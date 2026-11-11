#!/usr/bin/env node
// Fix a playlist's contents: remove wrong tracks and/or add correct ones.
//
// Usage:
//   node scripts/fix-playlist.js <playlistId> --remove <id,...> [--add <id,...>]
//   node scripts/fix-playlist.js <playlistId> --add <id,...>
//
// Removal note (Spotify Development Mode):
//   DELETE /playlists/{id}/tracks  → 403 Forbidden (blocked for dev-mode apps)
//   DELETE /playlists/{id}/items   → also unreliable ("No uris provided")
//   POST   /playlists/{id}/items   → works (add)
//   PUT    /playlists/{id}/items   → works (reorder AND full replace)
// So we delete by REPLACING the playlist with the desired set of URIs via
// PUT /items. We first try a direct DELETE /items; if it fails we fall back
// to the PUT-replace, which is what actually works. Order is not preserved,
// which is fine because bingo playlists are shuffled at play time.

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = process.env.SPOTIFY_CONFIG
  || (fs.existsSync(path.join(__dirname, '../spotify-config.json'))
    ? path.join(__dirname, '../spotify-config.json')
    : path.join(__dirname, '../../spotify-mcp-server/spotify-config.json'));

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}
async function refreshIfNeeded(config) {
  if (config.expiresAt && Date.now() < config.expiresAt - 60_000) return config;
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: config.refreshToken }),
  });
  const data = await res.json();
  config.accessToken = data.access_token;
  config.expiresAt = Date.now() + data.expires_in * 1000;
  if (data.refresh_token) config.refreshToken = data.refresh_token;
  saveConfig(config);
  return config;
}
async function api(config, endpoint, opts = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.spotify.com/v1${endpoint}`;
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${config.accessToken}`, 'Content-Type': 'application/json', ...opts.headers },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Spotify API ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// Fetch every track URI in a playlist (uses /playlists/{id}, the /tracks
// sub-endpoint is blocked in dev mode). Handles pagination.
async function getPlaylistUris(config, playlistId) {
  const uris = [];
  const data = await api(config, `/playlists/${playlistId}`);
  const collect = items => {
    for (const item of items) {
      const track = item.item || item.track;
      if (track && track.uri) uris.push(track.uri);
    }
  };
  if (data.items && data.items.items) {
    collect(data.items.items);
    let next = data.items.next;
    while (next) {
      const page = await api(config, next);
      collect(page.items);
      next = page.next;
    }
  }
  return uris;
}

// Replace the entire playlist with `uris` (max 100 per PUT; remainder appended
// via POST). This is the reliable delete mechanism for dev-mode apps.
async function replaceAll(config, playlistId, uris) {
  const first = uris.slice(0, 100);
  await api(config, `/playlists/${playlistId}/items`, {
    method: 'PUT',
    body: JSON.stringify({ uris: first }),
  });
  for (let i = 100; i < uris.length; i += 100) {
    await api(config, `/playlists/${playlistId}/items`, {
      method: 'POST',
      body: JSON.stringify({ uris: uris.slice(i, i + 100) }),
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const playlistId = args[0];
  if (!playlistId || playlistId.startsWith('--')) {
    console.error('Usage: fix-playlist.js <playlistId> [--remove id,...] [--add id,...]');
    process.exit(1);
  }
  const removeIdx = args.indexOf('--remove');
  const addIdx = args.indexOf('--add');
  const toRemove = removeIdx > -1 ? args[removeIdx + 1].split(',').map(id => `spotify:track:${id.trim()}`) : [];
  const toAdd    = addIdx    > -1 ? args[addIdx    + 1].split(',').map(id => `spotify:track:${id.trim()}`) : [];

  let config = loadConfig();
  config = await refreshIfNeeded(config);

  if (toRemove.length) {
    const removeSet = new Set(toRemove);
    const current = await getPlaylistUris(config, playlistId);
    const before = current.length;
    // Keep everything not marked for removal, then append any additions.
    const desired = current.filter(uri => !removeSet.has(uri)).concat(toAdd);
    await replaceAll(config, playlistId, desired);
    const removed = before - current.filter(uri => !removeSet.has(uri)).length;
    console.log(`Playlist replaced: ${before} → ${desired.length} tracks (removed ${removed}, added ${toAdd.length})`);
  } else if (toAdd.length) {
    await api(config, `/playlists/${playlistId}/items`, {
      method: 'POST',
      body: JSON.stringify({ uris: toAdd }),
    });
    console.log(`Added ${toAdd.length} track(s)`);
  } else {
    console.error('Nothing to do: pass --remove and/or --add');
    process.exit(1);
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
