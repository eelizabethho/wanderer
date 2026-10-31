// Local bridge: reads/controls the Spotify Mac app via AppleScript. No deps, localhost only.
import http from 'node:http';
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PORT = Number(process.env.BRIDGE_PORT) || 5174;
const ROOT = new URL('..', import.meta.url);
const SEP = '\u001f';

// Every script checks "is running" first: telling a closed Spotify anything would launch it.
const guard = (body) => `if application "Spotify" is running then
${body}
else
return ""
end if`;

const NOW_PLAYING = guard(`tell application "Spotify"
if player state is stopped then return ""
set sep to ASCII character 31
set t to current track
return (name of t) & sep & (artist of t) & sep & (album of t) & sep & (artwork url of t) & sep & (player position as string) & sep & (duration of t as string) & sep & (player state as string) & sep & (shuffling as string) & sep & (repeating as string) & sep & (sound volume as string)
end tell`);

const CONTROLS = {
  playpause: guard('tell application "Spotify" to playpause'),
  next: guard('tell application "Spotify" to next track'),
  previous: guard('tell application "Spotify" to previous track'),
  shuffle: guard('tell application "Spotify" to set shuffling to not shuffling'),
  repeat: guard('tell application "Spotify" to set repeating to not repeating'),
};

// The ONLY values ever interpolated into a script. Each is validated with an exact regex first.
const URI_RE = /^spotify:(playlist|album|track):([A-Za-z0-9]{22})$/;
const URL_RE = /^https:\/\/open\.spotify\.com\/(playlist|album|track)\/([A-Za-z0-9]{22})(?:\?[\w=&.-]*)?$/;
/** Returns a canonical spotify:<type>:<id> or null. */
function normUri(s) {
  const m = URI_RE.exec(s) ?? URL_RE.exec(s);
  return m ? `spotify:${m[1]}:${m[2]}` : null;
}
const scriptVolume = (n) => guard(`tell application "Spotify" to set sound volume to ${n}`);
const scriptSeek = (n) => guard(`tell application "Spotify" to set player position to ${n}`);
const scriptPlay = (uri) => guard(`tell application "Spotify" to play track "${uri}"`);

function osa(script) {
  return new Promise((resolve, reject) => {
    execFile('osascript', ['-e', script], { timeout: 2000 }, (err, stdout) =>
      err ? reject(err) : resolve(stdout.trim()),
    );
  });
}

// AppleScript number-to-string may use a locale decimal comma.
const num = (s) => Number(s.replace(',', '.'));

async function nowPlaying() {
  const out = await osa(NOW_PLAYING);
  if (!out) return null;
  const [title, artist, album, artUrl, pos, dur, state, shuf, rep, vol] = out.split(SEP);
  if (state === undefined) return null;
  return {
    title, artist, album, artUrl,
    progressMs: Math.round(num(pos) * 1000),
    durationMs: Math.round(num(dur)),
    isPlaying: state === 'playing',
    shuffling: shuf === 'true',
    repeating: rep === 'true',
    volume: Math.round(num(vol)),
  };
}

const oembedCache = new Map();
async function describe(uri) {
  if (oembedCache.has(uri)) return oembedCache.get(uri);
  const [, type, id] = uri.split(':');
  let p = { uri, name: uri, imageUrl: '' };
  try {
    const r = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    p = { uri, name: String(j.title ?? uri), imageUrl: String(j.thumbnail_url ?? '') };
    oembedCache.set(uri, p); // failures are not cached, so they retry next time
  } catch (e) {
    console.error(`[bridge] oembed ${uri} failed: ${e.message}`);
  }
  return p;
}

async function playlists() {
  let list;
  for (const f of ['playlists.json', 'playlists.example.json']) {
    try { list = JSON.parse(readFileSync(new URL(f, ROOT), 'utf8')); break; } catch (e) { if (e.code !== 'ENOENT') console.error(`[bridge] ${f}: ${e.message}`); }
  }
  if (!Array.isArray(list)) return [];
  const uris = [];
  for (const x of list) {
    const u = typeof x === 'string' ? normUri(x.trim()) : null;
    if (u) uris.push(u); else console.error(`[bridge] playlists: dropping invalid entry ${JSON.stringify(x)}`);
  }
  return Promise.all(uris.map(describe));
}

const server = http.createServer(async (req, res) => {
  const send = (code, body) => {
    res.writeHead(code, body ? { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } : {});
    res.end(body ? JSON.stringify(body) : undefined);
  };
  // Other websites can reach 127.0.0.1 too: refuse cross-origin requests and rebound hostnames.
  const origin = req.headers.origin;
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(req.headers.host ?? '') || (origin && !/^http:\/\/(127\.0\.0\.1|localhost):5173$/.test(origin))) {
    return send(403);
  }
  try {
    if (req.method === 'GET' && req.url === '/api/now-playing') {
      const t = await nowPlaying();
      return t ? send(200, t) : send(204);
    }
    const m = req.method === 'POST' && /^\/api\/control\/(\w+)$/.exec(req.url ?? '');
    if (m && Object.hasOwn(CONTROLS, m[1])) {
      await osa(CONTROLS[m[1]]);
      return send(204);
    }
    if (req.method === 'GET' && req.url === '/api/playlists') return send(200, await playlists());
    const v = req.method === 'POST' && /^\/api\/(volume|seek|play)\/([^/]*)$/.exec(req.url ?? '');
    if (v) {
      let arg;
      try { arg = decodeURIComponent(v[2]); } catch { return send(400); }
      let script = null;
      if (v[1] === 'volume' && /^\d{1,3}$/.test(arg) && Number(arg) <= 100) script = scriptVolume(Number(arg));
      else if (v[1] === 'seek' && /^\d{1,9}(\.\d{1,3})?$/.test(arg)) script = scriptSeek(Number(arg));
      else if (v[1] === 'play') { const u = normUri(arg); if (u) script = scriptPlay(u); }
      if (!script) return send(400);
      await osa(script);
      return send(204);
    }
    send(404);
  } catch (e) {
    console.error(`[bridge] ${req.method} ${req.url} failed: ${String(e.message).split('\n')[0]}`);
    send(502);
  }
});

server.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? `[bridge] port ${PORT} already in use; is another bridge running?` : `[bridge] ${e.message}`);
  process.exit(1);
});
server.listen(PORT, '127.0.0.1', () => console.log(`[bridge] listening on http://127.0.0.1:${PORT}`));
