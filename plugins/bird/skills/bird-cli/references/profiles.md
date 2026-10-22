# Profiles

A profile is one stored login for one workspace, so several workspaces can stay signed in at once. The login a plain `bird auth login` stores is the `default` profile.

## Sign one in

- `bird auth login --profile <name>` signs a profile in, creating it when the name is new and replacing its login when it is not. The other profiles are untouched. Names are lowercase letters, digits, `-` and `_`.
- The first profile signed in on a machine becomes the default, whatever its name, whether it came from `bird auth login` or account onboarding.

## Pick one per command

- Every command uses the default profile unless `--profile <name>` or `BIRD_PROFILE=<name>` names another for that call. The flag wins over the variable.
- A valid `BIRD_API_KEY` wins over every profile, so with a key set, `--profile` changes nothing. Unset the key to act through a profile.
- `bird auth status` reports `profile` and `profile_source` (`flag`, `env`, `file` for the stored default, `unset` for `default`). Check it before acting in a workspace you did not sign in to this session.

## List and switch

- `bird profile list` prints each profile with its `workspace_id`, `organization_id` and `region`. `default: true` marks the default, and `selected: true` marks the profile this call uses.
- `bird profile set <name>` makes a signed-in profile the default. An unknown name fails with `profile_not_found` and a `next` step to sign it in.
- Before `bird auth logout --profile <name>`, confirm with the person which profile goes and the workspace it holds (from `bird profile list`). Logout revokes that login server-side and deletes it: commands that name it with `--profile` fail until it signs in again, and commands without `--profile` move to the next default below, which can be another workspace. Name that workspace too before confirming. Other profiles are untouched.
- After a logout, commands without `--profile` use the stored default while its login exists, else `default`, else the only profile left. With several left and no default, they fail with `no_default_profile` and a `bird profile set` step.

A running `bird mcp` server keeps the profile it started with; restart it after `bird profile set`, or start it with `--profile`.
