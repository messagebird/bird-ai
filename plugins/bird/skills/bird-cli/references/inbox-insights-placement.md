# Read placement

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:read`. Check the [domain list](inbox-insights-domains.md) for the requested verified domain. If it is absent, explain that ownership verification is required before reading its report.

`bird email inbox-insights placement mail.example.com --from 2026-09-01 --to 2026-09-07` returns placement sections for an owned, verified domain. The dates are inclusive UTC days, with at most 30 days between them. Omitting dates lets the API select its default window.

`--compare previous_period` requests the preceding equal-length period. `--group-by week` changes the series grain. Repeat `--series-providers` for provider lines, for example `--series-providers gmail --series-providers yahoo`; the provider table remains unfiltered. `--include-ip-details` requests per-IP detail.

Rates are percentages of measured placements. Sparse time-series buckets are omitted, and each section carries its own status. A successful response can contain sections without measurements.

Done when the requested data and any missing-measurement statuses have been reported.
