# List verified domains

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:read`. Use the requested workspace; domain ownership is checked within that workspace.

`bird email inbox-insights domains list --limit 25` returns verified domains and each domain's `monitored` setting. Sending readiness is separate from ownership, so a domain can appear before it is ready to send. Monitoring records the workspace's preference and does not prove vendor measurements exist.

Follow `next_cursor` with `--starting-after` or `prev_cursor` with `--ending-before`, retaining filters and ordering. `--sending-domain mail.example.com` matches one domain; `--search example` applies a substring filter. Both filters are case-insensitive. A null `next_cursor` marks the end.

Done when the requested data and any missing-measurement statuses have been reported.
