# API keys

`bird api-keys create` issues a workspace API key and returns its token once. That is the only api-keys command the CLI has: listing, rotating, and revoking a key are dashboard-only, so a key minted here can be inspected or retired only from the web app.

**The credential that runs this command cannot be an API key.** A `bk_` key carries data-plane scopes only, and issuing keys is not one of them, so `BIRD_API_KEY` fails here however broad the key is. It needs a login: `bird auth login --scope api_keys:write`. A plain `bird auth login` is not enough either — the scopeless login takes a read-only floor that does not include `api_keys`, so the command shows as disabled in `--help` and fails with exit `4`. `bird api-keys create --help` prints the exact re-authentication line when the current grant is short.

## Create

`bird api-keys create --body-file <path>` (`-` reads stdin). `--name` is the only flag; everything else rides the body, because `scopes` is a list of objects and `expires_at` is a timestamp, neither of which the CLI renders as a flag today. `--example` prints a ready-to-edit body and needs no credentials.

The body is `{name, scopes, expires_at?, cidrs?}`:

- **`scopes`** is the whole permission set, as `{scope, level}` pairs with `level` either `read` or `write`. The vocabulary is closed and data-plane only, 17 at the time of writing: `emails`, `email_management`, `email_marketing`, `domains`, `realtime`, `sms`, `sms_management`, `verify`, `whatsapp`, `whatsapp_management`, `voice`, `voice_management`, `mailbox`, `mailbox_management`, `assets`, `lookup`, `numbers`. The authoritative set is the one the surface itself states — `api_keys_create`'s tool schema on MCP, or `bird api-keys create --example` — so read it from there rather than this list if a scope is refused. There is deliberately no `api_keys`, `members`, or `settings` — a key can never issue another key or reach the control plane, which is why this command is not self-serving.
- **`expires_at`** is RFC 3339 and must be in the future. Omitting it mints a key that **never expires**, and no call changes an expiry once set: the update endpoint carries only `name` and `scopes`, and the CLI has no update command at all. Replacing a key's expiry means rotating or re-issuing it from the dashboard. A non-expiring key outlives the login that created it, including that login's revocation, so an expiry is worth setting on anything an agent mints for itself.
- **`cidrs`** restricts the key to source IP ranges. The key and its restriction are written in one transaction, so an invalid range fails the whole call rather than leaving an unrestricted key behind.

**The `token` in the response is the only copy.** No later call returns it, and there is no command that reads it back — a lost token means minting another key and retiring the first one in the dashboard. Capture it from the response before doing anything else.

`--idempotency-key` makes a retry safe: the same key replays the original result instead of minting a second credential. Worth passing on every call here, because the thing being duplicated is a live credential.

**Done when** the response carries an `id` and a `token`, and the token has been stored somewhere durable.

## Traps

- **An API key cannot mint an API key.** `BIRD_API_KEY` fails no matter its scopes; this command needs an interactive login carrying `api_keys:write`.
- **A plain `bird auth login` does not carry `api_keys:write`.** The scopeless login is a read-only floor, so the step-up is explicit.
- **Omitting `expires_at` mints a key with no expiry**, and nothing can add one later. That key survives revocation of the grant that created it.
- **`scopes` is the complete set, not an addition**, and it cannot be widened later from the CLI at all.
- **The token appears once.** Nothing re-reads it; the dashboard shows only a prefix and a fingerprint.
- **Retiring a key is a dashboard action.** A script that mints keys here has no CLI path to clean them up.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
