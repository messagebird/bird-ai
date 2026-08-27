# How much mail the workspace received

`bird email stats inbound` counts the mail that arrived, mirroring the family that counts what the workspace sent. Three commands, one per grain: `summary` for a single aggregate row, `daily` for one row per calendar day, `hourly` for one row per hour.

## Pick the grain

- `bird email stats inbound summary --from 2026-05-01 --to 2026-05-31` answers one number for the window. This is the read for "how much did we receive last month".
- `bird email stats inbound daily` returns one row per day, up to 365 days. Quiet days are included with a zero count, so the series charts without gap handling.
- `bird email stats inbound hourly` returns one row per hour, up to 720 hours (30 days). Use it inside a single day or a recent window; for anything longer the daily grain is the one that answers.

## Narrow it

- `--from` and `--to` are both calendar days (`YYYY-MM-DD`) or both RFC 3339 instants. Mixing the two forms is a usage error, and the hourly command takes instants.
- `--timezone` takes an IANA name and moves the day and hour boundaries, so a bare calendar day means a local day once it is set. Omitted, the window is UTC.
- `--tag` narrows the count to one counting tag: `inbound_address_id:ina_…` for mail that arrived at an address you minted, or `mailbox_id:mbx_…` for a mailbox an agent owns. Pass a bare name to match any value of that tag.

## Traps

- **These count received mail only, and there is no direction flag.** The workspace's own sending is a separate group of commands one level up, so a total that looks too low is usually the wrong group rather than missing data.
- **A zero is an answer, not an empty result.** Every bucket in the window comes back, so a run of zeros means no mail arrived rather than no data — check the window and the tag before concluding the pipeline is broken.
- **The counts are a rolling aggregation.** `period.data_as_of` is the instant the numbers are current to, a few seconds behind live. Read it rather than treating the totals as to-the-second.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
