# Webhooks

Manage the outbound endpoints Bird delivers events to: `create`, `list`, `get`, `update`, `test`, `attempts`, `replay`, `rotate-secret`, `delete`.

These are _outbound_ endpoints — URLs Bird POSTs events to. `update` changes an endpoint's URL, event set, label, or paused status in place and keeps its secret; `rotate-secret` issues a new one. Read either command's `--help` before using it.

## Pick the action

Branch on what the user asked for:

- **Register a new endpoint** → _Create_ below.
- **See what's registered, or inspect one** → _List_ and _Get_ below.
- **Confirm an endpoint actually receives deliveries** → _Test_ below.
- **See what failed, or redeliver it** → _Attempts_ and _Replay_ below.
- **Remove an endpoint** → _Delete_ below.

## Create

`bird webhooks create <url>` posts a `WebhookEndpointCreate`. The URL, as the argument or `--url`, is an HTTPS URL Bird can reach; leave it out with `--connector`, because Bird builds a connector endpoint's URL. `--events` (the event types to subscribe to, comma-separated or repeated) is required and `--description` is an optional label. You can supply the body three ways, and they combine:

- **Flags** — `--url`, `--events`, `--description`, `--connector`, `--field`.
- **A JSON body via `--body-file <path|->`** — the whole request as one object: `bird webhooks create --body-file endpoint.json`; `-` reads stdin.
- **Both** — a flag overrides the matching field in the body. `--connector` and `--field name=value` set the connector and its nonsecret fields; its secret fields take `--secret-env name=ENV_VAR`, `--secret-stdin name` or the body's `destination.connector.credentials`, never a value on the command line, and `--dry-run` prints them redacted. A connector endpoint takes no URL, `--events` defaults to every event the connector accepts, and a missing required field fails before anything is sent. `--help` lists every connector with its fields and setup steps.

Read the shape before building it: `bird webhooks create --example` prints a complete, valid body and needs no credentials, so it's the right thing to read rather than guessing field names. To see exactly what would be sent without registering anything, add `--dry-run`.

Event types aren't enumerable through the CLI and aren't checked locally — a name the API doesn't recognize comes back as a validation failure (exit `2`), not something caught before the request. The `--example` body shows representative names (`email.delivered`, `email.bounced`); treat those as the starting point, not the full set.

### The secret is returned once

A successful create returns the endpoint with a `secret` — the key your receiver uses to verify a delivery really came from Bird and isn't a forgery from someone who learned the URL. It's returned only here, at create time, and can't be fetched again, so capture it from this response before doing anything else; losing it means deleting the endpoint and creating a new one for a fresh secret. Use `--idempotency-key <key>` when a create might be retried, so a repeat replays the original result (and its secret) instead of registering a duplicate.

### Done when

The command returns the endpoint (HTTP 201) with an `id` and a `secret`. Confirm it's stored with _Get_, and confirm it actually receives deliveries with _Test_.

## Set up end to end

To send events to a receiver the user owns (a Zapier, Make or n8n catch hook, their own endpoint, or a destination type such as an agent platform), follow this flow:

- The user owns the receiving side, so you cannot create it for them. For a plain endpoint, ask for its HTTPS URL, such as a Zapier "Catch Hook", a Make custom webhook or an n8n Webhook node's production URL. For a connector, read its setup steps and fields in `webhooks create --help` or the tool's `connector_id` description: walk the user through the steps, collect the values they produce, then create the webhook and send a test event. Ask which events to send.
- `bird webhooks list`: For a plain endpoint, filter by the receiver's `url` to look for one this setup made before. Several endpoints can share a URL, so a match is this setup's only if its description and events say so; ask the user when they don't. Reuse that match, without a connector destination, changing it with `webhooks.update`. For a connector, create a new endpoint: Bird builds its URL from the fields, two endpoints of one connector can reach different accounts, and an update cannot change the connector or its nonsecret fields. The filter finds matches, it does not stop duplicates.
  - Whether you reuse an endpoint or create one, send a test event before telling the user it works. (`bird webhooks create`, `bird webhooks update`, `bird webhooks test`)
- `bird webhooks create`: For a connector, give its id, nonsecret fields and secret fields, and omit `url`: Bird builds it. On the CLI, pass `--connector` and a `--field name=value` for each nonsecret field and `--secret-env name=ENV_VAR` or `--secret-stdin name` for each secret one, never a secret value as a flag; the MCP tool takes `connector_id`, `config` and `credentials`. The response shows the signing secret once; hand it to the user to store, and never repeat credentials back.
  - Send a test event before telling the user it works. (`bird webhooks test`)
- `bird webhooks test`: Sends one synthetic event and reports whether the receiver accepted it, its HTTP status and the time it took. The call succeeds either way, so read the result's `status`: only when the receiver accepted the event is the setup done. When it failed, report its HTTP status and response body, or for an unreachable receiver its `error`, to the user, fix the cause as below, and test again before saying it works.
  - Once the test was accepted, ask the user to confirm the event shows up on their side.
  - Real deliveries and their failure reasons are in `webhooks.attempts`. Fix a plain endpoint's URL or events with `webhooks.update`. A connector endpoint's URL comes from its fields and cannot be set, so fix its credentials or events with `webhooks.update`, or, for a wrong nonsecret field, delete it and create a new one. (`bird webhooks attempts`, `bird webhooks update`, `bird webhooks delete`)

## List

