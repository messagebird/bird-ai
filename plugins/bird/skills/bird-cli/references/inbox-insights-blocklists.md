# Read blocklists

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:read`. Check the [domain list](inbox-insights-domains.md) for the requested verified domain. If it is absent, explain that ownership verification is required before reading its report.

`bird email inbox-insights blocklists mail.example.com` checks current listings without a date window. Inspect each target's status and `checked_at`. A null `active_count` means no target could be checked; it does not mean the infrastructure is clear.

Done when the requested data and any missing-measurement statuses have been reported.
