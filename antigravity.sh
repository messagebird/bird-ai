#!/usr/bin/env bash
# Builds a standalone Antigravity package from the shared Bird plugin assets.
# Antigravity needs its own root manifest; the mirror keeps one skills tree.
# Usage: bash antigravity.sh <new-package-directory>
set -euo pipefail

root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
source="$root/plugins/bird"
target="${1:?usage: bash antigravity.sh <new-package-directory>}"

mkdir -- "$target"
cp "$source/.antigravity-plugin/plugin.json" "$target/plugin.json"
cp "$source/.antigravity-plugin/mcp_config.json" "$target/mcp_config.json"
cp -R "$source/skills" "$target/skills"
cp "$root/VERSION" "$target/VERSION"
cp "$root/LICENSE" "$target/LICENSE"