`bird webhooks list` returns the registered endpoints as a cursor envelope; `--url <url>` narrows it to the endpoint delivering to exactly that URL, which is how a repeated setup finds the endpoint it made before: `{ "data": [...], "next_cursor": ..., ... }`. Page with `--limit` (default 25, must be at least 1) and pass a response's `next_cursor` value back as `--starting-after`; a null `next_cursor` means you've reached the end. Like the other list commands it emits JSON only, so pull fields with `jq` — e.g. `bird webhooks list | jq -r '.data[].id'`.

**Done when** you have the page (or have walked the cursors to the end for a full sweep).

## Get

`bird webhooks get <webhook-id>` shows one endpoint by its `whk_…` id — URL, status, subscribed events, description, and creation time. Default output is JSON; `--format text` prints a human card. The `secret` is not among these fields; it only ever appears at create. A missing id returns not-found (exit `3`).

**Done when** the endpoint is returned.

## Test

`bird webhooks test <webhook-id>` makes a real delivery to the endpoint's live URL, so you can confirm it's reachable and that its signature check passes. Pass `--event-type` to simulate a specific event (e.g. `email.bounced`); omit it for a generic ping. The response carries the endpoint's HTTP status, latency, and any error — that's how you tell a working endpoint from a silently broken one, which a `get` can't show you.

Because it hits the real URL, aim it at the endpoint you mean and preview with `--dry-run` first when you're unsure — a production receiver processes the test like any other delivery, side effects and all.

**Done when** the response shows the endpoint's result; a 2xx `response_status_code` means it accepted the delivery.

## Attempts

`bird webhooks attempts <webhook-id>` lists the endpoint's recent delivery attempts, newest first, with each one's status, response code, and latency. Each entry is one HTTP request, so a retried event appears once per try. Narrow the window with `--after` / `--before` (RFC 3339 timestamps) and cap it with `--limit` (default 50, at most 100). `--before` is strict, so passing the oldest `attempted_at` you received skips any other attempts in that same millisecond; to page further back, pass a `--before` one millisecond later and drop the ids you already have. Test deliveries are not recorded here.

**Done when** you have the attempts for the window you asked about.

## Replay

`bird webhooks replay <webhook-id>` queues redelivery of the endpoint's **failed** attempts in a window. `--since` and `--until` (RFC 3339) bound it on attempt time, not event time; omitted, the window is the last 24 hours. An event is skipped only when one of its attempts **inside the window** was delivered; a success outside it — a later retry, or an earlier replay — doesn't count, so that event is delivered again. Redeliveries reuse the event's `webhook-id`, so the receiver must deduplicate on it. `--dry-run` prints the body without sending.

What it cannot do shapes when to use it:

- **Only failed attempts come back.** An event that arrived while the endpoint was paused was never attempted, so nothing replays it.
- **A paused endpoint redelivers nothing.** Re-enable it with `bird webhooks update <webhook-id> --status active` first.
- **History reaches back three days.** An earlier `--since` widens the window without recovering anything older.
- **Never re-run a replay whose `--until` has passed.** The first replay's redeliveries were attempted after that bound, so a second pass sees none of them and sends every one again.
- **One replay covers at most the oldest 10,000 events in the window.** For a larger outage, split it up front into consecutive windows narrow enough to stay under the cap. An event whose failed attempts span two windows can still arrive twice, which receiver deduplication absorbs.
- **Each redelivery is one attempt**, not the retry schedule a live delivery follows. Fix the receiver before replaying, or a still-broken endpoint just fails again.
- **20 replays per organization per UTC day.** Beyond that the API returns `429` (`WebhookReplayQuotaExceeded`), so cover recovery in one window rather than replaying per event.

The command returns `{ "accepted": true, "id": ... }` — the replay is queued, not finished, and no count is returned.

**Done when** the replay is accepted and a later `attempts` shows the window's failed events redelivered successfully.

## Delete

`bird webhooks delete <webhook-id>` removes an endpoint and stops every future delivery to it — it can't be undone. It requires `--yes` and never prompts, so a bare `delete` exits `2` rather than acting; re-run with `--yes` once you've confirmed the id with the user. There's no way to recreate it with the same secret — a replacement endpoint gets a new one, so plan to update the receiver. Use `--idempotency-key <key>` when a delete might be retried.

**Done when** the command reports `{ "deleted": true, "id": ... }`. A `get` on the same id afterward returns not-found (exit `3`).

## Traps

- **Recreating an endpoint rotates its secret.** Use `update` to change a URL, event set, or description; a delete-and-create hands the receiver a new signing key.
- **The secret appears once.** It's in the create response only — not in `get`, not in `list`. Capture it then, or the only recovery is a new endpoint with a new secret.
- **`replay` is accepted, not done.** `accepted: true` means queued; confirm with `attempts`.
- **Re-running a replay whose `--until` has passed duplicates deliveries.** Only successes inside the window suppress an event.
- **`test` is a real outbound request.** It POSTs to the endpoint's actual URL, so a production receiver acts on it. Use `--dry-run` to preview and check the id before firing.
- **Unknown event types fail at the server, not locally.** A typo in `--events` isn't caught until the API rejects it as a `422` (exit `2`); run `bird webhooks create --example` to see accepted names rather than guessing.
- **`delete` won't act without `--yes`.** Omitting it exits `2` with no change — by design, so a loose retry or glob can't quietly destroy an endpoint.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
