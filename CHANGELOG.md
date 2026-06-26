# Changelog

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
