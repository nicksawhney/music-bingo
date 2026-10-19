# Plan a Music Bingo Night

Help the user plan a complete music bingo night — from brainstorming rounds and songs to generating Spotify playlists and printable bingo cards.

## Argument

$ARGUMENTS — A description of the event: how many rounds, any themes, the vibe, the crowd, or anything else relevant. If blank, ask the user about their event.

## Steps

### 1. Plan the rounds

Work with the user to design their rounds. A typical night has 5-7 rounds. Consider:

- **Energy arc**: Start mellow, build to peak energy, end with a fast blackout round.
- **Variety**: Mix up song-title rounds vs artist-name rounds.
- **Crowd favorites**: Party Anthems and R&B Hits always land. Guilty Pleasures is a crowd-pleaser.
- **Special rounds**: Covers (hear an unexpected voice, ID the original song), Famous Intros (blackout format), decades themes.
- **25-30 items per round** is the sweet spot for a 5x5 card with free space. Each card gets a random 24. **Blackout rounds MUST have exactly 30 items** — with only 24, every card is identical and everyone wins simultaneously. 30 items ensures each card gets a unique random subset of 24.

### 2. Curate the songs

For each round, brainstorm a song list of 25-30 items. These should be songs the crowd will *recognize* — singability and nostalgia matter more than obscurity. Present them as a numbered list for the user to review and swap out.

### 3. Create the playlist text files

Once the user approves a round's song list, write it to a text file in `playlists/`:

- One item per line (song titles OR artist names, depending on the round format)
- File naming: `playlists/{event_date}/round{N}_{theme}.txt` (e.g., `playlists/0415/round1_pop_divas.txt`)
- **ALWAYS create a `_spotify_ref.txt` alongside every round's `.txt`** — not just covers rounds. This records the exact song that plays for each card item, so the audio never drifts from the card and you have a written record of the real tracklist. Format: `Card Item | Song Title — Artist`. For covers rounds use `Song Title | Cover Artist (original: Original Artist)`. For artist rounds, generate it from the built playlist (step 4). Never skip this file.

### 4. Build Spotify playlists

Use `node scripts/spotify.js` for **everything** Spotify — building, cloning, searching,
reading, and auth. **Never** use the Spotify MCP server, and never reach into
`~/spotify-mcp-server` (its `npm run auth` writes to a *different* config file than the
one this repo reads). All the tooling you need is in `scripts/spotify.js` and
`scripts/fix-playlist.js`.

The script auto-refreshes tokens from `spotify-config.json`. When a refresh token expires
or Spotify revokes it, **every** command dies up front with
`Token refresh failed: 400 ... invalid_grant`. Fix it with:

```bash
node scripts/spotify.js auth
```

This prints an authorize URL, catches the callback on `127.0.0.1:8888`, and writes fresh
tokens back to `spotify-config.json`. Claude Code runs on a **remote GCP VM**, so the user
must tunnel the callback port from their laptop first — have them run
`ssh -L 8888:127.0.0.1:8888 <vm>`, then open the printed URL in their laptop browser.
Opening the auth URL without the tunnel will fail at the redirect.

Use `--prefix` with the event date so playlists group together in the user's Spotify library (the Spotify API doesn't support folders).

```bash
# Build all playlists for the night with a date prefix
node scripts/spotify.js build-playlist "Round 1 - Pop Divas" playlists/{event_date}/round1_pop_divas.txt --prefix "MM/DD Bingo"
node scripts/spotify.js build-playlist "Round 2 - Covers" playlists/{event_date}/round2_covers.txt --covers --prefix "MM/DD Bingo"
node scripts/spotify.js build-playlist "Round 3 - Guilty Pleasures" playlists/{event_date}/round3_guilty_pleasures.txt --prefix "MM/DD Bingo"
```

This creates playlists named like `[04/15 Bingo] Round 1 - Pop Divas` and adds all the tracks automatically.

**Important — artist-name rounds**: Use `build-artist-round` instead of `build-playlist` for rounds where the .txt file contains artist names. It searches by `artist:NAME` (not title), and can reuse exact track URIs from an existing reference playlist to avoid mismatches:

```bash
# Dry-run: see proposed tracklist before building
node scripts/spotify.js build-artist-round playlists/{event_date}/round1_artists.txt \
  --reference <existing-playlist-url>

# Build for real once you've reviewed the output
node scripts/spotify.js build-artist-round playlists/{event_date}/round1_artists.txt \
  --reference <existing-playlist-url> \
  --build "Round 1 - Artist Round" --prefix "MM/DD Bingo"
```

