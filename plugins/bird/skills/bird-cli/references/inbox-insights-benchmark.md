# Read the industry benchmark

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:read`. Check the [domain list](inbox-insights-domains.md) for the requested verified domain. If it is absent, explain that ownership verification is required before reading its report.

`bird email inbox-insights benchmarks industry mail.example.com` returns the industry's median placement and cohort. It accepts no date window or prior-period comparison. Compare it with the domain's placement report while accounting for different weighting: the benchmark uses a default mix, while placement uses the domain's audience mix. A `no_data` status can mean the industry is unknown or the cohort is too small.

Done when the requested data and any missing-measurement statuses have been reported.
