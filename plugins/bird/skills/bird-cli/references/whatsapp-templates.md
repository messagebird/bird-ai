# WhatsApp templates

A WhatsApp template (`wat_…`) is the only content WhatsApp delivers outside an open 24-hour customer service window, and only an approved one is deliverable. The tree is three groups deep, mirroring the resource path: a template holds versions, and each version holds one entry per language, so what actually sends is a language of a version, not the template itself.

- `bird whatsapp templates` covers the template: `list`, `get`, `create`, `update`, `delete`, `duplicate`.
- `bird whatsapp templates versions` covers its versions: `list`, `get`, `create`, `delete`, `submit`.
- `bird whatsapp templates versions languages` covers a version's per-language content: `list`, `get`, `set`, `delete`, `discard`.

Reading and authoring are both here; sending a template is not, because it is a payload mode of [whatsapp](whatsapp.md) `send`. Two things shape the whole authoring surface: content is written to a draft and reaches WhatsApp only when the draft is submitted, and approval comes back per language rather than per template.

Branch on what they asked for:

- **See what templates exist, or read one's content** → _Read_ below.
- **Create a template, or change its metadata** → _Author_ below.
- **Write or edit a language's content** → _Author_ below.
- **Get a template approved, or find out where a review stands** → _Submit and poll_ below.
- **Undo an edit, drop a language, or retire a template** → _Undo and remove_ below.

## Permissions

The six reads need `whatsapp_management:read` and the ten writes need `whatsapp_management:write`, both workspace-level; nothing here needs an elevated or resource-scoped grant. A plain `bird auth login` requests a read-only baseline, so the writes need a step-up: `--yolo` requests the full delegable catalogue, which is what an agent that will author wants. Reach for `--scope whatsapp_management` only to mint a deliberately minimal token, because `--scope` replaces the baseline rather than adding to it and drops every other scope the token would have held. [authenticate](authenticate.md) has the full rule.

A workspace may author only on a WhatsApp Business Account it has connected. An account it does not hold is refused, and so is a Bird built-in template (`scope: system`), which lives on Bird's own account: fork one with `duplicate` onto your own account instead of trying to edit it.

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

## Author

Content lives on a draft, and a template holds at most one open draft. Nothing written here reaches WhatsApp until the draft is submitted.

1. Pick the account: `bird whatsapp business-accounts list` reports the accounts the workspace has connected, and every create names one.
2. `bird whatsapp templates create <slug> --waba <waba> --category utility|marketing|authentication --default-language <tag>`. The slug is permanent, and WhatsApp's own template name derives from it; the category is fixed too, but it is not what a send is priced at: Meta applies its own category per language and may move one, and the price follows that. The `bird_` prefix is reserved.
3. `bird whatsapp templates versions create <template-ref>` opens the draft. It is safe to call when unsure: a template has one draft, so this returns the open one rather than a second. `bird whatsapp templates get <template-ref>` reports it as `draft_version_id`, which skips the call.
4. `bird whatsapp templates versions languages set <template-ref> <version-id> <language> --body-file <file>` writes one language, once per language.

`set` replaces the language rather than merging it, so the file carries the language's complete `components` every time. There is no flag for content: a block holds nested arrays of its own, which no flat flag expresses. `--example` prints the shape.

`bird whatsapp templates update <template-ref>` changes the display name, description, and language policies. It never moves the slug or the category, and it never touches content.

`bird whatsapp templates duplicate <template-ref> --waba <waba>` copies a template into a new one holding the source's content as an open draft, which is how a Bird built-in becomes something the workspace can edit. The copy names the account it lands on rather than inheriting the source's, and calls WhatsApp zero times.

```
# create the template, open its draft, then write English into it
bird whatsapp templates create order_update --waba 102290129340398 --category utility --default-language en
bird whatsapp templates versions create order_update | jq -r '.id'
bird whatsapp templates versions languages set order_update <version-id> en --body-file en.json
```

To seed the first draft in the create itself, pass the whole body with `--body-file`: its `languages` object maps a language tag to that language's `components`.

## Submit and poll

Check before you freeze. `bird whatsapp templates versions submit <template-ref> <version-id> --validate-only` runs every check across every language and reports each problem in one pass, freezing nothing and sending nothing to WhatsApp. Read `valid` and `errors`; each error carries the language, the field, and the error code a real submit would fail with.

