# SMS

Send SMS and MMS messages through Bird, inspect what was sent, and browse the templates you can send. `bird sms` covers the channel (`send`, `list`, `get`, `media`); `bird sms templates` reads template identities, versions, and language content.

Branch on what they asked for:

- **Send a message** → _Send_ below.
- **Find or inspect already-sent messages** → _List_ and _Get_ below.
- **Browse stored templates** → _Templates_ below.

## Send

`bird sms send --to <e164>` sends to one recipient. Choose direct content or a stored text template:

- **Free text** — `--text "<body>"` with `--category` (`transactional`, `marketing`, `authentication`, or `service`; required with `--text`).
- **MMS** — set `subject` alongside text, or `media_urls` with or without text, in a JSON `--body-file`. A subject alone is invalid. Supply `--category`, a `+1` recipient and an MMS-capable number held by the workspace as `--from`. Media must stay publicly fetchable; the carrier checks 600 KiB per file and 900 KiB total during delivery. MMS uses one message unit at MMS rates; plain SMS is billed per segment.
- **A stored template** — `--template <smt_… | slug>` with `--parameters '<json>'` for its variables and `--language <bcp-47>` to pick the language. Browse templates with `bird sms templates list`, then read the live version for its variables.

`--from` is the sender (an E.164 number, an alphanumeric sender ID, or a short code). It must be a sender the workspace owns and can use. A `messaging_profile_id` in the body file can supply an omitted sender and category; otherwise supply them for direct content and a sender for workspace templates. A built-in system template picks its own sender and rejects `--from`. `--tag` and `--metadata` attach labels. `bird sms send --example` prints a complete, valid body and needs no credentials, so read it before constructing a `--body-file`.

**Done when** the command returns a message object with an `id` and `status: accepted`. Like email, `accepted` means Bird took the message, not that it landed; read it back with _Get_ to confirm delivery.

## List

`bird sms list` returns a page of sent messages, newest first, as a cursor envelope (`{ "data": [...], "next_cursor": ... }`); page with `--limit` and `--starting-after`. `list` only emits JSON, so pull fields with `jq`.

## Get

`bird sms get <message-id>` returns one message with its delivery status. Default output is JSON; `--format text` prints a human card. A missing id returns not-found (exit `3`).

## Templates

`bird sms templates` is read-only. Template reads are shallow; content and variables live on versions.

- `bird sms templates list` returns a cursor page of template summaries. Filter with `--q`, `--scope`, `--category`, `--status`, or `--language`.
- `bird sms templates get <smt_… | slug>` returns one template's identity, lifecycle, and `live_version_id`, without message text.
- `bird sms templates versions list <template-ref>` returns a cursor page of shallow versions. Use the template's `live_version_id` to identify what sends use.
- `bird sms templates versions get <template-ref> <version-id>` returns the version's variables and all language text, keyed by language tag.
- `bird sms templates versions languages list <template-ref> <version-id>` lists the languages without their text.
- `bird sms templates versions languages get <template-ref> <version-id> <language>` returns one language's text and content hash.

## Download received media

`bird sms media <message-id> <media-id> --output photo.jpg` downloads a stored inbound attachment. Take the message ID and the attachment's `media[].id` from `bird sms get`. Omit `--output` to write bytes to stdout, or use `--url` to print a short-lived download URL instead. Do not send Bird authorization when fetching that URL. Files are kept for 30 days; `410` means the file is gone, and `404` means the message or attachment was not found.

## Traps

- **Templates cannot include direct content.** Omit `--text` and `--category`, and omit `subject` and `media_urls` from the body file, with `--template`; use `--parameters`/`--language` instead.
- **Resolve the sender before sending.** Direct content and workspace templates need `from`, supplied explicitly or by a messaging profile. A sender the workspace does not own or cannot use is rejected. Built-in system templates pick their sender.
- **`accepted` is not delivered.** SMS delivery is asynchronous; the status on `send` only confirms Bird accepted the message. Read it back with `get`.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
