# Insights access

Check that the installed CLI release includes Insights and that its grant selects the intended workspace. Commands are registered in normal builds. Scoped API keys need organization preview access; seed operations also require preview admission for OAuth and service-account tokens. Organization master keys retain their existing seed-test access.

If the required scope is absent, run [authenticate](authenticate.md) with `bird auth login --scope inbox_insights:read` for reports or `--scope inbox_insights:write` for monitoring changes or seed registration. These scopes are outside the normal read-only baseline.

Seed history uses a maximum 90-day window; see [seed history](inbox-insights-seed-list.md). Other windowed reports use inclusive UTC dates, with at most 30 days between them. Omit dates for the API default window. Section statuses distinguish missing measurements from measured zero. Reports require verified ownership and do not change monitoring.

Done when the correct workspace grant carries the scope required by the operation.
