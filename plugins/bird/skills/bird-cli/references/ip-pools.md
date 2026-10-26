# Dedicated IPs and IP pools

Two related resources behind sending reputation. A **dedicated IP** (`dip_…`) is one sending IP address with a warmup status. An **IP pool** (`ipp_…`) is a named group of dedicated IPs that a message routes through (the `ip_pool_id` field on [email](email.md) `send` selects one, or `ipp_shared` for the shared pool when permitted). An explicit send pool takes precedence over the sending domain's default in the current workspace; without either, ordinary default routing applies. An IP is always in exactly one pool. Two command groups mirror this:

- `bird email dedicated-ips` covers dedicated IPs: `list`, `get`, `create`, `assign`, `delete`.
- `bird email ip-pools` covers IP pools: `list`, `get`, `create`, `update`, `delete`, and `workspaces list`, `assign`, `remove` for which workspaces may send through a pool.

## Permissions

Reads (`list`, `get`) need only `ip_pools:read`. `workspaces list` and every mutation are **organization-level** and need organization permission on the logged-in account; without it the command returns auth-denied (exit `4`), not a usage error.

## Read

- `bird email dedicated-ips list` and `bird email ip-pools list` return cursor envelopes (`{ "data": [...], "next_cursor": ... }`), newest first; page with `--limit` and `--starting-after`. They return the pools the current workspace can use and the dedicated IPs in those pools. Organization ownership alone does not grant a workspace access.
- `bird email dedicated-ips get <dip_…>` returns one IP with `status` (`warming`, `active`, `pending_cancellation`), `warmup_progress`, and its `ip_pool_id`.
- `bird email ip-pools get <ipp_…>` returns one pool with its assigned `ips`. Use the reserved id `ipp_shared` for the shared pool.

```
# pools that are not the shared default, with their IP counts
bird email ip-pools list | jq -r '.data[] | select(.protected|not) | "\(.id)\t\(.name)\t\(.ip_count)"'
```

## Mutate

Every mutation takes flags or a `--body-file` JSON body (`--example` prints the shape, `--dry-run` previews the request without sending). Deletes require `--yes`.

Workspace assignment mutations require the fleet's `manage` mode. In the default `legacy` mode, pool creation accepts `--workspace-id` but creates no assignment. During `prepare` and `enforce`, creation with that flag and assignment mutations return `IPPoolAssignmentsNotAvailable` (E11012). Assignment lists are readable from `prepare` onward.

- `bird email ip-pools create <name>` creates an empty, non-default pool within the organization's pool quota. `--workspace-id <ws_…>` also assigns it to that workspace without changing the workspace's default.
- `bird email ip-pools workspaces assign <ipp_…> <ws_…>` lets a workspace send through a pool; `--is-default` makes it the workspace's default. On a workspace with no assigned pools, `--is-default=false` keeps its current sending (the shared pool becomes its default); omitting it makes this pool the default, after which the workspace sends only through its assigned pools.
- `bird email ip-pools workspaces remove <ipp_…> <ws_…> --yes` stops that. It is refused for the workspace's default and while its domain defaults, mailboxes, SMTP settings, or draft, scheduled, or unfinished broadcasts name the pool; the error counts them. Terminal broadcast history does not block removal.
- `bird email ip-pools update <ipp_…> --name <name> --is-default` renames a pool or sets the organization default. The default is **moved, never cleared**, so `--is-default` on a non-default pool moves it; pass `ipp_shared` as the id to return the default to the shared pool.
- `bird email ip-pools delete <ipp_…> --yes` deletes an **empty** pool. Move or cancel its IPs first; replace default selections and remove workspace assignments and saved uses before deleting it.
- `bird email dedicated-ips create --quantity <n> --ip-pool-id <ipp_…>` purchases IPs into a pool. **Paid action.** `--ip-pool-id` is required once the organization has pools; omit it on the first purchase and a pool is created automatically. New IPs start `warming`. The response carries a top-up result when the wallet is short.
- `bird email dedicated-ips assign <dip_…> --ip-pool-id <ipp_…>` moves an IP to another pool (an IP is always in exactly one pool, so assign is a move).
- `bird email dedicated-ips delete <dip_…> --yes` cancels an IP. It stays usable until the end of the billing period (`cancels_at`), so the pool still contains it until release. It stops counting toward default-pool admission immediately.

**Warmup permission:** A pool with warming IPs needs the shared pool assigned to the workspace for overflow. A fixed dedicated-only assignment is refused with `IPPoolWarmupNeedsSharedPool` (E11016) while this applies. Removing shared permission makes a warming route refuse sends; it does not select another default.

**The setup loop:** `email ip-pools create`, then `email dedicated-ips create --ip-pool-id` (or `email dedicated-ips assign` an existing IP in), wait for `warming` to finish, then make the pool a default: `email ip-pools update --is-default` before workspace assignments are activated, or `email ip-pools workspaces assign --is-default` once they can be managed. From the start of activation the organization update returns `IPPoolOrganizationDefaultRetired` whenever it carries `--is-default`.

## Traps

- **Mutations are organization-scoped.** Reads work with a normal workspace login; create/update/delete/assign need organization permission. A workspace-only login gets exit `4`, not a hint to add a flag.
- **Dedicated IP purchases can require a top-up.** Check the response before treating the purchase as provisioned. Creating an empty pool does not purchase an IP.
- **A pool with any IP can't be deleted, even a cancelling one.** `email dedicated-ips delete` sets `cancels_at` in the future and the IP keeps its pool slot until then, so `email ip-pools delete` returns `409` (`ResourceInUse`) until the pool is genuinely empty.
- **The shared pool can't hold dedicated IPs.** `email dedicated-ips assign <id> --ip-pool-id ipp_shared` returns `422`; the shared pool is for non-dedicated sending only.
- **A configured workspace keeps one default in its assigned set.** Replace it with another permitted pool. Setting `--is-default=false` on the current default is rejected. A workspace without assignments uses the shared pool.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
