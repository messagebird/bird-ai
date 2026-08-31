# Changelog

## 0.35.0

- Mailboxes now report `size_bytes`: the stored bytes of their retained messages (the metadata and extracted text kept for the retention tier plus attachment bytes). Plans can cap it per mailbox; a send from a mailbox at its cap is rejected with `E17049`.

## 0.34.0

- Mailbox `retention_tier` now accepts `90d` and `1y` on create and update, gated by the organization's plan; a tier the plan does not include is rejected with `E17048`.

## 0.33.0

- Add the `webhooks_update` tool.
- `api_keys_create` accepts the `webhooks` scope.

## 0.32.1

- The API keys reference lists `workspace` among the `--scope` areas, and states what a key cannot do: issue keys, or change members and settings.

## 0.32.0

- The bird-cli skill covers `register_verified_number`, the trust action behind registering a phone number as a verified caller ID.

## 0.31.0

- Add tools for received-email volumes and the hosted unsubscribe page.
- The bird-cli skill covers the new bird preferences command group.
- `whatsapp_numbers_profile_update` accepts `display_name`, which requests a new display name; `new_display_name_status` says whether WhatsApp is reviewing it or accepted it without a review.
- The `bird-cli` skill now covers `bird whatsapp templates`, routing to a reference for browsing WhatsApp templates, their versions, and each version's per-language content.

## 0.30.0

- Ship the vendor-neutral Agent Plugins 1.0 manifest pair (plugin.json + mcp.json) at the plugin root, so clients that read the spec load the skills and the hosted MCP server without a per-tool conversion.

## 0.29.0

- `bird compliance identities list` lists the businesses a workspace has stored as compliance parties, so a registration can name the one it is for. The same read is available as an MCP tool.
- Backward paging now documents `refresh_cursor` alongside `prev_cursor` as an accepted anchor, so the cursor that re-reads a list from its leading edge is discoverable without cross-referencing the response schema.

## 0.28.0

- Add `bird sms senders create` and `bird sms senders registrations create` (`sms_senders_create`, `sms_senders_registrations_create`), so a workspace can claim an alphanumeric sender and register it for a country without the dashboard. Registering a priced alphanumeric sender takes a setup fee and a recurring monthly charge; registering a number is free.
- Add `bird sms tfn verifications requirements`, `create`, `list`, `get`, `update` and `cancel` (`sms_tfn_verifications_requirements`, `sms_tfn_verifications_create`, `sms_tfn_verifications_list`, `sms_tfn_verifications_get`, `sms_tfn_verifications_update`, `sms_tfn_verifications_cancel`), so a toll-free verification can be read, drafted, filled in, and abandoned to free its number, without the dashboard. Submitting it to the carrier stays a dashboard step: it charges a non-refundable fee, so a person authorizes it.
- Add `bird trust gates list|get`, `bird trust gates verification create|check` and `bird trust actions requirements` (`trust_gates_list`, `trust_gates_get`, `trust_gates_verification_create`, `trust_gates_verification_check`, `trust_actions_requirements`), so an organization's outstanding verification can be read and worked through without the dashboard. A write refused with `E16000 TrustGateUnmet` now has somewhere to go: `trust actions requirements` names which requirement is unmet.
- Add `bird sms 10dlc brands requirements` and `bird sms 10dlc campaigns requirements` (`sms_10dlc_brands_requirements`, `sms_10dlc_campaigns_requirements`), which say what the campaign registry wants before you register, and where you already stand with it. Both registrations charge per attempt and neither refunds a decline: a brand submission charges a one-off registration fee, and a campaign charges a vetting fee plus the first period of a recurring per-campaign subscription. Reading this first is what stops you paying to find out.
- Add the `bird voice trunks`, `bird voice numbers` and `bird voice destinations` write commands, and their MCP tools, so a SIP trunk, an inbound number and the voice destination allowlist can be configured from the terminal. `bird voice numbers` is new: it lists the numbers a workspace can answer calls on and sets what each one does with a call.
- The `bird-cli` skill now documents the `bird whatsapp numbers create`, `bird whatsapp numbers update`, `bird whatsapp numbers delete`, and `bird whatsapp numbers profile` commands, and `bird whatsapp business-accounts get`, so an agent using the skill can connect, rename, disconnect, and manage the business profile of a WhatsApp number, and read a connected WhatsApp Business Account.

