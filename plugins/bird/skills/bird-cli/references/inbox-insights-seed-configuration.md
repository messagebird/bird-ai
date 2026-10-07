# Read seed-test configuration

Complete [Insights access](inbox-insights-access.md) with `inbox_insights:read`. If the owned sending domain is unknown, [list verified domains](inbox-insights-domains.md) first.

Run `bird email inbox-insights seed-tests configuration get --sending-domain <domain>` to discover the available list types, regions and engagement profiles. When [registering a test](inbox-insights-seed-create.md), select list types and engagement profiles whose `available` field is `true`, and use regions returned for the domain. Unavailable or guessed choices can produce a proposal that cannot register.

Done when the available options for the intended domain are reported.
