# SMS

Send SMS messages through Bird, inspect what was sent, and browse the templates you can send. `bird sms` covers the channel (`send`, `list`, `get`); `bird sms templates` browses stored templates (`list`, `get`).

Branch on what they asked for:

- **Send a message** → _Send_ below.
- **Find or inspect already-sent messages** → _List_ and _Get_ below.
- **Browse stored templates** → _Templates_ below.

## Send

`bird sms send --to <e164>` sends to one recipient. The body is either free text or a stored template, and the two are mutually exclusive:

- **Free text** — `--text "<body>"` with `--category` (`transactional`, `marketing`, `authentication`, or `service`; required with `--text`).
- **A stored template** — `--template <smt_… | slug>` with `--parameters '<json>'` for its variables and `--language <bcp-47>` to pick the language. Browse templates with `bird sms templates list`.

`--from` is the sender (an E.164 number, an alphanumeric sender ID, or a short code). It is **required on a free-text send**, and a numeric sender must be one the workspace owns. A template send picks its own sender, so `--from` is not accepted there. `--tag` and `--metadata` attach labels. `bird sms send --example` prints a complete, valid body and needs no credentials, so read it before constructing a `--body-file`.

**Done when** the command returns a message object with an `id` and `status: accepted`. Like email, `accepted` means Bird took the message, not that it landed; read it back with _Get_ to confirm delivery.

## List

`bird sms list` returns a page of sent messages, newest first, as a cursor envelope (`{ "data": [...], "next_cursor": ... }`); page with `--limit` and `--starting-after`. `list` only emits JSON, so pull fields with `jq`.

## Get

`bird sms get <message-id>` returns one message with its delivery status. Default output is JSON; `--format text` prints a human card. A missing id returns not-found (exit `3`).

## Templates

`bird sms templates` is read-only — you browse templates authored elsewhere, then send one with `bird sms send --template`.

- `bird sms templates list` returns the templates available to the workspace (cursor envelope).
- `bird sms templates get <smt_…>` returns one template with its body, variables, and available languages.

## Traps

- **`--text` and `--template` are mutually exclusive.** A text send needs `--category`; a template send takes `--parameters`/`--language`. Mixing them is a usage error (exit `2`).
- **A free-text send has no default sender.** Omitting `--from` with `--text` fails the send with `422 SMSNoEligibleSender`, and so does a numeric `--from` the workspace does not own. Bird only picks the sender on the template path.
- **`accepted` is not delivered.** SMS delivery is asynchronous; the status on `send` only confirms Bird accepted the message. Read it back with `get`.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
