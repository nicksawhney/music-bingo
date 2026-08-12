#!/usr/bin/env node

/**
 * Spotify playlist builder for Music Bingo.
 *
 * Usage:
 *   node scripts/spotify.js create-playlist "Round 1 - Pop Divas"
 *   node scripts/spotify.js search "MMMBop" [--artist "Hanson"]
 *   node scripts/spotify.js build-playlist "Round 3 - Guilty Pleasures" playlists/0401_round3_guilty_pleasures.txt
 *   node scripts/spotify.js build-playlist "Round 2 - April Fools Covers" playlists/0401_round2_april_fools_covers_spotify_ref.txt --covers
 *
 * Config: reads from SPOTIFY_CONFIG env var or ../spotify-mcp-server/spotify-config.json
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = process.env.SPOTIFY_CONFIG
  || (fs.existsSync(path.join(__dirname, '../spotify-config.json'))
    ? path.join(__dirname, '../spotify-config.json')
    : path.join(__dirname, '../../spotify-mcp-server/spotify-config.json'));

// ── helpers ──────────────────────────────────────────────────────────────────

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

async function refreshIfNeeded(config, forceRefresh = false) {
  if (!forceRefresh && config.expiresAt && Date.now() < config.expiresAt - 60_000) return config;

  console.log('Refreshing access token...');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  config.accessToken = data.access_token;
  config.expiresAt = Date.now() + data.expires_in * 1000;
  if (data.refresh_token) config.refreshToken = data.refresh_token;
  saveConfig(config);
  console.log('Token refreshed.');
  return config;
}

async function api(config, endpoint, opts = {}) {
  const base = 'https://api.spotify.com/v1';
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify API ${res.status}: ${body}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function getUserId(config) {
  const me = await api(config, '/me');
  return me.id;
}

// ── commands ─────────────────────────────────────────────────────────────────

async function createPlaylist(config, name, description = '') {
  const data = await api(config, '/me/playlists', {
    method: 'POST',
    body: JSON.stringify({ name, description, public: false }),
  });
  console.log(`Created: "${data.name}"`);
  console.log(`  ID:  ${data.id}`);
  console.log(`  URL: ${data.external_urls.spotify}`);
  return data;
}

async function searchTrack(config, query, limit = 5) {
  const params = new URLSearchParams({ q: query, type: 'track', limit: String(limit) });
  const data = await api(config, `/search?${params}`);
  return data.tracks.items;
}

async function addTracks(config, playlistId, trackUris) {
  // Spotify allows max 100 tracks per request
  // Note: /playlists/{id}/items works, /playlists/{id}/tracks returns 403
  for (let i = 0; i < trackUris.length; i += 100) {
    const batch = trackUris.slice(i, i + 100);
    await api(config, `/playlists/${playlistId}/items`, {
      method: 'POST',
      body: JSON.stringify({ uris: batch }),
    });
  }
}

function parseSongList(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('BINGO') && !l.startsWith('SPOTIFY'));
}

function parseCoversFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l.includes('|'))
    .map(line => {
      const [title, rest] = line.split('|').map(s => s.trim());
      // "Jeff Buckley (original: Leonard Cohen)" -> artist = "Jeff Buckley"
      const artist = rest.replace(/^play:\s*/i, '').replace(/\s*\(original:.*\)/, '').trim();
      return { title, artist };
    });
}

async function buildPlaylist(config, playlistName, filePath, isCover = false) {
  console.log(`\nBuilding playlist: "${playlistName}" from ${filePath}\n`);

  // Create playlist
  const playlist = await createPlaylist(config, playlistName, `Music Bingo - ${playlistName}`);

  // Parse songs
  let songs;
  if (isCover) {
    songs = parseCoversFile(filePath);
  } else {
    songs = parseSongList(filePath).map(title => ({ title, artist: null }));
  }

  // Search and collect track URIs
  const trackUris = [];
  const notFound = [];

  for (const song of songs) {
    const query = song.artist ? `${song.title} artist:${song.artist}` : song.title;
    const results = await searchTrack(config, query, 3);

    if (results.length > 0) {
      const track = results[0];
      trackUris.push(track.uri);
      console.log(`  ✓ ${song.title} → "${track.name}" by ${track.artists.map(a => a.name).join(', ')}`);
    } else {
      notFound.push(song.title);
      console.log(`  ✗ ${song.title} → NOT FOUND`);
    }

    // Small delay to be gentle on the API
    await new Promise(r => setTimeout(r, 100));
  }

  // Add tracks to playlist
  if (trackUris.length > 0) {
    await addTracks(config, playlist.id, trackUris);
    console.log(`\nAdded ${trackUris.length}/${songs.length} tracks to "${playlistName}"`);
  }

  if (notFound.length > 0) {
    console.log(`\nNot found (${notFound.length}):`);
    notFound.forEach(t => console.log(`  - ${t}`));
  }

  console.log(`\nPlaylist URL: ${playlist.external_urls.spotify}`);
  return { playlist, trackUris, notFound };
}