## 0.27.0

- `bird whatsapp media <message-id> <media-id>` (`whatsapp_media`) downloads the image, video, audio clip, sticker or document on a received WhatsApp message. Bytes go to `--output` or stdout; `--url` prints the short-lived download URL instead. The MCP tool returns the file inline up to 5 MiB, or the URL above that.

## 0.26.0

- Ask WhatsApp whether it will accept a phone number before you buy it. `bird whatsapp numbers precheck <phone-number>` (`whatsapp_numbers_precheck`) answers `available` or `unavailable` for one number in E.164 format. No number is connected to your workspace, but this is a write rather than a lookup, so check the number you intend to buy rather than sweeping a list. A number that is available now can still be taken by someone else before you connect it.

## 0.25.0

- Add the `bird compliance requirements`, `bird compliance attachments upload`, `bird compliance submissions create` and `bird compliance submissions resupply` commands, so a country's registration paperwork can be read, evidenced, filed and corrected without the dashboard (`compliance_requirements`, `compliance_attachments_upload`, `compliance_submissions_create`, `compliance_submissions_resupply`). Filing answers is a legal representation about your business: `create` has no draft step and sends everything in one call.
- Add `bird sms senders list` and `bird sms senders get` (`sms_senders_list`, `sms_senders_get`), which is also what makes `bird sms senders requirements` reachable — it is keyed by a sender id nothing else on these surfaces issued.

## 0.24.0

- Read your WhatsApp traffic from the terminal and over MCP. `bird whatsapp stats summary`, `daily` and `hourly` (`whatsapp_stats_summary`, `whatsapp_stats_daily`, `whatsapp_stats_hourly`) return the period aggregate and its per-day or per-hour series, each restrictable to one template, category, sender or tag. `bird whatsapp stats by-error-code`, `by-template`, `by-template-category`, `by-tag` and `by-phone-number` rank the workspace's traffic along one dimension, and `bird whatsapp stats inbound …` counts what customers sent you. `bird whatsapp business-accounts get` (`whatsapp_business_accounts_get`) returns one connected WhatsApp Business Account, addressed by either its `waa_` id or the numeric id WhatsApp reports. All read-only.
- A received email's sender is read more reliably. `bird email inbound-messages list` and `get` (`email_inbound_messages_list`, `email_inbound_messages_get`) no longer fail on an address that differs only by quoting, and a `From` header that cannot be read falls back to the envelope sender.

## 0.23.0

- `sms 10dlc brands create` takes an optional `--identity-id`, naming the compliance party the brand describes. It records which business the registration is for, so registrations filed for the same business are tied to one another, and brands return `identity_id` on read, null when none was named.
- The party is created separately with `POST /v1/compliance/identities`; naming it on a brand does not create it, and it must belong to the same workspace, since naming another workspace's party is a `404` like a party that does not exist.
- `sms 10dlc brands submissions create` takes it too, because a resubmit sends the same body a registration does. It may attach a party to a brand registered without one; it cannot move a brand to a different party, which is a `422` naming `identity_id`.

## 0.22.1

- `bird api-keys create` takes `--name`, a repeatable `--scope <area>:<level>`, `--expires-at` and `--cidr`, so a key can be minted from flags instead of a JSON body file. `--body-file` still works, and a flag replaces the field it names rather than adding to it.
- The `bird-cli` skill's email templates reference now covers the `--theme` filter, alongside `--scope`, `--category`, `--source`, and `--q`.

## 0.22.0

