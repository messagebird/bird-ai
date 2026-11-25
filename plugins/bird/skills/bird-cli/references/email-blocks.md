# Reusable email blocks

A **block** (`ebl_…`) is one self-contained email section, such as a legal footer or a disclosure, that templates **link** instead of copying. Each block language has one editable **draft** and its own **published revisions**. Every send fills a link with the block's latest published content in the template's language, so publishing a block language changes every template that links it, with no new template version. The tree mirrors the resource path:

- `bird email blocks` covers the block: `list`, `get`, `create`, `update`, `duplicate`, `validate`, `publish`.
- `bird email blocks languages` covers a block's per-language drafts: `list`, `get`, `set`, `delete`.
- `bird email blocks languages revisions` covers a language's published revisions: `list`, `get`.

Linking a block into a template is not here: it is a save of the template language, `bird email templates versions languages set` (see [email-templates](email-templates.md) for the template loop).

## Permissions

Reads, including `validate`, need `email_management:read`; every other write needs `email_management:write`. A plain login requests read permissions, so check [authentication](authenticate.md) and step up before writing. API keys, logins and the dashboard share the same blocks.

## The section

Commands author HTML blocks. A section is one complete `<table role="presentation">` whose single content cell names the language and sets its own typography. This starter is valid as written:

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tbody>
    <tr>
      <td lang="en" style="font-family: Arial, sans-serif; font-size: 14px; font-style: normal; font-weight: normal; line-height: 20px; letter-spacing: normal; text-align: left; text-transform: none; color: #333333; margin: 0; padding: 16px;">
        <p style="margin: 0;">Your disclosure text.</p>
      </td>
    </tr>
  </tbody>
