# WhatsApp

Send WhatsApp messages through Bird, templates or free-form content, inspect what was sent, follow a message's event timeline, read the numbers and business accounts the workspace sends from, and read traffic statistics. `bird whatsapp` covers the channel (`send`, `list`, `get`, `list-events`), its senders (`numbers`, including a `precheck` before you buy one, and `business-accounts`), and its stats (`stats`); browse the approved template catalogue in the Bird dashboard.

Branch on what they asked for:

- **Send a message** → _Send_ below.
- **Find or inspect already-sent messages, or follow one's lifecycle** → _List_, _Get_, and _List events_ below.
- **Pick a sender, or work out why a send was refused** → _Numbers_ and _Business accounts_ below.
- **Check whether WhatsApp will accept a number before buying it** → _Numbers_ below (`precheck`).
- **Read traffic volume, delivery/failure rates, or a breakdown by dimension** → _Stats_ below.

## Send

`bird whatsapp send --to <e164>` sends one message to one recipient, carrying exactly one kind of content:

- **A template:** `--template <slug>` or `--template-id <wat_…>`, with `--language` for the variant and `--components '<json>'` filling its placeholders (e.g. `--components '[{"type":"body","parameters":[{"type":"text","text":"A1B2C3D4"}]}]'`). Browse your workspace's approved templates in the Bird dashboard.
- **Free-form content:** `--text` (with `--preview-url`), `--image`, `--video`, `--audio` (with `--voice` for a voice note), `--sticker`, `--document` (with `--filename`), or a location (`--latitude`/`--longitude`, with `--location-name`/`--location-address`). `--caption` labels an image, video, or document.

A Bird-managed template picks its own sender from its category and must omit `--from`; a template your workspace authored requires `--from`, the same as free-form content. `--tag` and `--metadata` attach labels.

**Done when** the command returns a message object with an `id` and `status: accepted`. Like email and SMS, `accepted` means Bird took the message, not that it landed; read it back with _Get_ or follow _List events_ to confirm delivery.

## List

`bird whatsapp list` returns a page of sent messages, newest first, as a cursor envelope (`{ "data": [...], "next_cursor": ... }`); page with `--limit`, `--starting-after`/`--ending-before`. Narrow with `--created-after`/`--created-before` (RFC 3339), `--status` (repeatable), `--phone-number` (E.164 exact match), or `--bsuid` (Meta business-scoped user id). `list` only emits JSON, so pull fields with `jq`.

## Get

`bird whatsapp get <message-id>` returns one message with its delivery status. Default output is JSON; `--format text` prints a human-readable card. A missing id returns not-found (exit `3`).

## List events

`bird whatsapp list-events <message-id>` returns the lifecycle event timeline for one message, in chronological order (e.g. sent, delivered, read, failed). Filter by `--type` (e.g. `whatsapp.delivered`, `whatsapp.failed`).

## Numbers

`bird whatsapp numbers list` returns a page of the numbers the workspace can send from, as a cursor envelope (`{ "data": [...], "next_cursor": ... }`). Narrow with `--phone-number` (E.164, normalized before matching), `--waba` (the `waba` value a business account carries, not its `waa_` id), `--status` (repeatable), and `--scope` (`system` for platform-managed numbers, `workspace` for the ones you connected yourself). `bird whatsapp numbers get <number-id>` returns one number; `--format text` prints a card.

`bird whatsapp numbers precheck <phone-number>` asks WhatsApp whether it will accept a number before you buy it, and answers `{ "phone_number": ..., "outcome": "available" | "unavailable" }`. No number is connected to your workspace, but this is a write rather than a lookup, so check the one number you intend to buy rather than a list of candidates. Confirm the number with the user before running it, and retry an uncertain result with the same `--idempotency-key` you sent the first time: a fresh key asks WhatsApp again rather than replaying the verdict. The two reasons behind `unavailable` — already in use on WhatsApp, or a number WhatsApp cannot serve — are not told apart, so treat it as a number to skip. The answer describes this moment: an available number can be taken by someone else before you connect it.

