# Dedicated IPs and IP pools

Two related resources behind sending reputation. A **dedicated IP** (`dip_…`) is one sending IP address with a warmup status. An **IP pool** (`ipp_…`) is a named group of dedicated IPs that a message routes through (the `ip_pool` field on [email](email.md) `send` selects one, or `ipp_shared` for the shared pool). An IP is always in exactly one pool. Two command groups mirror this:

- `bird email dedicated-ips` covers dedicated IPs: `list`, `get`, `create`, `assign`, `delete`.
- `bird email ip-pools` covers IP pools: `list`, `get`, `create`, `update`, `delete`.

## Permissions

Reads (`list`, `get`) need only `ip_pools:read`. Every mutation is **organization-level** and needs organization permission on the logged-in account; without it the command returns auth-denied (exit `4`), not a usage error.

## Read

- `bird email dedicated-ips list` and `bird email ip-pools list` return cursor envelopes (`{ "data": [...], "next_cursor": ... }`), newest first; page with `--limit` and `--starting-after`. Both are organization-wide, so every workspace sees the same result.
- `bird email dedicated-ips get <dip_…>` returns one IP with `status` (`warming`, `active`, `pending_cancellation`), `warmup_progress`, and its `pool_id`.
- `bird email ip-pools get <ipp_…>` returns one pool with its assigned `ips`. Use the reserved id `ipp_shared` for the shared pool.

```
# pools that are not the shared default, with their IP counts
bird email ip-pools list | jq -r '.data[] | select(.protected|not) | "\(.id)\t\(.name)\t\(.ip_count)"'
```

## Mutate

Every mutation takes flags or a `--body-file` JSON body (`--example` prints the shape, `--dry-run` previews the request without sending). Deletes require `--yes`.

- `bird email ip-pools create <name>` creates a pool. The response carries a top-up result instead of a pool when the organization wallet can't cover it.
- `bird email ip-pools update <ipp_…> --name <name> --is-default` renames a pool or sets the organization default. The default is **moved, never cleared**, so `--is-default` on a non-default pool moves it; pass `ipp_shared` as the id to return the default to the shared pool.
- `bird email ip-pools delete <ipp_…> --yes` deletes an **empty** pool. Move or cancel its IPs first; the default pool can't be deleted.
- `bird email dedicated-ips create --quantity <n> --pool-id <ipp_…>` purchases IPs into a pool. **Paid action.** `--pool-id` is required once the organization has pools; omit it on the first purchase and a pool is created automatically. New IPs start `warming`. Like create-pool, the response carries a top-up result when the wallet is short.
- `bird email dedicated-ips assign <dip_…> --pool-id <ipp_…>` moves an IP to another pool (an IP is always in exactly one pool, so assign is a move).
- `bird email dedicated-ips delete <dip_…> --yes` cancels an IP. It stays usable until the end of the billing period (`cancels_at`), so the pool still counts it as present until then.

**The setup loop:** `email ip-pools create`, then `email dedicated-ips create --pool-id` (or `email dedicated-ips assign` an existing IP in), wait for `warming` to finish, then `email ip-pools update --is-default` to route sending through the pool.

## Traps

- **Mutations are organization-scoped.** Reads work with a normal workspace login; create/update/delete/assign need organization permission. A workspace-only login gets exit `4`, not a hint to add a flag.
- **`ips create` and `ip-pools create` are dual-outcome.** You get either the created object or a top-up-required result when the wallet is short; branch on which one you got, not on the status code (both are success). `ips create` spends money.
- **A pool with any IP can't be deleted, even a cancelling one.** `email dedicated-ips delete` sets `cancels_at` in the future and the IP keeps its pool slot until then, so `email ip-pools delete` returns `409` (`ResourceInUse`) until the pool is genuinely empty.
- **The shared pool can't hold dedicated IPs.** `ips assign <id> --pool-id ipp_shared` returns `422`; the shared pool is for non-dedicated sending only.
- **There is always exactly one default pool.** You move the default to another pool, you never clear it. Setting `--is-default` false on the current default is rejected.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
