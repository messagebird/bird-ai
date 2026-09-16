# Remove a watched brand

Complete [Competitive access](competitive-access.md) with `competitive:write`. Read the [watchlist](competitive-watchlist.md) to identify the requested entry. If it is already absent, report that result without repeating the removal.

Before removing it, verify that the user requested or approved removal of this entry. Existing authorization in the session is sufficient. Otherwise, explain that removal frees its allowance slot and adding the brand again creates a new watchlist entry, then ask for confirmation before proceeding.

Run `bird email competitive watchlist brands delete <watchlist-brand-id> --yes` after authorization. This removes the workspace entry while leaving the vendor's campaign data intact. Reuse `--idempotency-key` if retrying the same removal.

Done when the watchlist confirms the requested entry is absent. Do not remove entries automatically after read-only work.
