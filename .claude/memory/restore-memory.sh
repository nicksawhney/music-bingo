#!/usr/bin/env bash
# Copy the repo's checked-in Claude Code memories into (or out of) the
# per-project memory directory Claude Code actually reads.
#
#   ./.claude/memory/restore-memory.sh          # repo  -> ~/.claude  (restore)
#   ./.claude/memory/restore-memory.sh --save   # ~/.claude -> repo   (sync back)
#
# See RESTORE.md for context.

set -euo pipefail

REPO_MEM="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$REPO_MEM/../.." && pwd)"

# Claude Code slugifies the repo's absolute path: every character that is not
# a letter or digit becomes a hyphen.
SLUG="$(printf '%s' "$REPO_ROOT" | sed 's/[^a-zA-Z0-9]/-/g')"
LIVE_MEM="$HOME/.claude/projects/$SLUG/memory"

echo "repo memory: $REPO_MEM"
echo "live memory: $LIVE_MEM"
echo

if [[ "${1:-}" == "--save" ]]; then
    if [[ ! -d "$LIVE_MEM" ]]; then
        echo "error: no live memory directory at $LIVE_MEM" >&2
        echo "Nothing to save. Has Claude Code run in this repo yet?" >&2
        exit 1
    fi
    cp -v "$LIVE_MEM"/*.md "$REPO_MEM"/
    echo
    echo "Saved into the repo. Review with 'git diff .claude/memory', then commit."
else
    mkdir -p "$LIVE_MEM"
    for f in "$REPO_MEM"/*.md; do
        name="$(basename "$f")"
        # RESTORE.md documents this script; it is not a memory.
        [[ "$name" == "RESTORE.md" ]] && continue
        cp -v "$f" "$LIVE_MEM/$name"
    done
    echo
    echo "Restored. Start Claude Code in $REPO_ROOT and it will pick these up."
fi
