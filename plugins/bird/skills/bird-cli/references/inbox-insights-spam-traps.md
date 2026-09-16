# Read spam traps

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:read`. Check the [domain list](inbox-insights-domains.md) for the requested verified domain. If it is absent, explain that ownership verification is required before reading its report.

`bird email inbox-insights spam-traps mail.example.com --from 2026-09-01 --to 2026-09-07 --compare previous_period` returns trap totals, kinds, networks and individual hits. A measured zero is a valid result. Both windowed reports follow the placement date bounds; omit dates to use API defaults.

Done when the requested data and any missing-measurement statuses have been reported.
