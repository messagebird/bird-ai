# WhatsApp

Send WhatsApp template messages through Bird, inspect what was sent, and follow a message's event timeline. `bird whatsapp` covers the channel (`send`, `list`, `get`, `list-events`); browse the approved template catalogue in the Bird dashboard.

Branch on what they asked for:

- **Send a message** → _Send_ below.
- **Find or inspect already-sent messages, or follow one's lifecycle** → _List_, _Get_, and _List events_ below.

## Send

`bird whatsapp send --to <e164> --template <slug>` sends a template message to one recipient. This command sends template messages only — browse your workspace's approved templates in the Bird dashboard first; the wider API also accepts free-form content, but this command has no flags for it yet.

- `--to` — recipient phone number in E.164 format (e.g. `+15551234567`).
- `--template` — the template, by its slug (e.g. `bird_otp`).
- `--template-id` — the template, by its id (`wat_…`); alternative to `--template`.
- `--language` — the template variant's language tag (e.g. `en` or `pt-BR`); omit when the template has a single language.
- `--components` — a JSON array filling the template's placeholders (body/header/button component objects), e.g. `--components '[{"type":"body","parameters":[{"type":"text","text":"A1B2C3D4"}]}]'`.

Bird selects the sender number from the template's category — there is no `--from`. **Done when** the command returns a message object with an `id` and `status: accepted`. Like email and SMS, `accepted` means Bird took the message, not that it landed; read it back with _Get_ or follow _List events_ to confirm delivery.

## List

`bird whatsapp list` returns a page of sent messages, newest first, as a cursor envelope (`{ "data": [...], "next_cursor": ... }`); page with `--limit`, `--starting-after`/`--ending-before`. Narrow with `--created-after`/`--created-before` (RFC 3339), `--status` (repeatable), `--phone-number` (E.164 exact match), or `--bsuid` (Meta business-scoped user id). `list` only emits JSON, so pull fields with `jq`.

## Get

`bird whatsapp get <message-id>` returns one message with its delivery status. Default output is JSON; `--format text` prints a human-readable card. A missing id returns not-found (exit `3`).

## List events

`bird whatsapp list-events <message-id>` returns the lifecycle event timeline for one message, in chronological order (e.g. sent, delivered, read, failed). Filter by `--type` (e.g. `whatsapp.delivered`, `whatsapp.failed`).

## Traps

- **Free text isn't supported yet.** Every send needs `--template`; there's no free-text body path like email or SMS.
- **`accepted` is not delivered.** WhatsApp delivery is asynchronous; the status on `send` only confirms Bird accepted the message. Read it back with `get`, or follow `list-events` for the full lifecycle.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
