# Competitive email intelligence

0. Complete [Competitive access](competitive-access.md) for the intended workspace.
1. Choose the requested operation below. Read operations leave the watchlist unchanged; adding or removing an entry changes the organization's allowance usage.

- [Search brands](competitive-search.md)
- [Add a watched brand](competitive-create.md)
- [Read the watchlist report](competitive-watchlist.md)
- [Read a brand profile](competitive-brand.md)
- [List campaigns](competitive-campaigns.md)
- [Read a campaign](competitive-campaign.md)
- [Read notable campaigns](competitive-notable.md)
- [Read sending patterns](competitive-send-time.md)
- [Compare volume over time](competitive-volume-series.md)
- [Remove a watched brand](competitive-delete.md)

These operations inherit JSON output, exit-code, retry, and credential-resolution conventions from the `bird-cli` entry. The API validates allowed values; the CLI checks required argument presence.

Done when the selected operation reaches its stated result and that result is reported to the user.
