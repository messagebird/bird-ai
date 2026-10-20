# Read a proposal

`bird operation-confirmations get <id>` reads one proposal this sign-in made, by the `id` that `bird operation-confirmations list` or a confirmable command returned. It shows the proposal's `status`, `review_url`, `expires_at` and, once the person has run it, its recorded `result`, without rerunning the original command.

- `pending`: no result is recorded yet. Give the person the `review_url` if they have not opened it.
- `completed`: the `result` holds the operation's own response. Report it; do not run the request again.
- `cancelled` or `expired`: no result is recorded, which does not prove the request never ran. Check the operation's own records before proposing it again.
- It needs an OAuth login (`bird auth login`); an API key or service account has no proposals to read. `BIRD_API_KEY` takes precedence over a login, so unset it first.
- It also needs your current access to the proposed operation: if that was taken away, the read is refused with a permission error. That refusal says nothing about the outcome; ask the person, or someone who still has access, to check the operation's records.

Done when you have reported the proposal's status, with its result if it completed, its review link if it is pending, or that its outcome is unknown and has to be checked in the operation's records.
