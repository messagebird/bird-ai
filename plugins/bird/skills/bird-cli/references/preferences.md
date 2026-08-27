# Messaging preferences

Stated consent grants and opt-outs, keyed by channel plus handle (an email address or E.164 phone number), optionally narrowed to one sender. A preference is cross-channel data: the same `bird preferences` group answers for email, SMS, and WhatsApp. One command group:

- `bird preferences` covers `list`, `get`, `create`, `delete`.

## Reading

- `bird preferences list` returns a page of the workspace's preferences (cursor envelope; page with `--limit`/`--starting-after`). Filter with `--channel`, and add `--handle` to look up everything on record for one address or number before messaging them; `--handle` requires `--channel`, since a handle only means something on its channel.
- `bird preferences get <preference-id>` returns one record: the key, the current statement, and its provenance.

## Writing

- `bird preferences create` records one statement, a grant or an opt-out, from flags or a `--body-file`; run `bird preferences create --example` for the shape. The write is an upsert by key (channel, handle, optional sender scope): a statement made after the key's current one replaces it.
- Statements are ordered by the moment they were **made**. One made before the key's current statement is refused, whenever it arrives, and returned with `applied: false`; the exit code is still success, so check `applied` in the output rather than the exit code alone.
- A grant over a stored opt-out needs `--consented-at` later than the opt-out it reverses. It may not be in the future.
- `bird preferences delete <preference-id> --yes` removes a workspace-recorded statement. The delete is ordered by the moment the API receives it (there is no flag to backdate one) and answers `applied: false` when a statement made after that moment survived it.

## Traps

- **`applied: false` is a refusal, not an error.** Both `create` and `delete` return success exit codes with the surviving record when the store refuses an out-of-order write. Read the `applied` field.
- **A person's own statement cannot be deleted.** An unsubscribe, a stop keyword, or a preference-page choice refuses deletion (`E25005`); the person opts back in, or you record a grant with consent evidence; deleting is never the path.
- **An opt-out defaults to `non_transactional` coverage.** Receipts and verification codes keep flowing unless the statement is recorded with `--coverage all`, which is the recipient asking for silence and blocks transactional traffic too.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
