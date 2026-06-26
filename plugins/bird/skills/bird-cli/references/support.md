# Support tickets

Open support tickets with Bird and follow up on them: `bird support-tickets create`, `reply`, `get`, `list`. One ticket is a conversation: your messages and the support agent's replies, oldest first.

The key fact for an agent: **a reply arrives asynchronously, not in the response that opened the ticket.** The reply may be automated (Bird's AI, on an `ai` ticket) or from a person, and either can resolve your question, so read it back and judge whether it answers what you asked rather than assuming you must wait for a human. An `ai` reply usually lands within a minute; a human `support` reply can take longer. So opening or replying is step one; reading the reply back and judging it is step two.

## Procedure

- `bird support-tickets create`: Returns the new ticket with its first message.
  - The reply arrives asynchronously and may be automated or from a person; either can answer your question. Read the ticket back to see it (a message with `sender_type: agent` that was not there before), judge whether it resolves your request, and reply with more detail if it does not. (`bird support-tickets get`, `bird support-tickets reply`)

## Open a ticket

`bird support-tickets create --message "..."` opens a ticket with its first message and returns the created ticket.

- `--type` routes it: `ai` (default, automated answer), `support` (a human agent), `feedback` (product feedback).
- `--type support` takes an `--area` (`email`, `sms`, `whatsapp`, `voice`, `api`, `dashboard`, `billing`, `other`); `--type feedback` takes a `--feedback-kind` (`feature-request`, `improvement`, `bug`, `general`).
- `--title` is optional (derived from the message when omitted); `--priority` is `LOW`/`MEDIUM`/`HIGH`/`CRITICAL`.
- `bird support-tickets create --example` prints a complete, valid body and needs no credentials, so read it before constructing one.

Once the ticket is open, don't drop it: **watch it for the reply** (next section), either in the same call with `create --watch` or afterwards with `get <id> --watch`.

## Wait for the reply (`--watch`)

Both `create` and `get` take `--watch`, which blocks until a reply arrives (a new message with `sender_type: agent` appears, whether automated or from a person, or the ticket leaves `OPEN`) and then prints the result. **If your environment can run a command in the background, run the watch as a background task** (using whatever mechanism your harness provides) so you can keep working and pick the reply up when it lands; otherwise run it in the foreground and block until it returns:

```
# open a ticket and wait for the answer in one call
bird support-tickets create --type support --message "DKIM verification is stuck" --watch

# or wait on an existing ticket (e.g. after a reply)
bird support-tickets get tkt_123 --watch
```

`--watch` always exits `0` on a clean watch. Branch on the JSON it prints, not the exit code:

- a reply arrived → `{"answered": true, "timed_out": false, "ticket": {...}}`
- the window elapsed first → `{"answered": false, "timed_out": true, "ticket": {...}}`; re-run later, the ticket is still open.

Tune the wait with `--watch-timeout` (default `5m`, capped at `30m`). For a human `--type support` ticket that can take hours, don't pin a long watch; let it time out and check back later with another `get --watch`.

## Reply and read

- `bird support-tickets reply <id> --text "..."` adds a message. It returns the ticket id as confirmation, not the thread; read the ticket back for the updated history.
- `bird support-tickets get <id>` returns one ticket and its messages (add `--format text` for a human card). `bird support-tickets list` returns the caller's tickets, newest first, as JSON.
