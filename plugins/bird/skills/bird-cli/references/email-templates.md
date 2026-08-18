# Email templates

A template is reusable email content that a send refers to by handle instead of inlining the markup. A **template** (`emt_…`) owns an immutable `slug` and one editable **draft**; submitting the draft freezes it as an immutable numbered **version**, and sends serve that version. Content lives per language inside a version, so the tree is three groups deep, mirroring the resource path:

- `bird email templates` covers the template: `list`, `get`, `create`, `update`, `delete`, `duplicate`, `preview`.
- `bird email templates versions` covers its versions: `list`, `get`, `delete`, `submit`, `rollback`.
- `bird email templates versions languages` covers a version's per-language content: `list`, `get`, `set`, `update`, `delete`.

Sending a template is not here — it is a payload mode of [email](email.md) `send` (`--template <slug|emt_…>`).

## Permissions

Reads need `email_management:read`; every mutation needs `email_management:write`. Both are workspace-level, so a normal workspace login is enough.

## The authoring loop

Four steps:

```
bird email templates create welcome-email --category marketing --source html
bird email templates versions languages set <emt_…> <emv_…> en --subject "Hi {{ first_name }}" --html "<p>Hello</p>" --yes
bird email templates versions submit <emt_…> <emv_…> --validate-only --yes   # check, freeze nothing
bird email templates versions submit <emt_…> <emv_…> --yes                   # freeze, go live
```

`create` returns the template with `draft_version_id` — that is the `<emv_…>` every version and language command takes. Then send it:

```
bird email send --from hello@yourdomain.com --to a@b.com --template welcome-email --parameters '{"first_name":"Ada"}'
```

## Read

- `bird email templates list` returns a cursor envelope spanning both the workspace's own templates and Bird's built-in catalogue: the workspace's own templates lead (newest first), with the built-in catalogue trailing once they're exhausted. Narrow with `--scope workspace|system`, `--category`, `--source`, and `--q`, which matches slug, name, **and** description.
- `bird email templates get <slug|emt_…>` returns one template's metadata and the state of each language it holds. It carries **no content** — that is deliberate, so opening a template costs the same at one language or twenty-five.
- `bird email templates versions list <emt_…>` returns the draft plus every submitted version, newest first.
- `bird email templates versions get <emt_…> <emv_…>` returns one version's frozen content and the `variables` it expects.
- `bird email templates versions languages list <emt_…> <emv_…>` names the languages a version holds, with revisions but no content; `… languages get <emt_…> <emv_…> <lang>` returns one language's subject and bodies.

```
# templates that have never gone live
bird email templates list --scope workspace | jq -r '.data[] | select(.live_version_id == null) | .slug'
```

## Mutate

Every mutation takes flags or a `--body-file` JSON body (`--example` prints the shape, `--dry-run` previews the request without sending). Every mutation but `create`, `duplicate`, and `preview` is destructive and requires `--yes`.

- `bird email templates create <slug>` creates the template and its empty draft. `--category` and `--source` are required and fixed at creation. The draft's initial per-language content is a language-keyed map that no flag can express, so seed it with `--body-file` or, more simply, create empty and use `versions languages set`.
- `bird email templates update <slug|emt_…> --revision <n> --yes` changes metadata only (`--name`, `--description`, `--default-language`, `--on-missing-language`, `--language-source-required`). Content is never edited here.
- `bird email templates duplicate <slug|emt_…>` forks a workspace template or a built-in into a new unpublished template; `--slug` names the copy, otherwise one is derived.
- `bird email templates preview <slug|emt_…> --parameters '{...}'` renders the draft (or `--version <emv_…>`) and returns the subject and bodies a send would deliver. Nothing is sent.
- `bird email templates versions languages set <emt_…> <emv_…> <lang> --subject … --html … --yes` writes one language in full; `… languages update … --yes` changes only the flags you pass; `… languages delete … --yes` removes a language.
- `bird email templates versions submit <emt_…> <emv_…> --yes` freezes the draft and makes it live. `--validate-only` also requires `--yes` and runs every check without freezing anything; `--expected-revision <n>` refuses the submit if the draft moved since you read it.
- `bird email templates versions rollback <emt_…> <emv_…> --revision <n> --yes` makes an earlier version live again and resets the draft to its content. No new version is created.
- `bird email templates versions delete <emt_…> <emv_…> --yes` **discards the draft's edits**, resetting it to what is live. It does not delete a submitted version.
- `bird email templates delete <slug|emt_…> --yes` deletes the template and every version. The slug becomes reusable, and a later send naming it fails.

## Traps

- **A draft is never sent.** Editing changes nothing about live behavior; only `versions submit` does. A template that has never been submitted has no live version, and sending it returns `422`, not `404`.
- **`--dry-run` and `--validate-only` are different things on `submit`.** `--dry-run` is the universal CLI flag: print the request, call nothing. `--validate-only` is a real API call that runs every completeness check server-side and freezes nothing. Use `--validate-only` to find content problems; `--dry-run` only shows you the body you were about to send.
- **`slug` is the handle, `name` is decoration.** The slug is workspace-unique and immutable, and it is what a send names. `name` is a mutable display label that defaults to the slug and resolves nothing. Renaming for display never breaks a send.
- **Writes are revision-guarded.** `update`, `rollback`, and the language writes take the revision you last read; a concurrent change returns `409`. Re-read and retry rather than forcing.
- **Submit is all or nothing.** Every language needs a subject and a body and the default language must be among them. One incomplete language rejects the whole submit, and the response names every problem across every language, so fix them in one pass. A submit that would change nothing is also refused.
- **`bird_` templates are Bird's, not yours.** Built-ins can be listed, read, previewed, and sent, but never edited or deleted; `duplicate` is how you make one yours. Creating a template whose slug starts with `bird_` or `emt_` is rejected.
- **The template's category rides along.** A send that omits `--category` takes the template's own classification, which decides suppression policy. Set `--category` on the send only to override it.
- **A language-strict template can't be broadcast.** Turning on `--language-source-required` makes every send name a language, and a broadcast has no field to name one, so the template becomes unusable there.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
