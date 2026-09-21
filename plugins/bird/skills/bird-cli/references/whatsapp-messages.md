# Send and inspect WhatsApp messages

Account operations require [authentication](authenticate.md). Send only within the user's requested scope.

## Send

Start with `bird whatsapp send --example <kind>` for a ready-to-edit payload: `text`, `image`, `video`, `audio`, `document`, `sticker`, `location`, `contact-cards`, `template`, `interactive-button`, `interactive-list`, `interactive-cta-url`, `interactive-carousel`, `interactive-location-request-message`, or `interactive-request-contact-info`. Bare `--example` keeps the default template example.

Interactive kinds have different shapes: reply buttons use `interactive.buttons`, lists use `interactive.list`, link buttons use `interactive.cta_url`, and carousels use `interactive.cards`. Copy the matching schema-derived example; do not extrapolate from the button kind. A list row uses `text`, not `title`; `title` names its section.

Run `bird whatsapp send --body-file message.json --dry-run` to check the schema and print the resolved body without sending. Preview also checks the content schema before returning a link. These local checks do not verify account permissions, sender ownership, or the customer service window.

`bird whatsapp send --to <e164>` sends one message to one recipient, carrying exactly one kind of content:

- **A template:** `--template <slug>` or `--template-id <wat_…>` (mutually exclusive), with `--language` for the variant and `--components '<json>'` filling its placeholders (e.g. `--components '[{"type":"body","parameters":[{"type":"text","text":"A1B2C3D4"}]}]'`). Browse your workspace's approved templates with `bird whatsapp templates list`.
- **Free-form content:** `--text` (with `--preview-url`), `--image`, `--video`, `--audio` (with `--voice` for a voice note), `--sticker`, `--document` (with `--filename`), or a location (`--latitude`/`--longitude`, with `--location-name`/`--location-address`). `--caption` labels an image, video, or document.
- **Interactive content:** `--interactive '<json>'` sends reply buttons, a list menu, a link button, media cards, or a single button asking the recipient to share their location or their phone number (e.g. `--interactive '{"type":"button","body_text":"Reschedule?","buttons":[{"type":"quick_reply","quick_reply":{"slug":"yes","text":"Yes"}}]}'`). A tap comes back as an ordinary inbound message: a reply button or list row as `interactive_reply`, a location or contact card as `location`/`contact_cards` on `bird whatsapp get`.
- **Contact cards:** `--contact-cards '<json>'` sends up to five contact cards, each a `name` plus optional `org`, `birthday`, `phone_numbers`, `emails`, `urls` and `addresses` (e.g. `--contact-cards '[{"name":{"formatted_name":"Barbara J. Johnson","first_name":"Barbara"},"phone_numbers":[{"phone_number":"+16505551234","type":"Mobile"}]}]'`). A `name` needs `formatted_name` plus at least one other part, or WhatsApp rejects the card; a phone number in E.164 is what earns the card a Message button, and any other form renders an Invite button instead.

`--in-reply-to <wam-id>` quotes an earlier message from the same conversation, with any content kind. A Bird-managed template picks its own sender from its category and must omit `--from`; a template your workspace authored requires `--from`, the same as free-form and interactive content. `--tag` and `--metadata` attach labels.

**Done when** the command returns a message object with an `id` and `status: accepted`. Like email and SMS, `accepted` means Bird took the message, not that it landed; read it back with [Get](#get) or follow [List events](#list-events) to confirm delivery.

## List

`bird whatsapp list` returns a page of sent messages, newest first, as a cursor envelope (`{ "data": [...], "next_cursor": ... }`); page with `--limit`, `--starting-after`/`--ending-before`. Narrow with `--created-after`/`--created-before` (RFC 3339), `--status` (repeatable), `--phone-number` (E.164 exact match), or `--bsuid` (Meta business-scoped user id). `list` only emits JSON, so pull fields with `jq`.

## Get

`bird whatsapp get <message-id>` returns one message with its delivery status. Default output is JSON; `--format text` prints a human-readable card. A missing id returns not-found (exit `3`).

## List events

`bird whatsapp list-events <message-id>` returns the lifecycle event timeline for one message, in chronological order (e.g. sent, delivered, read, failed). Filter by `--type` (e.g. `whatsapp.delivered`, `whatsapp.failed`).

## Media on received messages

`bird whatsapp media <message-id> <media-id>` downloads the image, video, audio clip, sticker or document on a received message. The media id is the `id` on the content object `bird whatsapp get` returns, not the message id. Bytes go to `--output`, or to stdout when it is unset, so redirect or `--output` them rather than letting binary hit a terminal. `--url` prints the short-lived (15 minute) download URL instead, for handing to another tool; that URL authorizes itself, so do not send it an `Authorization` header. `--url` and `--output` cannot be combined — pick one. Media is kept 30 days after the message arrives; after that the message still lists the media's `mime_type` and `caption`, and this exits with a gone error.

## Traps

- **Free-form content needs an open window.** It's deliverable only inside an open 24-hour customer service window, which the contact opens by messaging or calling you and resets each time they do it again. Bird does not track the window, so a send outside one is accepted and then fails with `service_window_expired` on the message's `last_error`. A template is the only content WhatsApp delivers outside one.
- **`accepted` is not delivered.** WhatsApp delivery is asynchronous; the status on `send` only confirms Bird accepted the message. Read it back with `get`, or follow `list-events` for the full lifecycle.
