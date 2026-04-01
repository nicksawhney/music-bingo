# Music Bingo

CLI tools for music bingo hosts. Build a Spotify playlist, and these scripts turn it into randomized, printable bingo cards — no manual data entry required.

Built by a music bingo host in Brooklyn who got tired of copy-pasting 240 songs into web forms every week.

## The workflow

1. **Build a Spotify playlist** for each round (25-30 songs)
2. **Export it** — `spotify.js get-playlist` pulls your track list into a text file
3. **Generate cards** — `bingobaker.js create` turns that text file into a PDF of randomized, unique bingo cards
4. **Game night** — shuffle each Spotify playlist, hit play, let your crowd play along

Spotify playlist to printable bingo cards in two commands:

```bash
node scripts/spotify.js get-playlist https://open.spotify.com/playlist/YOUR_PLAYLIST --output playlists/round1.txt
node scripts/bingobaker.js create "Round 1 - Pop Divas" playlists/round1.txt
```

## What's in the box

### `scripts/bingobaker.js`

Automates [BingoBaker](https://bingobaker.com) card creation using Puppeteer. Give it a title and a text file of items, and it:

1. Logs into your BingoBaker account
2. Creates a new bingo card with your items
3. Downloads a PDF with randomized, unique cards

**Requires a paid BingoBaker account** ($24.95 lifetime). Free accounts have print limits.

```bash
node scripts/bingobaker.js create "Round 1 - Pop Divas" playlists/round1.txt
```

Options:
| Flag | Default | Description |
|------|---------|-------------|
| `--pages N` | 10 | Number of pages in the PDF |
| `--per-page N` | 4 | Cards per page (1, 2, or 4) |
| `--no-title` | — | Hide the bingo title on cards |
| `--no-free-space` | — | No free space in the center |
| `--visibility V` | hidden | `public`, `hidden`, or `private` |

Output goes to `cards/`.

### `scripts/spotify.js`

Reads your Spotify playlists and exports them as song lists for bingo card generation. Also includes search and playlist creation helpers.

```bash
# Export a playlist's tracks to a text file (the key command!)
node scripts/spotify.js get-playlist https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M --output playlists/round1.txt

# Export artist names instead of song titles (great for "Name That Artist" rounds)
node scripts/spotify.js get-playlist PLAYLIST_ID --output playlists/round1.txt --format artists

# Search for a track
node scripts/spotify.js search "MMMBop"
node scripts/spotify.js search "Hallelujah" --artist "Jeff Buckley"

# Create an empty playlist
node scripts/spotify.js create-playlist "Round 3 - Guilty Pleasures"
```

## Playlist file format

One item per line. Items can be song titles, artist names, or anything you want on the bingo card cells.

```
MMMBop
Barbie Girl
Who Let the Dogs Out
Call Me Maybe
Mambo No. 5
```

You can also write these by hand — the Spotify export is just a shortcut.

For rounds where you play a cover version but the card shows the original song title, use the **covers reference format**:

```
Song Title | Cover Artist (original: Original Artist)
Hallelujah | Jeff Buckley (original: Leonard Cohen)
Hurt | Johnny Cash (original: Nine Inch Nails)
```

The bingo card file (for BingoBaker) should contain just the song titles or just the artists. The reference file (for Spotify) tells the script which version to search for. Claude is good at generating these.

## Setup

### Prerequisites

- Node.js 18+
- A [BingoBaker](https://bingobaker.com) paid account (for card generation)
- A [Spotify Developer](https://developer.spotify.com/dashboard) app (for playlist export)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/music-bingo.git
cd music-bingo
npm install
```

### BingoBaker setup

1. Create a [BingoBaker](https://bingobaker.com) account and purchase a paid plan ($24.95 lifetime) — free accounts have print/download limits
2. Copy the example config and fill in your credentials:

```bash
cp bingobaker-config.example.json bingobaker-config.json
```

```json
{
  "email": "your-bingobaker-email@example.com",
  "password": "your-bingobaker-password"
}
```

The script uses these credentials to log in via Puppeteer and automate card creation.

### Spotify setup

1. Create an app at https://developer.spotify.com/dashboard
2. Under **APIs used**, check **Web API**
3. Under **User Management**, add your Spotify email address
4. Set the redirect URI to `http://127.0.0.1:8888/callback`

```bash
cp spotify-config.example.json spotify-config.json
```

Edit `spotify-config.json` with your `clientId` and `clientSecret`.

#### Getting your access and refresh tokens

You need a one-time OAuth flow to get your `accessToken` and `refreshToken`. The easiest way is using the [spotify-mcp-server](https://github.com/marcelmarais/spotify-mcp-server) auth tool:

```bash
git clone https://github.com/marcelmarais/spotify-mcp-server.git
cd spotify-mcp-server
npm install
# Add your clientId, clientSecret, and redirectUri to spotify-config.json
npm run auth
```

This opens a browser for Spotify login. Once authenticated, copy the `accessToken` and `refreshToken` from the MCP server's config into your `spotify-config.json`. The script auto-refreshes tokens on subsequent runs.

#### Spotify API limitations (as of 2026)

Apps in Spotify's Development Mode can read playlists, search tracks, and create empty playlists. Adding tracks to playlists programmatically requires [Extended Quota Mode](https://developer.spotify.com/documentation/web-api/concepts/quota-modes) — but you don't need it for the core workflow. Just build your playlists in Spotify and export them.

## Running a bingo night

### 1. Build your Spotify playlists

Create a playlist in Spotify for each round with ~25-30 songs. This is where you curate the music — pick songs your crowd will love.

### 2. Export and generate cards

```bash
# For each round: export the playlist, then generate cards
node scripts/spotify.js get-playlist https://open.spotify.com/playlist/PLAYLIST_ID --output playlists/round1.txt
node scripts/bingobaker.js create "Round 1 - Pop Divas" playlists/round1.txt

node scripts/spotify.js get-playlist https://open.spotify.com/playlist/PLAYLIST_ID --output playlists/round2.txt
node scripts/bingobaker.js create "Round 2 - Guilty Pleasures" playlists/round2.txt
```

Each PDF has 40 unique cards (10 pages x 4 per page). Print them out.

### 3. Game night

- Shuffle each Spotify playlist before playing
- Each card has a random subset of your song list, so no two are alike
- For blackout rounds (fill the whole card), use shorter song lists for faster games

## Claude Code integration

If you use [Claude Code](https://claude.ai/claude-code), this repo includes a `/bingo-night` slash command that walks you through the full flow — brainstorming rounds, curating songs, generating text files, and creating bingo cards.

## Example output

See `examples/0401-april-fools/` for sample generated bingo card PDFs from an April Fools themed event with 6 rounds and 40 cards per round.

## Tips for hosts

- **25-30 items per round** is the sweet spot for a 5x5 card with free space. Each card gets a random 24 out of your pool.
- **Energy arc matters.** Start mellow, build to peak energy, end with a fast blackout round.

## License

MIT
