# Cancel automatic renewal

Follow [authentication](authenticate.md). Read the exact recurring subscription and its status. Stop if already cancelled. This operation needs `esim:write`.

Confirm the intended subscription and that future renewals should stop. Inspect `bird esim recurring-subscriptions cancel --help` and cancel the confirmed subscription. Paid packages remain valid through their paid period.

Read the subscription again. Done when cancellation is confirmed or the failure is explained.
