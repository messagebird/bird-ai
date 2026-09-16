# Read the watchlist report

Complete [Competitive access](competitive-access.md) with `competitive:read`. Use the requested range, or omit it for the API default.

`bird email competitive watchlist get --range 7` returns the whole watchlist as one JSON report, including your own sending row and watched competitor rows. Each competitor row carries a `watchlist_brand_id` beginning with `cwb_`. This report has no cursor pages.

Done when the report and any missing-measurement statuses are reported. An empty watchlist is a valid result and does not authorize adding brands.
