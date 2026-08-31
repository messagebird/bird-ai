# API keys

`bird api-keys create` issues a workspace API key and returns its token once. That is the only api-keys command the CLI has: listing, rotating, and revoking a key are dashboard-only, so a key minted here can be inspected or retired only from the web app.

**The credential that runs this command cannot be an API key.** A `bk_` key cannot carry `api_keys`, so `BIRD_API_KEY` fails here however broad the key is. It needs a login: `bird auth login --scope api_keys:write`. A plain `bird auth login` is not enough either — the scopeless login takes a read-only floor that does not include `api_keys`, so the command shows as disabled in `--help` and fails with exit `4`. `bird api-keys create --help` prints the exact re-authentication line when the current grant is short.

## Create

`bird api-keys create --name "Email ops key" --scope emails:write --scope domains:read`. Every body field has a flag: `--name`, a repeatable `--scope <area>:<level>`, `--expires-at`, and a repeatable `--cidr` (both repeatable flags also take a comma-separated list). `--body-file <path>` (`-` reads stdin) still works for a stored body, and a flag replaces the matching field in it rather than adding to it, so `--scope` given inline is the whole permission set, not an addition to the file's. `--example` prints a ready-to-edit body and needs no credentials; `--dry-run` prints the resolved body without minting anything.

The body is `{name, scopes, expires_at?, cidrs?}`:

- **`scopes`** is the whole permission set, as `{scope, level}` pairs with `level` either `read` or `write`. On the CLI one pair is one `--scope <area>:<level>`, the same spelling `bird auth login --scope` takes. The vocabulary is closed: `emails`, `email_management`, `email_marketing`, `domains`, `realtime`, `sms`, `sms_management`, `verify`, `whatsapp`, `whatsapp_management`, `voice`, `voice_management`, `mailbox`, `mailbox_management`, `assets`, `lookup`, `numbers`, `webhooks`, `preferences`, `workspace`. The authoritative set is the one the surface itself states — `api_keys_create`'s tool schema on MCP, or `bird api-keys create --example` — so read it from there rather than this list if a scope is refused. There is deliberately no `api_keys` or `members`: a key can never issue another key or change who is in the workspace, which is why this command is not self-serving. `workspace` reads the workspace's own identity and settings and is refused at `write`.
- **`expires_at`** (`--expires-at`) is RFC 3339 and must be in the future. Omitting it mints a key that **never expires**, and no call changes an expiry once set: the update endpoint carries only `name` and `scopes`, and the CLI has no update command at all. Replacing a key's expiry means rotating or re-issuing it from the dashboard. A non-expiring key outlives the login that created it, including that login's revocation, so an expiry is worth setting on anything an agent mints for itself.
- **`cidrs`** (`--cidr`) restricts the key to source IP ranges. The key and its restriction are written in one transaction, so an invalid range fails the whole call rather than leaving an unrestricted key behind.

**The `token` in the response is the only copy.** No later call returns it, and there is no command that reads it back — a lost token means minting another key and retiring the first one in the dashboard. Capture it from the response before doing anything else.

`--idempotency-key` makes a retry safe: the same key replays the original result instead of minting a second credential. Worth passing on every call here, because the thing being duplicated is a live credential.

**Done when** the response carries an `id` and a `token`, and the token has been stored somewhere durable.

## Traps

- **An API key cannot mint an API key.** `BIRD_API_KEY` fails no matter its scopes; this command needs an interactive login carrying `api_keys:write`.
- **A plain `bird auth login` does not carry `api_keys:write`.** The scopeless login is a read-only floor, so the step-up is explicit.
- **Omitting `expires_at` mints a key with no expiry**, and nothing can add one later. That key survives revocation of the grant that created it.
- **`scopes` is the complete set, not an addition**, and it cannot be widened later from the CLI at all. The same holds for `--scope` over a `--body-file`: the flags replace the file's array rather than appending to it.
- **The token appears once.** Nothing re-reads it; the dashboard shows only a prefix and a fingerprint.
- **Retiring a key is a dashboard action.** A script that mints keys here has no CLI path to clean them up.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
