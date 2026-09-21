# Read receipts and reactions

These mutate the contact's conversation; establish the requested message and action before running them. Read [authentication](authenticate.md) for account access.

## Acknowledging a received message

`bird whatsapp mark-read <message-id>` marks one message the contact sent as read, showing them the blue ticks; WhatsApp marks every earlier message in that conversation read too. Add `--typing-indicator` to show a typing indicator at the same time — WhatsApp clears it when you send your next message or after 25 seconds, whichever comes first, and there is no command to clear it early, so ask for one only when you are about to reply. Repeating the call restarts that 25-second window, but only with a fresh `--idempotency-key` or none: a replayed key answers from the stored response without acknowledging anything again.

Only an inbound message can be acknowledged. WhatsApp allows it for 30 days, but Bird keeps the provider id a receipt needs for 15, so an older message is not-found (exit `3`); a message the workspace sent is unprocessable.

## Reactions

`bird whatsapp reaction set <message-id> --emoji 👍` places one emoji on a message the contact sent, the same way tapping and holding does. The workspace holds at most one reaction per message, so setting another replaces it rather than adding a second. `bird whatsapp reaction remove <message-id> --yes` takes yours back; removing one from a message you never reacted to changes nothing and still succeeds.

`bird whatsapp reaction list-events <message-id>` returns every change to that message's reactions, newest first, as a cursor envelope — each emoji placed, each replaced, each taken back, by the contact and by you. Page with `--limit`, `--starting-after`/`--ending-before`. Entries carry a `status`, so a reaction WhatsApp refused is visible here with its `error`. For what currently stands instead, read the `reactions` on `bird whatsapp get`.

## Traps

- **A `202` is acceptance, not application.** `mark-read`, `reaction set` and `reaction remove` all answer once Bird has taken the request, not once WhatsApp has acted. Reactions carry no delivery or read receipt, so `reaction list-events` is the only place a refusal says why; a read receipt reports nothing at all, so there is nothing to poll and no webhook.
- **Reactions go on messages the contact sent.** Reacting to your own outbound message is not supported and is refused, as is a message that is itself a reaction or one past WhatsApp's 30-day window — the latter two as not-found (exit `3`), because Bird keeps the id a reaction needs for 15 days and has nothing left to match.
