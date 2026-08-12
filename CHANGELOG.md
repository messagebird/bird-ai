# Changelog

## 0.18.0

- **Breaking:** `carrier` and `mcc_mnc` are omitted from `sms.sent`, `sms.delivered` and `sms.received` webhook payloads when the carrier reports none, instead of arriving as `null`; `subject` on `sms.received` behaves the same way. They are now optional rather than required, so a typed field changes to a pointer or an optional — check for absence where you checked for `null`. This matches how the message resource has always reported the same fields.
- `sms.accepted` now carries `segments`, the segment breakdown the send is billed on, so a webhook-only integration can explain the `cost` on the same event instead of fetching the message to reconcile a charge.
- Subscribe to `sms.received` to be pushed inbound SMS instead of polling for it. The payload carries the message body, its segment breakdown, both numbers, and the sending operator where the carrier reports one; a `STOP` arrives as an ordinary received message and is yours to act on.

## 0.17.0

- Listing calls now accepts in-flight and final statuses together in one `status` filter and returns them as a single page, where mixing them used to be rejected.

## 0.16.0

- Verify gains a next-channel action: when a recipient reports the passcode never arrived, send a fresh one on the next channel in the verification's plan without waiting out the resend cooldown. Identify the verification by the same recipient you started it with, as with a check — there is still no id to store. Every passcode already sent stays valid, so a late arrival can still be checked. Available as `verify.verifications.nextChannel` / `NextChannel` / `next_channel` / `nextChannel` on the TypeScript, Go, Python, and PHP SDKs, `bird verify verifications next-channel` on the CLI, and the `verify_verifications_next_channel` MCP tool. A verification whose channel plan is exhausted answers `422 NoNextChannel`.
- Corrected the email templates skill reference to describe the fixed list ordering (workspace templates lead, built-in catalogue trails).
- The create-verification docs no longer name SMS as the phone channel: a phone recipient is verified over the phone channels enabled for its destination country, in that country's configured order.

## 0.15.0

- Realtime app management reaches the command surfaces: provision and manage Realtime apps, rotate the keys their clients connect with, and read the regions an app can run in. Nine operations as `bird realtime` commands and as MCP tools. The SDKs are unchanged — publishing and channel inspection stay their business, and app management is deliberately not on them.

## 0.14.1

- Bird's Cursor plugin now carries a logo, so the Bird mark shows on its card in Cursor's plugin list.

## 0.14.0

- Contact responses no longer include `channels`; read email and phone presence directly.
- The bird CLI skill now states that transient failures are retried before a command fails, so an agent does not immediately re-run a command whose error is already the result of exhausted retries.

## 0.13.0

- Add a voice node to the bird-cli skill: reading the call log, the statistics family, and the trunk, caller-ID, and destination settings a refused call is diagnosed against.
- `bird whatsapp send` gains `--template-id`, addressing a template by its `wat_` id instead of `--template` (slug); `--language` now takes a BCP-47 tag such as `pt-BR`.

## 0.12.2

- The `bird-cli` skill now documents `--from` as required on a free-text SMS send; only a template send picks its own sender.

## 0.12.1

- Updated the bird-cli ip-pools skill reference: deleting an IP pool that still holds dedicated IPs now returns 409 (ResourceInUse), not 422.

## 0.12.0

- Route the bird-cli skill to email templates, covering the create-author-submit loop and the traps around it.

## 0.11.2

- Email message reads and send responses now report `requested_language` and `resolved_language`.
- Email message reads and send responses now report `template_id` and `template_version_id`. A template's live version changes each time you submit it, so the version is what identifies the wording a message was actually delivered with, and the two together fetch that content back.

## 0.11.1

- Fix the WhatsApp CLI reference doc: the send template is addressed by slug, not name.

## 0.11.0

- Email message reads now report the message as delivered. For a send that used a template, `subject` and the bodies from the message-content endpoint previously returned the template source, tokens and all, which is content no recipient received; they now return that source with the send's substitution values applied. The values themselves are exposed as a new `parameters` field so the inputs stay visible beside the result. Sends that supplied their content inline are unaffected.

## 0.10.0

- **Breaking:** remove the WhatsApp templates-list surface — `bird whatsapp templates list`, the `whatsapp_templates_list` MCP tool, and `whatsappTemplates.list` / `WhatsappTemplates.List` / `whatsapp_templates.list` in the TypeScript, Go, and Python SDKs. WhatsApp is still in preview and the templates contract is being reshaped for localisation; templates return to the public and command audiences at GA in the new shape.

## 0.9.3

- The plugin now connects Bird's hosted MCP server at the vanity host `https://mcp.bird.com` (replacing `mcp.platform.bird.com`), and the bundled `bird-cli` skill installs from `https://cli.bird.com/install.sh`.
- Internal improvements.

## 0.9.2

- Internal improvements.

## 0.8.8

- Correct the verification guidance in the `bird-cli` skill: a verification you have already resolved is no longer checkable and comes back as a missing verification, not a `success: false` result.

## 0.8.0

- Add account-onboarding guidance to the `bird-cli` skill: create an account, organization, and workspace without a browser (`bird auth signup`, `bird auth verify-email`, `bird auth create-org`).
- Add verification guidance to the `bird-cli` skill: send a one-time passcode and check it (`bird verify verifications`).

## 0.7.0

- Add WhatsApp guidance to the `bird-cli` skill: send messages and browse history (`bird whatsapp` — send, list, get, list-events) and list approved templates (`bird whatsapp templates`).

## 0.6.0

- Update the `bird-cli` skill for the 0.6.0 CLI: SMS (`bird sms` — send, list, get, plus `bird sms templates`), contacts, audiences, and contact properties (`bird contacts`, `bird audiences`, `bird contact-properties`), and email `send-batch`.

## 0.5.1

- Add inbound-email (email forwarding) guidance to the `bird-cli` skill: mint and manage forward addresses (`bird email inbound-addresses`) and read the mail received at them (`bird email inbound-messages`).

## 0.5.0

- Add the `email-audit` skill: audit a domain's email authentication (DMARC, SPF, DKIM, BIMI, MX) and explain the fixes like a deliverability consultant.
- Add email deliverability-tools guidance to the `bird-cli` skill: validate a DMARC or BIMI record and run a full domain audit (`bird email tools ...`).

## 0.3.0

- BREAKING: Email resources are namespaced under `email`: `bird email`, `bird email domains`, `bird email dedicated-ips`, `bird email ip-pools`. Resource naming is aligned across the CLI and MCP.
- Add support-ticket guidance: open, reply to, and read Bird support tickets, and wait for a reply with `bird support-tickets ... --watch`.
- Add documentation-search guidance: find and fetch Bird docs with `bird docs search`.
- Add `bird email domains update` for sending-domain configuration.
- Sharper email guidance (pick a sender by recipient eligibility), and operation prerequisites woven into the skill so prechecks run before an action.

## 0.2.1

- Rewrite the README with a setup section per provider (Claude Code, Cursor, Codex, GitHub Copilot, Factory Droid): copy-paste agent-setup prompt, manual install, and the MCP config as a code block.

## 0.2.0

- Add dedicated IP and IP pool management to the `bird-cli` skill (`bird ips` and `bird ip-pools`: list, get, create, update, assign, delete).

## 0.1.0

- Initial release: the `bird` plugin with the `bird-cli` skill.
