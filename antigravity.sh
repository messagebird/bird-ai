#!/usr/bin/env bash
# Antigravity needs its own root manifest; the mirror keeps one skills tree.
#
# Usage:
#   bash antigravity.sh               # every workspace: ~/.gemini/config/plugins/bird
#   bash antigravity.sh --project     # this workspace: ./.agents/plugins/bird
#   bash antigravity.sh <directory>   # a package directory, e.g. for `agy plugin install`
set -euo pipefail

case "${1:-}" in
  "") target="$HOME/.gemini/config/plugins/bird" ;;
  --project) target="$PWD/.agents/plugins/bird" ;;
  -*)
    echo "usage: bash antigravity.sh [--project | <directory>]" >&2
    exit 2
    ;;
  *) target="$1" ;;
esac

if [[ -e "$target" ]] && ! grep -qs '"name": "bird"' "$target/plugin.json"; then
  echo "$target already exists and is not a Bird plugin. Choose another directory." >&2
  exit 1
fi

work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT

root=""
if [[ -n "${BASH_SOURCE[0]:-}" && -f "${BASH_SOURCE[0]}" ]]; then
  root=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
fi
if [[ ! -d "$root/plugins/bird/.antigravity-plugin" ]]; then
  # Piped from curl, so there is no checkout beside this script.
  curl -fsSL https://github.com/messagebird/bird-ai/archive/refs/heads/main.tar.gz | tar -xz -C "$work"
  root="$work/bird-ai-main"
fi
source="$root/plugins/bird"

package="$work/package"
mkdir -- "$package"
cp "$source/.antigravity-plugin/plugin.json" "$package/plugin.json"
cp "$source/.antigravity-plugin/mcp_config.json" "$package/mcp_config.json"
cp -R "$source/skills" "$package/skills"
cp "$root/VERSION" "$package/VERSION"
cp "$root/LICENSE" "$package/LICENSE"

mkdir -p -- "$(dirname -- "$target")"
rm -rf -- "$target"
mv -- "$package" "$target"

echo "Installed the Bird plugin $(cat "$target/VERSION") in $target."
echo "Before calling Bird tools, open Customizations in Antigravity's sidebar and authenticate bird."
echo "If bird is not listed there, restart Antigravity."