Each number carries the state WhatsApp reports for it (`status`, `quality_rating`, `messaging_limit`, `throughput_level`) as of `meta_synced_at`, which is a reading taken roughly hourly rather than a live value. A number whose connection has not succeeded carries `error` with Bird's classification, plus WhatsApp's own words and code where WhatsApp was the one that refused; it is present while a number is still retrying as well as once it has given up.

## Business accounts

`bird whatsapp business-accounts list` returns the WhatsApp Business Accounts the workspace has connected, as a cursor envelope. Each account carries the state WhatsApp last reported for it: its own status, how far WhatsApp's review of it has got, and whether Meta verified the business behind it.

`bird whatsapp business-accounts get <business-account-ref>` returns one account, addressed by either the `waa_` id the list reports or the numeric id WhatsApp reports in `waba`. `--format text` prints a card. An account the list does not show is not-found here either, in both forms.

## Stats

`bird whatsapp stats …` reads aggregate views over your own WhatsApp traffic. Every subcommand takes an optional `--from`/`--to` window and `--timezone`; all of them emit JSON only, so pull fields with `jq`. The bounds are calendar days (`YYYY-MM-DD`) except on `hourly` and `inbound hourly`, which parse RFC 3339 instants (`2026-08-20T09:00:00Z`) and reject a bare day client-side; `summary` accepts either form and reports by day or by hour to match.

- **The period aggregate:** `bird whatsapp stats summary` returns counts (accepted, sent, delivered, failed, rejected), delivery and failure rates, read engagement, and latency percentiles. `--from`/`--to` default to the trailing 30 days here; `--compare previous_period` adds the deltas against the window before.
- **The series:** `bird whatsapp stats daily` and `bird whatsapp stats hourly` return one row per day or hour, gap-filled so a silent bucket is a zero row. `--from`/`--to` are optional: `daily` defaults to the trailing 30 days, `hourly` to the trailing 168 hours.
- **Restricting the aggregate or a series to one dimension:** `--template`, `--category`, `--phone-number` or `--tag`, one at a time. These work on `summary`, `daily` and `hourly` only.
- **The breakdowns:** `bird whatsapp stats by-error-code`, `by-template`, `by-template-category`, `by-tag` and `by-phone-number` each return the workspace's rows for that one dimension, ranked by volume (accepted volume, or failure count on `by-error-code`, whose rows carry only `error_code` and `count`), capped by `--limit` (default 50, max 200). `--from`/`--to` are optional and default to the trailing 30 days. A breakdown takes no dimension filter: it is already a single-dimension view. To follow one template or tag over time, filter `daily` by it instead.
- **Received messages:** `bird whatsapp stats inbound summary|daily|hourly` and `bird whatsapp stats inbound by-phone-number` count what customers sent you, separately from what you sent them.

Counts are attributed to the day the message was accepted, so a delivery confirmation arriving Wednesday for a message accepted the prior Monday lands in Monday's row; recent buckets under-report while callbacks are still arriving, and `period.data_as_of` in every response is how fresh the answer is.

## Traps

- **Free-form content needs an open window.** It's deliverable only inside an open 24-hour customer service window, which the contact opens by messaging or calling you and resets each time they do it again. Bird does not track the window, so a send outside one is accepted and then fails with `service_window_expired` on the message's `last_error`. A template is the only content WhatsApp delivers outside one.
- **`accepted` is not delivered.** WhatsApp delivery is asynchronous; the status on `send` only confirms Bird accepted the message. Read it back with `get`, or follow `list-events` for the full lifecycle.
- **A platform-managed number reports no WhatsApp state.** A number with `scope: system` carries no `quality_rating`, `messaging_limit`, `throughput_level`, or `meta_synced_at`, and its `connected` status is Bird's own assertion. Their absence is not a fault to chase.
- **`--waba` and `--scope=system` never overlap.** A platform-managed number belongs to no WhatsApp Business Account, so pairing the two filters always returns an empty page.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
