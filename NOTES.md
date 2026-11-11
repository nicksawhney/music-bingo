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
- **R&B Hits**: ~~Strong crowd response, lots of sing-along. Keep reusing.~~ **Superseded
  2026-11-11** — Nick: "R&B has been hard for people lately. It really depends on the
  demographic that shows up on a given night." Diagnosis: the list is 90s/2000s-locked
  (TLC, Blackstreet, Ginuwine), so it only lands for a mid-30s–40s room and dies outside
  it. Not an R&B problem — a *cohort-locked round* problem. Same risk applies to
  Millennials in Love, Hip Hop & Rap, 2000s Bangers, Gen Z Party Anthems.
  **When the crowd is unpredictable, prefer rounds that span decades by construction** —
  Super Bowl Halftime (booked on broad fame), One-Hit Wonders (radio saturation),
  Karaoke Classics.
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

### Title rounds collide with artist rounds through the *pinned* track (2026-10-19)

A title round and an artist round can look disjoint on the cards and still play the same
recording. The artist round's card item is just a name — the collision lives in whatever
song that name resolves to.

On 10/21, Wedding Reception (titles) and Famous Intros (artists) collided three times:

| Famous Intros artist | 8/26 pinned track | Wedding Reception card item |
|----------------------|-------------------|------------------------------|
| Whitney Houston | I Wanna Dance with Somebody | I Wanna Dance with Somebody |
| Earth, Wind & Fire | September | September |
| Journey | Don't Stop Believin' | Don't Stop Believin' |

This is structural, not bad luck: **Famous Intros pins each artist to their single most
iconic song, and "most iconic song" is exactly the selection rule for Wedding Reception,
Karaoke Classics and Party Anthems.** Any pairing of Famous Intros with one of those is
guaranteed to collide somewhere.

Fix used: swap the *artists* out of Famous Intros (→ Survivor, The Rolling Stones,
Aerosmith) rather than repin them. Repinning to a lesser-known track defeats the round —
the whole game is that the first two seconds are unmistakable.

Next landmine if those two rounds meet again: **Bon Jovi** (*Livin' on a Prayer*).

Check this *before* cloning, by diffing the artist round's `_spotify_ref.txt` right-hand
side against the title round's `.txt`. `gen-refs.js` catches it too, but only after both
playlists already exist.

### gen-refs.js suffix cleaner misses parenthesized remasters (2026-10-19)

It strips `- 2015 Remaster` but not `(2024 Remaster)`. The 10/21 Wedding Reception clone
came back as `Don't Stop Believin' (2024 Remaster)` on the card. Re-read every rewritten
card `.txt` after running it — print re-casing is already a manual post-step, so fold the
suffix check into the same pass.

### Recurring card-item ↔ Spotify-credit mismatches (2026-10-28)

`gen-refs.js` will warn `no track found for card item "X"` for these every single time
their round is cloned. The card items are *correct as printed* — only the ref lookup
misses. Fill the two ref lines in by hand and move on.

- **98 Degrees** (Boy Bands vs Girl Groups) — Spotify credits **98º**.
- **The Black Eyed Peas** (2000s Bangers) — Spotify credits **Black Eyed Peas**, no "The".

Same class as Céline Dion / 2Pac. Pattern: the warning is only a real problem when the
*whole round* warns (wrong `.txt` format); one or two named artists is a credit-string
mismatch.

### A title search can mispick *within the right artist* (2026-10-28)

NOTES already covers `build-artist-round` picking the wrong artist. The title-side version
is just as bad: with `--covers`, `Thriller | Michael Jackson` resolved to **"Human
Nature"** and `Bat Out of Hell | Meat Loaf` to **"Paradise By the Dashboard Light"** —
right artist, wrong song, and nothing in the output flags it as suspicious.

Plain `search "Thriller" --artist "Michael Jackson"` also failed to return Thriller.
`search "track:Thriller artist:Michael Jackson"` returns it first. **Use field-qualified
search syntax when repinning a track.**

So: read every line of a `--covers` build, not just the `NOT FOUND` list.

### Halloween rounds (2026-10-28)

Two Halloween rounds work if each gets its own hard boundary, and they must be curated
against each other or they converge:

- **Halloween Classics** — the literal canon (Monster Mash, Thriller, Ghostbusters, Time
  Warp, Carpenter's *Halloween* theme). A *recognition* round, not a singalong.
- **Monsters, Ghosts & Devils** — a monster/ghost/devil/horror word in the title, from
  modern pop and rock. Blackout closer.

Watch the devil count — the second round drifted to five devil songs before trimming.
Also avoid near-identical card items across the two (*Black Magic Woman* in one vs
*Black Magic* in the other was caught and swapped for *Voodoo Child*).

Scooby-Doo: the original TV theme is not on Spotify as a real recording, only karaoke
re-records. Use **What's New Scooby-Doo? — Simple Plan**.

### Folder dates are build dates, not always show dates (2026-10-19)

**`playlists/1007` and `cards/1007` were played on 10/14** — the 10/07 show was cancelled
and Nick reused those cards the following week. The folder name and the `[10/07 Bingo]`
Spotify prefixes were left as-is so the two stay linked.

Consequence: **don't compute "weeks since last played" from folder names alone.** Doing so
makes a cancelled-and-reused set look a week more rested than it is. Known exception so
far: 1007 → actually 10/14. Log any future ones here.

### A "- Mix" / "- Edit" suffix often IS the hit (2026-11-11)

Flagged four One-Hit Wonders tracks as wrong-version because of their suffixes. On
checking release dates, **three were the original hit single** and only one was wrong:

| Track | Reality |
|-------|---------|
| *Here Comes the Hotstepper - Heartical Mix* | 1994 original single. The Heartical Mix **is** the #1 hit |
| *What Is Love - 7" Mix* | 1992 original single |
| *Blue (Da Ba Dee) - Gabry Ponte Video Edit* | 1998 original single; the un-suffixed version isn't on Spotify at all |
| *The One And Only - Acoustic* | **Genuinely wrong** — 3:13, 2022 compilation |

**Check `album.release_date` before swapping, not the suffix.** A suffix near the original
release year is the single; a clean title on a 2010s/2020s compilation is often the
re-record. The `/v1/tracks` bulk endpoint is 403 in dev mode — fetch `/v1/tracks/{id}`
one at a time.

### Mononym card items can resolve to a different artist (2026-11-11)

`build-artist-round` dry-run gave **Selena** → *Love You Like A Love Song*. That's Selena
**Gomez**; the card meant Selena Quintanilla. Nothing in the output flags it — it reads as
a clean `[search]` hit.

Same dry-run also gave two feature-credit errors — *WAP* for Megan Thee Stallion (Cardi B's
song) and *We Are Young* for Janelle Monáe (fun.'s song) — plus **Luke Combs → *Fast Car***,
which collides with Tracy Chapman *in the same round*.

**Never build an artist round without reading the full dry-run.** Watch for: mononyms,
tracks where the card artist is only a feature, and covers that collide with the original
elsewhere on the card.

### Pop Divas + Millennials in Love always collide (2026-11-11)

They share five artists — Beyoncé, Alicia Keys, Rihanna, Adele, Lady Gaga — and the
builder hands each the same signature song in both rounds. On 11/11 that was four
duplicate recordings.

Fix used: repoint the *Millennials in Love* picks to love-specific songs (*Love On Top*,
*No One*, *Stay*, *Make You Feel My Love*), which suits that round better anyway. Expect
this every time these two rounds share a night.
