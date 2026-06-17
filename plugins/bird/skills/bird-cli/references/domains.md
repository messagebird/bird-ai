# Domains

Manage the domains Bird sends email from. A message's `from` address must be on a **verified** sending domain, so `bird domains list` is how you find a usable `from` before [email](email.md) `send`. Four actions on one resource: `list`, `get`, `create`, `verify`.

## State check, then act

Every action calls the live API, so first confirm credentials — a missing login fails the same way a real error does:

```
bird auth status --format json
```

Hand off to [authenticate](authenticate.md) unless `valid` is `true`, then come back. Then branch on what they asked for:

- **Find a domain to send from / list what exists** → _List_.
- **Inspect one domain or see its DNS records** → _Get_.
- **Add a new sending domain** → _Create_, then _Verify_.

## List

`bird domains list` returns the workspace's sending domains, newest first, as a cursor envelope (`{ "data": [...], "next_cursor": ... }`); page with `--limit` and `--starting-after`. Each domain carries a top-level `status` (`pending`, `verified`, `partially_verified`, `failed`, `temporary_failure`) and per-capability statuses under `capabilities` (`sending`, `return_path`).

To pick a `from` for `bird email send`, find one whose sending capability is verified:

```
bird domains list | jq -r '.data[] | select(.capabilities.sending.status=="verified") | .domain'
```

**Done when** you have the page (or the address of a verified domain to send from).

## Get

`bird domains get <dom_…>` shows one domain by its `dom_…` id, including the per-capability status and the `dns_records` to configure. Default output is JSON; `--format text` prints a card with the DNS records laid out (a `✓` marks each record that has verified). A missing id returns not-found (exit `3`).

## Create

`bird domains create mail.acme.com` registers a sending domain and returns it with the `dns_records` you must add at your DNS provider. The domain starts in `pending`. Like every mutation it also accepts a JSON body via `--body-file <path|->` (`bird domains create --example` prints the shape; `--dry-run` previews the request without creating). `tracking_subdomain` is a preview field and is intentionally not exposed — supplying it returns `422`.

## Verify

`bird domains verify <dom_…>` triggers a fresh DNS check and returns the updated domain. Run it after the `create`/`get` DNS records are live at your provider; the status only moves toward `verified` once the records resolve. Verification is also retried automatically on a schedule, so `verify` just asks for an immediate re-check.

**The setup loop:** `create` → add the returned DNS records at your provider → `verify` → repeat until `status` is `verified` → the domain is now usable as a `from`.

## Traps

- **`status: verified` (or `capabilities.sending.status: verified`) is the bar for sending.** `pending`, `partially_verified`, and `failed` domains exist but will `422` an `email send` — they are not usable senders yet.
- **`verify` re-checks DNS; it does not change DNS for you.** If the records from `create`/`get` aren't live at your DNS provider, the status stays `pending`/`failed` no matter how often you verify.
- **DNS propagation is asynchronous.** A freshly-created domain won't verify until its records propagate, which can take minutes to hours — `verify` immediately after `create` will almost always still read `pending`.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
