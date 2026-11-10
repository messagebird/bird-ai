# WhatsApp broadcasts

`bird whatsapp broadcasts` drafts, checks, tests, sends and inspects one approved WhatsApp template sent to an audience from one connected number. Start with [authentication](authenticate.md). Sending needs a plan that includes WhatsApp broadcasts; without one, `send` returns E15093.

## An existing broadcast

When the user names a broadcast, read it first with `bird whatsapp broadcasts get <broadcast-id>`. Only a `draft` or `scheduled` broadcast can be edited or sent. A `scheduled`, `accepted` or `sending` one can be canceled: confirm with the user first, because a cancel cannot be undone. Any other status can only be followed up. Then continue at the step the user asked for.

## Draft

1. Find the sender with `bird whatsapp numbers list`, the audience with `bird audiences list`, and an approved template with `bird whatsapp templates list`.
2. Read the template's inputs: `bird whatsapp templates get <template-ref>` gives `live_version_id`, then `bird whatsapp templates versions get <template-ref> <live-version-id>`. `variables` names every input and marks the optional ones.
3. Create the draft:

   ```bash
   bird whatsapp broadcasts create --name "Fall launch" --from +13124495648 \
     --audience-id <audience-id> --template <wat_…> --parameters '{"promo_code":"FALL25"}'
   ```

   `--parameters` takes one JSON object and replaces the whole map. Leave `--language` out to give each recipient the language for their phone number's country, or the template's default when the template allows it; otherwise that recipient is skipped. `update` replaces the whole template, so pass `--template` again with any other template flag.

## Check and test

1. `bird whatsapp broadcasts validate <broadcast-id>` names every problem in one result, including an audience over the sender's daily messaging limit. `send-quota` shows that limit and `counts` shows who the template can reach.
2. For a marketing template, `bird whatsapp broadcasts pricing-estimate <broadcast-id>` gives a lower and upper bound. Recipients in a destination with no published price are left out; zero bounds mean no price is available, not a free send. Never invent an amount.
3. `bird whatsapp broadcasts preview <broadcast-id>` renders the message. Pass `--contact-id` when the template reads contact data, and keep `preview_fingerprint`.
4. Confirm a test with the user, then run `bird whatsapp broadcasts test <broadcast-id> --to <e164> --preview-fingerprint <fingerprint> --idempotency-key <intent-key>` with the preview's exact `--language`, `--parameters` and `--contact-id`. It sends a real, charged message that does not count towards the broadcast. A changed preview returns a conflict; preview again.

## Who receives it

Recipients resolve when the send starts. Contacts without a phone number and suppressed contacts are left out. A marketing template is not delivered to United States numbers. A template language with a maximum price does not deliver in countries without maximum-price support, such as the European Economic Area; use a language without one there.

## Send and follow up

Confirm the audience, sender, template and send time with the user, then run `bird whatsapp broadcasts send <broadcast-id>`, or `--scheduled-at <rfc3339>`. A started broadcast cannot be recalled; `cancel` stops recipients not yet reached.

Follow delivery with `bird whatsapp broadcasts get` (counters and `failure_reason`), `bird whatsapp broadcasts list-recipients` (each recipient's status and `rejection_reason`) and `bird whatsapp list --broadcast-id <broadcast-id>` (the messages themselves). A failed broadcast does not send again. On `internal_error`, contact support and do not recreate it. On `workspace_suspended`, Bird support must reactivate the workspace first, and reactivation does not resume the broadcast. In every other case, and for a suspended broadcast once the workspace is active again, run `list-recipients` first: a broadcast that failed partway, such as on `insufficient_funds`, already reached and charged some recipients. Fix what `failure_detail` names, and create a new broadcast only once the user confirms a resend to those already reached, or narrows the audience.

**Done when** the requested action is confirmed by the returned broadcast state, or its delivery state is reported with what remains uncertain.
