# Change domain monitoring

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:write`. Read the [domain list](inbox-insights-domains.md) first. If the requested monitoring state already holds, report it without repeating the change.

`bird email inbox-insights domains update mail.example.com --monitored=true` enables monitoring; `--monitored=false` disables it. The boolean is required, including when it is false. Use `--example` to inspect the body, `--body-file` to provide JSON, or `--dry-run` to preview the body without sending it. A changed flag overrides its body-file field.

Enabling enrolls the verified owned domain with eDataSource and saves the workspace preference. Disabling removes only that preference; vendor enrollment and history remain. Report access is governed by verified ownership, not the monitoring preference. Reuse `--idempotency-key` for retries of the same change.

Done when the domain list confirms the requested monitored value. Disabling does not remove vendor enrollment or measurement history.
