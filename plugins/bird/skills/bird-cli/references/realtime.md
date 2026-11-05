# Realtime

Provision Bird Realtime — WebSocket channels for browser and mobile clients — from the terminal. `bird realtime regions list` is the set of regions an app may run in, `bird realtime apps` the app lifecycle, and `bird realtime apps keys` the credentials a client connects with.

**There is no command that publishes an event.** Publishing, and reading which channels are occupied or who is in them, additionally authenticates with the app's own key and secret, which the CLI does not carry — those operations live in the server SDKs (`bird.realtime.publish(...)` and friends). So every command here provisions or manages; the thing an app exists to do happens from the customer's own backend.

Branch on what they asked for:

- **Create an app, or read one back** → _Apps_ below.
- **Rotate the credentials a client connects with** → _Keys_ below; it is a three-step sequence, not one command.
- **Which region to put an app in** → `bird realtime regions list`, and read _Apps_ before creating.

## Apps

`bird realtime apps create --name <name> --region <region>` provisions an app and its first key. Two things about the response matter more than the rest:

- **`app_id` is what a client connects with**, alongside a key. It is a numeric id, distinct from the `rap_…` id every other command takes.
- **`key.secret` appears here and nowhere else.** No later read returns it. A caller that does not capture it has to create another key to get one, so ask the user where it should be stored (for `gh secret set`, which repository) and capture it straight into that store in the same step, printing the rest as the receipt: `resp=$(bird realtime apps create --name <name> --region <region> --idempotency-key <key>) && secret=$(jq -er .key.secret <<<"$resp") && printf %s "$secret" | gh secret set REALTIME_SECRET --repo <owner/repo> && jq 'del(.key.secret)' <<<"$resp"`. The receipt carries the `app_id` and the public `key.key` that pairs with the stored secret. If the store fails, ask the user before running the line again: a retry with the same key within about 3 hours usually replays the same value, but the API does not promise it kept the first response, so a retry can create another app, so check `bird realtime apps list` first. The store runs only when the command succeeded and returned the value, so a failed or empty result never overwrites a stored secret. Never print the value, write it to a file you read, or pass it to anything but `printf` into the store.

`--region` is immutable after creation, and the only accepted values are the ids from `bird realtime regions list` (`eu1`, `us1` today; read the command rather than assuming). Unlike other Bird products an app may sit in a region other than the workspace's own. Getting it wrong means a new app and repointed clients, not an update.

The four config flags — `--client-events`, `--connection-counting`, `--connection-count-events`, `--authorized-connections` — are off unless passed, and all four are editable later. `--connection-count-events` needs `--connection-counting`.

`bird realtime apps list` returns a cursor page, filterable with `--name` (case-insensitive substring) and sortable with `--sort` (`created_at`, `name`). `bird realtime apps get <rap_…>` returns one app. Neither ever includes key material, so both are safe to print and log.

`bird realtime apps update <rap_…>` renames an app or flips its flags; omitted fields are left alone. It is gated on `--yes` like the deletes, because it overwrites stored values.

`bird realtime apps delete <rap_…> --yes` is terminal: every connected client is disconnected and the app's keys go with it. No restore.

**Done when** the app is in hand with its `app_id`, region, and a key whose secret went straight into the user's store through the pipe.

## Keys

An app holds several live keys at once, and that is the whole point: it makes rotation zero-downtime. `bird realtime apps keys list <rap_…>` shows the live ones (add `--include-revoked` for the rest) and never their secrets — a secret is readable only in the response that created it.

Rotate in this order, and not another:

1. `bird realtime apps keys create <rap_…>` adds a key and returns its secret as `secret`; capture it into the user's store as with _Apps_ (`resp=$(bird realtime apps keys create <rap_…> --idempotency-key <key>) && secret=$(jq -er .secret <<<"$resp") && printf %s "$secret" | <store> && jq 'del(.secret)' <<<"$resp"`, whose receipt names the public `key`), and the same caution on a retry: check `bird realtime apps keys list <rap_…>` first, since it can add another key. Existing keys keep working.
2. Ask the user to roll the new key and secret out to every client and server that connects.
3. `bird realtime apps keys revoke <rap_…> <rak_…> --yes` — the old key stops working **immediately**; there is no grace period. The record survives with `revoked_at` set, for audit.

Two guards you will hit if you rotate in the wrong order:

- Revoking a key that is already revoked is a conflict (exit `5`).
- **An app's last remaining key cannot be revoked** (exit `2`, with a message saying to create another first). Revoke-then-create is not a valid sequence.

## Traps

- **No command publishes.** If the user wants to send an event to a channel, the answer is a server SDK, not the CLI. The same applies to listing channels, reading a channel's members, and disconnecting one.
- **The key secret is one-shot.** Capture it from `create` straight into its store; there is no command that re-reads it.
- **`app_id` and `rap_…` are different ids.** The numeric `app_id` goes to the connecting client; the `rap_…` id goes to every command here.
- **`--region` cannot be changed**, and a value outside the region list is refused by the API (exit `2`), not by the CLI.
- **`update` and both destructive commands need `--yes`.** The CLI never prompts.
- **`realtime:write` is needed for create, update, delete, and both key commands**; the reads need only `realtime:read`. A `realtime:write` key can mint a key and secret for any app in the workspace, so treat it as equivalent to holding every app's credentials.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
