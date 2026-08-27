# Authenticate the CLI

Run `bird auth login` before any command that hits the API — unless `bird auth status` already reports `valid: true`, in which case there's nothing to do. Gate on `valid` being `true`, not on `false`: with no credential, `valid` is omitted and `authenticated` is `false`, so a "`valid == false`" check sails past the unauthenticated case.

`bird auth login` opens a browser to sign in; you pick a workspace and the permissions to grant, and the resulting token — scoped to that workspace — is saved for later commands. An agent launches it the same as a human; it's not a terminal prompt. On a headless or SSH host (or with `--device`), it prints a code and a URL to enter on another device instead.

Plain `bird auth login` requests a **read-only baseline**, not everything the user holds: workspace, emails, domains, analytics, email marketing, webhooks, mailbox, and SMS reads. Every write, and every `org:` scope, is a deliberate step-up. So a login that succeeded still 403s the first time you try to send, register, or verify something.

Two ways up. `--yolo` requests the full delegable catalogue and lets the consent screen cap it to what the signing-in user actually holds — the right default for an agent that will do more than read. `--scope` (repeatable) **replaces** the baseline with exactly the scopes you list (it is not additive), dropping every other one, so use it only to mint a deliberately minimal token. The two are mutually exclusive; passing both fails with `scope_conflict`.

Some `org:` scopes are owner-only and some are not. `org:billing`, `org:members`, `org:settings` and `org:workspaces` are also granted to `billing_admin`; `org:access_restrictions`, `org:audit`, `org:ip_pools`, `org:sso` and `org:trust` are reachable only through the owner bypass or a staff grant, so a non-owner cannot obtain those at any scope setting. `bird auth status` lists the scopes a token actually carries, which is the reliable check after any login.

To act on a different workspace, run `bird auth login` again and pick it at consent — a credential is bound to one workspace.

## Done when

`bird auth status` reports `valid: true`.
