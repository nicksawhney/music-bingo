# Music Bingo — Wed 9/9

Football season opener night. Kickoff lands ~30 min after bingo starts, which puts it
mid-Round 2 — hence the Super Bowl Halftime round in that slot.

## Running order

| # | Round | Card shows | Items | Spotify | Cards |
|---|-------|-----------|-------|---------|-------|
| 1 | R&B Hits | artist names | 30 | [open](https://open.spotify.com/playlist/2vXSTfF3QKfP6cCIx68x5I) | [view](https://bingobaker.com/view/10867290) |
| 2 | **Super Bowl Halftime** *(new)* | artist names | 30 | [open](https://open.spotify.com/playlist/7zQKTosOaOX7KblMCXphXV) | [view](https://bingobaker.com/view/10867292) |
| 3 | Pop Divas | artist names | 30 | [open](https://open.spotify.com/playlist/1zZvXQ08NupFQdedc7X5FP) | [view](https://bingobaker.com/view/10867294) |
| 4 | Nickelodeon & Disney | song titles | 26 | [open](https://open.spotify.com/playlist/2RMhzgV621EtuRgXsa0Oo8) | [view](https://bingobaker.com/view/10867296) |
| 5 | Scorned Women | song titles | 32 | [open](https://open.spotify.com/playlist/2xRZDBbHvqbxvz0h4RUUdk) | [view](https://bingobaker.com/view/10867308) |
| 6 | **Soft Rock — BLACKOUT** | song titles | 30 | [open](https://open.spotify.com/playlist/0OGFuiVzJONEBhFcSTnpHT) | [view](https://bingobaker.com/view/10867314) |

Energy arc: mid-tempo groove → kickoff moment → belting → nostalgia detonation →
scream-along peak → whole-bar communal closer.

## Round sources

| Round | Source | Last played |
|-------|--------|-------------|
| 1 R&B Hits | clone of 9/2 | 1 week |
| 2 Super Bowl Halftime | **new — hand-curated** | — |
| 3 Pop Divas | clone of 9/2 | 1 week |
| 4 Nickelodeon & Disney | clone of 8/26 | 2 weeks |
| 5 Scorned Women | clone of 9/2 | 1 week |
| 6 Soft Rock | clone of 9/2, one track swapped | 1 week |

R&B and Pop Divas both ran on 9/2 but in the opposite positions (R&B was #4, Divas
was #1). Inverted here with reshuffled cards so the night doesn't read as a rerun.

## Round 2 — Super Bowl Halftime (new)

Every artist on the card has performed a Super Bowl halftime show. The hook works even
for people who don't watch football — it's just a "greatest pop moments" round with a
reason to exist tonight.

- **Announce it at kickoff.** The game starts during this round. Lean into it rather
  than fighting the TVs.
- Built with zero artist overlap against R&B Hits (#1) and Pop Divas (#3), so the three
  consecutive artist rounds draw from completely separate benches.
- Four songs were deliberately pinned off their obvious pick to avoid collisions:
  Coldplay → *Viva La Vida* (not "Yellow", in Soft Rock), Maroon 5 → *Moves Like Jagger*
  (not "She Will Be Loved", in Soft Rock), No Doubt → *Don't Speak* (not "Just A Girl",
  in Scorned Women), Dr. Dre → *Still D.R.E.* (not "No Diggity", in R&B Hits).
- **Paul McCartney was cut** for Red Hot Chili Peppers. "Hey Jude" is credited to The
  Beatles on Spotify and "Live and Let Die" to Wings, so the card item wouldn't have
  matched the playing artist.
- Nick's picks: *NUEVAYoL* for Bad Bunny (NYC nod) and *I Don't Want to Miss a Thing*
  for Aerosmith over "Walk This Way".
- **Beyoncé is deliberately absent.** She already has three tracks in Scorned Women plus
  one each in R&B Hits and Pop Divas — five in the night. Adding a sixth was too much.
- Watch: *Not Like Us* will get the loudest reaction of the round but it's a diss track.
  *Born to Run* also appeared in June's Victory Lap round, so a few regulars may have
  heard it three months ago.

## Round 6 — Soft Rock (BLACKOUT)

- **Lifehouse swap:** "Hanging by a Moment" is out, **"You and Me"** is in (2005
  self-titled album version, `0815caqt2Lytro5EIzMufT`). Holds the round at exactly 30.
- **"Wake Me Up When September Ends" still lands** — it's September 9. Worth calling
  out from the mic again.
- Two card items are re-cased off Spotify's raw titles for print ("Wake Me up" →
  "Wake Me Up", "You And Me" → "You and Me"). **Re-apply this if you re-run
  `gen-refs.js` — it overwrites the card file with Spotify's casing.**

## Hosting notes

- **Round 1 is the easy one, by design.** R&B stays in artist format because several of
  its titles are recall-hostile ("Untitled (How Does It Feel)", "Redbone", Keith Sweat's
  "Nobody"). The artists are instant; the titles are not.
- **Rounds 1–3 are all artist rounds**, then 4–6 are all titles. Content is far enough
  apart that it shouldn't read as repetitive, but it's the one structural compromise.
- **Nick & Disney at #4 is the buffer.** Pop Divas and Scorned Women share nine artists
  (Beyoncé, Rihanna, Britney, Christina, P!nk, SZA, Olivia Rodrigo, Chappell Roan,
  Shakira). Keeping a round between them stops that from being obvious.
- **Round 5 is the peak.** Same as the last two outings — let it run.
- Nick & Disney is back after a one-week rest following three straight appearances.

## Verification

178 songs across 6 rounds, **0 duplicate recordings** (`node scripts/gen-refs.js 0909`).

Build issues caught and fixed:

- **`clone-playlist --output` writes song titles regardless of round format.** Rounds 1
  and 3 are artist rounds and got title lists. Rebuilding with `--format artists` then
  produced raw Spotify credits — "USHER" in caps, "Ms. Lauryn Hill", and **"Bruno Mars"
  twice** where the second card item should be Silk Sonic. Fixed by copying 9/2's vetted
  card files, since both playlists are exact clones.
- **Halftime search mispicks.** Letting Spotify search choose returned "Promiscuous" for
  Nelly (that's Nelly *Furtado*), "Who Says" for The Who (John Mayer), and "The Girl Is
  Mine" for Paul McCartney (a Michael Jackson track already in the round). The round was
  rebuilt from an explicit title+artist file instead.
- **"Californication" resolved to "Scar Tissue"** even with the artist filter. Fixed with
  `fix-playlist.js` → `48UPSzbZjgc449aqz8bxox`.
- Round 5's first card generation failed mid-PDF (`fetch failed`); card 10867300 is
  orphaned and unused. Regenerated as 10867308.
