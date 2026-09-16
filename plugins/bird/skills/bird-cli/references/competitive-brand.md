# Read a brand profile

Complete [Competitive access](competitive-access.md) with `competitive:read`. If the requested workspace entry ID is unknown, read the [watchlist](competitive-watchlist.md).

`bird email competitive watchlist brands get <watchlist-brand-id> --range 90` returns headline figures and per-provider placement. Use the `cwb_` entry ID; the panel `brand_id` from search does not identify a watchlist entry.

Done when the requested profile and its missing-measurement statuses are reported, or the entry cannot be found in the workspace.
