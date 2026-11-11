---
name: feedback_no_song_overlap
description: Artist overlaps between rounds are fine; never play the same actual song twice
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ca39f5e3-ebdf-41e3-b8eb-1b029e89450e
  modified: 2026-09-16T22:21:22.257Z
---

Nick is fine with the SAME ARTIST appearing on cards in multiple rounds. The
real constraint is: never play the same actual SONG twice across the night, and
avoid obscure songs no one knows.

**The rule is within a single night only.** Repeating a song from a previous
week is fine — "no worries about repeating fresh stuff, if it's good it's
totally fine to repeat" (9/16/2026). Don't spend effort diffing new lists
against recent weeks' refs; only the same-night dedupe gate matters.

**Why:** Artist-name rounds let him hot-swap the played song live, so a repeated
artist is harmless — but a repeated song, or a song nobody recognizes, kills a
round.

**How to apply:** When reusing artist rounds, the auto-builder often maps a
collab to two artists (e.g. "Yeah!" → Lil Jon AND Ludacris) or reuses one hit
for an artist in two rounds (Beyoncé → "Crazy In Love" twice). After building,
run a duplicate-song check across ALL rounds and fix collisions with
`--override "Artist=trackId"` (overrides now win over the reference). See
[[feedback_artist_format]] and [[feedback_spotify_ref_files]].
