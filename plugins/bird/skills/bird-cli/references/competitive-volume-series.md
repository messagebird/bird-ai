# Compare volume over time

Complete [Competitive access](competitive-access.md) with `competitive:read`. If the requested workspace entry IDs are unknown, read the [watchlist](competitive-watchlist.md).

`bird email competitive volume-series --range 30 --brand-ids <watchlist-brand-id> --brand-ids <another-watchlist-brand-id>` compares watched brands with the workspace's own sending. Repeat `--brand-ids` for each entry; the flag does not split comma-separated values. Up to 20 distinct watchlist entry IDs are accepted in the requested order. Omitting the flag requests the workspace line.

The `source` field distinguishes panel estimates from the workspace's accepted sends. The report returns daily points without pagination.

Done when the requested lines, sources, and any missing-data statuses are reported.
