# WhatsApp suppressions

Account reads and writes require [authentication](authenticate.md). A suppression blocks every message to one address, so confirm the intended scope before adding one.

## Suppressions

`bird whatsapp suppressions list` returns the suppressions in force as a cursor envelope; page with `--limit` and `--starting-after`/`--ending-before`, and narrow with `--address` or `--reason`.

`bird whatsapp suppressions add --address +15550001234 [--waba 102290129340398]` records one, and `get <id>` reads one back.

`remove <id> --yes` ends a suppression, which starts messages flowing to that address again. **Confirm the record and its scope with the user before running it.** `--yes` only satisfies the CLI's own gate; it is not the user telling you this is the right address. Read the record back with `get <id>` and put its address and `waba` in front of them first, because a wrong id here resumes delivery to someone who asked to be left alone.

- **`--address` on the list is a prefix, not an exact match.** A partial value returns every address under it, which is how a range is checked; a complete address returns just that one. Do not present a multi-row answer as a bad query.
- **`list` shows only what is in force, `get` also answers for what has ended.** An address missing from the list is not proof it was never suppressed. An ended record keeps its dates and reports `ended_at` and `ended_reason`, so the history of what was blocked when survives the block itself.
- **Omitting `--waba` blocks the address for the whole workspace, including accounts connected later.** With it, only that business account stops; every other account in the workspace still reaches the address. The same address for two accounts is therefore two records, so covering a workspace is one call rather than one per account.

## Traps

- **Ending is not deleting, and only a `manual` suppression can be ended.** A recipient's own opt-out is theirs to reverse and the attempt is unprocessable, so fail closed rather than retrying it. Repeating `remove` on one that has already ended succeeds and changes nothing; an id that does not exist is not-found (exit `3`).
- **There is no command that ends a suppression by address.** Look the id up with `list --address` first.
- **A suppression catches an accepted message only if it is still waiting to be processed.** The check runs once, at the top of the Process stage, and the Send job is enqueued after it. So a message accepted but not yet processed is caught and terminally rejected, failing asynchronously with a `whatsapp.rejected` event carrying `error.code: "recipient_suppressed"`; a message already past that check is queued to send and nothing rechecks it. Adding a suppression is therefore not a way to recall in-flight sends, and a `202` from an earlier send tells you nothing either way.
- **Adding an address that is already suppressed for that scope returns the existing record.** It is not a duplicate and not an error, so do not retry it as though the first call failed.
