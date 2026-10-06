# Purchase an eSIM package

Follow [authentication](authenticate.md). Confirm `esim:read` and `esim:write` access. If retrying a submitted purchase, read its order before creating another; reuse its idempotency key.

1. Find the destination with `bird esim zones list`, then use `bird esim offers list` to find a package for that zone. Use the price returned for this workspace in its published currency.
2. Read `bird esim offers checkout-options` and `bird esim offers requirements` for the selected offer. For a top-up, start with `bird esim compatible-offers` for the existing eSIM.
3. Show the buyer the package, destination, duration, and quoted price. Obtain their approval before purchasing. Follow any confirmation link returned by the command.
4. Inspect `bird esim orders create --example` and prepare the request with the selected `offer_id`. Pin `offer_revision` and `expected_price` for a one-time purchase. Omit `esim_id` for a new profile or set it for a top-up. Do not set `delivery`; send installation details separately after the order completes.
5. Preview with `--body-file order.json --dry-run`, then submit with a stable `--idempotency-key`. Reuse that key on retry.
6. Read `bird esim orders get` until the order is `completed` or `failed`. HTTP 201 can carry either terminal state. An order in `charging` needs the balance described by `funding`; a failed order must not be described as a successful purchase.

Done when the order is completed or failed and the buyer knows the result. For a completed new profile, continue to [installation credentials](esim-credentials.md) or [delivery](esim-delivery.md) when requested.
