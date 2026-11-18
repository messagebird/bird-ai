# Submit a separate seed example

Complete [access](email-seeding-access.md). Establish authorization for this sender and content before sending. A live runtime can spend seed-test allowance and send billable seed copies. Inspecting a campaign alone does not authorize a new example.

Check enabled settings through [settings](email-seeding-settings.md); do not enable them as a side effect of a send. Use the trigger as the sole actual To recipient, with no Cc or Bcc. Mixing it into an ordinary send does not trigger an automatic run, while ordinary copies may still send.

Use the existing `bird email send` operation with finished HTML/text or a published template using caller parameters. Inline content follows [send email](email.md). Selecting a separate personalization contact for a standalone example is outside this CLI/MCP workflow.

Inline Liquid caller values use top-level `parameters`; stored-template caller values use `template.parameters`. Neither replaces reserved `bird.contact` values. To use a separate contact's values in this standalone path, supply approved finished content; caller parameters cannot override reserved fields. [Template preview](email-templates.md) can inspect a selected contact's rendering without sending; it does not issue recipient-specific unsubscribe URLs.

For a template, use the [template workflow](email-templates.md#read) to establish its published version, language and required caller parameters when they are not already known. Supply those parameters under `template.parameters` and the chosen language under `template.language`. A draft preview alone does not establish that the version being sent has been published.

Use the returned trigger address in the send body. Before the first send, choose an explicit idempotency key and retain it with the exact body. MCP generates an omitted key internally and does not return it for recovery across calls.

For an already authorized inline example with a verified sender and retained nonempty intent key:

```sh
set -o pipefail
: "${seeding_send_key:?Retain one key for this authorized example}"
settings=$(bird email seeding settings get) &&
body=$(printf '%s' "$settings" | jq -ce \
  --arg sender 'news@example.com' --arg subject 'Campaign example' \
  --arg html '<p>Approved campaign content.</p>' '
  if .enabled == true and (.trigger_address | type == "string" and length > 0)
  then {from: $sender, to: [.trigger_address], subject: $subject, html: $html}
  else error("enabled settings and a trigger are required") end') &&
printf '%s' "$body" | bird email send --body-file - \
  --idempotency-key "$seeding_send_key" | jq '{id, status}'
```

Replace the illustrative sender, subject and content with the authorized values. Retain the exact body and key in the execution environment until the outcome is known. If a response is lost, recover the outcome or obtain approval for a manual retry when it is not already authorized; do not create a fresh intent or rebuild from changed settings.

Retain the original message ID, then follow [activity](email-seeding-activity.md) using `source_email_id`. SMTP examples use the externally submitted MIME flow; broadcasts use their existing send workflow. Neither needs a manual run-create, registration, dispatch or resend tool.

Done when the send is accepted and its source observation or current absence is reported. Acceptance alone does not establish a run, delivery or placement.
