# Retrieve installation credentials

Follow [authentication](authenticate.md). Read `bird esim get` and confirm the intended profile is installable. If its purchase is pending, follow [purchase completion](esim-purchase.md) first. This operation needs `esim_credentials` read permission.

Run `bird esim credentials get` with the confirmed eSIM ID. Treat the activation code and installation links as secrets; disclose them only to the intended traveler through the requested channel.

Done when the traveler has installation instructions or the unavailable-profile error is explained. Use [delivery](esim-delivery.md) when an email or SMS is requested.
