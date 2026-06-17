# Authenticate the CLI

Run `bird auth login` before any command that hits the API — unless `bird auth status` already reports `valid: true`, in which case there's nothing to do. Gate on `valid` being `true`, not on `false`: with no credential, `valid` is omitted and `authenticated` is `false`, so a "`valid == false`" check sails past the unauthenticated case.

`bird auth login` opens a browser to sign in; you pick a workspace and the permissions to grant, and the resulting token — scoped to that workspace — is saved for later commands. An agent launches it the same as a human; it's not a terminal prompt. On a headless or SSH host (or with `--device`), it prints a code and a URL to enter on another device instead.

Don't pass `--scope` by default. Plain `bird auth login` requests the full delegable set and the consent screen caps it to what the signing-in user actually holds — complete and least-surprising. `--scope` (repeatable) **replaces** that set with exactly the scopes you list (it's not additive), dropping every other scope — so a later command can 403 on a scope you didn't think to include. Use it only to deliberately mint a minimal-privilege token.

To act on a different workspace, run `bird auth login` again and pick it at consent — a credential is bound to one workspace.

## Done when

`bird auth status` reports `valid: true`.
