# Marketing broadcasts

`bird email broadcasts` prepares, sends, and inspects email to an audience. Start with [authentication](authenticate.md): `bird auth status --workflow marketing` checks the broadcast permission; template, domain, and workspace commands have separate permissions.

`bird workspace get` names the workspace and gives its parent organization ID. The command API does not expose the organization's display name; report the ID as an ID when identifying the account.

## Before sending

1. `bird email broadcasts get <broadcast-id>` identifies the audience, category, sender, template, and state you are about to use.
2. `bird email broadcasts counts <broadcast-id>` estimates `total`, `addressable`, and `sendable` contacts. `bird email broadcasts send-quota <broadcast-id>` compares the sendable count with the organization's daily and monthly email limits. Both are live estimates that can change before the broadcast sends.

   Before scheduling, run `bird email broadcasts send-quota <broadcast-id> --send-at <scheduled_at>` with the time you plan to pass to `bird email broadcasts send --scheduled-at`. The check uses current limits and does not subtract broadcasts that are scheduled but have not sent yet. Broadcasts scheduled for the same period may together exceed the limit even if each check shows enough quota. `allowed` and `limited_by` describe the email send allowance at that time. If an allowance resets by then, the check uses its full allowance. It does not reflect plan changes or temporary limit changes that take effect before that time. This check reserves nothing. The allowance is checked again when the broadcast sends, using what remains after other sends.

   When present, `resets_at` is the earliest time the reported allowance resets. An audience larger than the full `limit` cannot send in any window with that limit. Without `--send-at`, the result is for a send now, even if the broadcast is already scheduled. `limit_reason` explains what sets the monthly email limit if you can read the organization's billing. If `broadcasts.remaining` is 0, you cannot send or schedule a draft.

3. Check the sender with `bird email domains list` and preview the template with `bird email templates preview <template-ref>`. An empty unsubscribe link in a preview is not live; a caller-supplied `bird.unsubscribe_url` renders as provided. Marketing sends add unsubscribe content at send time.
4. Confirm the broadcast, audience, and sender with the user before `bird email broadcasts send <broadcast-id>` or `bird email broadcasts create --send`. A send cannot be recalled after delivery begins.

`counts` and `send-quota` can time out on very large audiences. An E01017 response gives no reliable pre-send estimate; do not treat it as zero or as permission to send. The quota result describes Bird's email send allowance for this broadcast. It does not report the current subscription plan or the external provider's account capacity.

## Recipient visibility

`bird audiences list-contacts <audience-id>` lists members, including contacts a marketing broadcast might exclude. `counts` shows only aggregate sendability. There is no address-level pre-send exclusion list or reason in these commands. Once sending starts, `bird email broadcasts list-recipients <broadcast-id>` shows resolved recipients and their delivery state; use `--to <address>` to find one. An empty recipient list before sending does not mean the audience is empty.

After sending, read the broadcast status, recipients, and events. If a send request times out, check the broadcast and its recipients before attempting any retry; the timeout alone does not establish that the send was rejected.

**Done when** the requested broadcast action is confirmed by its returned state, or its delivery state is reported with the remaining uncertainty made explicit.
