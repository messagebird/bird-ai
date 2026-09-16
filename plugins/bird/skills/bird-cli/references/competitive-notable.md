# Read notable campaigns

Complete [Competitive access](competitive-access.md) with `competitive:read`. Use the requested range, or omit it for the API default.

`bird email competitive watchlist notable --range 90` returns up to 100 findings. A campaign can carry multiple signals. `truncated` reports omitted eligible findings; this report has no cursor pages.

Done when findings and their status or truncation are reported. An empty result does not establish complete panel coverage.
