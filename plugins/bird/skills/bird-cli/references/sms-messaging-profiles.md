# SMS messaging profiles

Group the senders, reply numbers and sending defaults of one program so a send can name them with `messaging_profile_id`. `bird sms messaging-profiles` has `list`, `get`, `create`, `update` and `delete`.

Branch on what they asked for:

- **Set up a new program's senders and defaults** → _Create_ below.
- **Change a profile, or point its events at a callback URL** → _Update_ below.
- **Find a profile's ID, or read one** → _List and get_ below.
- **Retire a profile** → _Delete_ below.

## Create

`bird sms messaging-profiles create --name <label>` creates a profile; names are not unique. Everything else is optional: `--default-category`, `--validity-period`, `--cost-center` and `--callback-events` are flags, and the nested `senders`, `inbound` (reply numbers and callback URL) and `options` objects come from `--body-file <path|->`. Run `--example` to read a complete body before building one.

- `senders` chooses a sender per destination country, with one entry that omits `country_code` as the default. Every sender must belong to the workspace; get IDs from `bird sms senders list`.
- `inbound.numbers` lists the numbers that receive replies. A number belongs to one profile at a time, and a short code needs its `country_code`.
- A send that names the profile takes its sender, default category, smart encoding, cost center, validity period and callback URL when it leaves them out; an explicit value on the send wins.

**Done when** the command returns a profile object with an `id` (`mpr_…`). Pass it as `messaging_profile_id` on a send.

## Update

`bird sms messaging-profiles update <profile-id>` changes only what you pass. `senders` and `inbound.numbers` replace the whole list, so send every entry you want to keep. A property that accepts `null` clears with `null` in a `--body-file` body, for example `{"options": {"callback_url": null}}`; a flag cannot carry a null. A change reaches sends and inbound attribution within 60 seconds.

## List and get

`bird sms messaging-profiles list` returns a cursor page, newest first; `bird sms messaging-profiles get <profile-id>` returns one profile with its senders, numbers and options.

## Delete

`bird sms messaging-profiles delete <profile-id>` deletes the profile and frees its reply numbers. Messages already sent keep what they used, and a later send naming the profile returns `SMSMessagingProfileNotFound`, but sends and inbound reply attribution can keep using the deleted profile for up to 60 seconds because profiles are cached, so wait that long before treating the deletion as in effect or retrying a send. Confirm with the user first; the command refuses without `--yes` and never prompts.
