# Stop a seeding run

Complete [access](email-seeding-access.md) with write permission, then `bird email seeding runs get <run-id>` to establish the intended run and state. If already terminal, report it; stopping a finished or failed run does not rewrite its outcome.

Before acting, establish the user's intent to stop this run and explain that already granted copies may still send. Existing explicit stop authorization covers the intent; the [browser confirmation flow](email-seeding-access.md) still requires the person to execute the frozen request. Wait for its recorded result before reporting a stop. Stopping does not recall mail, cancel the original email, schedule or broadcast, or promise a refund.

```sh
: "${seeding_stop_key:?Retain one key for this intended stop}"
bird email seeding runs cancel <run-id> --yes --idempotency-key "$seeding_stop_key"
bird email seeding runs get <run-id>
```

Retain a nonempty key for this intent. Without an explicit key, command confirmation derives a key from the exact request. Repeating that request can recover its proposal under the same OAuth grant and workspace, including after access-token refresh or a new chat; the derived key is not returned as a caller-owned recovery key. Use a new explicit key for a new intent. A lost review link can also be recovered by [listing pending confirmations](operation-confirmations.md), without a saved confirmation ID.

An uncertain response uses the same key on an authorized retry; the replay snapshot is not current progress. Report unknown and pending copies separately from the stop. Pending can be awaiting admission or an outcome; it does not prove a grant or cancellation. Unknown can resolve with later evidence. Pending has no admission-stage breakdown, including on a stopped run. The not_sent count includes refusals and cancellations from multiple causes and cannot quantify how many deliveries this stop prevented. Later outcomes remain visible through [activity](email-seeding-activity.md).

Done when a fresh read shows the stop or a terminal state, and remaining granted-copy uncertainty is reported.
