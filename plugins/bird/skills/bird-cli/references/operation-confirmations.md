# Operation confirmations

Some commands, such as sending a batch, registering a 10DLC campaign or buying a number, need the signed-in person to confirm them in the browser. The command proposes the request instead of sending it, and the person runs it from a review link. `bird operation-confirmations list` finds the proposals that are still waiting; to read one by id, see [read a proposal](operation-confirmations-get.md).

## Find a lost review link

`bird operation-confirmations list` returns the proposals this sign-in made in the current workspace that are still waiting for review, newest first. Each has its `id`, `operation`, `review_url` and `expires_at`.

- Before proposing a request again, check here. If it is listed, give the person its `review_url`; a second proposal is a second request for them to find.
- It needs an OAuth sign-in (`bird auth login`). An API key makes no proposals, so it has none to list and the command refuses it. `BIRD_API_KEY` takes precedence over a login, so unset it first.
- A proposal whose operation you can no longer perform is left out, so an empty list does not prove nothing is waiting.
- A proposal leaves the list once it has run, been cancelled or expired. None of those leaves a result to read here, and a missing result does not prove the request never ran.

Done when the person has the review link for the request, or you have told them that nothing is listed for this sign-in, which leaves out proposals for operations it can no longer perform, so it does not prove nothing is waiting.
