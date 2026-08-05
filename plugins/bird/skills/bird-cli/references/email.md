# Email

Send email messages through Bird and inspect what was already sent. Actions on one resource: `send`, `send-batch`, `list`, `get`.

`send` delivers one message to explicit recipient addresses, carrying either raw html/text or a stored template; `send-batch` posts many distinct messages in one call. There's no audience or broadcast path here.

**Sending a stored template.** `--template <slug|emt_…>` sends a template's live version in place of `--subject`/`--html`/`--text`, with `--parameters '{"first_name":"Ada"}'` supplying its variables. The two content modes are exclusive, and on a template send the values belong to the template, so passing `--parameters` alongside inline content is a different thing entirely. A send that omits `--category` takes the template's own classification. Authoring the templates you send here is [email-templates](email-templates.md).

## Procedure

- The `from` must be a sender the workspace can use: a verified sending domain, or the shared onboarding domain on a new workspace.
- `bird email send`: Returns `accepted` (HTTP 202), delivered asynchronously; not confirmation of delivery.
  - Confirm delivery or inspect bounces by reading the message back. (`bird email get`)

Then branch on what they asked for:

- **Send a message** → _Send_ below.
- **Find or inspect already-sent messages** → _List_ and _Get_ below.

## Send

`bird email send` builds an `EmailMessageSendRequest` and posts it. You can supply the body three ways, and they combine:

- **Flags** — every body field has one: `--from`, `--to`/`--cc`/`--bcc`/`--reply-to` (repeatable or comma-separated), `--subject`, `--html`/`--html-file`, `--text`/`--text-file`, `--attach`, `--header`/`--tag` (Key=Value), `--metadata`, `--category`, `--ip-pool`, `--track-opens`/`--track-clicks`.
- **A JSON body via `--body-file <path|->`** — the whole request as one object: `bird email send --body-file body.json`; `-` reads stdin (`jq … | bird email send --body-file -`). The CLI never reads stdin unless `--body-file -` names it.
- **Both** — flags override the matching field in the body, so one stored template serves many recipients: `bird email send --body-file campaign.json --to alice@acme.com`.

The body file is also the only way to set the attachment sub-fields `--attach` can't express (`content_id` for inline images, `content_type`). To see the exact shape with a real value in every field, run `bird email send --example` — it prints a complete, valid body and needs no credentials, so it's the right thing to read before constructing one rather than guessing field names.

### Pick a sender the workspace can actually send from

The `from` address decides which recipients you're allowed to reach, so resolve it before composing the send — don't assume an arbitrary domain works:

- **A verified domain reaches anyone.** Run `bird email domains list` and pick one with `status: verified`; that sender can send to any recipient.
- **No verified domain yet? Use the shared onboarding domain.** A new workspace can send from `onboarding@messagebird.dev` immediately — no DNS, no verification — but it only delivers to **verified members of the workspace** (e.g. the signed-in user's own address) or the **sandbox addresses** (`delivered@`, `bounce@`, and the others at `messagebird.dev`), and it's capped at ~50 recipients per organization per day. Sending from it to any other address is rejected.
- **To reach arbitrary external recipients, verify your own domain first** (`bird email domains create` → add DNS → `bird email domains verify`; see [domains](domains.md)).

So match the sender to the recipient: from the shared domain, send to the user's own member address or a sandbox address; for an outside recipient, send from a verified domain.

### Confirm before sending

`send` puts real mail in real inboxes — it can't be unsent, and a wrong recipient or a bad `from` spends sender reputation you can't get back. Before running it, confirm the recipient set and the `from` address with the user, and look twice when a body file fans out to a large `to`/`cc`/`bcc` list. Use `--idempotency-key <key>` when a send might be retried, so a repeat with the same key replays the original result instead of delivering twice.

### Done when

The command returns a message object (HTTP 202) with an `id` and `status: accepted`. `accepted` means Bird took the message, not that it landed — delivery is asynchronous. To find out whether it actually delivered or bounced, read it back later with _Get_; the counts there are the source of truth.

## Send batch

`bird email send-batch` posts many distinct messages in one request — each with its own recipients and body — rather than one message to many recipients. Build the batch as a JSON array via `--body-file <path|->` (`bird email send-batch --example` prints the shape). The response is a batch object; each entry is `accepted` independently, so read the batch back to confirm per-message delivery. The sender rules from _Send_ apply to every message in the batch.

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
- **List output is JSON only.** `--format text` is silently ignored on `list`, so don't try to parse a human table — read `.data[]` with `jq`.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
