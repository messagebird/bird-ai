# Competitive access

Check that the installed CLI release includes Insights and that its grant selects the intended workspace. Commands are registered in normal builds. API-key calls and watchlist creation require organization preview access.

If the required scope is absent, run [authenticate](authenticate.md) with `bird auth login --scope competitive:read` for reports or `--scope competitive:write` for watchlist changes. These scopes are outside the normal read-only baseline. Check `bird auth status` for the resulting grant.

Windowed reports accept `--range 7`, `30`, or `90`, with a default of `30`. Panel measurements can be `null`; inspect `panel_status` before interpreting missing data as no activity. A search result's numeric-string `brand_id` identifies a panel brand; a watchlist entry's `id`, beginning with `cwb_`, identifies the workspace entry used for subsequent reads and removal.

Done when the intended workspace grant carries the scope required by the operation and preview admission is available where required.
