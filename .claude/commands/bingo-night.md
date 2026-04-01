# Plan a Music Bingo Night

Help the user plan a complete music bingo night — from brainstorming rounds and songs to generating printable bingo cards.

## Argument

$ARGUMENTS — A description of the event: how many rounds, any themes, the vibe, the crowd, or anything else relevant. If blank, ask the user about their event.

## Steps

### 1. Plan the rounds

Work with the user to design their rounds. A typical night has 5-7 rounds. Consider:

- **Energy arc**: Start mellow, build to peak energy, end with a fast blackout round.
- **Variety**: Mix up song-title rounds vs artist-name rounds.
- **Crowd favorites**: Party Anthems and R&B Hits always land. Guilty Pleasures is a crowd-pleaser.
- **Special rounds**: Covers (hear an unexpected voice, ID the original song), Famous Intros (blackout format), decades themes.
- **25-30 items per round** is the sweet spot for a 5x5 card with free space. Each card gets a random 24.

### 2. Curate the songs

For each round, brainstorm a song list of 25-30 items. These should be songs the crowd will *recognize* — singability and nostalgia matter more than obscurity. Present them as a numbered list for the user to review and swap out.

### 3. Create the playlist text files

Once the user approves a round's song list, write it to a text file in `playlists/`:

- One item per line (song titles OR artist names, depending on the round format)
- File naming: `playlists/{event_date}/round{N}_{theme}.txt` (e.g., `playlists/0415/round1_pop_divas.txt`)
- For covers rounds, also create a `_spotify_ref.txt` with the format: `Song Title | Cover Artist (original: Original Artist)`

### 4. Tell the user to build Spotify playlists

Tell the user to create a Spotify playlist for each round and add the songs. They can use the search helper:

```bash
node scripts/spotify.js search "Song Title"
node scripts/spotify.js search "Song Title" --artist "Artist Name"
```

If the user already has a Spotify playlist, they can export it instead of writing a text file by hand:

```bash
node scripts/spotify.js get-playlist <playlist-url-or-id> --output playlists/{event_date}/round{N}_{theme}.txt
# For artist-name rounds:
node scripts/spotify.js get-playlist <playlist-url-or-id> --output playlists/{event_date}/round{N}_{theme}.txt --format artists
```

### 5. Generate bingo cards

Once the text files are ready, generate bingo cards for each round:

```bash
node scripts/bingobaker.js create "Round 1 - Theme Name" playlists/{event_date}/round1_theme.txt
node scripts/bingobaker.js create "Round 2 - Theme Name" playlists/{event_date}/round2_theme.txt
# ... repeat for each round
```

This creates PDFs in `cards/` with 40 unique cards per round (10 pages x 4 cards). Remind the user to print them.

### 6. Game night checklist

Wrap up with a checklist for the user:
- [ ] Print bingo cards for each round
- [ ] Shuffle each Spotify playlist before playing
- [ ] Bring daubers/markers for players
- [ ] Have prizes ready for winners
- [ ] Remember: for blackout rounds, use shorter song lists for faster games
