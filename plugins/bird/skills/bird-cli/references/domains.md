# Domains

Manage the domains Bird sends email from. A message's `from` address must be on a **verified** sending domain, so `bird email domains list` is how you find a usable `from` before [email](email.md) `send`. Five actions on one resource: `list`, `get`, `create`, `verify`, `update`.

## Pick the action

Branch on what the user asked for:

- **Find a domain to send from / list what exists** → _List_.
- **Inspect one domain or see its DNS records** → _Get_.
- **Add a new sending domain** → _Create_, then _Verify_.
- **Turn click/open tracking on or off, or set the tracking domain** → _Update_.

## List

`bird email domains list` returns the workspace's sending domains, newest first, as a cursor envelope (`{ "data": [...], "next_cursor": ... }`); page with `--limit` and `--starting-after`. Each domain carries a top-level `status` (`pending`, `verified`, `partially_verified`, `failed`, `temporary_failure`) and per-capability statuses under `capabilities` (`sending`, `return_path`).

To pick a `from` for `bird email send`, find one whose sending capability is verified:

```
bird email domains list | jq -r '.data[] | select(.capabilities.sending.status=="verified") | .domain'
```

**Done when** you have the page (or the address of a verified domain to send from).

## Get

`bird email domains get <dom_…>` shows one domain by its `dom_…` id, including the per-capability status and the `dns_records` to configure. Default output is JSON; `--format text` prints a card with the DNS records laid out (a `✓` marks each record that has verified). A missing id returns not-found (exit `3`).

## Create

`bird email domains create mail.acme.com` registers a sending domain and returns it with the `dns_records` you must add at your DNS provider. The domain starts in `pending`. Like every mutation it also accepts a JSON body via `--body-file <path|->` (`bird email domains create --example` prints the shape; `--dry-run` previews the request without creating). `tracking_subdomain` is a preview field and is intentionally not exposed — supplying it returns `422`.

## Verify

`bird email domains verify <dom_…>` triggers a fresh DNS check and returns the updated domain. Run it after the `create`/`get` DNS records are live at your provider; the status only moves toward `verified` once the records resolve. Verification is also retried automatically on a schedule, so `verify` just asks for an immediate re-check.

**The setup loop:**

- `bird email domains create`: Returns the domain in `pending` with the `dns_records` to configure.
  - Add the returned DNS records at your DNS provider.
  - Re-read the records, then trigger a verification check. (`bird email domains get`, `bird email domains verify`)
- `bird email domains verify`: Triggers a fresh DNS check and returns the updated domain.
  - If the check now reports verified, the domain is usable as a sender for email.
  - Records are not yet visible. DNS propagation is asynchronous (minutes to hours); verification is retried automatically, or trigger it again later. (`bird email domains verify`)

DNS propagation is asynchronous, so a `verify` right after `create` will almost always still read `pending`; that's expected, not a failure.

## Update

`bird email domains update <dom_…>` changes a domain's tracking configuration. Flags: `--click-tracking` and `--open-tracking` (booleans; pass `--open-tracking=false` to turn one off) toggle link/open tracking and apply immediately to new sends; `--tracking-domain <name>` sets or changes the tracking name part (`links` on `mail.acme.com` becomes `links.mail.acme.com`), and on a verified domain that change is staged behind DNS verification. `--example` prints the body shape, `--dry-run` previews the request. As with every mutation a `--body-file` JSON body can express the full `DomainUpdate` (including `return_path` and `dkim`); inline flags win over body fields. Removing the tracking domain (sending `tracking: null`) is not yet exposed.

## Traps

- **`status: verified` (or `capabilities.sending.status: verified`) is the bar for sending.** `pending`, `partially_verified`, and `failed` domains exist but will `422` an `email send` — they are not usable senders yet.
- **`verify` re-checks DNS; it does not change DNS for you.** If the records from `create`/`get` aren't live at your DNS provider, the status stays `pending`/`failed` no matter how often you verify.
- **DNS propagation is asynchronous.** A freshly-created domain won't verify until its records propagate, which can take minutes to hours — `verify` immediately after `create` will almost always still read `pending`.
- **Tracking toggles need a tracking domain.** `update --click-tracking`/`--open-tracking` on a domain with no tracking domain configured returns `409` — set `--tracking-domain` first (the toggle can be enabled before that record verifies; it starts working once it does).

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