async function getPlaylistTracks(config, playlistId) {
  // Use /playlists/{id} instead of /playlists/{id}/tracks
  // The /tracks sub-endpoint is blocked in Spotify Development Mode,
  // but the main playlist endpoint returns tracks inline.
  const tracks = [];
  const data = await api(config, `/playlists/${playlistId}`);

  if (data.items && data.items.items) {
    for (const item of data.items.items) {
      const track = item.item || item.track;
      if (track) {
        tracks.push({
          name: track.name,
          artists: track.artists.map(a => a.name),
          uri: track.uri,
        });
      }
    }

    // Handle pagination if there are more tracks
    let next = data.items.next;
    while (next) {
      const page = await api(config, next);
      for (const item of page.items) {
        const track = item.item || item.track;
        if (track) {
          tracks.push({
            name: track.name,
            artists: track.artists.map(a => a.name),
            uri: track.uri,
          });
        }
      }
      next = page.next;
    }
  }

  console.log(`Playlist: "${data.name}" (${tracks.length} tracks)`);
  return tracks;
}

function extractPlaylistId(input) {
  // Handle full URLs like https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  const urlMatch = input.match(/playlist[/:]([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  // Otherwise treat as raw ID
  return input;
}

// ── build-artist-round ────────────────────────────────────────────────────────

async function buildArtistRound(config, artistFile, options = {}) {
  const { referenceId, playlistName, prefix, overrides = new Map() } = options;

  const artists = parseSongList(artistFile);
  console.log(`\nArtist list: ${artists.length} artists from ${artistFile}`);

  // Build a map of lowercase artist name → {trackName, uri} from reference playlist
  const referenceMap = new Map();
  if (referenceId) {
    console.log(`\nLoading reference playlist...`);
    const refTracks = await getPlaylistTracks(config, referenceId);
    for (const track of refTracks) {
      for (const artist of track.artists) {
        referenceMap.set(artist.toLowerCase(), { trackName: track.name, uri: track.uri, artist });
      }
    }
    console.log(`Reference loaded: ${referenceMap.size} artist entries\n`);
  }

  // Match each artist
  const matched = [];
  const unmatched = [];

  for (const artist of artists) {
    const ref = referenceMap.get(artist.toLowerCase());
    if (ref) {
      matched.push({ artist, trackName: ref.trackName, uri: ref.uri, source: 'reference' });
    } else {
      unmatched.push(artist);
    }
  }

  // Search for unmatched artists
  const searched = [];
  for (const artist of unmatched) {
    // Check for manual override first
    const overrideId = overrides.get(artist.toLowerCase());
    if (overrideId) {
      searched.push({ artist, trackName: `[override: ${overrideId}]`, uri: `spotify:track:${overrideId}`, source: 'override' });
      continue;
    }
    const results = await searchTrack(config, `artist:${artist}`, 3);
    if (results.length > 0) {
      const top = results[0];
      searched.push({
        artist,
        trackName: top.name,
        uri: top.uri,
        source: 'search',
        alternatives: results.slice(1).map(t => `"${t.name}" (${t.id})`),
      });
    } else {
      searched.push({ artist, trackName: null, uri: null, source: 'not-found' });
    }
    await new Promise(r => setTimeout(r, 100));
  }

  // Print proposed tracklist
  const allTracks = [...matched, ...searched];
  console.log('\n── Proposed tracklist ──────────────────────────────────────────');
  for (const t of allTracks) {
    if (t.source === 'reference') {
      console.log(`  ✓ [ref]      ${t.artist.padEnd(30)} → "${t.trackName}"`);
    } else if (t.source === 'override') {
      console.log(`  ✓ [override] ${t.artist.padEnd(30)} → ${t.trackName}`);
    } else if (t.source === 'search') {
      console.log(`  ? [search] ${t.artist.padEnd(30)} → "${t.trackName}"`);
      if (t.alternatives.length) {
        t.alternatives.forEach(a => console.log(`             ${''.padEnd(30)}   alt: ${a}`));
      }
    } else {
      console.log(`  ✗ [miss]   ${t.artist.padEnd(30)} → NOT FOUND`);
    }
  }
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`\n  ${matched.length} from reference, ${searched.length} searched`);
  console.log(`  Re-run with --build "Playlist Name" --prefix "MM/DD Bingo" to create it.\n`);

  // Build if requested
  if (playlistName) {
    const fullName = prefix ? `[${prefix}] ${playlistName}` : playlistName;
    const uris = allTracks.filter(t => t.uri).map(t => t.uri);
    const playlist = await createPlaylist(config, fullName, `Music Bingo - ${fullName}`);
    await addTracks(config, playlist.id, uris);
    console.log(`\nPlaylist created: ${playlist.external_urls.spotify}`);
    console.log(`Added ${uris.length}/${allTracks.length} tracks`);
  }

  return allTracks;
}

// ── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  let config = loadConfig();
  config = await refreshIfNeeded(config);

  switch (command) {
    case 'get-playlist': {
      const input = args[1];
      if (!input) {
        console.error('Usage: get-playlist <playlist-url-or-id> [--output songs.txt] [--format titles|artists]');
        process.exit(1);
      }
      const playlistId = extractPlaylistId(input);
      const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'titles';
      const outputIdx = args.indexOf('--output');
      const outputFile = outputIdx > -1 ? args[outputIdx + 1] : null;

      const tracks = await getPlaylistTracks(config, playlistId);

      let lines;
      if (format === 'artists') {
        lines = tracks.map(t => t.artists[0]);
      } else {
        lines = tracks.map(t => t.name);
      }

      if (outputFile) {
        fs.writeFileSync(outputFile, lines.join('\n') + '\n', 'utf8');
        console.log(`Wrote ${lines.length} items to ${outputFile}`);
      } else {
        lines.forEach(l => console.log(l));
      }
      break;
    }

    case 'create-playlist': {
      const name = args[1];
      if (!name) { console.error('Usage: create-playlist "Name"'); process.exit(1); }
      await createPlaylist(config, name, args[2] || '');
      break;
    }

    case 'search': {
      const query = args[1];
      if (!query) { console.error('Usage: search "query"'); process.exit(1); }
      const artistIdx = args.indexOf('--artist');
      const fullQuery = artistIdx > -1 ? `${query} artist:${args[artistIdx + 1]}` : query;
      const results = await searchTrack(config, fullQuery);
      results.forEach((t, i) => {
        console.log(`${i + 1}. "${t.name}" by ${t.artists.map(a => a.name).join(', ')} (${t.id})`);
      });
      break;
    }

    case 'build-playlist': {
      const name = args[1];
      const file = args[2];
      const isCover = args.includes('--covers');
      const prefixIdx = args.indexOf('--prefix');
      const prefix = prefixIdx > -1 ? args[prefixIdx + 1] : null;
      if (!name || !file) {
        console.error('Usage: build-playlist "Playlist Name" path/to/songs.txt [--covers] [--prefix "04/15 Bingo"]');
        process.exit(1);
      }
      const fullName = prefix ? `[${prefix}] ${name}` : name;
      await buildPlaylist(config, fullName, file, isCover);
      break;
    }

    case 'build-artist-round': {
      const file = args[1];
      if (!file) {
        console.error('Usage: build-artist-round artists.txt [--reference <playlist-url-or-id>] [--build "Name"] [--prefix "MM/DD Bingo"]');
        process.exit(1);
      }
      const refIdx = args.indexOf('--reference');
      const referenceId = refIdx > -1 ? extractPlaylistId(args[refIdx + 1]) : null;
      const buildIdx = args.indexOf('--build');
      const playlistName = buildIdx > -1 ? args[buildIdx + 1] : null;
      const prefixIdx = args.indexOf('--prefix');
      const prefix = prefixIdx > -1 ? args[prefixIdx + 1] : null;
      // --override "Artist Name=trackId" (repeatable)
      const overrides = new Map();
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--override' && args[i + 1]) {
          const eqIdx = args[i + 1].indexOf('=');
          if (eqIdx > -1) {
            overrides.set(args[i + 1].slice(0, eqIdx).toLowerCase(), args[i + 1].slice(eqIdx + 1));
          }
        }
      }
      await buildArtistRound(config, file, { referenceId, playlistName, prefix, overrides });
      break;
    }

    default:
      console.log(`Music Bingo Spotify Tool

Commands:
  get-playlist <url-or-id> [--output file] [--format titles|artists]
      Export a playlist's tracks as a song list (for bingo cards)
  search "query" [--artist "name"]
      Search for a track
  create-playlist "Name"
      Create an empty playlist
  build-playlist "Name" songs.txt [--covers] [--prefix "04/15 Bingo"]
      Create playlist & add all tracks from file
      --prefix wraps the name, e.g. "[04/15 Bingo] Round 1 - Pop Divas"
  build-artist-round artists.txt [--reference <playlist-url-or-id>] [--build "Name"] [--prefix "MM/DD Bingo"]
      Build a playlist from an artist-name round file.
      --reference: reuse exact tracks for matching artists from an existing playlist
      --build: create the Spotify playlist (dry-run if omitted)
      --prefix: wraps the playlist name`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