</table>
```

All layout stays inside that cell. The cell's `lang` must equal the block language, so a section copied from `en` to add `fr` needs `lang="fr"`. The cell sets `font-family`, a `font-size` in pixels, `font-style`, `font-weight`, `line-height`, `letter-spacing`, `text-align` (`left`, `right`, `center` or `justify`, not `start` or `end`), `text-transform`, `color`, `margin` and `padding`. Root-relative units such as `rem` are refused anywhere in the section; use px, em or percentages. No document wrapper, `<style>`, script, form, `class` or `id` attribute. A table nested inside the cell needs its own `<tbody>`. Outlook conditional comments must be complete; inside one, prefixed Office and VML elements such as `<v:fill />` may self-close, and the balanced `<!--[if !mso]><!-->` (or `<!--[if !mso]><!-- -->`) … `<!--<![endif]-->` pair is accepted when no other conditional comment sits inside it; Outlook resumes at the first `<![endif]`.

Liquid such as `{{ order_id }}` is allowed, but every tag opens and closes inside the cell, and a block cannot use `{% assign %}`, `{% capture %}`, `{% increment %}` or `{% decrement %}`. No Liquid control tag (`{% if %}`, `{% for %}` and the like) may sit inside an attribute or `style` value; put the condition around the whole element instead. `{{ bird.unsubscribe_url }}` may appear only as bare text or as the entire `href` of an `<a>`, as in `<a href="{{ bird.unsubscribe_url }}">Unsubscribe</a>`, and never inside an `<!--[if !mso]><!-->` span, which Outlook skips. Contact properties the section names must already be registered.

The section travels in a `fragment` object, which only `--body-file` can carry:

```json
{
  "source_language": "en",
  "fragment": { "serializer_version": 2, "fragment_html": "<table role=\"presentation\" …>…</table>" }
}
```

Send `fragment_html` exactly as written: nothing wraps, strips or reformats it. `--example` prints the full shape.

## Author, check, publish

```
bird email blocks validate --language en --body-file section.json      # checks; saves nothing
bird email blocks create "Legal footer" --body-file block.json          # draft revision 1
bird email blocks languages set <ebl_…> fr --revision 0 --body-file fr.json   # add a language
bird email blocks publish <ebl_…> --language en=1 --language fr=1
```

- `validate` checks an unsaved section against the publication rules and returns its derived plain text. A problem is a `422` naming the field. It checks contact properties only for a login or key with contact read access; `publish` checks them either way.
- `create` saves an unpublished block with one source-language draft. Unfinished content saves; only publishing requires a valid section.
- `languages set <ebl_…> <lang>` replaces one draft with a complete section. `--revision` is the draft revision last read, or `0` to add a language. Saving never publishes.
- `publish <ebl_…>` names each language with its draft revision (`--language <tag>=<revision>`, repeatable). The named languages publish together or not at all.

After publishing, `languages get` reports `published_revision_id`, and `languages revisions list <ebl_…> <lang>` shows the new revision.

## Read

- `bird email blocks list` returns block metadata without content. `--q` matches the name; `--archived` lists only archived blocks and `--archived=false` only unarchived ones, and leaving it out returns both.
- `bird email blocks get <ebl_…>` returns one block's metadata and its `revision`, which `update` and `duplicate` send back.
- `bird email blocks languages list <ebl_…>` names the languages with their draft revisions and published revision IDs.
- `bird email blocks languages get <ebl_…> <lang>` returns one draft: its `fragment`, its `revision` and its `authoring_mode`.
- `bird email blocks languages revisions list <ebl_…> <lang>` and `… revisions get <ebl_…> <lang> <ebr_…>` read published history.

## Link a block into a template

Only an HTML-authored template language links blocks through commands. The block must be published in the template's exact language and not archived.

```
bird email templates versions languages get <emt_…> <emv_…> en --authoring   # source HTML, shared_blocks, revision
bird email templates versions languages set <emt_…> <emv_…> en --body-file linked.json
bird email templates versions submit <emt_…> <emv_…>
```

1. Read the draft language with `--authoring`. It returns the source HTML with any existing link comments, the `shared_blocks` map and the `revision` to save with. An ordinary read returns filled HTML instead.
2. Place a comment `<!--bird:shared-block:UUID-->` where the section goes, using a fresh lowercase UUID, and add the same UUID to `shared_blocks.bindings`:

```json
{
  "subject": "Your order",
  "html": "<html><body><p>Thanks for your order.</p><!--bird:shared-block:3f2b8c1e-5d4a-4e6b-9c7d-2a1f0e9b8c7d--></body></html>",
  "text": "",
  "revision": 4,
  "shared_blocks": {
    "version": 1,
    "bindings": { "3f2b8c1e-5d4a-4e6b-9c7d-2a1f0e9b8c7d": { "block_id": "ebl_…" } }
  }
}
```

3. Save the whole language with `languages set`. Keep `text` empty: a language with links derives its plain text. If the language already has custom plain text, add `"replace_custom_text": true` to replace it.
4. Preview with `bird email templates preview`, then submit. Sends fill each link with the block's latest publication.

To move a section, move its comment and keep its UUID. To remove one, delete both the comment and its binding. To remove every link, save with no comments and `"bindings": {}`. Leaving out `shared_blocks` when saving a linked language is refused, so a save of filled HTML never drops the links by accident.

## Change and maintain

- `bird email blocks update <ebl_…> --revision <n>` renames the block, edits its description, changes its source language before the first publication, or archives it with `--archived` (unarchive with `--archived=false`). An archived block keeps every existing link filling and stays publishable, but cannot be linked anew.
- `bird email blocks duplicate <ebl_…> --revision <n> --name <name>` copies every current draft into a new unpublished block with no history. Each language keeps its authoring mode.
- `bird email blocks languages set <ebl_…> <lang> --revision <n> --from-revision-id <ebr_…>` copies a published revision back into the draft. It does not publish it.
- `bird email blocks languages delete <ebl_…> <lang> --yes` removes a language that was never published. The source language and a published language cannot be removed.

## Traps

- **Publishing reaches mail already scheduled.** A publication changes every template that links the block in that language for mail that starts afterwards, including broadcasts already scheduled. Only an individually scheduled message keeps the content it was accepted with. Validate and preview before publishing.
- **A publication that adds a sender input asks first.** If the new content needs an input that live templates' senders do not supply yet, `publish` fails with `E04105` (exit `5`) naming the inputs and up to ten templates. Once those senders supply them, run the same `publish` again with `--yes`. If you passed `--idempotency-key`, pass a new key for that repeat, because it is a different request.
- **The unsubscribe link is protected.** A publication that removes the only unsubscribe link from a live marketing template is refused with a `422` naming the template.
- **Two revisions, two meanings.** A draft's `revision` guards saves and publication. A published revision's `version_number` counts publications. Send the draft `revision` to `publish`, never the `version_number`.
- **Languages are exact.** `pt-BR` and `pt` are different languages, with no fallback. A template language can link a block only when that exact block language is published.
- **Visual content is edited in the dashboard.** A block language or template language with `authoring_mode: visual` was built in the Bird dashboard's visual editor. Commands can read it but not replace its body, and linking into a visual template language is refused with `E04108`; only `subject` and `preview_text` updates still work. A visual template language that links no blocks yet can be replaced with HTML by an ordinary save, which discards its visual design, and then linked. Ask before discarding someone's design.
- **A linked language saves with its links.** A save that changes the body of a language that links blocks but leaves out `shared_blocks` fails with `E04109`. Read it again with `--authoring` and save the complete language.
- **A block language keeps its mode.** Sending HTML to a visual block language is refused with `E04110`. Create a new block for HTML content instead.
- **Filled HTML is not a link.** Copying the HTML of an ordinary template read into another template creates independent content that no longer follows the block.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
