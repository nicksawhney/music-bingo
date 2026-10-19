# Music Bingo - Technical Notes & Learnings

## Current Workflow (manual, as of 2026-03-31)

### Creating a round
1. Pick a theme and curate ~25-30 songs in a newline-separated `.txt` file in `playlists/`
2. Upload the txt file to [bingobaker.com](https://bingobaker.com) to generate bingo cards
3. Manually create a Spotify playlist and add the songs by searching one-by-one
4. On game night, shuffle the Spotify playlist and play

### Pain points
- Step 3 is extremely tedious (30 songs x 6 rounds = 180 manual searches + adds)
- No programmatic bridge between song lists, Spotify, and bingo card generation
- For special rounds (e.g., covers), need to track which VERSION to play vs what goes on the card

---

## Spotify API Findings (2026-03-31)

### MCP Server
- Used: https://github.com/marcelmarais/spotify-mcp-server
- Cloned to: `~/spotify-mcp-server`
- Claude Code MCP config: `claude mcp add --transport stdio spotify -- node ~/spotify-mcp-server/build/index.js`

### Auth Setup
1. Create app at https://developer.spotify.com/dashboard
2. Under "APIs used" check **Web API**
3. Under "User Management" add your Spotify email (required for Development Mode apps)
4. Set redirect URI to `http://127.0.0.1:8888/callback`
5. Copy `spotify-config.example.json` -> `spotify-config.json` with clientId, clientSecret, redirectUri
6. Run `npm run auth` to complete OAuth flow

### API Endpoint Issues Discovered
- **`POST /users/{user_id}/playlists`**: Returns 403 Forbidden. Appears deprecated or restricted for dev-mode apps.
- **`POST /me/playlists`**: Works! Use this instead for creating playlists.
- **`PUT /playlists/{id}`**: Works for updating playlist name/description.
- **`POST /playlists/{id}/tracks`**: Returns 403 Forbidden. Cannot add tracks to playlists programmatically with a dev-mode app as of March 2026.
- **`PUT /playlists/{id}/tracks`**: Also 403.
- **All GET endpoints**: Work fine (search, playlists, user info, etc.)
- **Scopes**: Token correctly includes `playlist-modify-private` and `playlist-modify-public` but Spotify still rejects add-track writes.

### MCP Server Bugs
- The `@spotify/web-api-ts-sdk` cached instance causes stale token issues for write operations. After one successful write, subsequent writes fail with 403 even though the token is valid.
- The MCP server read operations (search, get playlists) work reliably.

### Custom Script
- Built `scripts/spotify.js` with search, create-playlist, and build-playlist commands.
- Create-playlist works (uses `/me/playlists`).
- Adding tracks does NOT work due to Spotify API restrictions (not a code issue).
- The script handles token refresh, config loading, and has parsers for both plain song lists and cover-reference files.

### Possible Solutions (not yet tried)
- Apply for Spotify "Extended Quota Mode" — may unlock write endpoints
- Create a fresh Spotify Developer app — sometimes new apps get different default permissions
- Use Spotify's "Import" feature in the desktop app with `spotify:track:xxx` URIs
- Use a different Spotify library (spotipy/Python) — unlikely to help since it's the same API

---

## Reading Other Users' Playlists (2026-08-25)

- **You cannot read another Spotify user's playlist tracks with this dev-mode app.**
  `GET /playlists/{id}` returns name/owner fine, but `GET /playlists/{id}/tracks` AND
  `GET /playlists/{id}/items` both return **403 Forbidden** when the owner isn't you.
  Following the playlist into your library does *not* help — following ≠ owning.
- **Workaround**: in the Spotify desktop app, open their playlist → Ctrl+A → right-click →
  Add to playlist → New playlist. Once you own a copy, all reads work normally.
- Reading your *own* playlists via `GET /playlists/{id}` works fine (tracks come back inline).

### New script commands
- `spotify.js my-playlists [--search term]` — list/filter your library (needed to find a
  guest's playlist ID; the MCP server's `getMyPlaylists` fails on stale-token refresh).
- `spotify.js clone-playlist <src> "Name" [--prefix] [--output f.txt] [--ref f.txt]` —
  copy an existing playlist's exact track URIs into a new one. Use this for reused rounds
  instead of `build-playlist`: searching by title mispicks obscure or ambiguous names
  ("I Wish" → Stevie Wonder instead of Skee-Lo; "Icky Vicky" → anything).
- `gen-refs.js <event-date>` — regenerates every `_spotify_ref.txt` for an event from the
  built playlists, cleans Spotify's `- 2015 Remaster` / `(feat. X)` / `- From "Grease"`
  suffixes out of the card items, and **fails loudly if any recording appears twice in the
  night**. Run it after building all playlists as the final dedupe gate.
  Reads `playlists/<date>/rounds.json` for the round list:
  `{ "rounds": [{ "file", "id", "format": "artists|titles" }], "acceptedDupes": [] }`.
  `acceptedDupes` whitelists a recording you're deliberately playing twice.
- `spotify.js get-playlist <id> --format uris` — prints `trackId  Name — Artists`, which is
  what you feed to `fix-playlist.js --remove`.

### Artist rounds: playlist order != .txt order (2026-08-26)

`build-artist-round` adds all **reference-matched** tracks first (in .txt order), then
appends the **search-matched** ones. So if artist #7 falls back to search, the playlist has
that track at position 30, and everything from 7 on is shifted by one.

Consequence: **never build a `_spotify_ref.txt` for an artist round by index-pairing the
.txt against the playlist.** Doing so silently produced `a-ha | Jolene — Dolly Parton` for
the 0826 Famous Intros round. Match each card item to the track whose *artist list contains
that name*, normalizing accents and punctuation ("Celine Dion" vs "Céline Dion", "Toto" vs
"TOTO"). `gen-refs.js` does this via `pairByArtist()`.

Accented artist names are the usual cause of a fallback-to-search in the first place — the
reference lookup is a plain lowercase string match, so "Celine Dion" in the .txt misses
"Céline Dion" in the reference playlist and silently picks whatever search returns.

## BingoBaker Integration (planned)

### What BingoBaker does
- Web-based bingo card generator at bingobaker.com
- Accepts a list of items (song titles, artist names, etc.)
- Generates randomized bingo cards (5x5 grid, free center space)
- Cards can be shared via URL, printed, or played digitally

### Desired automation
- Given a Spotify playlist ID, generate bingo cards where each cell is either:
  - The **song title** (for rounds like Party Anthems, R&B Hits, Guilty Pleasures)
  - The **artist name** (for rounds like Pop Divas, Rock Classics)
- User should be able to choose title vs artist per round
- Output should be compatible with bingobaker.com's input format (or generate cards directly)

### Potential approaches
1. **MCP Server for BingoBaker**: Build a custom MCP server that interfaces with bingobaker.com (may need to reverse-engineer their API or use browser automation)
2. **Standalone tool**: CLI that reads a Spotify playlist (via MCP or API) and outputs a bingobaker-compatible format
3. **Full pipeline**: Spotify playlist -> extract song/artist data -> generate bingo cards -> output shareable links

---

## File Structure

```
music-bingo-0225/
  playlists/                          # Song lists for each round
    round{N}_{theme}.txt              # Reusable round templates (from 0225 event)
    0401_round{N}_{theme}.txt         # Event-specific rounds
    0401_round2_..._spotify_ref.txt   # Cover artist reference for Spotify
    0401_event_guide.md               # Full event rundown with Spotify search instructions
  scripts/
    spotify.js                        # Spotify API tool (search, create playlist, build playlist)
  cards/
    0401/
      Round_1_-_{theme}.pdf
  NOTES.md                            # This file
```

---

## Crowd Feedback (Fort Greene pub)

- **Party Anthems**: Highest energy, whole bar singing. Keep reusing.
- **R&B Hits**: Strong crowd response, lots of sing-along. Keep reusing.
- **Pop Divas**: Good recognition energy. Works well as opener/warm-up. Nick's take
  (2026-09-02): "always a fun round and never gets old" — safe to run week after week, it
  doesn't need resting the way themed rounds do.
- **Songs With a Name**: Did NOT get the crowd going as expected. Avoid reusing for now.
- **Movies & TV / Rock Classics**: Mid-tier. Artist-name format is more "guess" than "sing."
- **Modern Love Songs**: Lower energy, more sway-along than sing-along.
- **Nickelodeon and Disney**: folks Nick's age love this one. Ran 8/12, 8/19 and 8/26;
  rested 9/02 to keep it feeling special. Also note it's one of the few *song-title*
  rounds in the library, so resting it costs card-format variety.
- **Scorned Women** (guest round, Aeslyn, 8/26): scream-along peak. Nick asked for it
  again unprompted the following week.
- **Soft Rock** (new 9/02): late-90s–early-2010s acoustic pop. Run as a mellow blackout
  closer after the peak round — the bet is a communal singalong ending rather than a
  high-tempo one. Check how it actually landed.

### Card-file format traps when cloning (2026-09-09)

Three separate ways the card `.txt` can end up wrong. All of them produce cards that look
plausible and are only caught by reading the file.

1. **`clone-playlist --output` always writes song titles**, regardless of the round's
   format. Cloning an *artist* round with it silently yields a title list.
2. **`get-playlist --format artists` writes raw Spotify credits**, not card items. On the
   9/9 R&B clone that gave `USHER` (caps), `Ms. Lauryn Hill`, and **`Bruno Mars` twice** —
   the second entry should have been `Silk Sonic`. A duplicate card item breaks the card.
3. **`gen-refs.js` rewrites the card `.txt` from Spotify's raw titles**, undoing any print
   re-casing.

**Rules:**
- When cloning an artist round, `cp` the source week's vetted `.txt` — the playlist is an
  exact clone, so the card items are guaranteed to match.
- Apply print re-casing **after** `gen-refs.js`, as the last step before card generation.
- `gen-refs.js` warns `no track found for card item "X"` when the `.txt` format doesn't
  match `rounds.json`. That warning means the card file is in the wrong format — don't
  ignore it just because the dupe count is 0.

### Never build a new round from bare artist names (2026-09-09)

`build-artist-round` on an unreviewed artist list produces confidently wrong picks:
- Nelly → "Promiscuous" (that's Nelly **Furtado**)
- The Who → "Who Says" (John Mayer); alt was "Who's Lovin' You" (Jackson 5)
- Paul McCartney → "The Girl Is Mine" (a Michael Jackson track already in the round)

Even a title+artist search via `build-playlist --covers` mispicks: `Californication |
Red Hot Chili Peppers` resolved to **"Scar Tissue"**. Always read the full build output
and repair with `fix-playlist.js`.

Build new rounds from an explicit `Song Title | Artist` file with `--covers`, after the
list has been reviewed. Note the `--covers` parser reads `Title | Artist`, which is *not*
the `_spotify_ref.txt` format (`Card Item | Title — Artist`) — they need separate files.

### Artists whose Spotify credit won't match an artist-round card item

Avoid these on artist cards, or pin them knowingly:
- **Paul McCartney** — "Hey Jude" is credited to The Beatles, "Live and Let Die" to Wings.
- **Gloria Estefan** — "Conga" is credited to Miami Sound Machine (she is listed second,
  so `pairByArtist` still resolves it).
- **Silk Sonic / Bruno Mars** — same track credits both; pick which one is the card item.
