---
name: reference-clone-output-format-bug
description: "clone-playlist --output always writes song titles, breaking artist rounds; get-playlist --format artists writes raw Spotify credits"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 89214de5-9699-413f-8178-14ca174b2372
  modified: 2026-09-09T22:06:56.513Z
---

`scripts/spotify.js clone-playlist --output` writes **song titles** regardless of the
round's card format. Cloning an artist round with it silently produces a title list, and
the bingo cards come out wrong.

Re-running with `get-playlist <id> --format artists` fixes the format but writes **raw
Spotify credits**, not card items: "USHER" in caps, "Ms. Lauryn Hill", and duplicate
"Bruno Mars" entries where the second card item should have been "Silk Sonic" (a
duplicate card item breaks the card).

**How to apply:** When cloning an artist round, copy the source week's vetted `.txt`
card file directly — the playlists are exact clones, so the card items are guaranteed to
match. Only fall back to `--format artists` for a genuinely new playlist, and eyeball the
result for caps, honorifics, and collab credits.

Also: `gen-refs.js` rewrites the card `.txt` from Spotify's raw titles, so any print
re-casing (e.g. "Wake Me up" → "Wake Me Up") must be re-applied **after** the dedupe gate,
as the last step before generating cards. Related: [[feedback-spotify-ref-files]]
