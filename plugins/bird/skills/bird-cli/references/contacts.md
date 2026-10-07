# Contacts, audiences, and contact properties

Three related resources behind the workspace's contact data. A **contact** is a person (identified by email); an **audience** is a named group of contacts; a **contact property** is a custom field that describes contacts. Three command groups:

- `bird contacts` manages contacts: `list`, `get`, `create`, `update`, `delete`, `batch`.
- `bird audiences` manages groups and their membership: `list`, `get`, `create`, `update`, `delete`, plus `list-contacts`, `add-contacts`, `remove-contacts`, `remove-contact`.
- `bird contact-properties` manages custom fields: `list`, `get`, `create`, `update`, `archive`, `unarchive`.

## Contacts

- `bird contacts list` returns a page of contacts (cursor envelope; page with `--limit`/`--starting-after`). `bird contacts get <contact-id>` returns one.
- `bird contacts create <email>` creates a contact; set custom fields with the properties defined in `bird contact-properties`. `bird contacts update <contact-id>` edits one.
- `bird contacts delete <contact-id> --yes` removes a contact.
- `bird contacts batch` applies many creates/updates in one call from a `--body-file`; run `bird contacts batch --example` to see the shape.

## Audiences

- `bird audiences create <name>` creates a group; `bird audiences update <audience-id>` renames or reconfigures it; `bird audiences delete <audience-id> --yes` removes it.
- `bird audiences list-contacts <audience-id>` pages the members. Move contacts in and out with `bird audiences add-contacts <audience-id>` and `bird audiences remove-contacts <audience-id>` (both take the contact set from flags or a `--body-file`), or drop one with `bird audiences remove-contact <audience-id> <contact-id>`.

## Contact properties

Properties are the schema for contact custom fields, so define a property before setting it on a contact.

- `bird contact-properties create <key>` defines a field; `bird contact-properties update <property-id>` edits it.
- `bird contact-properties archive <property-id> --yes` removes a property from pickers and prevents its use in new template versions. Published templates keep sending. Contacts keep their values, and the API and imports still accept updates of the correct type. `bird contact-properties unarchive <property-id>` restores the property with its values.

## Traps

- **A contact property must exist before a contact can carry that field.** Setting an unknown field on `contacts create`/`update` is a usage error, not a silent add. Define it with `contact-properties create` first.
- **Remove a property with archive and restore it with unarchive.** There is no hard delete. Archiving returns a 409 conflict while a published automation, including a paused one, uses the property in a trigger or contact write, or while an active run writes it. Remove it from those automations or archive them, let active runs finish or cancel them, then retry with `--yes`. The key stays reserved and counts toward the 200-property limit.
- **`add-contacts`/`remove-contacts` take a set; `remove-contact` takes one.** Use the plural forms with a `--body-file` for bulk membership changes and the singular for a single id.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
