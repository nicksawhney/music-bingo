# Music Bingo — Wed 8/26 (WNYU Reunion Night)

Guest contributor: **Aeslyn** (rounds 2 and 5). College radio friends in the crowd.

## Running order

| # | Round | Card shows | Items | Spotify |
|---|-------|-----------|-------|---------|
| 1 | Pop Divas | artist names | 30 | [open](https://open.spotify.com/playlist/4Xwb9yfCHvayhpJazrjEms) |
| 2 | I Love Him! *(Aeslyn)* | song titles | 28 | [open](https://open.spotify.com/playlist/3drmm2CQmnsE9WE9gNo1Yr) |
| 3 | **Dolly Parton (1946–2026)** — memorial | song titles | 30 | [open](https://open.spotify.com/playlist/6cnWAQgi66OiqJNEBpyi4c) |
| 4 | Nickelodeon & Disney | song titles | 26 | [open](https://open.spotify.com/playlist/3baYAnldEpprnKDjPOAzwe) |
| 5 | Scorned Women *(Aeslyn)* | song titles | 32 | [open](https://open.spotify.com/playlist/7biFuTTj6kHPFWtFP2q7xQ) |
| 6 | Famous Intros — **BLACKOUT** | artist names | 30 | [open](https://open.spotify.com/playlist/7kKGD2POvkrdNrPvZCHqiI) |

Energy arc: warm-up → sweet/retro → fun → nostalgia peak → scream-along peak → fast blackout.

## Round 3 — Dolly Parton memorial

Dolly Parton died 8/25/2026, age 80, in Nashville — the day before this event. Round 3
replaced One-Hit Wonders.

- What to say before starting the round:

  > I have this job because I love music and I love people, and I love connecting with
  > them and having fun. Nobody did that better than Dolly Parton, so this round is for her.

  Then go straight into the first song — don't wait for a reaction.

- Every track is **Dolly's own recording**, verified one by one. Spotify's default match
  for "Old Flames Can't Hold a Candle to You" is Kesha's version with Dolly only featured —
  that's been replaced with Dolly's original. Same for "Do I Ever Cross Your Mind"
  (the default was a Chet Atkins album cut).
- "Powerful Women" (Pitbull ft. Dolly) is in, as requested.
- Swapped "Hard Candy Christmas" out for "Mule Skinner Blues" — the former is a Christmas
  song and it's August; the latter is a high-energy yodel showcase.
- The back half is deep (*Applejack, The Bargain Store, Joshua, Dumb Blonde*). That's
  unavoidable in a single-artist round — outside her top ~8, a Brooklyn pub crowd is
  guessing. Consider calling the year or album as a hint on the deep ones.
- **"Jolene" plays twice tonight** — round 3 and round 6 (Famous Intros). Nick okayed this
  deliberately. `gen-refs.js` whitelists it so the dedupe check stays green.

## Hosting notes

- **Round 2 is the soft spot.** "I Love Him!" skews 60s–80s and mellow — more sway-along
  than sing-along, same shape as Modern Love Songs which underperformed. It's early on
  purpose. About 5 of 28 are deep cuts the pub may not place (*Diet Mountain Dew,
  Romeo and Juliet, Father Figure, He's a Rebel, Criminal*) — be ready to call out the
  artist if the room goes quiet.
- **Round 5 should be the peak.** Nearly every track is a scream-along. Let it run.
- Consider handing Aeslyn the mic for rounds 2 and 5 — it's their set.
- Rounds 4 and 6 are exact reruns of the 8/19 and 8/12 playlists. Regulars have played
  Nickelodeon twice already; the new faces haven't.
- Nice closer if the night calls for it: play "I Will Always Love You" or "Jolene" off-round
  after the blackout, no cards, just the room.
- Whitney Houston appears 3× across the night (*How Will I Know* and *Saving All My Love*
  in R2, *I Wanna Dance with Somebody* in R6). Three distinct songs, but the R6 intro may
  feel familiar after R2 — no action needed, just don't be surprised.

## Verification

176 songs across 6 rounds, **0 duplicate recordings** (`node scripts/gen-refs.js` checks this).

Two collisions were caught and fixed at build time:
- SZA — "Kill Bill" is in Scorned Women, so Pop Divas was pinned to
  *Snooze (Acoustic) feat. Justin Bieber* instead.
- Céline Dion — "My Heart Will Go On" belongs to Famous Intros, so Pop Divas was pinned
  to *It's All Coming Back to Me Now*. (The accent in "Céline" made the reference lookup
  miss and silently pick the Titanic song for both rounds.)
