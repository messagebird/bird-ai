# Read complaints

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:read`. Check the [domain list](inbox-insights-domains.md) for the requested verified domain. If it is absent, explain that ownership verification is required before reading its report.

`bird email inbox-insights complaints mail.example.com --from 2026-09-01 --to 2026-09-07 --group-by week --compare previous_period` returns the Google Postmaster spam rate for Gmail-received mail. It is separate from Bird's feedback-loop complaint rate across providers. Without completed Postmaster setup, sections can report `not_configured`.

Done when the requested data and any missing-measurement statuses have been reported.
