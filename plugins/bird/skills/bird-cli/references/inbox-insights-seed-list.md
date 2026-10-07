# Read seed-test history and results

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:read`. If the owned sending domain is unknown, [list verified domains](inbox-insights-domains.md) first.

Run `bird email inbox-insights seed-tests list --sending-domain <domain>`. Omit date bounds for the API default window. History is capped at 100 rows within a maximum 90-day window; use `--from` and `--to` to narrow or move the window when `tests.truncated` is true.

Only `latest` has full detail. `registration_id` cannot locate a history row, and missing history does not prove registration failed. The returned `quota` reports organization-wide use and the next reset.

Done when the results, selected window and any truncation are reported.
