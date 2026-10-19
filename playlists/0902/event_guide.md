# Music Bingo — Wed 9/2

All-rerun night except the closer. New cards and a new running order throughout.

## Running order

| # | Round | Card shows | Items | Spotify | Cards |
|---|-------|-----------|-------|---------|-------|
| 1 | Pop Divas | artist names | 30 | [open](https://open.spotify.com/playlist/3lT3BTLYRZ7gqCwofKQ7qD) | [view](https://bingobaker.com/view/10836148) |
| 2 | 2010 Music | song titles | 29 | [open](https://open.spotify.com/playlist/4rdm6hOvj14I0jPpsiVzuk) | [view](https://bingobaker.com/view/10836150) |
| 3 | 2020s Bangers | artist names | 29 | [open](https://open.spotify.com/playlist/2eb7B1De8dGalgJbCNyiwp) | [view](https://bingobaker.com/view/10836152) |
| 4 | R&B Hits | artist names | 30 | [open](https://open.spotify.com/playlist/0iRTq9BBAfq3NZ3jlGF5TU) | [view](https://bingobaker.com/view/10836160) |
| 5 | Scorned Women | song titles | 32 | [open](https://open.spotify.com/playlist/3MhtbhR9TZuzgtIDUSlQp6) | [view](https://bingobaker.com/view/10836166) |
| 6 | **Soft Rock — BLACKOUT** | song titles | 30 | [open](https://open.spotify.com/playlist/0tOTwq6KkcqmPYHMqdNiXH) | [view](https://bingobaker.com/view/10836170) |

Energy arc: warm-up → nostalgia → modern → sing-along build → scream-along peak →
whole-bar communal closer.

## Round sources

Every round except 6 is an exact clone of a previous week's playlist — same recordings,
reshuffled cards.

| Round | Cloned from | Last played |
|-------|-------------|-------------|
| 1 Pop Divas | 8/26 | 1 week |
| 2 2010 Music | 4/08 | ~5 months |
| 3 2020s Bangers | 7/29 | 5 weeks |
| 4 R&B Hits | 8/12 | 3 weeks |
| 5 Scorned Women | 8/26 | 1 week |

## Round 6 — Soft Rock (new)

Nick's build. Late-90s through early-2010s acoustic/soft rock — the "everyone
accidentally knows every word" catalog.

- **This is a mellow blackout, which is deliberate.** It follows Scorned Women's
  scream-along peak, so the room is loud going in. The blackout format keeps it moving
  fast regardless of tempo, and the payoff is the whole bar singing "Iris" and
  "Chasing Cars" together at close. Don't fight the drop in volume — let it be the
  end-of-night moment.
- **"Wake Me Up When September Ends" on September 2nd.** Worth calling out from the mic.
- Exactly 30 items, as a blackout requires.
- Two card items were re-cased off Spotify's raw titles for print
  ("Wake Me up" → "Wake Me Up", "Hanging By A Moment" → "Hanging by a Moment").
  The `_spotify_ref.txt` records both spellings.

## Hosting notes

- **Round 5 is the peak.** Same as 8/26 — nearly every track is a scream-along. Let it run.
- **Round 2 skews specific.** It is *only* songs from the calendar year 2010, which is a
  fun hook to announce up front. Deep-ish cuts to watch: *We No Speak Americano*,
  *Bedrock*, *Bottoms Up*.
- **Nickelodeon & Disney is resting this week** after three straight appearances. It's
  still a hit — bring it back in a week or two and it'll feel special again.
- Rounds 3 and 4 are both artist rounds back to back. If that feels samey on the night,
  they're safe to swap in either order.

## Verification

180 songs across 6 rounds, **0 duplicate recordings** (`node scripts/gen-refs.js 0902`).

Four collisions were caught and fixed at build time:

- **Rihanna** — "Only Girl (In the World)" is in the 2010 round, so Pop Divas was re-pinned
  to *Umbrella*.
- **Lady Gaga** — "Bad Romance" is in the 2010 round, so Pop Divas was re-pinned to
  *Poker Face*.
- **Train** — "Hey, Soul Sister" was in both the 2010 round and Soft Rock. Kept in Soft Rock
  per Nick's list and pulled from the 2010 clone, which drops that round to 29 items.
- **Bruno Mars** — "Leave the Door Open" landed in both 2020s Bangers and R&B Hits (R&B
  legitimately carries two Bruno tracks). 2020s Bangers was re-pinned to *Die With a Smile*.

Two more were pre-solved by cloning 8/26's Pop Divas, which had already been deduped
against Scorned Women that night: SZA → *Snooze* (not "Kill Bill") and Céline Dion →
*It's All Coming Back to Me Now*.

Rounds dropped during planning: Hip Hop Royalty (Nick's call — also would have collided
with R&B Hits on Lauryn Hill's "Doo Wop (That Thing)"), Guilty Pleasures (replaced by Pop
Divas, which removed conflicts on "Unwritten" and "Bad Day" with the Soft Rock closer).
