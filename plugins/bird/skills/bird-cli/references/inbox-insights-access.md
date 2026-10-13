# Insights access

Check that the installed CLI release includes Insights and that its grant selects the intended workspace. Commands are registered in normal builds. Inbox Insights uses workspace permissions without organization preview enrollment, including seed configuration, history and registration.

If the required scope is absent, run [authenticate](authenticate.md) with `bird auth login --scope inbox_insights:read` for reports or `--scope inbox_insights:write` for monitoring changes or seed registration. These scopes are outside the normal read-only baseline.

Seed history uses a maximum 90-day window; see [seed history](inbox-insights-seed-list.md). Other windowed reports use inclusive UTC dates, with at most 30 days between them. Omit dates for the API default window. Section statuses distinguish missing measurements from measured zero. Reports require verified ownership and do not change monitoring.

Done when the correct workspace grant carries the scope required by the operation.
