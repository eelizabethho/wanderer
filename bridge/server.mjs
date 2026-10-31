// Local bridge: reads/controls the Spotify Mac app via AppleScript. No deps, localhost only.
import http from 'node:http';
import { execFile } from 'node:child_process';

const PORT = Number(process.env.BRIDGE_PORT) || 5174;
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
  // Deliberately unguarded: opening Spotify is the point, launching it if closed.
  open: 'tell application "Spotify" to activate',
};

// The ONLY values ever interpolated into a script, each validated by an exact regex first.
const scriptVolume = (n) => guard(`tell application "Spotify" to set sound volume to ${n}`);
const scriptSeek = (n) => guard(`tell application "Spotify" to set player position to ${n}`);

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
    const v = req.method === 'POST' && /^\/api\/(volume|seek)\/([^/]*)$/.exec(req.url ?? '');
    if (v) {
      let arg;
      try { arg = decodeURIComponent(v[2]); } catch { return send(400); }
      let script = null;
      if (v[1] === 'volume' && /^\d{1,3}$/.test(arg) && Number(arg) <= 100) script = scriptVolume(Number(arg));
      else if (v[1] === 'seek' && /^\d{1,9}(\.\d{1,3})?$/.test(arg)) script = scriptSeek(Number(arg));
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
