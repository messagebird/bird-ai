# Register a seed test

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:write` and an OAuth login; API-key credentials cannot create confirmation proposals. If needed, run [authenticate](authenticate.md) with `bird auth login --scope inbox_insights:write`. Then [read configuration](inbox-insights-seed-configuration.md) for the owned sending domain if its available options are unknown.

Confirm that the user's authorization covers registration and its shared organization allowance before acting. Register only when the intended send is ready: registration consumes allowance and returns addresses with `expires_at`, but sends no email. Obtain separate send authorization before including those addresses in a message.

Run `bird email inbox-insights seed-tests create --example` for the body and use `--dry-run` to check it locally. Pass regions exactly as returned, using repeated `--regions` flags, and omit `--label` when no label is needed.

The command returns a browser review URL and confirmation ID on stderr, then waits. Give the URL to the user: the signed-in person registers the test from that page with their own permissions. After interruption, repeat the unchanged command with `--confirmation-id <id>` to read the same proposal; `--yes` cannot bypass review. Pending, expired or cancelled proposals do not prove that registration never ran.

Choose an explicit `--idempotency-key` for each intended registration and reuse it with the unchanged body after a lost response. Automatic transport retries reuse their key, but a new command without an explicit key creates a fresh intent. On `409 E27008`, contact support with the domain and request ID before starting another test. Missing [history](inbox-insights-seed-list.md) does not prove registration failed.

Done when the returned addresses and expiry are reported, or the uncertain outcome is reported without starting a second registration.
