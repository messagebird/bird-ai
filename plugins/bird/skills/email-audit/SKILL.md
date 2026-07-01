---
name: email-audit
description: Audit a domain's email-authentication setup and explain how to fix it — run `bird email tools audit <domain>` to resolve and grade the live DMARC, SPF, DKIM, BIMI, and MX records, then read the severity-tagged findings like a deliverability consultant. Use when someone asks "is my email set up correctly?", "why is my mail going to spam / getting marked as junk?", "audit my domain's email", "check my SPF/DKIM/DMARC", "why am I failing DMARC?", "is my domain spoofable?", "what's wrong with my email authentication?", or wants a domain's deliverability posture reviewed and prioritized fixes. For drafting or checking a *single* record before publishing it (not a live domain), use the per-record validators instead (`bird email tools validate-dmarc` / `validate-bimi`). Not for sending mail or managing domains — that is the bird-cli skill.
---

# Email authentication audit

`bird email tools audit <domain>` resolves a domain's live email-authentication records — DMARC, SPF, DKIM, BIMI, MX — validates each, checks how they work _together_, and returns a graded report. Your job with this skill is to run it and then act as the consultant: read the findings, explain what each means in plain terms, and give the user a prioritized plan.

It is DNS-only and needs no auth. It sends no mail and inspects no message; it reads what the domain publishes.

```
bird email tools audit acme.com
bird email tools audit acme.com --selector s1   # also check a DKIM selector (see DKIM below)
```

MCP: `email_tools_audit` with `{ "domain": "acme.com", "selector": "s1" }`.

## When to use this vs the per-record validators

- **`audit <domain>`** — "how is _my domain_ set up?" Resolves live records and grades the whole posture. This is the one to reach for when someone describes a _symptom_ ("going to spam", "failing DMARC", "can people spoof us?").
- **`validate-dmarc` / `validate-bimi <record>`** — "is _this record I wrote_ correct?" Offline, parses a pasted string. Use when drafting a record before publishing, not when diagnosing a live domain.

If they give you a domain, audit it. If they paste a record, validate it.

## Reading the report

```jsonc
{
  "domain": "acme.com",
  "valid": false,                      // true only when there are NO problem-severity findings
  "records": [                         // what was found, per area
    { "area": "dmarc", "found": true,  "value": "v=DMARC1; p=none; rua=..." },
    { "area": "spf",   "found": true,  "value": "v=spf1 include:... ~all" },
    { "area": "dkim",  "found": false, "value": null },
    ...
  ],
  "findings": [                        // graded observations, most-severe first
    { "severity": "problem", "area": "spf", "message": "...", "fix": "..." },
    { "severity": "warning", "area": "dmarc", "message": "...", "fix": "..." }
  ],
  "recommendations": [ "...", "..." ]  // the fixes, problems first — the action list
}
```

Three severities, and what each means for the user:

- **`problem`** — delivery or spoofing protection is actually broken right now. Lead with these. (`valid` is `false` whenever any exist.)
- **`warning`** — works, but is weak, incomplete, or risky. Address after the problems.
- **`ok`** — a passing check. Use these to reassure ("DMARC is enforcing, good") so the report isn't only negatives.

The fastest way to advise: read `findings` top-to-bottom (already severity-ordered), then hand back `recommendations` as the to-do list. Don't just dump the JSON — translate it.

## What each area means and how to fix it

**DMARC** (`_dmarc.<domain>`) — the policy that ties SPF and DKIM together and tells receivers what to do with mail that fails. The journey is `p=none` → `p=quarantine` → `p=reject`:

- `p=none` is **monitor-only**: you get reports but spoofed mail still lands. It's the right _first_ step, never the destination. Recommend moving to `quarantine` then `reject` once legitimate mail is passing aligned (see Alignment).
- No record at all is a `problem` — the domain is spoofable and you're blind to abuse. Start at `p=none` with a `rua=` address to collect reports.
- No `rua=` means no visibility — add a reporting address before tightening the policy.
- An invalid record is treated by receivers as no record; fix it (validate-dmarc) before anything else.

**SPF** (`<domain>` TXT, `v=spf1 …`) — the list of servers allowed to send for the domain. Two things bite people:

- **The 10-lookup limit (RFC 7208).** Every `include:`, `redirect=`, `a`, `mx`, `ptr`, `exists` costs a DNS lookup, and `include:` chains recurse. Over 10 total, SPF returns _permerror_ and fails for **all** mail, including legitimate. The audit counts recursively — this is its main value over eyeballing the record. The fix is to flatten or drop includes (remove unused providers, or use a sender that auto-flattens).
- **The `all` qualifier.** `-all` (hard fail) is the goal; `~all` (soft fail) is fine while verifying; `?all` (neutral) and especially `+all` give no protection — `+all` lets anyone send as the domain. Move toward `-all` once every legitimate sender is listed.
- Multiple SPF records is a `problem` (permerror) — merge into one.

**DKIM** (`<selector>._domainkey.<domain>`) — a cryptographic signature on each message; the more durable half of DMARC because, unlike SPF, it **survives forwarding**. The catch: **selectors can't be discovered from DNS.** The audit can only check DKIM if you pass `--selector`. So:

- If DKIM shows as "selector unknown" — that's not a failure, it just wasn't checked. Ask the user for their selector (their sending provider's DKIM setup shows it) and re-run with `--selector <s>`.
- No key at the given selector is a `problem` for mail signed with it — publish the provider's public key, or correct the selector.

**BIMI** (`default._bimi.<domain>`) — optional; shows the brand's logo in supporting inboxes. It only displays once **DMARC is at enforcement** and (for Gmail/Apple Mail) a **Verified Mark Certificate** (`a=`) is published. Absence is not a problem — it's a "nice to have, and only after the basics." Don't recommend BIMI until DMARC is enforcing.

**MX** (`<domain>` MX) — where the domain _receives_ mail. No MX is only a `warning`: it's fine and common for a send-only domain, but worth confirming it's intentional.

## The cross-record insight (the thing a flat checker misses)

DMARC passes only when SPF **or** DKIM passes _and is aligned_ with the From: domain. So the audit's most important synthesized finding is: **is DMARC enforcing while neither SPF nor DKIM can produce an aligned pass?** If so, the domain's own legitimate mail is being quarantined or rejected — the most damaging misconfiguration, and the one to fix first. Conversely, you can't safely advance DMARC past `p=none` until at least one of SPF/DKIM aligns. When you advise on sequencing, this is the spine: **get one of SPF/DKIM aligned → raise DMARC to quarantine → reject → (optionally) BIMI.**

## Honest limits — say these out loud

- **DKIM needs a selector** (not DNS-enumerable). An unchecked DKIM is "unknown", not "absent" — don't report it as missing.
- **DNS records only.** No SMTP probing, no test send, no message/header inspection. (To analyze a specific message's headers, that's `bird email tools analyze-headers`; to read a DMARC aggregate report, `analyze-dmarc-report`.)
- **It reflects this moment's DNS.** Results are briefly cached; a record you just changed may take time to propagate.

## How to deliver the result

Be the consultant, not a linter:

1. One-line verdict — is the domain protected, monitoring, or exposed.
2. The problems, each in plain language with the concrete fix from `recommendations`.
3. The sequencing — what to do first (almost always: fix alignment, then advance DMARC).
4. The reassuring `ok` findings so they know what's already right.
5. If DKIM was unknown, ask for the selector and offer to re-run.
