# Marketing broadcasts

`bird email broadcasts` prepares, sends, and inspects email to an audience. Start with [authentication](authenticate.md): `bird auth status --workflow marketing` checks the broadcast permission; template, domain, and workspace commands have separate permissions.

`bird workspace get` names the workspace and gives its parent organization ID. The command API does not expose the organization's display name; report the ID as an ID when identifying the account.

## Before sending

1. `bird email broadcasts get <broadcast-id>` identifies the audience, category, sender, template, and state you are about to use.
2. `bird email broadcasts counts <broadcast-id>` estimates `total`, `addressable`, and `sendable` contacts. `bird email broadcasts send-quota <broadcast-id>` compares the sendable count with the organization's daily and monthly email allowance. Both are live estimates that can change before the send.

   Before scheduling, run `bird email broadcasts send-quota <broadcast-id> --send-at <scheduled_at>` with the time you plan to pass to `bird email broadcasts send --scheduled-at`. The check uses current limits and does not subtract broadcasts that are scheduled but have not sent yet. Broadcasts scheduled for the same period may together exceed the limit even if each check shows enough quota. `allowed` and `limited_by` describe the email send allowance at that time. If an allowance resets by then, the check uses its full allowance. It does not reflect plan changes or temporary limit changes that take effect before that time. This check reserves nothing. The allowance is checked again when the broadcast sends, using what remains after other sends.

   When present, `resets_at` is the earliest time the reported allowance resets. An audience larger than a full daily or funded monthly limit cannot send in any window with that limit. A reported monthly `limit` can instead be a temporary funding restriction.

   When present, use `can_start` to decide whether email limits permit starting, even if `allowed` or `remaining` is 0. For example, 60,000 recipients can exceed a temporary unfunded `limit` of 50,000 yet have `can_start: true` when daily and funded monthly limits permit them; the broadcast can start and wait for funds. If `can_start` is absent, use `allowed` and do not assume waiting is supported. Other send checks still apply.

   Without `--send-at`, the result is for a send now, even if the broadcast is already scheduled. `limit_reason` explains what sets the monthly email limit if you can read the organization's billing. If `broadcasts.remaining` is 0, you cannot send or schedule a draft.