- Registering or resubmitting a 10DLC campaign under a brand registered as a public company now fails until that brand's Auth+ vetting has completed, and names the vetting call to make instead. The campaign registry always refused these campaigns; it now costs nothing to find out, since the refusal arrives before the registration fee.
- Registering or resubmitting a 10DLC brand for a publicly-traded company now accepts `auto_request_auth_plus`, opting in to Bird requesting the required Auth+ vetting once the brand is approved. It is refused for any other entity type, and the vetting fee is charged when the request is placed rather than at registration.
- Add `bird sms 10dlc brands vettings list` and `bird sms 10dlc brands vettings create` for ordering a 10DLC brand's external vetting and reading past attempts.
- **Breaking:** `bird sms 10dlc brands create`, `bird sms 10dlc brands submissions create`, `bird sms 10dlc campaigns create` and `bird sms 10dlc campaigns submissions create` rename flags, most of them gaining the prefix that says which record the value belongs to (`--business-…`, `--contact-…`, `--legal-entity-…`, `--use-case-…`, `--opt-in-…`, `--opt-out-…`). Body-file keys move with the flags, and `--stock-exchange` now takes a lowercase value, so `NASDAQ` is `nasdaq`. Check every script and body file driving these four commands against `bird help <command>`, which lists the current names.
- **Breaking:** `bird sms 10dlc campaigns create` now takes `--use-case-category` in place of `--use-case`, and the body key is `use_case_category`. Resubmitting is unaffected: `campaigns submissions create` never took the use case, carrying it forward from the current submission instead.
- Issue a workspace API key from the CLI and MCP: bird api-keys create, and the api_keys_create tool. The token is returned once. Requires a login carrying api_keys:write; an API key cannot issue another key.
- The `bird-cli` skill's WhatsApp reference now covers free-form sends: the content flags, the `--from` requirement, and the 24-hour customer service window a free-form message has to land inside.
- The `bird-cli` skill's WhatsApp reference now covers the senders a workspace can use: `bird whatsapp numbers list|get` and `bird whatsapp business-accounts list`, and what a number's WhatsApp state says about why a send was refused.

## 0.21.0

- **Breaking:** the voice trunk, caller-ID and destination tools now require the `voice_management` scope in place of `voice`, so a token holding only `voice` gets `403`. Re-authorize with `voice_management:read` added, or issue a new API key holding both scopes.
- The `bird-cli` skill's WhatsApp reference no longer claims templates are the only content type a send can carry: `bird whatsapp send` still sends template messages only, but the wider API also accepts free-form content.

## 0.20.0

- Telegram is a known verification channel, so a verification can be created with `telegram` in `options.channels` and a passcode can be delivered over it.
- `bird-cli` voice reference: `bird voice tools test-call` places a test call, session credentials are a third trunk admission control, and `bird voice session-credentials create` is a write.
- Fixed the email templates skill reference to use live_version_id instead of the retired published_version_id.
- The `bird-cli` skill's verify reference now matches the shipped commands: it takes `--email` for an email recipient in place of the removed `--email-address`, documents `bird verify verifications next-channel`, and names WhatsApp among the channels a passcode is delivered over.

## 0.19.1

- The bird-cli skill now documents the lookup command group.

## 0.19.0

- **Breaking:** a contact's phone identifier is now named `phone_number`, matching the rest of the API. It replaces `phone` in create, update, batch-upsert and read bodies; the `GET /v1/contacts` filter becomes `?phone_number=`; the `identifier` filter value and the batch `match_on` / `matched_on` values become `phone_number` — they name the field, so they move with it. On the TCR brand surface, a brand's own `phone` becomes `phone_number` as well. The CLI's `bird contacts create|update` take `--phone-number`, and `bird contacts list` filters on `--phone-number`. Qualified compounds are unchanged: `mobile_phone`, `primary_phone` and `business_contact_phone` keep their names.
- **Breaking:** a verification's email recipient is now named `email`, replacing `email_address` — `bird verify verifications create|check|next-channel` take `--email`, and the JSON these commands print renames the matching field on `to`. Scripts passing the old flag, or reading `to.email_address` with `jq`, need updating. Phone recipients are unchanged: `--phone-number` and `to.phone_number` keep their names.

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
