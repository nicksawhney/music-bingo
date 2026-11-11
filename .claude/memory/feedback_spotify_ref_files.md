---
name: feedback-spotify-ref-files
description: Curate and get approval on the explicit song list BEFORE any Spotify write; never let search pick songs
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c88589ff-86fa-450b-8bd2-172607af4a50
  modified: 2026-09-09T22:06:43.579Z
---

For any NEW round, hand-curate the exact `Song Title | Artist` list, write the
`_spotify_ref.txt`, and present it to Nick as a table for review **before touching
Spotify at all**. Do not run `build-artist-round` on bare artist names and show him the
results — that is backwards and he has pushed back on it hard (9/9).

**Why:** Spotify's search picks are genuinely bad and silently wrong. On the 9/9 Halftime
round a bare-artist dry run returned "Promiscuous" for Nelly (that's Nelly *Furtado*),
"Who Says" for The Who (John Mayer), and "The Girl Is Mine" for Paul McCartney (a Michael
Jackson track already in the same round). Even an artist-filtered title search resolved
"Californication" to "Scar Tissue". Nick hosts off these lists live and cannot discover a
mismatch mid-round.

**How to apply:** Curate songs → write `_spotify_ref.txt` → present as a reviewable table
with a conflict check → wait for approval → only then build. Build new rounds from an
explicit `Title | Artist` file via `build-playlist --covers`, not from artist names.
Verify every pick in the build output and repair mispicks with `fix-playlist.js`.
Related: [[feedback-artist-format]], [[feedback-no-song-overlap]], [[reference-clone-output-format-bug]]
