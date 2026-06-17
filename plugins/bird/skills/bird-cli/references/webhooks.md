# Webhooks

Manage the outbound endpoints Bird delivers events to. Five actions on one resource: `create`, `list`, `get`, `test`, `delete`.

These are _outbound_ endpoints — URLs Bird POSTs events to — and there's no `update`: to change an endpoint's URL, event set, or label you `delete` it and `create` a new one, which issues a fresh signing secret the receiver has to adopt.

## State check, then act

Every action calls the live API, so first confirm credentials — a missing key fails the same way a real error does, and the wasted round-trip hides the actual problem:

```
bird auth status --format json
```

Hand off to [authenticate](authenticate.md) unless `valid` is `true`, then come back — that node explains why the check gates on `valid` being `true`. Don't tell the user to authenticate and stop — the task stalls there.

Then branch on what they asked for:

- **Register a new endpoint** → _Create_ below.
- **See what's registered, or inspect one** → _List_ and _Get_ below.
- **Confirm an endpoint actually receives deliveries** → _Test_ below.
- **Remove an endpoint** → _Delete_ below.

## Create

`bird webhooks create <url>` posts a `WebhookEndpointCreate`. The endpoint URL (an HTTPS URL Bird can reach) is the positional argument; `--events` (the event types to subscribe to, comma-separated or repeated) is required and `--description` is an optional label. You can supply the body three ways, and they combine:

- **The url argument plus flags** — `<url>`, `--events`, `--description`.
- **A JSON body via `--body-file <path|->`** — the whole request as one object: `bird webhooks create --body-file endpoint.json`; `-` reads stdin.
- **Both** — the url argument or a flag overrides the matching field in the body.

Read the shape before building it: `bird webhooks create --example` prints a complete, valid body and needs no credentials, so it's the right thing to read rather than guessing field names. To see exactly what would be sent without registering anything, add `--dry-run`.

Event types aren't enumerable through the CLI and aren't checked locally — a name the API doesn't recognize comes back as a validation failure (exit `2`), not something caught before the request. The `--example` body shows representative names (`email.delivered`, `email.bounced`); treat those as the starting point, not the full set.

### The secret is returned once

A successful create returns the endpoint with a `secret` — the key your receiver uses to verify a delivery really came from Bird and isn't a forgery from someone who learned the URL. It's returned only here, at create time, and can't be fetched again, so capture it from this response before doing anything else; losing it means deleting the endpoint and creating a new one for a fresh secret. Use `--idempotency-key <key>` when a create might be retried, so a repeat replays the original result (and its secret) instead of registering a duplicate.

### Done when

The command returns the endpoint (HTTP 201) with an `id` and a `secret`. Confirm it's stored with _Get_, and confirm it actually receives deliveries with _Test_.

## List

`bird webhooks list` returns the registered endpoints as a cursor envelope: `{ "data": [...], "next_cursor": ..., ... }`. Page with `--limit` (default 25, must be at least 1) and pass a response's `next_cursor` value back as `--starting-after`; a null `next_cursor` means you've reached the end. Like the other list commands it emits JSON only, so pull fields with `jq` — e.g. `bird webhooks list | jq -r '.data[].id'`.

**Done when** you have the page (or have walked the cursors to the end for a full sweep).

## Get

`bird webhooks get <webhook-id>` shows one endpoint by its `wh_…` id — URL, status, subscribed events, description, and creation time. Default output is JSON; `--format text` prints a human card. The `secret` is not among these fields; it only ever appears at create. A missing id returns not-found (exit `3`).

**Done when** the endpoint is returned.

## Test

`bird webhooks test <webhook-id>` makes a real delivery to the endpoint's live URL, so you can confirm it's reachable and that its signature check passes. Pass `--event-type` to simulate a specific event (e.g. `email.bounced`); omit it for a generic ping. The response carries the endpoint's HTTP status, latency, and any error — that's how you tell a working endpoint from a silently broken one, which a `get` can't show you.

Because it hits the real URL, aim it at the endpoint you mean and preview with `--dry-run` first when you're unsure — a production receiver processes the test like any other delivery, side effects and all.

**Done when** the response shows the endpoint's result; a 2xx `response_status_code` means it accepted the delivery.

## Delete

`bird webhooks delete <webhook-id>` removes an endpoint and stops every future delivery to it — it can't be undone. It requires `--yes` and never prompts, so a bare `delete` exits `2` rather than acting; re-run with `--yes` once you've confirmed the id with the user. There's no way to recreate it with the same secret — a replacement endpoint gets a new one, so plan to update the receiver. Use `--idempotency-key <key>` when a delete might be retried.

**Done when** the command reports `{ "deleted": true, "id": ... }`. A `get` on the same id afterward returns not-found (exit `3`).

## Traps

- **There is no update.** Changing a URL, event set, or description means delete-and-recreate, and the new endpoint carries a new secret — so a "quick edit" silently rotates the signing key out from under the receiver.
- **The secret appears once.** It's in the create response only — not in `get`, not in `list`. Capture it then, or the only recovery is a new endpoint with a new secret.
- **`test` is a real outbound request.** It POSTs to the endpoint's actual URL, so a production receiver acts on it. Use `--dry-run` to preview and check the id before firing.
- **Unknown event types fail at the server, not locally.** A typo in `--events` isn't caught until the API rejects it as a `422` (exit `2`); run `bird webhooks create --example` to see accepted names rather than guessing.
- **`delete` won't act without `--yes`.** Omitting it exits `2` with no change — by design, so a loose retry or glob can't quietly destroy an endpoint.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
