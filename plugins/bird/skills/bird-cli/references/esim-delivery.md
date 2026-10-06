# Deliver installation details

Follow [authentication](authenticate.md). Read `bird esim get` and `bird esim deliveries list` for the intended profile. Check existing deliveries before resending; avoid duplicate messages. This operation needs `esim_credentials` write permission.

Confirm the traveler, recipient address and email or SMS channel before sending. Inspect `bird esim credentials deliver --example`, then submit with a stable idempotency key. Reuse that key when retrying the same send.

Read `bird esim deliveries list` until the delivery succeeds or fails. A successful request alone does not prove delivery. Treat hosted installation links as secrets.

Done when delivery reaches a terminal outcome and the requester knows the result.
