# Suspend an eSIM profile

Follow [authentication](authenticate.md). Read `bird esim get` for the exact target and inspect its current status. Stop if the requested state is already reached. This operation needs `esim:write`.

Confirm the loss of connectivity before suspending. Inspect `bird esim suspend --help` and act only on the confirmed target.

Read the target again. Done when the requested state is confirmed, or a failure is reported without claiming success.
