---
name: spotify-mcp-server-and-api-notes
description: "Spotify workflow, script usage, and API restrictions for playlist automation"
metadata: 
  node_type: memory
  type: reference
  originSessionId: d0901c4e-6c7c-43d5-99a5-0bd0d0dfe24b
  modified: 2026-10-07T19:16:47.705Z
---

Use `node scripts/spotify.js` in the music-bingo repo for **everything** Spotify — build,
clone, search, read, and auth. **Never** the Spotify MCP server, and never
`~/spotify-mcp-server` (Nick corrected this 2026-10-07: "we aren't using the spotify MCP
server, you wrote a bunch of tooling in spotify.js").

- The script auto-refreshes tokens from the repo's own `spotify-config.json`
- `node scripts/spotify.js auth` re-authorizes when the refresh token expires or is
  revoked (symptom: *every* command fails up front with `invalid_grant`). Added 10/07.
- The VM is remote, so the user must tunnel the callback first:
  `ssh -L 8888:127.0.0.1:8888 <vm>`, then open the printed URL in their laptop browser
- `~/spotify-mcp-server/npm run auth` writes to a **different** config file than this repo
  reads — using it means hand-copying the token. Don't.

**What works (as of May 2026):**
- `build-playlist "Name" file.txt --prefix "MM/DD Bingo"` — creates playlist and adds tracks ✓
- `get-playlist <url-or-id> --output file.txt` — exports existing playlist to text file ✓
- `search "query"` — finds tracks ✓
- `create-playlist "Name"` — creates empty playlist ✓

**Removing tracks:** `DELETE /playlists/{id}/tracks` is 403-blocked, but removal *does*
work via PUT-replace — use `scripts/fix-playlist.js`. See [[reference_spotify_delete_solution]].

**Artist-name rounds:**
Use `build-artist-round` (not `build-playlist`) for artist-name rounds. It searches `artist:NAME` and supports a `--reference <playlist-id>` to reuse exact track URIs from an existing playlist. Always do a dry-run first (omit `--build`) to review `[ref]` vs `[search]` picks before committing.

Nick's Spotify user ID: 1261844282, Premium account
