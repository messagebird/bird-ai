# Changelog

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
- Move marketplace generation into the beak codegen toolchain (packaging only; no API changes)

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
