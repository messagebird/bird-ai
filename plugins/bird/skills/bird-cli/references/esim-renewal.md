# Start automatic renewal

Follow [authentication](authenticate.md). Read the intended eSIM's assignment and existing recurring subscriptions. Stop if the requested renewal already exists. This operation needs `esim:read` and `esim:write`.

Read `bird esim offers recurrence` and checkout terms. Establish the traveler with `bird esim subscribers` and `bird esim assignment` when needed. Show the published price, currency and recurring cadence; obtain approval for recurring charges.

Inspect `bird esim recurring-subscriptions create --example`. Pin the accepted offer and recurrence revisions and price, submit with a stable idempotency key, and follow any returned confirmation link.

Read the subscription. Done when enrollment is confirmed or its failure is reported. Use [cancellation](esim-cancel-renewal.md) to stop future renewal.
