# SMS callback URLs

Sign, inspect and recover the deliveries of SMS callback URLs, the per-message or per-profile receivers that take a message's events instead of your webhook endpoints. `bird webhooks callbacks` has `rotate-signing-secret`, `attempts` and `replay`. Set the URL itself with `options.callback_url` on a send, or on a messaging profile (`bird sms messaging-profiles`).

Branch on what they asked for:

- **Get a secret to verify callback signatures** → _Rotate the signing secret_ below.
- **See whether callbacks reached the receiver** → _Attempts_ below.
- **Redeliver callbacks that failed** → _Replay_ below.

## Rotate the signing secret

Rotation is destructive: once the 24-hour overlap ends the old secret stops signing, and the new one is shown only once. Confirm with the user before running it, then pass `--yes`; the command refuses without it and never prompts.

`bird webhooks callbacks rotate-signing-secret --yes` mints a new secret for the workspace and prints it once; it cannot be read again, so store it before doing anything else. One secret signs every callback URL in the workspace. For 24 hours both the old and the new secret sign each callback, then the old one stops. A workspace holds at most 5 valid secrets, so rotating again inside the overlap can be refused with `WebhookTooManySecrets`. Callbacks are signed before anyone has rotated, but with a secret nobody can read, so rotate before relying on verification.

## Attempts

`bird webhooks callbacks attempts` lists recent attempts to callback URLs, newest first, one per HTTP request, so a retried event appears once per try. Narrow with `--before`, `--after` and `--limit`. Attempts older than three days are gone.

## Replay

`bird webhooks callbacks replay` queues one more attempt for each event whose callbacks failed in a window: `--since` (default 24 hours ago) to `--until`. Each event goes to the URL its own failed attempts used, not to the profile's current URL, so it recovers a receiver outage, not a wrong URL. An event also delivered inside the window is skipped, so the receiver must still deduplicate on the `webhook-id` header. One replay sends at most the oldest 10,000 events, and replays share the daily limit of 20 per organization with endpoint replays. Read the outcome with `attempts`; replay returns nothing beyond acceptance.
