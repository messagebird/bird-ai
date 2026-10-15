# WhatsApp conversations

Reads need `whatsapp:read` and updates need `whatsapp:write`, both workspace-level. A plain `bird auth login` gets a read-only baseline without the `whatsapp` scope, so step up with `--yolo`, or `--scope whatsapp` for a minimal token. [authenticate](authenticate.md) has the full rule.

## What a conversation is

One thread between a connected number and a single contact, or a group that number belongs to, with a `wacv_` id. It exists only on a number with conversations turned on, which is a dashboard setting, and appears once a first message is recorded. It is never closed: resolving it keeps the id, and the contact's next message reopens it.

## Triage the inbox

- `bird whatsapp conversations counts` gives the open buckets: assigned to you, unassigned, and held by the Meta Business Agent.
- `bird whatsapp conversations list` returns the most recently active first. Filter with `--inbox-status open|resolved`, `--business-phone-number <e164>`, `--control bird|meta_business_agent`, `--assigned-to <user-id>|me|unassigned`, `--service-window-status open|closed` or `--label <name>` (repeatable).
- `bird whatsapp conversations get <conversation-id>` shows who answers it, when its 24-hour service window closes, unread count, labels and last message.
- `bird whatsapp conversations list-events <conversation-id>` is its history: control moves, assignments and agent notifications. `--type` narrows to one kind.

## Read the thread

`bird whatsapp conversations list-messages <conversation-id>` returns its messages newest first; `--direction inbound|outbound` reads one side. `get-message <conversation-id> <message-id>` reads one. They are the same objects `bird whatsapp list` returns. Messages are kept for 30 days, so an old conversation can return an empty page.

## Update it

`bird whatsapp conversations update <conversation-id>` with any of:

- `--assigned-to <user-id>` or `--assigned-to me`. Unassign with `{"assigned_to": null}` through `--body-file`: the flag sends `null` as text.
- `--labels billing --labels vip` replaces the whole set. Pass every label to keep. To clear them, send `{"labels": []}` through `--body-file`; a single empty `--labels ""` also clears every label, so never pass an unset variable to it.
- `--inbox-status resolved` finishes the work; `open` reopens it.
- `--read <timestamp>` marks inbound messages at or before that `created_at` read in the workspace inbox.

Reply with `bird whatsapp send`: to a contact, `--from` the conversation's `business_phone_number` `--to` its `recipient.phone_number`, or its `recipient.bsuid` when the phone number is null; to a group (`recipient.group_id` set), `--to <wag_…>` with no `--from`, because the group already has its number.

## Traps

- **`me` and `counts` need a person.** An API key has no user. `--assigned-to me` (on `list` or `update`) returns `422`; pass the user's id instead. `counts` returns `403` `E02083` and has no input to substitute: sign in with `bird auth login --yolo` (or `--scope whatsapp`) and repeat it.
- **`--read` is not a read receipt.** The contact sees nothing; use `bird whatsapp mark-read` for that.
- **Control is not on the CLI.** Taking a conversation from the Meta Business Agent, or handing it back, stays in the dashboard.
- **A closed service window refuses free-form replies.** Check `service_window.status` before replying; outside it only a template sends.
