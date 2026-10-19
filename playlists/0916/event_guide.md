# Music Bingo — Wed 9/16

Millennial nostalgia night with a guitar detour at the peak. Five of six rounds are
pop/vocal; Warped Tour at #5 is the deliberate texture break before the blackout.

## Running order

| # | Round | Card shows | Items | Spotify | Cards |
|---|-------|-----------|-------|---------|-------|
| 1 | One-Hit Wonders *(format flipped)* | **song titles** | 30 | [open](https://open.spotify.com/playlist/7MYPNGSORTCZ0BwtQF0COw) | [view](https://bingobaker.com/view/10893462) |
| 2 | Boy Bands vs Girl Groups | artist names | 30 | [open](https://open.spotify.com/playlist/1r4omJDR4y86QYLMh2t7TF) | [view](https://bingobaker.com/view/10893466) |
| 3 | Millennials in Love | artist names | 29 | [open](https://open.spotify.com/playlist/1xYwSnieEl1Ek7WVDAKSoB) | [view](https://bingobaker.com/view/10893468) |
| 4 | Scorned Women | song titles | 32 | [open](https://open.spotify.com/playlist/4XkHQ7C6jBW1p3pt1j7piR) | [view](https://bingobaker.com/view/10893488) |
| 5 | **Warped Tour** *(new)* | song titles | 30 | [open](https://open.spotify.com/playlist/34yQI4baXfjAQIicoFmOD5) | [view](https://bingobaker.com/view/10893502) |
| 6 | **Pop Hits — BLACKOUT** *(new)* | song titles | 30 | [open](https://open.spotify.com/playlist/4rXDaOoD5y5pKZm1Kivyi1) | [view](https://bingobaker.com/view/10893512) |

Energy arc: silly warm-up → puppy-love nostalgia → grown-up love → love gone wrong →
teenage rage → pure joy. Rounds 2–5 read as a narrative; worth calling out from the mic.

## Round sources

| Round | Source | Last played |
|-------|--------|-------------|
| 1 One-Hit Wonders | clone of 8/19, **card format flipped to titles** | 4 weeks |
| 2 Boy Bands vs Girl Groups | clone of 5/13 | 4 months |
| 3 Millennials in Love | clone of 5/13 | 4 months |
| 4 Scorned Women | clone of 9/9 | 1 week |
| 5 Warped Tour | **new — hand-curated** | — |
| 6 Pop Hits | **new — hand-curated** | — |

## Round 1 — One-Hit Wonders (format flipped)

Same 30 recordings as 8/19, but **the card now shows song titles, not artists.** Nick's
call: nobody knows who Ini Kamoze, Chesney Hawkes, Taco or Baltimora are, and the round
was hostile as an artist round. The titles are all in the hook.

Three card items differ from 8/19 because they now come from Spotify's actual track
names: "I Am the One and Only" → **"The One and Only"**, "Mickey" → **"Hey Mickey"**,
"What's Up" → **"What's Up?"**. All correct — these are the real titles.

## Round 5 — Warped Tour (new)

Every artist on this card actually played Vans Warped Tour. That constraint is the
round — it's what keeps it from drifting into generic "2000s rock."

- **This replaced a "Road Trip Songs" round that got scrapped.** That list had no frame,
  so it filled up with genre-box-checking and movie-association picks (Life Is a
  Highway/*Cars*, Come and Get Your Love/*Guardians*). Warped Tour is a hard, verifiable
  boundary. Keep using frames like this.
- **Notable exclusions, all for the same reason — never played Warped:** The Killers
  (losing Mr. Brightside hurt), Evanescence, Avril Lavigne, Nickelback, Kings of Leon,
  3 Doors Down, The White Stripes.
- **Paramore gets "That's What You Get"** because Scorned Women already owns "Misery
  Business." Same reason "Since U Been Gone" isn't here.
- **Four deep-ish cuts to watch:** *Ohio Is for Lovers*, *My Friends Over You*, *Sell
  Out*, *The Impression That I Get*. Anyone who went to Warped will lose it; anyone who
  didn't may blank. Bench if a re-run needs them softer: *My Own Worst Enemy* (Lit),
  *Party Hard* (Andrew W.K.), *I'm Shipping Up to Boston* (Dropkick Murphys), *The Great
  Escape* (Boys Like Girls), *Be My Escape* (Relient K).
- Search went 30/30 with zero mispicks — the explicit `Title | Artist` build file did
  its job.

## Round 6 — Pop Hits (BLACKOUT)

Exactly 30 items, so every card gets a unique 24. Built for speed: each song is
identifiable inside two seconds, which is what stops a 24-square round from dragging.

- **"good 4 u" was cut** — Scorned Women already plays it. Replaced with **Havana**.
- **Ed Sheeran's "Shape of You" was cut** at Nick's call, replaced with **Thrift Shop**.
- Bruno Mars appears twice as a featured artist (Uptown Funk, APT.) — different songs,
  fine, but don't play them back to back.

## Hosting notes

- **Round 4 is the proven peak** — same as the last three outings. Let it run.
- **Round 5 is the loudest.** Warped Tour after Scorned Women is the one-two punch of
  the night. Announce it by name; the title alone gets a reaction.
- **Rounds 2 and 3 are both artist rounds back to back.** Content is far enough apart
  (bubblegum groups vs. grown-up love songs) that it shouldn't read as repetitive.
- Guilty Pleasures and Party Anthems were **deliberately left out** — both fall flat
  with this crowd.
- **Karaoke Classics was excluded on purpose.** It ran 8/19 and overlaps Warped Tour's
  job. Don't schedule the two together.

## Verification

181 songs across 6 rounds, **0 duplicate recordings** (`node scripts/gen-refs.js 0916`).

Build issues caught and fixed:

- **`gen-refs.js` flagged "98 Degrees" as UNMATCHED** in Round 2. False alarm — the
  track is there, but Spotify credits the artist as **98º** (degree symbol), so the
  string compare missed. Card item stays "98 Degrees" (more readable); the ref line was
  patched by hand.
- **Print casing re-applied by hand after `gen-refs.js`** — it writes Spotify's raw
  casing. Fixed: "All The Small Things" → "All the Small Things", "Ohio Is For Lovers"
  → "Ohio Is for Lovers", "FACE DOWN" → "Face Down", "Prayer Of The Refugee" → "Prayer
  of the Refugee", "CAN'T STOP THE FEELING!" → "Can't Stop the Feeling!", "Video Killed
  The Radio Star"/"Who Let The Dogs Out" → lowercase "the". **Re-apply all of these if
  you re-run `gen-refs.js`.**
- **"Cupid's Chokehold / Breakfast in America"** shortened to **"Cupid's Chokehold"** —
  the full Spotify title is too long for a 5×5 cell.
- **Round 4's first card generation failed mid-PDF** (`fetch failed`), then a retry hit
  a login navigation timeout. Card **10893472 is orphaned and unused**. Succeeded on the
  third try after a 90-second backoff as 10893488. BingoBaker needs real gaps between
  requests.

## Tabled for a future week

**Duets** — card cell shows two artists ("Beyoncé & Jay-Z"), and artists deliberately
repeat across cells so you have to catch the *collaborator*, not just the voice. Full
30-item list with songs is in `duets_TABLED.md`. It conflicts with Millennials in Love
(Crazy in Love, Shallow, Dilemma, We Found Love) so those two can't run the same night.
