# Read a campaign

Complete [Competitive access](competitive-access.md) with `competitive:read`. If either identifier is unknown, read the [campaign list](competitive-campaigns.md) for the requested watched brand.

`bird email competitive watchlist brands campaigns get <watchlist-brand-id> <campaign-id>` reads one campaign. Preserve the campaign ID as text; numeric conversion can change a long ID's digits. The creative URL can be null.

Done when the campaign's measurements and available creative are reported, or the requested campaign is not found for that watched entry.
