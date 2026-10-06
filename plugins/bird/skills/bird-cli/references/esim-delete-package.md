# Packages delete an eSIM package

Follow [authentication](authenticate.md). Read `bird esim packages get` for the exact target and inspect its current status. Stop if the requested state is already reached. This operation needs `esim:write`.

Explain the permanent removal and loss of remaining allowance; obtain explicit approval before supplying --yes or a balance-forfeit acknowledgement. Inspect `bird esim packages delete --help` and act only on the confirmed target.

Read the target again. Done when the requested state is confirmed, or a failure is reported without claiming success.
