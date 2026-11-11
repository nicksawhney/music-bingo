# Music Bingo — Wed 10/28 (Pre-Halloween)

Three days before Halloween, the full spooky treatment the 10/21 guide promised. Two
Halloween rounds bookend the night (R2 and the R6 blackout); the three middle rounds are
rested crowd-pleasers that keep the singing going.

## Running order

| # | Round | Card shows | Items | Spotify | Cards |
|---|-------|-----------|-------|---------|-------|
| 1 | Pop Divas | artist names | 30 | [open](https://open.spotify.com/playlist/3342qiBEI0RLZ98tW2FE7h) | [view](https://bingobaker.com/view/11030744) |
| 2 | **Halloween Classics** *(new)* | song titles | 30 | [open](https://open.spotify.com/playlist/3wmmszu8HO0SKz61nFE0S2) | [view](https://bingobaker.com/view/11030748) |
| 3 | Boy Bands vs Girl Groups | artist names | 30 | [open](https://open.spotify.com/playlist/3d6WbkiCaNaBL61Wt1MZm0) | [view](https://bingobaker.com/view/11030752) |
| 4 | Scorned Women | song titles | 32 | [open](https://open.spotify.com/playlist/70BHphqVAMb3p1m2vsbgpW) | [view](https://bingobaker.com/view/11030756) |
| 5 | 2000s Bangers | artist names | 30 | [open](https://open.spotify.com/playlist/6G52UPmqvrRkZr0oeacL3m) | [view](https://bingobaker.com/view/11030758) |
| 6 | **Monsters, Ghosts & Devils — BLACKOUT** *(new)* | song titles | 30 | [open](https://open.spotify.com/playlist/2oaHX4YeIRuStMk1Kc1OKQ) | [view](https://bingobaker.com/view/11030760) |

Energy arc: diva warm-up → Halloween novelty → boy-band nostalgia → scream-along peak →
dance peak → fast spooky blackout. Format alternates artist/title every round.

## Round sources

| Round | Source | Last played |
|-------|--------|-------------|
| 1 Pop Divas | exact clone of 10/14 | 2 weeks |
| 2 Halloween Classics | **new — hand-curated** | — |
| 3 Boy Bands vs Girl Groups | exact clone of 9/16 | 6 weeks |
| 4 Scorned Women | exact clone of 10/14 | 2 weeks |
| 5 2000s Bangers | exact clone of 9/23 | 5 weeks |
| 6 Monsters, Ghosts & Devils | **new — hand-curated** | — |

**Nothing from 10/21 repeats** (Millennials in Love, 2010s Bangers, Hip Hop & Rap,
Nickelodeon & Disney, Wedding Reception, Famous Intros are all rested).

## The two Halloween rounds

Both have a hard boundary, and they are deliberately disjoint:

- **R2 Halloween Classics** — the literal canon, songs that only ever get played in
  October. Monster Mash, Thriller, Ghostbusters, Time Warp, Werewolves of London, the
  Carpenter *Halloween* theme, Tubular Bells.
- **R6 Monsters, Ghosts & Devils** — a monster/ghost/devil/horror word in the title, drawn
  from modern pop and rock instead. Zombie, Ghost, Bloody Mary, vampire, Creepin',
  bury a friend, Defying Gravity.

R2 is a *recognition* round rather than a singalong — the pub won't belt the Addams Family
theme the way they belt R&B. The singing lives in rounds 3–5. Worth noting how R2 actually
lands; if it drags, the fix is to move it later and open with Boy Bands.

### Nick's request
**Defying Gravity** (Cynthia Erivo & Ariana Grande, *Wicked* 2024) is in R6 — card item
*Defying Gravity*. Shout at the Devil (Mötley Crüe) was dropped to make room; R6 still has
three other devil songs. Witch Doctor was briefly cut for this and put back at Nick's call.

## Dedupe notes

`gen-refs.js 1028` passes clean: **182 songs, 0 duplicates.**

Deliberate artist repeats across rounds (all different recordings, which is fine):

- **Olivia Rodrigo ×3** — *stupid song* (R1), *good 4 u* (R4), *vampire* (R6).
- **AC/DC ×2** — *Highway to Hell* (R2) and *Hells Bells* (R6). Both are canon, kept on purpose.
- **Alice Cooper ×2** — R2 has none now; *Poison* is R6 only.
- **Ariana Grande ×2** — *hate that i made you love me* (R1) and the *Defying Gravity* duet (R6).
- **Taylor Swift ×2** — *The Fate of Ophelia* (R1) and *Bad Blood* (R6).
- **Rihanna ×2** — *We Found Love* (R1), *Breakin' Dishes* (R4), plus her feature on *The Monster* (R6).
- **Destiny's Child ×2** — *Say My Name* (R3) and *Jumpin', Jumpin'* (R5).
- **Busta Rhymes ×2** — featured on *Don't Cha* (R3) and *Touch It* (R5).

### Mispicks caught and fixed

| Round | Card item | Auto-picked | Pinned to |
|-------|-----------|-------------|-----------|
| 2 | Thriller | *Human Nature* — Michael Jackson | *Thriller* (`2LlQb7Uoj1kKyGhlkBf9aC`) |
| 6 | Bat Out of Hell | *Paradise By the Dashboard Light* — Meat Loaf | *Bat Out of Hell* (`3mCeeoBvTTpg8Xy2Wuvirw`) |

`Scooby Doo Where Are You` returned nothing real — only karaoke re-recordings. Swapped to
**What's New Scooby-Doo? — Simple Plan**, which is the version this crowd's age group
actually knows. Card item renamed to match.

### gen-refs.js card-item warnings (both benign)

- `no track found for card item "98 Degrees"` — Spotify credits them **98º**.
- `no track found for card item "The Black Eyed Peas"` — Spotify credits them **Black Eyed Peas**, no "The".

Same class as the Céline Dion accent bug. Both card items are correct as printed; the two
ref lines were filled in by hand. **These will recur every time these two rounds are
cloned.**

### Print re-casing

`gen-refs.js` rewrote both new card files from Spotify's raw titles and had to be undone:
*This is Halloween* → *This Is Halloween*, *Main Theme: The Addams Family* → *The Addams
Family Theme*, *Sympathy For The Devil* → *Sympathy for the Devil*, *Tubular Bells* →
*Tubular Bells (The Exorcist)*, *(You're The) Devil In Disguise* → *(You're the) Devil in
Disguise*, *Bad To The Bone* → *Bad to the Bone*, *Spooky (Single Version)* → *Spooky*,
*Wanted Dead Or Alive* → *Wanted Dead or Alive*.

### Standing constraint — no Ed Sheeran

Verified zero Sheeran tracks and zero Sheeran features across all six rounds.

## Pre-show checklist

- [ ] Print all six PDFs from `cards/1028/`
- [ ] Shuffle every playlist in the Spotify app before its round
- [ ] Round 6 is **blackout** — 30 items means every card is a different 24
- [ ] Daubers / markers out
- [ ] Prizes ready
