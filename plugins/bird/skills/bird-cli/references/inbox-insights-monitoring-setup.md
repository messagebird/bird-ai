# Set up monitoring

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:write`. Read the [domain list](inbox-insights-domains.md) first. If the requested monitoring state already holds, report it without repeating the change.

`bird email inbox-insights domain-monitoring upsert` performs automatic setup without a body. Inspect `outcome`: `enabled` names the chosen domain; `already_on` preserves existing choices, which the domain list shows; `choice_required` calls for an explicit domain choice; `no_verified_domains` requires verifying a sending domain first. Only `enabled` returns a non-null domain. Automatic setup also accepts `--idempotency-key`.

Done when the response outcome is understood and the domain list confirms the requested state.