The dry-run output marks each track as `[ref]` (reused from reference), `[search]` (new, auto-picked), or `[miss]` (not found). Search results show alternatives so you can verify the pick is right before committing.

**Dedupe the actual songs across the whole night — no song plays twice.** The auto-builder can map a collab to two different artists (e.g. "Yeah!" → both Lil Jon and Ludacris) or reuse the same hit for an artist that appears in two rounds (e.g. Beyoncé → "Crazy In Love" in both Pop Divas and R&B). It can also pick the wrong artist's song for a collab (e.g. Usher → "If I Ain't Got You", which is Alicia Keys' track). After dry-running every round, scan for (a) the same track played twice anywhere, and (b) a card item whose song is actually by a different artist. Fix each with `--override "Artist Name=trackId"`. Overrides win over the reference, so you can pin any artist's song even when it matched the reference. Look up track IDs with `node scripts/spotify.js search "song" --artist "name"`.

**Spotify write capabilities (verified 2026-08-19):**
- **Add tracks** — ✅ works (the script posts to the `/items` alias, not the blocked `/tracks`).
- **Reorder tracks** — ✅ works (`PUT /playlists/{id}/items`).
- **Remove tracks** — ✅ works via PUT-replace. `DELETE /tracks` is 403-blocked and `DELETE /items` is unreliable, so `scripts/fix-playlist.js` deletes by fetching the current URIs, dropping the unwanted ones, and PUT-replacing the full list on `/items` (order isn't preserved — fine, playlists are shuffled at play time).

```bash
# Remove a wrong pick (and optionally add the correct one) after building:
node scripts/fix-playlist.js <playlistId> --remove <trackId,...> [--add <trackId,...>]
```

Still prefer `--override` at build time to get picks right on the first pass. Use `fix-playlist.js` to repair a bad or duplicate pick after a playlist already exists, instead of rebuilding from scratch.

**Reusing a round from a previous week?** Use `clone-playlist` — it copies exact track
URIs, so obscure or ambiguous titles can't get mis-searched:

```bash
node scripts/spotify.js clone-playlist <source-playlist-id> "Round 3 - One-Hit Wonders" \
  --prefix "MM/DD Bingo" [--output playlists/{date}/roundN_theme.txt] [--ref playlists/{date}/roundN_theme_spotify_ref.txt]
```

**A guest is contributing a playlist?** Spotify's dev-mode app returns 403 on
`GET /playlists/{id}/tracks` and `/items` for playlists you don't own — following it into
your library doesn't help. Ask the user to duplicate it into their own account (open
playlist → Ctrl+A → right-click → Add to playlist → New playlist), then find it with
`node scripts/spotify.js my-playlists --search "name"`.

**Final dedupe gate**: after building every playlist, run a pass that pulls all tracks back
down and checks no recording appears twice across the whole night (see `scripts/gen-refs.js`
for the 0826 event as a template). This also cleans Spotify's `- Remaster` / `(feat. X)` /
`- From "Movie"` suffixes out of card items, which look bad printed. Watch for accented
artist names ("Céline Dion" vs "Celine Dion") silently missing the reference lookup and
falling back to a search pick that collides with another round.

**If the user already has a Spotify playlist**, export it to a text file instead:

```bash
node scripts/spotify.js get-playlist <playlist-url-or-id> --output playlists/{event_date}/round{N}_{theme}.txt
# For artist-name rounds:
node scripts/spotify.js get-playlist <playlist-url-or-id> --output playlists/{event_date}/round{N}_{theme}.txt --format artists
```

### 5. Generate bingo cards

Once the text files are ready, generate bingo cards for each round:

```bash
node scripts/bingobaker.js create "Round 1 - Pop Divas" playlists/{event_date}/round1_pop_divas.txt --date {event_date}
node scripts/bingobaker.js create "Round 2 - Covers" playlists/{event_date}/round2_covers.txt --date {event_date}
node scripts/bingobaker.js create "Round 3 - Guilty Pleasures" playlists/{event_date}/round3_guilty_pleasures.txt --date {event_date}
```

This creates PDFs in `cards/{event_date}/` with 40 unique cards per round (10 pages x 4 cards). Remind the user to print them.

### 6. Game night checklist

Wrap up with a checklist for the user:
- [ ] Print bingo cards for each round
- [ ] Shuffle each Spotify playlist before playing
- [ ] Optionally drag playlists into a folder in the Spotify app for organization
- [ ] Bring daubers/markers for players
- [ ] Have prizes ready for winners
- [ ] Remember: blackout rounds must have 30 items so each card is unique — never 24 or fewer
