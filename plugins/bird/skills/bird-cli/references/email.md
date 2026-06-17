# Email

Send email messages through Bird and inspect what was already sent. Three actions on one resource: `send`, `list`, `get`.

`send` delivers to explicit recipient addresses with raw html/text — there's no audience, template, or broadcast path here.

## State check, then act

Every action calls the live API, so first confirm credentials — a missing login fails the same way a real error does, and the wasted round-trip hides the actual problem:

```
bird auth status --format json
```

Hand off to [authenticate](authenticate.md) unless `valid` is `true`, then come back — that node explains why the check gates on `valid` being `true`. Don't tell the user to authenticate and stop — the task stalls there.

Then branch on what they asked for:

- **Send a message** → _Send_ below.
- **Find or inspect already-sent messages** → _List_ and _Get_ below.

## Send

`bird email send` builds an `EmailMessageSendRequest` and posts it. You can supply the body three ways, and they combine:

- **Flags** — every body field has one: `--from`, `--to`/`--cc`/`--bcc`/`--reply-to` (repeatable or comma-separated), `--subject`, `--html`/`--html-file`, `--text`/`--text-file`, `--attach`, `--header`/`--tag` (Key=Value), `--metadata`, `--category`, `--ip-pool`, `--track-opens`/`--track-clicks`.
- **A JSON body via `--body-file <path|->`** — the whole request as one object: `bird email send --body-file body.json`; `-` reads stdin (`jq … | bird email send --body-file -`). The CLI never reads stdin unless `--body-file -` names it.
- **Both** — flags override the matching field in the body, so one stored template serves many recipients: `bird email send --body-file campaign.json --to alice@acme.com`.

The body file is also the only way to set the attachment sub-fields `--attach` can't express (`content_id` for inline images, `content_type`). To see the exact shape with a real value in every field, run `bird email send --example` — it prints a complete, valid body and needs no credentials, so it's the right thing to read before constructing one rather than guessing field names.

### Confirm before sending

`send` puts real mail in real inboxes — it can't be unsent, and a wrong recipient or a bad `from` spends sender reputation you can't get back. Before running it, confirm the recipient set and the `from` address with the user, and look twice when a body file fans out to a large `to`/`cc`/`bcc` list. Use `--idempotency-key <key>` when a send might be retried, so a repeat with the same key replays the original result instead of delivering twice.

### Done when

The command returns a message object (HTTP 202) with an `id` and `status: accepted`. `accepted` means Bird took the message, not that it landed — delivery is asynchronous. To find out whether it actually delivered or bounced, read it back later with _Get_; the counts there are the source of truth.

## List

`bird email list` returns a page of sent messages, newest first. Filter with `--status` (`accepted`, `processed`, `deferred`, `delivered`, `partial_failure`, `bounced`, `complained`, `rejected`), `--to`, `--from`, and `--limit`.

The response is an envelope: `{ "data": [...], "next_cursor": ..., "prev_cursor": ..., "refresh_cursor": ... }`. For the next page, pass the `next_cursor` value back as `--starting-after`; a null `next_cursor` means you've reached the end. `list` only emits JSON (it ignores `--format text`), so pull fields with `jq` — e.g. `bird email list --status bounced | jq -r '.data[].id'`.

**Done when** you have the page (or have walked the cursors to the end for a full sweep).

## Get

`bird email get <message-id>` shows one message by its `em_…` id, including the delivery and engagement counts. Default output is JSON; `--format text` prints a human card. A missing id returns not-found (exit `3`).

**Done when** the message is returned. Use this after a `send` to confirm delivery, since `send` itself only reports `accepted`.

## Traps

- **Flags replace, they don't append.** `--to` overwrites the body's `to` array rather than adding to it — that's what makes the template-plus-override pattern work, but it surprises if you expected the body's recipients to stay.
- **Unknown JSON fields are rejected, not ignored.** A typo like `"frm"` fails with `unknown field "frm"` and exit `2` instead of silently dropping — run `bird email send --example` to see the accepted field names. This is deliberate, so a mistyped field never sends a subtly wrong message.
- **`from` must already be on a verified domain.** An unverified sender comes back as a `422` (exit `2`), and retrying won't clear it. Find a usable sender with `bird domains list` (look for `status: verified`), or set one up with `bird domains create` → add the DNS records → `bird domains verify` — see [domains](domains.md).
- **`accepted` is not `delivered`.** `send` returns before delivery happens; treating `accepted` as success will miss bounces. Confirm with _Get_ when delivery matters.
- **List output is JSON only.** `--format text` is silently ignored on `list`, so don't try to parse a human table — read `.data[]` with `jq`.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
