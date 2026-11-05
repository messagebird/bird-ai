# Retrieve installation credentials

Follow [authentication](authenticate.md). Read `bird esim get` and confirm the intended profile is installable. If its purchase is pending, follow [purchase completion](esim-purchase.md) first. This operation needs `esim_credentials` read permission.

Prefer [delivery](esim-delivery.md), which sends the activation code to the traveler without it entering the conversation. When the user wants to see the code themselves, ask them to run `bird esim credentials get <esim-id>` on their own; do not run it, since its output holds the code.

Done when the traveler has installation instructions or the unavailable-profile error is explained. Use [delivery](esim-delivery.md) when an email or SMS is requested.
