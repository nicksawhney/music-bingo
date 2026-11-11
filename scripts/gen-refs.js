#!/usr/bin/env node
// Generate card-item .txt and _spotify_ref.txt files from built playlists.
//
// For title rounds the card item is the cleaned track name (Spotify's raw
// names carry "- 2015 Remaster" / "(feat. X)" / "- From \"Grease\"" suffixes
// that look terrible on a bingo card). For artist rounds the card item is the
// artist name straight from the round's .txt file.
//
// Usage: node scripts/gen-refs.js

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../spotify-config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

// Strip version/feature cruft, but keep meaningful parentheses like
// "Leave (Get Out)" or "(I've Had) The Time Of My Life".
function cleanTitle(name) {
  return name
    .replace(/\s*-\s.*$/, '')
    .replace(/\s*\((feat\.|featuring|with|From|from)[^)]*\)/gi, '')
    .replace(/\s*\(Theme from[^)]*\)/gi, '')
    .trim();
}

async function tracksOf(playlistId) {
  const headers = { Authorization: `Bearer ${config.accessToken}` };
  const d = await (await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, { headers })).json();
  let items = (d.items && d.items.items) || [];
  let next = d.items && d.items.next;
  while (next) {
    const p = await (await fetch(next, { headers })).json();
    items = items.concat(p.items);
    next = p.next;
  }
  return items
    .map(it => it.item || it.track)
    .filter(Boolean)
    .map(t => ({ name: t.name, artists: t.artists.map(a => a.name).join(', ') }));
}

// Each event gets a rounds.json manifest next to its .txt files:
//   { "rounds": [ { "file": "...", "id": "...", "format": "artists|titles" } ],
//     "acceptedDupes": ["jolene — dolly parton"] }
// acceptedDupes whitelists a recording that is deliberately played twice in one
// night (8/26 ran "Jolene" in both the Dolly memorial and Famous Intros).
const EVENT = process.argv[2];
if (!EVENT) {
  console.error('Usage: node scripts/gen-refs.js <event-date>   e.g. 0902');
  process.exit(1);
}
const EVENT_DIR = path.join(__dirname, '../playlists', EVENT);
const manifest = JSON.parse(fs.readFileSync(path.join(EVENT_DIR, 'rounds.json'), 'utf8'));
const ROUNDS = manifest.rounds;
const ACCEPTED_DUPES = new Set(manifest.acceptedDupes || []);

// Accent- and punctuation-insensitive, so "Celine Dion" matches "Céline Dion"
// and "Toto" matches "TOTO".
function norm(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Artist rounds: pair each card item to the track that artist actually performs.
// Index pairing is WRONG here — build-artist-round appends search-matched tracks
// after the reference-matched ones, so playlist order != .txt order.
function pairByArtist(cardItems, tracks) {
  const remaining = tracks.slice();
  return cardItems.map(item => {
    const i = remaining.findIndex(t => t.artists.split(', ').some(a => norm(a) === norm(item)));
    const j = i > -1 ? i : remaining.findIndex(t => norm(t.artists).includes(norm(item)));
    if (j === -1) return null;
    return remaining.splice(j, 1)[0];
  });
}

(async () => {
  const allSongs = [];
  for (const r of ROUNDS) {
    const txtPath = path.join(EVENT_DIR, `${r.file}.txt`);
    const refPath = path.join(EVENT_DIR, `${r.file}_spotify_ref.txt`);
    const tracks = await tracksOf(r.id);

    let cardItems, paired;
    if (r.format === 'artists') {
      cardItems = fs.readFileSync(txtPath, 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
      paired = pairByArtist(cardItems, tracks);
    } else {
      // Title rounds are built in file order, so position pairing is safe.
      cardItems = tracks.map(t => cleanTitle(t.name));
      paired = tracks;
      fs.writeFileSync(txtPath, cardItems.join('\n') + '\n', 'utf8');
    }

    if (cardItems.length !== tracks.length) {
      console.error(`!! ${r.file}: ${cardItems.length} card items vs ${tracks.length} tracks — MISMATCH`);
    }
    paired.forEach((t, i) => {
      if (!t) console.error(`!! ${r.file}: no track found for card item "${cardItems[i]}"`);
    });

    const lines = cardItems.map((item, i) =>
      paired[i] ? `${item} | ${paired[i].name} — ${paired[i].artists}` : `${item} | !! UNMATCHED`);
    fs.writeFileSync(refPath, lines.join('\n') + '\n', 'utf8');
    console.log(`${r.file}: ${tracks.length} items`);

    tracks.forEach(t => allSongs.push({ round: r.file, song: `${t.name} — ${t.artists}` }));
  }

  // Night-wide duplicate check: the same recording must never play twice.
  const seen = new Map();
  let dupes = 0;
  for (const s of allSongs) {
    const key = s.song.toLowerCase();
    if (seen.has(key)) {
      if (ACCEPTED_DUPES.has(key)) {
        console.log(`   (accepted repeat: "${s.song}" — ${seen.get(key)} and ${s.round})`);
      } else {
        console.error(`\n!! DUPLICATE: "${s.song}"\n     ${seen.get(key)} and ${s.round}`);
        dupes++;
      }
    } else {
      seen.set(key, s.round);
    }
  }
  console.log(`\n${allSongs.length} songs across the night, ${dupes} duplicate(s).`);
})();
