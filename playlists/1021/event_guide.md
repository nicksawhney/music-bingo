# Music Bingo — Wed 10/21

Pre-Halloween week. The 10/28 show is three days before Halloween and gets the full
spooky treatment, so this one stays a normal night with a light seasonal nod seeded into
two rounds.

**10/07 was cancelled; that lineup was played on 10/14 instead** (see the `1007` folder —
its name matches the Spotify playlist prefixes, not the night it ran).

So last week's show was Pop Divas / Karaoke Classics / Super Bowl Halftime / Scorned
Women / Warped Tour / Soft Rock, and it leaned on the Pop Divas / Scorned Women / Warped
Tour core — Warped Tour having run three shows straight (9/16, 9/23, 10/14).

**All six of those rounds are rested here. Nothing on 10/21 repeats from last week.** The
night rebuilds around two long-rested revivals — **Hip Hop & Rap** (not played since
4/22) and **Famous Intros** (not since 8/26) — plus one new round, with the rest sourced
from 9/16 and 9/23.

## Running order

| # | Round | Card shows | Items | Spotify | Cards |
|---|-------|-----------|-------|---------|-------|
| 1 | Millennials in Love | artist names | 30 | [open](https://open.spotify.com/playlist/43YPMQ60hDhKfyueyfe3Q0) | [view](https://bingobaker.com/view/11000180) |
| 2 | **2010s Bangers** *(new)* | song titles | 30 | [open](https://open.spotify.com/playlist/6KJ5WssZEaVRebR4mngSTB) | [view](https://bingobaker.com/view/11000184) |
| 3 | Hip Hop & Rap | artist names | 30 | [open](https://open.spotify.com/playlist/2tA4wDyUgPWcGLlsHAmsFJ) | [view](https://bingobaker.com/view/11000186) |
| 4 | Nickelodeon & Disney | song titles | 30 | [open](https://open.spotify.com/playlist/2EyJFkhRq0BdPC0DH7rCLL) | [view](https://bingobaker.com/view/11000194) |
| 5 | Wedding Reception | song titles | 30 | [open](https://open.spotify.com/playlist/12nZL1dh3zOZIoryGKl82C) | [view](https://bingobaker.com/view/11000198) |
| 6 | **Famous Intros — BLACKOUT** | artist names | 30 | [open](https://open.spotify.com/playlist/1fQ8ybNqimmfova7kjDtA2) | [view](https://bingobaker.com/view/11000202) |

Energy arc: slow-jam warm-up → 2010s singalong → hip hop peak → childhood nostalgia →
everybody-on-the-floor → fast blackout. Format alternates artist/title every round.

## Round sources

| Round | Source | Last played |
|-------|--------|-------------|
| 1 Millennials in Love | clone of 9/16; Ed Sheeran removed, +Christina Perri, +Brian McKnight | 5 weeks |
| 2 2010s Bangers | **new — hand-curated** | — |
| 3 Hip Hop & Rap | rebuilt from the 4/22 + 6/17 lists, 14 songs pinned by hand | 6 months |
| 4 Nickelodeon & Disney | clone of 9/23, **+4 items** to reach 30 | 4 weeks |
| 5 Wedding Reception | exact clone of 9/23 | 4 weeks |
| 6 Famous Intros | clone of 8/26, **3 artists swapped + MJ repinned** | 8 weeks |

## Nick's requests

Two songs Nick was listening to this week, both confirmed never played before:

- **Adventure of a Lifetime — Coldplay** → Round 2, card item *Adventure of a Lifetime*.
  Past Coldplay picks were Clocks / Viva La Vida / Yellow, so this recording is fresh.
- **Touch the Sky — Kanye West** → Round 3, pinned to card item *Kanye West*.
  Past Kanye picks were Gold Digger / Stronger / Heartless / Power.

## Halloween nod (light)

- Round 4 opens the door on the season with **This Is Halloween**.
- Round 6 **Michael Jackson is repinned from Billie Jean to Thriller** — the creaking-door
  intro is the best seasonal moment available in a blackout round.

Save the full spooky round for 10/28.

## Standing constraint — no Ed Sheeran

Verified zero Sheeran tracks and zero Sheeran features across all six rounds. The 9/16
Millennials in Love list had *Thinking Out Loud* in it; it was removed during the clone
and replaced. **If Millennials in Love is cloned again, re-check this** — the 9/16 source
file still contains him.

## Dedupe notes

`gen-refs.js 1021` passes clean: **180 songs, 0 duplicates.**

Deliberate artist repeats across rounds (different recordings, which is fine):

- **Coldplay** — *Adventure of a Lifetime* (R2) and *Clocks* (R6).
- **Eminem** — *Without Me* (R3) and *Lose Yourself* (R6).
- **Jay-Z** — *99 Problems* (R3); also features on Beyoncé's *Crazy In Love* (R1).
- **Dr. Dre** — *Still D.R.E.* (R3); also features on 2Pac's *California Love* (R3).

### Collisions that were headed off

Wedding Reception and Famous Intros nearly collided three times — the 8/26 Famous Intros
picks for Whitney Houston, Earth Wind & Fire and Journey are *I Wanna Dance with
Somebody*, *September* and *Don't Stop Believin'*, all three of which are Wedding
Reception card items. Those three artists were swapped out for **Survivor** (Eye of the
Tiger), **The Rolling Stones** (Satisfaction) and **Aerosmith** (Dream On).

**If Wedding Reception and Famous Intros are ever run on the same night again, re-check
this.** Bon Jovi is the next landmine — *Livin' on a Prayer* is a Wedding Reception item
and would be the obvious Famous Intros pick.

Post Malone, Lil Nas X, Macklemore and Nelly were deliberately kept off the Hip Hop & Rap
card because their biggest songs (*Sunflower*, *Old Town Road*, *Thrift Shop*, *Dilemma*)
are already card items in Rounds 1 and 2.

### build-artist-round mispicks caught in dry-run

Round 3's auto-search produced seven wrong-artist picks, all overridden:

| Card item | Auto-picked | Actually by | Pinned to |
|-----------|-------------|-------------|-----------|
| Ludacris | Yeah! | Usher | Stand Up |
| Lil Jon | Yeah! | Usher | Get Low |
| T.I. | My Love | Justin Timberlake | Whatever You Like |
| Busta Rhymes | Look At Me Now | Chris Brown | Touch It |
| Travis Scott | Sky Walker | Miguel | SICKO MODE |
| Megan Thee Stallion | Beautiful Mistakes | Maroon 5 | Savage |
| Lil Wayne | Down | Jay Sean | Lollipop |

Four more were correct but weakly recognizable and were upgraded by hand: Kendrick Lamar
→ *HUMBLE.*, Drake → *One Dance*, Childish Gambino → *Redbone*, Lauryn Hill →
*Doo Wop (That Thing)*.

### Card-item gotcha: 2Pac

`gen-refs.js` warned `no track found for card item "Tupac"` — Spotify credits him as
**2Pac**, so the artist-pairing lookup missed. The card item was renamed to *2Pac* to
match. Same class of bug as the Céline Dion accent issue in NOTES.md.

## Pre-show checklist

- [ ] Print all six PDFs from `cards/1021/`
- [ ] Shuffle every playlist in the Spotify app before its round
- [ ] Round 6 is **blackout** — 30 items means every card is a different 24, so no
      simultaneous win
- [ ] Daubers / markers out
- [ ] Prizes ready
