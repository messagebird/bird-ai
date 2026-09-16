# Read authentication

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:read`. Check the [domain list](inbox-insights-domains.md) for the requested verified domain. If it is absent, explain that ownership verification is required before reading its report.

`bird email inbox-insights authentication mail.example.com --from 2026-09-01 --to 2026-09-07 --compare previous_period` returns SPF, DKIM, DMARC and sending-source sections. Date bounds follow the placement convention. A section can report `not_configured` when its data source is not connected.

All reports enforce domain ownership and leave monitoring unchanged. An unowned or unverified domain returns not-found. Use each response's section status to decide whether measurements are available.

Done when the requested data and any missing-measurement statuses have been reported.
