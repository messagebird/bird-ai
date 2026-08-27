# WhatsApp templates

A WhatsApp template (`wat_…`) is the only content WhatsApp delivers outside an open 24-hour customer service window, and only an approved one is deliverable. The tree is three groups deep, mirroring the resource path: a template holds versions, and each version holds one entry per language, so what actually sends is a language of a version, not the template itself.

- `bird whatsapp templates` covers the template: `list`, `get`.
- `bird whatsapp templates versions` covers its versions: `list`, `get`.
- `bird whatsapp templates versions languages` covers a version's per-language content: `list`, `get`.

This surface is reads only. Authoring, submitting for Meta review, duplicating, and discarding a template all stay dashboard-only, deliberately: the underlying contract is still reshaping around localization, and a CLI command, once shipped, cannot be withdrawn the way a dashboard screen can. Sending a template is not here either; it is a payload mode of [whatsapp](whatsapp.md) `send`.

## Permissions

All six reads need `whatsapp_management:read`, a workspace-level scope, so a normal workspace login is enough; nothing here needs an elevated or resource-scoped grant. This surface never asks for `whatsapp_management:write`: that half of the scope belongs to the dashboard's authoring flows, not to anything on this CLI surface.

## Read

- `bird whatsapp templates list` returns a cursor envelope of the workspace's templates, each with its handle, lifecycle status, and where each of its languages stands. Content is not included. Narrow with `--category`, `--status` (repeatable), `--scope system|workspace`, `--waba`, and `--q`, which matches slug, name, and description.
- `bird whatsapp templates get <template-ref>` returns one template by slug or `wat_…` id, same shape as a `list` row: no content.
- `bird whatsapp templates versions list <template-ref>` returns every version the template holds, newest first, including an open draft if one exists. Each version is otherwise immutable once submitted.
- `bird whatsapp templates versions get <template-ref> <version-id>` returns the whole version: every language's content blocks, what the submission did with each, and the `variables` the content fills in, combined across languages. This is the one call that carries content for all languages at once — `versions list` returns the same shape without content.
- `bird whatsapp templates versions languages list <template-ref> <version-id>` names the languages a version holds, each with its own review verdict and a content hash, so you can tell which languages differ before fetching any of them.
- `bird whatsapp templates versions languages get <template-ref> <version-id> <language>` returns one language's content blocks, plus what that version's submission did with it and Meta's review outcome.

```
# find the version a send resolves to: the template names it, don't guess from the list
bird whatsapp templates get <template-ref> | jq -r '.live_version_id'
# then read every language's content in one call
bird whatsapp templates versions get <template-ref> <version-id>
```

## Sending what you read

The send itself, and its flags, belong to [whatsapp](whatsapp.md) — go there to send. What the registry decides for it: a language is optional to name, resolving to the template's `default_language` unless the template sets `language_source_required`, in which case a send that omits one fails. The values a send supplies must fill the placeholders of whichever language actually resolves, so read that language's content here first to know what it expects.

## Traps

- **The newest version is not the one that sends.** `versions list` is newest-first and includes an open draft, so `.data[0]` is often a draft or a version still pending review. The template names the version in service as `live_version_id` — read that rather than inferring it from the order. It is null until a first approval, and a template with no live version cannot be sent at all.
- **List rows carry no content.** `bird whatsapp templates list` and `get` exist to find a `template-ref` and see lifecycle state, not to read what a template says; `versions list` omits it too. Content comes from `versions get` (every language at once) or `versions languages get` (one language).
- **Approval is per language, not per template.** One language can be approved while another on the same version is rejected, so check the specific language a send will use rather than the template's overall status.
- **`--scope system` and `--waba` never overlap.** Bird's built-in templates belong to no WhatsApp Business Account, so pairing the two filters on `list` always returns an empty page.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
