# WhatsApp

Send WhatsApp messages through Bird, templates or free-form content, inspect what was sent, follow a message's event timeline, and read the numbers the workspace sends from. `bird whatsapp` covers the channel (`send`, `list`, `get`, `list-events`) and its senders (`numbers`, `business-accounts`); browse the approved template catalogue in the Bird dashboard.

Branch on what they asked for:

- **Send a message** → _Send_ below.
- **Find or inspect already-sent messages, or follow one's lifecycle** → _List_, _Get_, and _List events_ below.
- **Pick a sender, or work out why a send was refused** → _Numbers_ and _Business accounts_ below.

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

Each number carries the state WhatsApp reports for it (`status`, `quality_rating`, `messaging_limit`, `throughput_level`) as of `meta_synced_at`, which is a reading taken roughly hourly rather than a live value. A number whose connection has not succeeded carries `error` with Bird's classification, plus WhatsApp's own words and code where WhatsApp was the one that refused; it is present while a number is still retrying as well as once it has given up.

## Business accounts

`bird whatsapp business-accounts list` returns the WhatsApp Business Accounts the workspace has connected, as a cursor envelope. Each account carries the state WhatsApp last reported for it: its own status, how far WhatsApp's review of it has got, and whether Meta verified the business behind it.

## Traps

- **Free-form content needs an open window.** It's deliverable only inside an open 24-hour customer service window, which the contact opens by messaging or calling you and resets each time they do it again. Bird does not track the window, so a send outside one is accepted and then fails with `service_window_expired` on the message's `last_error`. A template is the only content WhatsApp delivers outside one.
- **`accepted` is not delivered.** WhatsApp delivery is asynchronous; the status on `send` only confirms Bird accepted the message. Read it back with `get`, or follow `list-events` for the full lifecycle.
- **A platform-managed number reports no WhatsApp state.** A number with `scope: system` carries no `quality_rating`, `messaging_limit`, `throughput_level`, or `meta_synced_at`, and its `connected` status is Bird's own assertion. Their absence is not a fault to chase.
- **`--waba` and `--scope=system` never overlap.** A platform-managed number belongs to no WhatsApp Business Account, so pairing the two filters always returns an empty page.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
