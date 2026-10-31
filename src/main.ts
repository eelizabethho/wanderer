import { createRenderer } from './ascii';
import { FRAMES, SPRITE_H, drawSprite } from './sprite';
import { MODES } from './modes';
import { watchTrack, control } from './spotify';
import { mountNowPlaying } from './nowPlaying';
import type { Grid, Mode, Palette } from './types';

const MODE_SECONDS = 240;
const FADE_SECONDS = 4;
const SCROLL_SPEED = 3; // columns per second
const ANIM_FPS = 6;
// ?switch=song changes mode on every new song instead of on a timer.
const switchOnSong = new URLSearchParams(location.search).get('switch') === 'song';

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const renderer = createRenderer(canvas);
let grids: [Grid, Grid] = [renderer.newGrid(), renderer.newGrid()];

let modeIdx = 0;
let prevIdx = -1;
let fadeStart = -Infinity;
let modeStart = 0;
let scrollX = 0;
let groundY = NaN;

function nextMode(now: number) {
  prevIdx = modeIdx;
  modeIdx = (modeIdx + 1) % MODES.length;
  fadeStart = modeStart = now;
}

function paletteFor(mode: Mode): Palette {
  const h = new Date().getHours();
  return mode.name === 'night' || h < 7 || h >= 19 ? mode.palettes.night : mode.palettes.day;
}

function drawMode(mode: Mode, grid: Grid, t: number): Palette {
  const palette = paletteFor(mode);
  grid.clear();
  for (const layer of mode.layers) layer.draw(grid, scrollX, t, palette);
  return palette;
}

function mixHex(a: string, b: string, k: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  let out = 0;
  for (const s of [16, 8, 0]) {
    const ca = (pa >> s) & 255;
    out |= Math.round(ca + (((pb >> s) & 255) - ca) * k) << s;
  }
  return '#' + out.toString(16).padStart(6, '0');
}

let last = performance.now();
function frame(nowMs: number) {
  const t = nowMs / 1000;
  const dt = Math.max(0, Math.min(0.1, (nowMs - last) / 1000)); // clamp: first rAF can predate `last`; hidden tabs shouldn't jump
  last = nowMs;
  scrollX += SCROLL_SPEED * dt;
  if (!switchOnSong && t - modeStart > MODE_SECONDS) nextMode(t);

  const k = Math.min(1, (t - fadeStart) / FADE_SECONDS);
  const mode = MODES[modeIdx];
  const palette = drawMode(mode, grids[0], t);
  if (k < 1 && prevIdx >= 0) {
    const old = drawMode(MODES[prevIdx], grids[1], t);
    renderer.fill(mixHex(old.bg, palette.bg, k));
    renderer.paint(grids[1], 1 - k);
    renderer.paint(grids[0], k);
  } else {
    renderer.fill(palette.bg);
    renderer.paint(grids[0], 1);
  }

  // Creature: standing on the current mode's ground, pose swaps halfway through a fade.
  const shown = k < 0.5 && prevIdx >= 0 ? MODES[prevIdx] : mode;
  const col = Math.floor(renderer.cols * 0.4);
  const scale = Math.max(2, Math.round((renderer.rows * renderer.cellH) / (SPRITE_H * 10)));
  const targetY = (shown.groundRow(grids[0], scrollX, col, t) + 1) * renderer.cellH - SPRITE_H * scale; // groundRow is the feet row; surface line sits below it
  groundY = Number.isNaN(groundY) ? targetY : groundY + (targetY - groundY) * Math.min(1, dt * 4);
  const frames = FRAMES[shown.pose];
  drawSprite(renderer.ctx, frames[Math.floor(t * ANIM_FPS) % frames.length], col * renderer.cellW, Math.round(groundY), scale);

  requestAnimationFrame(frame);
}

addEventListener('resize', () => {
  renderer.resize();
  grids = [renderer.newGrid(), renderer.newGrid()];
});

addEventListener('keydown', (e) => {
  // Focused buttons/sliders own Space and arrows; other shortcuts (M, F, O) still apply.
  if ([' ', 'ArrowLeft', 'ArrowRight'].includes(e.key) && (e.target as Element).closest?.('input, button')) return;
  if (e.key === 'm' || e.key === 'M') nextMode(performance.now() / 1000);
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

const showTrack = mountNowPlaying(document.getElementById('now-playing')!, () => control('open'));
let lastSong = '';
watchTrack((track) => {
  showTrack(track);
  const song = track ? `${track.title}\u0000${track.artist}` : '';
  if (switchOnSong && song && lastSong && song !== lastSong) nextMode(performance.now() / 1000);
  if (song) lastSong = song;
});

requestAnimationFrame(frame);
