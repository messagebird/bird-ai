# Feedback

Send the person's feedback about Bird to the Bird team: `bird feedback send "<text>"`. It arrives as an email in Bird's feedback mailbox, from the signed-in account, and returns a receipt id (`fbk_…`).

## When to use it

Use it when the person asks to tell Bird something: a rough edge, a missing feature, praise, or anything else they want the team to hear. Pass their words, not a summary of the session, and share nothing they did not ask to share. When something is broken and blocking them, open a support ticket instead (`bird support-tickets create`, [support](support.md)): that is where they get help.

## Send

- `bird feedback send "<text>"`: the text is 1 to 4,000 characters.
- The team may answer at the account's email address.
- Each new call sends a new message, so do not repeat one that succeeded. Retrying a failed call with the same `--idempotency-key` and text within 24 hours is safe: it returns the same receipt and does not send a second message.
- It needs an OAuth login (`bird auth login`); an API key carries no person to send from.

Sending is limited to 5 messages an hour and 20 a day per account. A `429` says when to try again.
