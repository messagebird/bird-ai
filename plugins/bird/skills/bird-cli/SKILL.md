---
name: bird-cli
description: Operate Bird from the terminal with the `bird` CLI, the agent-facing surface for the Bird API. Covers email (send, batch, reusable templates, inbound, sending domains, dedicated IPs, IP pools, deliverability), SMS and WhatsApp (send plus templates), one-time-passcode verification, email-address and phone-number lookup, Realtime app and key provisioning, contacts, audiences, contact properties, webhooks, support tickets, account signup and onboarding, and auth, config, and documentation search. Use it for any request to send, inspect, or manage those from a shell or an agent loop, or to create and onboard a new Bird account. Not for calling the Bird HTTP API directly or the language SDKs.
---

# Bird CLI

`bird` is a single binary that talks to the Bird API. Each top-level command is one operation; every operation talks to the live API, so all of them need credentials first.

If `bird` isn't installed (`command -v bird` finds nothing), install it first — a checksum-verified download to `~/.local/bin` (or `/usr/local/bin`):

```
curl -fsSL https://cli.bird.com/install.sh | sh
```

## The path

**Step 0 — Authenticate (shared prerequisite).** Every command below fails without a key, and the failure looks the same as a real error, so confirm credentials first: [authenticate](references/authenticate.md). It is a no-op when `bird auth status` already reports `valid: true`, so it is safe to run first every time. No account yet? Create one — account, organization, and workspace — from scratch: [onboarding](references/onboarding.md); it ends by storing the same credential a login would.

**Step 1 — Run the operation the user asked for:**

- Send or inspect email messages (`bird email`, including `send-batch`) → [email](references/email.md)
- Author reusable email templates, submit a draft, or roll one back (`bird email templates`) → [email-templates](references/email-templates.md)
- Send or inspect SMS messages, or browse SMS templates (`bird sms`) → [sms](references/sms.md)
- Send or inspect WhatsApp messages, follow a message's events, or browse WhatsApp templates (`bird whatsapp`) → [whatsapp](references/whatsapp.md)
- Inspect voice calls, find out why one was refused, or place a test call (`bird voice`) → [voice](references/voice.md)
- Provision Realtime apps and rotate the keys their clients connect with (`bird realtime`) → [realtime](references/realtime.md)
- Verify a recipient with a one-time passcode — send a code, then check what they submit (`bird verify verifications`) → [verify](references/verify.md)
- Find out about a recipient before you use it — grade an email address, or identify a phone number and its network (`bird lookup`) → [lookup](references/lookup.md)
- Manage contacts, audiences, and contact properties (`bird contacts`, `bird audiences`, `bird contact-properties`) → [contacts](references/contacts.md)
- Manage sending domains (`bird email domains`), or find a verified `from` to send from → [domains](references/domains.md)
- Manage dedicated IPs (`bird email dedicated-ips`) and IP pools (`bird email ip-pools`) (sending reputation) → [ip-pools](references/ip-pools.md)
- Receive email at inbound forward addresses (`bird email inbound-addresses`), or read the mail received there (`bird email inbound-messages`) → [inbound](references/inbound.md)
- Manage outbound webhook endpoints → [webhooks](references/webhooks.md)
- Open a support ticket, reply to it, or wait for a support agent reply → [support](references/support.md)
- Answer a how-to or reference question about Bird from the documentation → [docs](references/docs.md) (public — skips Step 0)
- Inspect resolved CLI configuration → `bird config show` (sibling operation; node not yet authored)

Pick the one operation that matches the request; there is no ordering among them beyond the Step 0 auth they all share.

## Conventions every command shares

These hold across operations, so the nodes rely on them instead of repeating them:

- **Output is JSON by default** (`--format json`). Single-record commands (`get`, `status`, `show`) also take `--format text` for a human-readable card. List commands ignore `--format text` and always emit JSON, so a script can pipe them through `jq` without a per-command branch.
- **Exit codes carry the failure category** so a caller can branch without parsing prose: `2` invalid usage or input, `3` not found, `4` auth or permission denied, `1` anything else. Errors print to stderr; data to stdout.
- **Transient failures are retried for you.** A rate limit, a 5xx, or a network blip is retried twice with backoff before the command fails, so an error marked `retryable` has already been through that — re-running it immediately rarely helps. `--max-retries 0` turns it off when you drive your own retry loop.
- **The login sets the region.** The token from `bird auth login` is bound to one workspace and its region, which picks the API host; override with `--base-url`/`BIRD_API_URL`. Details and the state check live in [authenticate](references/authenticate.md).
