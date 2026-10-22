# Service status

Check whether Bird itself has an incident or scheduled maintenance: `bird platform status`. It reads the public status that bird.com/status shows, needs no sign-in, and reports Bird's services, not the person's workspace.

## When to use it

Run it when Bird calls fail in a way the person's setup does not explain: timeouts, `5xx` responses, or many sends stuck at once. A reported incident covering the failing product means the fix is to wait and retry, not to change the person's configuration. When the status is clear and the failure persists, open a support ticket ([support](support.md)).

## Read the result

- `indicator`: `none`, `minor`, `major` or `critical`. `description` says the same in words.
- `degraded_components`: each Bird component not fully operational, with its status.
- `incidents` and `scheduled_maintenances`: open events, each with a `shortlink` to its page.
- `--format text` prints a short summary ending in the status page URL.

A `status_unavailable` error means the status page could not be read. Retry, or send the person to https://bird.com/status.
