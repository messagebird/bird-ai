# Labels

The workspace's label catalogue: one record per label, with a name unique in the workspace regardless of case, an optional colour (`#RRGGBB`) and an optional description of when to apply it. Email threads, Apple Messages conversations and WhatsApp conversations all draw their custom labels from it. One command group:

- `bird labels` covers `list`, `get`, `create`, `update`, `delete`.

The five commands need three scopes. A token or key minted with a narrower `--scope` fails the others with exit `4` (`403`):

| Command            | Scope                      |
| ------------------ | -------------------------- |
| `list`, `get`      | `workspace:read`           |
| `create`, `update` | `mailbox:write`            |
| `delete`           | `mailbox_management:write` |

## Reading

- `bird labels list` returns every label in one list, ordered by name, without pagination (returning an empty list when the workspace has no custom labels yet). Read the descriptions before labelling a conversation and prefer an existing label over creating a near-duplicate.
- Mailbox system labels (`inbox`, `archive`, `spam`, `blocked`, `sent`, `trash`, `unread`) are not in the list, and returned labels carry no `type` field — remove any old `type == 'custom'` filter. A thread's `folder` and `read` fields, delete and restore set system labels; they cannot be created or renamed here.
- `bird labels get <label-id>` returns one label.
- Server cutover retires mailbox label listing independently of CLI upgrades (rolling back the CLI does not restore it); if an installed client cannot upgrade yet, call `GET https://{region}.platform.bird.com/v1/labels` directly with `workspace:read`.

## Writing

- `bird labels create <name>` adds a label; pass `--color` and `--description` to set them. A name already in use, in any casing, fails with `E17056`: use the existing label. System names such as `inbox`, `sent`, `unread`, `open` and `assigned` are reserved.
- `bird labels update <label-id>` renames a label or changes its colour or description. The label keeps its ID, and every conversation carrying it shows the new name. `--color null` or `--description null` removes that field.
- `bird labels delete <label-id> --yes` deletes a label and removes it from every conversation and message at once. It cannot be undone: creating the same name later makes a new label with a new ID.

## Traps

- **The workspace holds at most 100 labels.** A write that would add one past the limit fails with `E17057`. Delete labels the workspace no longer uses, then retry. Finding and deleting them needs `workspace:read` and `mailbox_management:write`, including for a WhatsApp or Apple Messages integration.
- **Writing a new label name onto a conversation creates it in the catalogue.** That counts toward the 100, so reuse a listed label where one fits.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
