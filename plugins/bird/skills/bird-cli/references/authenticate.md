# Authenticate the CLI

Run `bird auth login` before any command that hits the API — unless `bird auth status` already reports `valid: true`, in which case there's nothing to do. Gate on `valid` being `true`, not on `false`: with no credential, `valid` is omitted and `authenticated` is `false`, so a "`valid == false`" check sails past the unauthenticated case.

`bird auth login` opens a browser to sign in; you pick a workspace and the permissions to grant, and the resulting token — scoped to that workspace — is saved for later commands. An agent launches it the same as a human; it's not a terminal prompt. On a headless or SSH host (or with `--device`), it prints a code and a URL to enter on another device instead.

For broadcast operations, run `bird auth status --workflow marketing` before creating or sending. Its `workflow` result checks `email_marketing:write` and gives an `upgrade_command` when a valid OAuth grant needs that scope. Run that command to request it while retaining the existing grant. Domain lookup and template editing have separate permissions. `--all-scopes` expands the full missing-scope list in text output or includes it alongside a focused JSON workflow result. Plain JSON status also includes that list when discovery succeeds.

Plain `bird auth login` requests a **read-only baseline**, not everything the user holds: workspace, emails, domains, analytics, email marketing, webhooks, mailbox, and SMS reads. Every write, and every `org:` scope, is a deliberate step-up. So a login that succeeded still 403s the first time you try to send, register, or verify something.

Two ways up. `--yolo` requests the full delegable catalogue and lets the consent screen cap it to what the signing-in user actually holds — the right default for an agent that will do more than read. `--scope` (repeatable) **replaces** the baseline with exactly the scopes you list (it is not additive), dropping every other one, so use it only to mint a deliberately minimal token. The two are mutually exclusive; passing both fails with `scope_conflict`.

Some `org:` scopes are owner-only and some are not. `org:billing`, `org:members`, `org:settings` and `org:workspaces` are also granted to `billing_admin`; `org:access_restrictions`, `org:audit`, `org:ip_pools`, `org:sso` and `org:trust` are reachable only through the owner bypass or a staff grant, so a non-owner cannot obtain those at any scope setting. `bird auth status` lists the scopes a token actually carries, which is the reliable check after any login.

A credential is bound to one workspace. To act on another while keeping this one, sign it in as its own profile with `bird auth login --profile <name>` and pass `--profile <name>` on the commands for it ([profiles](profiles.md)).

A workspace with mTLS `enforced` refuses API key calls on the standard endpoint with `E02090`. Set `BIRD_CLIENT_CERT` and `BIRD_CLIENT_KEY` to the client certificate and key files, and pass `--mtls` (or set `BIRD_MTLS=1`) to use the region's mTLS endpoint. `bird auth login --client-cert <file> --client-key <file> --mtls` stores them in the profile, so later commands and `bird mcp` need no flags. `bird auth status` shows the certificate's fingerprint and expiry. A new login does not fix an mTLS refusal.

## Done when

`bird auth status` reports `valid: true`.
