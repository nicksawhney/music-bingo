---
name: reference_spotify_delete_solution
description: How to delete/replace tracks in a bingo Spotify playlist despite dev-mode 403s
metadata: 
  node_type: memory
  type: reference
  originSessionId: 31da5170-cedf-4c23-8492-afc2941d93d3
  modified: 2026-09-16T22:23:16.080Z
---

Removing tracks from a playlist DOES work, despite the old note that it was blocked.

Spotify Development Mode restrictions on the bingo app:
- `DELETE /playlists/{id}/tracks` → 403 Forbidden (blocked)
- `DELETE /playlists/{id}/items` → unreliable ("No uris provided")
- `POST /playlists/{id}/items` → works (add tracks)
- `PUT /playlists/{id}/items` → works (reorder AND full replace)

Solution: delete by REPLACING. Fetch the playlist's current URIs (via
`GET /playlists/{id}`, since the `/tracks` sub-endpoint is also blocked), drop
the unwanted URIs, then `PUT /playlists/{id}/items` with the full desired uri
list (max 100 per PUT; append the remainder with POST). Order is not preserved,
which is fine — bingo playlists are shuffled at play time.

`scripts/fix-playlist.js` implements this:
`node scripts/fix-playlist.js <playlistId> --remove <id,...> [--add <id,...>]`
Verified working 2026-08-19. This supersedes the "removal blocked" claim in
NOTES.md and the bingo-night command doc. See [[reference_spotify_mcp]].

**Deleting a whole playlist:** `DELETE /playlists/{id}/followers` → 200, works.
Spotify has no true delete; unfollowing removes it from the library but the
playlist object survives at its URL, so it's recoverable by re-following.
Verified 2026-09-16 removing a duplicate Round 6. Nick can't get playlist IDs
out of the Spotify UI, so do this from the CLI rather than telling him to
right-click → Delete in the app.
