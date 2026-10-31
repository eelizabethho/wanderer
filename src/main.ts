import { watchTrack, control } from './spotify';
import { mountPlayer } from './player';
import { ORDER, clockHours, nextBiome, transitionFor, type Biome } from './journey';

// The scene engine is the Wanderer v2 design, loaded as plain scripts from public/design/ (see index.html).
declare global {
  interface Window { WE: any }
}
const WE = window.WE;

const BIOME_MS = 6 * 60_000; // design: 6–10 min per biome
const TRANSITION_MS = 6000;
const FRAME_MS = 1000 / 15; // the design animates at ~10fps; 15 keeps motion smooth without burning a study laptop's battery
const PIXEL_SCALE = 3;
const WICK_X = 0.62; // right of the song title (design default is 0.36)
const params = new URLSearchParams(location.search);
// ?switch=song changes biome on every new song instead of on a timer.
const switchOnSong = params.get('switch') === 'song';
// ?hour=21.5 pins the time of day (handy for previewing night); otherwise the sky follows the real clock.
const pinnedHour = params.has('hour') ? Number(params.get('hour')) : null;

const canvas = document.getElementById('scene') as HTMLCanvasElement;

type Transition = { from: Biome; to: Biome; t0: number; mode: 'h' | 'v'; dir: 1 | -1; seedA: number; seedB: number };
let biome: Biome = ORDER[0];
let seed = Math.floor(Math.random() * 1000); // rerolls Wick's props each visit
let biomeStart = performance.now();
let tr: Transition | null = null;

function go(to: Biome, now: number) {
  if (tr) biome = tr.to;
  if (to === biome) return;
  tr = { from: biome, to, t0: now, ...transitionFor(biome, to), seedA: seed, seedB: seed + 1 };
  seed++;
  biomeStart = now;
}

// Draw at the design's 1280×800 and let CSS cover the window; scale the backing store so text stays crisp.
const dpr = () => Math.min(3, (devicePixelRatio || 1) * Math.max(innerWidth / WE.W, innerHeight / WE.H));

let engine: any;
let lastFrame = 0;
function frame(now: number) {
  requestAnimationFrame(frame);
  if (now - lastFrame < FRAME_MS) return;
  lastFrame = now;
  if (!switchOnSong && !tr && now - biomeStart > BIOME_MS) go(nextBiome(biome), now);

  let p = 0;
  if (tr) {
    p = (now - tr.t0) / TRANSITION_MS;
    if (p >= 1) {
      biome = tr.to;
      tr = null;
    }
  }
  const st = tr
    ? { a: tr.from, b: tr.to, mode: tr.mode, dir: tr.dir, p: WE.ease(p), seed: tr.seedA, seedB: tr.seedB }
    : { a: biome, seed };
  WE.renderFrame(canvas, { ...st, tod: pinnedHour ?? clockHours(new Date()), t: now / 1000, S: PIXEL_SCALE, card: false, pipX: WICK_X }, engine, dpr());
}

addEventListener('keydown', (e) => {
  // Focused buttons/sliders own Space and arrows; other shortcuts (M, F, O) still apply.
  if ([' ', 'ArrowLeft', 'ArrowRight'].includes(e.key) && (e.target as Element).closest?.('input, button')) return;
  if (e.key === 'm' || e.key === 'M') go(nextBiome(tr ? tr.to : biome), performance.now());
  else if (e.key === 'f' || e.key === 'F') {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  } else if (e.key === ' ') control('playpause');
  else if (e.key === 'ArrowRight') control('next');
  else if (e.key === 'ArrowLeft') control('previous');
  else if (e.key === 'o' || e.key === 'O') control('open');
  else return;
  e.preventDefault();
});

let idleTimer = 0;
addEventListener('mousemove', () => {
  document.body.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => document.body.classList.add('idle'), 5000);
});

const showTrack = mountPlayer(document.getElementById('player')!, { onOpenSpotify: () => control('open') });
let lastSong = '';
watchTrack((track) => {
  showTrack(track);
  const song = track ? `${track.title}\u0000${track.artist}` : '';
  if (switchOnSong && song && lastSong && song !== lastSong) go(nextBiome(tr ? tr.to : biome), performance.now());
  if (song) lastSong = song;
});

// The engine measures the monospace cell width once, so the font must be loaded first.
document.fonts.load(WE.FONT).catch(() => {}).finally(() => {
  engine = WE.makeEngine();
  requestAnimationFrame(frame);
});
