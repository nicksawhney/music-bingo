# Restoring Claude Code memory on a new machine

The `.md` files in this directory are the Claude Code project memories for
music-bingo. They are checked into the repo so they survive moving between
machines.

Claude Code does **not** read memory from here. It reads it from a per-project
directory under `~/.claude/projects/<slugified-repo-path>/memory/`, where the
slug is the repo's absolute path with every non-alphanumeric character replaced
by a hyphen.

Because the slug depends on where you clone the repo, the path will be different
on the new machine. Run the restore script to compute it and copy the files in:

```bash
./.claude/memory/restore-memory.sh
```

Then start Claude Code in the repo and confirm it loaded — ask it something that
only the memories cover, e.g. "what's the standing rule about Ed Sheeran?"

## Re-syncing later

Memory lives in `~/.claude/...` during normal use, so edits Claude makes while
hosting a night will **not** land in git automatically. To pull them back in:

```bash
./.claude/memory/restore-memory.sh --save
git add .claude/memory && git commit -m "chore: sync claude memory"
```

Worth doing after any night where Claude learned something new.