3. Check the sender with `bird email domains list`. For template parameters, follow [published inputs, preview, and member test](#published-inputs-preview-and-member-test). `bird email templates preview <template-ref>` inspects authored content; it does not supply a broadcast preview fingerprint. An empty unsubscribe link in a preview is not live; marketing sends add unsubscribe content at send time.
4. Confirm the broadcast, audience, and sender with the user before `bird email broadcasts send <broadcast-id>` or `bird email broadcasts create --send`. A send cannot be recalled after delivery begins.

`counts` and `send-quota` can time out on very large audiences. An E01017 response gives no reliable pre-send estimate; do not treat it as zero or as permission to send. The quota result describes Bird's email send allowance for this broadcast. It does not report the current subscription plan or the external provider's account capacity.

## Resume a paused broadcast

Resume the same broadcast to continue delivery to its remaining recipients. Read it with `bird email broadcasts get <broadcast-id>` and check `status`, `started_at`, and the pinned `template.id`, `template.version_id`, and `template.language`. A `waiting_for_funds` broadcast continues automatically if funding recovers during its wait; explicit resume requires `paused`.

Before continuing late delivery, ask the user whether the message is still appropriate. A reviewer with `email_management:read` first runs `bird email templates get <template-id>` with the broadcast's `template.id` to check `scope`, which the version read does not show. `scope: system` marks a built-in template, whose lookups return current catalogue content; a `404` means a deleted workspace template, whose pinned version stays readable. For a workspace template, inspect the pinned content with `bird email templates versions get <template-ref> <version-id>`, including after the template is deleted. Broadcasts with frozen content keep it, but older broadcasts can read the catalogue again when resumed. Neither a current lookup nor an earlier message alone proves what remaining recipients will receive. Leave the broadcast paused unless that content can be verified.

After the user confirms, run `bird email broadcasts resume <broadcast-id>`. If sending started at least 24 hours ago, pass `--yes` only after the user acknowledges that the remaining recipients will receive the message late. Older broadcasts without `started_at` use send authorization, or creation when that is also missing. The flag skips no funds, workspace activity, sending allowance, or concurrency check.

A successful response accepts continuation; inspect the broadcast and its recipients to follow delivery. If the request times out, read its state before retrying. If funds or sending allowances still block it, resolve that restriction and retry the same broadcast. Do not create a replacement broadcast to recover the remaining recipients.

## Published inputs, preview, and member test

Parameter operations use ordinary workspace permissions. Input discovery, broadcast `parameters` and per-language `parameter_overrides`, validation, preview and test are available.

1. Read the broadcast and its selected template, then run `bird email templates parameters <template-ref>` with the same `--language` if selected. This discovers requirements from the template's published content in that language without contact values. Draft author samples are separate from saved broadcast inputs; there is no customer version selector here.
2. Supply a complete map with `--parameters` on broadcast `create` or `update`, or with `template.parameters` in `--body-file`. Omission retains the saved map; `{}` clears it; `null`, lists, and scalars cannot replace the map. Replacing the map replaces every entry. Changing the template ID clears the old language and both maps before supplied replacements; repeat the same ID to retain them while clearing its selected template version. A body can clear a draft selection with `template:null`, or clear its language with `template.language:null`; template flags cannot be combined with a cleared template. Per-language values go in a second complete map, `--parameter-overrides` or `template.parameter_overrides`, keyed by a language tag such as `es`: each language holds only the names whose value differs, and a name it leaves out uses the `parameters` value, including later changes to it. For a non-default language, an override value replaces the `parameters` value, even `""`, `0`, `false` or `null`; remove the name to return it to the `parameters` value. Overrides for the template's current default language are kept but unused. Omission keeps the override map, `{}` removes every override, and a language with no names is removed. Sending the override map applies language rules: `parameters` must then hold every input the default language and the envelope use.
3. Run `bird email broadcasts validate <broadcast-id>` with any intended template, language, map, or envelope overrides. Validation checks the template's published content without saving overrides, selecting a template version for sending, or evaluating recipients. Fix used-input problems before previewing.
4. Run `bird email broadcasts preview <broadcast-id>` with the same overrides and `--contact-id <contact-id>` when used inputs need an actual contact. The contact supplies personalization and requires `email_marketing:read`. Inspect the subject and bodies and retain `preview_fingerprint`; author template preview cannot replace this step. Validate and preview execute fresh reads and leave the draft unchanged.
5. Confirm a test with the user, then run `bird email broadcasts test <broadcast-id> --to <member-email> --preview-fingerprint <fingerprint> --idempotency-key <intent-key>`, repeating the preview's exact overrides and contact. The operation requires marketing write (`email_marketing:write`), template management read (`email_management:read`) and email send (`emails:write`) permissions. The destination is a current organization member with workspace access, independent of the personalization contact. A user can use their own member email; another destination or a machine principal also needs members read permission. A changed preview requires a fresh fingerprint. Acceptance queues a tracking-disabled test; it does not establish delivery. Reuse the intent key for the same accepted request, and inspect its returned identity before retrying an ambiguous result.

Each value is a string, number, boolean, or null and is used exactly as given, including false, zero, and text containing braces. Objects and lists are refused. Caller names are bare names outside `bird`; for recipient data, the template itself reads contact fields such as `bird.contact.first_name`. Individual email `--parameters` keeps its own format.

```json
{ "template": { "parameters": { "title": "Welcome", "offer": "OCTOBER20", "discount": 20 } } }
```

Keep the same effective template, map, language, contact, and envelope through validate, preview, and test. For a real audience send or schedule, retain the confirmation above and use ordinary `send` or `create --send` with its scheduling flags. The send request checks the template's published content but does not select a version; execution later uses the template's latest published version. A later published change can therefore require correcting the saved inputs before execution.

## Recipient visibility

`bird audiences list-contacts <audience-id>` lists members, including contacts a marketing broadcast might exclude. `counts` shows only aggregate sendability. There is no address-level pre-send exclusion list or reason in these commands. Once sending starts, `bird email broadcasts list-recipients <broadcast-id>` shows resolved recipients and their delivery state; use `--to <address>` to find one. An empty recipient list before sending does not mean the audience is empty.

After sending, read the broadcast status, recipients, and events. If a send request times out, check the broadcast and its recipients before attempting any retry; the timeout alone does not establish that the send was rejected.

**Done when** the requested broadcast action is confirmed by its returned state, or its delivery state is reported with the remaining uncertainty made explicit.