Then submit for real by dropping `--validate-only`. That freezes the draft as an immutable version and answers `202`. Only the languages whose content differs from their approved copy go to WhatsApp as `pending`; one that already matches carries its `approved` verdict forward and is never sent, so a submit whose languages are all unchanged comes back settled with nothing to poll for. Use a different `--idempotency-key` for the check and the submit, because reusing one key with a different body is rejected. No replacement draft opens afterwards, so the next round of edits starts at `versions create` again.

Approval arrives later, and per language:

- `bird whatsapp templates get <template-ref>` reports `pending_version_id`, which stays set while any language is unresolved and is absent when the submit settled on the spot. That is what to poll. Its `status` is the aggregate: `active` means at least one language is sendable, not all of them.
- `bird whatsapp templates versions languages list <template-ref> <version-id>` reports each language's own verdict. `approved` sends; `rejected`, `submit_failed`, and `paused` need an edit on a fresh draft, because WhatsApp accepts an edit to a paused language and a resubmit is what clears it; `disabled`, `limit_exceeded`, and `in_appeal` refuse an edit outright, so they only need re-reading until WhatsApp moves them.
- `available_languages` on the template is exactly what a send can resolve right now.

A clean `--validate-only` does not predict WhatsApp's decision. WhatsApp offers no way to ask in advance, so it can still refuse content the local checks passed.

## Undo and remove

All four discard or delete something unrecoverable, so each refuses with `confirmation_required` unless you pass `--yes`. `--yes` answers the CLI's prompt, not the user: ask the person you are acting for first, naming the template or language and that the content does not come back, and pass the flag only once they have said yes.

- `bird whatsapp templates versions languages discard <template-ref> <version-id> <language> --yes` restores one language of the draft to the copy it was branched from, leaving every other language alone.
- `bird whatsapp templates versions languages delete <template-ref> <version-id> <language> --yes` removes a language from the draft. The default language cannot be removed.
- `bird whatsapp templates versions delete <template-ref> <version-id> --yes` deletes the whole draft. What sends resolve is unaffected, because a submitted version keeps serving.
- `bird whatsapp templates delete <template-ref> --yes` deletes the template and every language it holds, here first and at WhatsApp afterwards. Sends by that slug stop working.

`discard` and `set` both take `--revision`, the revision you last read for that language, which makes the write a compare-and-set: a mismatch is refused rather than overwriting an edit you have not seen. Omit it for last-write-wins, which is what a single writer wants.

## Sending what you read

The send itself, and its flags, belong to [whatsapp](whatsapp.md) — go there to send. What the registry decides for it: a language is optional to name, resolving to the template's `default_language` unless the template sets `language_source_required`, in which case a send that omits one fails. The values a send supplies must fill the placeholders of whichever language actually resolves, so read that language's content here first to know what it expects.

## Traps

- **A draft is not a version, and neither is sendable until approved.** `create` returns a template with `status: draft` and nothing at WhatsApp. Only a submitted, approved version serves a send.
- **`set` replaces, it does not merge.** Sending only the block you changed deletes the rest of the language. Read the language first and write it back whole.
- **Every variable needs an example value.** WhatsApp reviews the filled message rather than the template, so a block with placeholders and no `example_parameters` is refused at submit.
- **A language under review refuses a write.** WhatsApp holds it until the review finishes, so an edit during `pending` fails rather than queueing.
- **The four destructive commands need `--yes`.** `templates delete`, `versions delete`, `languages delete` and `languages discard` each refuse with `confirmation_required` without it, so a non-interactive run fails on the first attempt.
- **Check and submit need different idempotency keys.** Reusing one key with a different body is rejected, and `--validate-only` changes the body.
- **The newest version is not the one that sends.** `versions list` is newest-first and includes an open draft, so `.data[0]` is often a draft or a version still pending review. The template names the version in service as `live_version_id` — read that rather than inferring it from the order. It is null until a first approval, and a template with no live version cannot be sent at all.
- **List rows carry no content.** `bird whatsapp templates list` and `get` exist to find a `template-ref` and see lifecycle state, not to read what a template says; `versions list` omits it too. Content comes from `versions get` (every language at once) or `versions languages get` (one language).
- **Approval is per language, not per template.** One language can be approved while another on the same version is rejected, so check the specific language a send will use rather than the template's overall status.
- **`--scope system` and `--waba` never overlap.** Bird's built-in templates belong to no WhatsApp Business Account, so pairing the two filters on `list` always returns an empty page.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
