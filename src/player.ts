import './player.css';
import { control, seek, setVolume } from './spotify';
import type { Control, Track } from './types';

const I = (body: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
const ICONS = {
  shuffle: I('<path d="M3 7h3.5c5 0 6 10 11 10H21M3 17h3.5c1.7 0 3-.9 4-2.2M13.5 9.2C14.5 7.9 15.8 7 17.5 7H21"/><path d="M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5"/>'),
  prev: I('<path class="pl-solid" d="M18 5.5v13L8.5 12z"/><path d="M5.5 5v14"/>'),
  next: I('<path class="pl-solid" d="M6 5.5v13l9.5-6.5z"/><path d="M18.5 5v14"/>'),
  play: I('<path class="pl-solid" d="M7 4.5v15l12.5-7.5z"/>'),
  pause: I('<path class="pl-solid" d="M6 4.5h4v15H6zM14 4.5h4v15h-4z"/>'),
  repeat: I('<path d="M4 11V9.5A2.5 2.5 0 0 1 6.5 7H20M20 13v1.5a2.5 2.5 0 0 1-2.5 2.5H4"/><path d="M17 4l3 3-3 3M7 14l-3 3 3 3"/>'),
  open: I('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  vol: I('<path class="pl-solid" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
};

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Render the Spotify-TV-style player inside root; returns an update fn called on every poll. */
export function mountPlayer(root: HTMLElement, opts: { onOpenSpotify: () => void }): (t: Track | null) => void {
  // Static markup only; track data goes in via textContent/attributes below.
  root.innerHTML = `
  <div class="pl pl-empty">
    <div class="pl-grad"></div>
    <div class="pl-wrap">
      <div class="pl-info">
        <img class="pl-cover" alt="" />
        <div class="pl-text">
          <div class="pl-over pl-fade">PLAYING FROM SPOTIFY</div>
          <div class="pl-title"></div>
          <div class="pl-artist"></div>
        </div>
      </div>
      <div class="pl-fade">
        <div class="pl-prog">
          <span class="pl-time pl-elapsed">0:00</span>
          <div class="pl-bar" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="pl-fill"></div><div class="pl-knob"></div></div>
          <span class="pl-time pl-total">0:00</span>
        </div>
        <div class="pl-row">
          <span></span>
          <div class="pl-pill">
            <button class="pl-toggle pl-shuffle" aria-label="Shuffle" aria-pressed="false">${ICONS.shuffle}</button>
            <button class="pl-prev" aria-label="Previous">${ICONS.prev}</button>
            <button class="pl-play" aria-label="Pause">${ICONS.pause}</button>
            <button class="pl-next" aria-label="Next">${ICONS.next}</button>
            <button class="pl-toggle pl-repeat" aria-label="Repeat" aria-pressed="false">${ICONS.repeat}</button>
          </div>
          <div class="pl-right">
            <button class="pl-lists" aria-label="Open Spotify to pick music" title="Open Spotify (O)">${ICONS.open}</button>
            <span class="pl-volicon" aria-hidden="true" style="display:grid;color:rgba(255,255,255,.85)">${ICONS.vol}</span>
            <input class="pl-vol" type="range" min="0" max="100" step="1" aria-label="Volume" />
          </div>
        </div>
      </div>
    </div>
  </div>`;
  const $ = <T extends Element>(s: string) => root.querySelector<T>(s)!;
  const el = $<HTMLElement>('.pl');
  const cover = $<HTMLImageElement>('.pl-cover');
  const title = $<HTMLElement>('.pl-title'), artist = $('.pl-artist');
  const elapsed = $('.pl-elapsed'), total = $('.pl-total');
  const bar = $<HTMLElement>('.pl-bar'), fill = $<HTMLElement>('.pl-fill'), knob = $<HTMLElement>('.pl-knob');
  const playBtn = $<HTMLButtonElement>('.pl-play');
  const shuffleBtn = $('.pl-shuffle'), repeatBtn = $('.pl-repeat');
  const vol = $<HTMLInputElement>('.pl-vol');

  const click = (sel: string, c: Control) => $(sel).addEventListener('click', () => void control(c));
  click('.pl-shuffle', 'shuffle'); click('.pl-prev', 'previous'); click('.pl-play', 'playpause');
  click('.pl-next', 'next'); click('.pl-repeat', 'repeat');
  $('.pl-lists').addEventListener('click', opts.onOpenSpotify);

  // Progress: local clock anchored at the last poll/seek.
  let posMs = 0, anchor = performance.now(), duration = 0, playing = false, holdUntil = 0;
  let scrubbing = false, scrubFrac = 0, raf = 0, shownSec = -1, shownTotal = -1;

  const current = () => (playing ? Math.min(duration, posMs + performance.now() - anchor) : posMs);
  const paint = () => {
    const frac = duration ? (scrubbing ? scrubFrac : current() / duration) : 0;
    fill.style.transform = `scaleX(${frac})`;
    knob.style.left = `${frac * 100}%`;
    const sec = Math.floor((scrubbing ? scrubFrac * duration : current()) / 1000);
    if (sec !== shownSec) {
      shownSec = sec;
      elapsed.textContent = fmt(sec * 1000);
      bar.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
    }
    if (duration !== shownTotal) { shownTotal = duration; total.textContent = fmt(duration); }
  };
  const tick = () => { paint(); raf = playing && !scrubbing ? requestAnimationFrame(tick) : 0; };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const fracAt = (e: PointerEvent) => {
    const r = bar.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  bar.addEventListener('pointerdown', (e) => {
    if (!duration) return;
    scrubbing = true; scrubFrac = fracAt(e);
    bar.setPointerCapture(e.pointerId); bar.classList.add('drag'); paint();
  });
  bar.addEventListener('pointermove', (e) => { if (scrubbing) { scrubFrac = fracAt(e); paint(); } });
  const endScrub = (e: PointerEvent) => {
    if (!scrubbing) return;
    scrubbing = false; bar.classList.remove('drag');
    posMs = Math.round(fracAt(e) * duration); anchor = performance.now();
    holdUntil = anchor + 2500; // a poll in flight may still carry the old position
    void seek(posMs);
    paint(); kick();
  };
  bar.addEventListener('pointerup', endScrub);
  bar.addEventListener('pointercancel', () => { scrubbing = false; bar.classList.remove('drag'); kick(); });
  bar.tabIndex = 0;
  bar.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 5000 : e.key === 'ArrowLeft' ? -5000 : 0;
    if (!d || !duration) return;
    e.stopPropagation(); e.preventDefault(); // main.ts uses these keys for next/previous
    posMs = Math.min(duration, Math.max(0, current() + d)); anchor = performance.now();
    holdUntil = anchor + 2500;
    void seek(posMs); paint();
  });

  // Volume: ignore polled value while dragging or until the debounced write has gone out.
  let volDrag = false, volTimer = 0;
  vol.addEventListener('pointerdown', () => { volDrag = true; });
  addEventListener('pointerup', () => { volDrag = false; });
  vol.addEventListener('input', () => {
    clearTimeout(volTimer);
    volTimer = window.setTimeout(() => { volTimer = 0; void setVolume(Number(vol.value)); }, 150);
  });

  let artUrl = '';
  return (t) => {
    el.classList.toggle('pl-empty', !t);
    if (!t) { playing = false; return; }
    if (t.title !== title.textContent) { title.textContent = t.title; title.title = t.title; }
    if (t.artist !== artist.textContent) artist.textContent = t.artist;
    if (t.artUrl !== artUrl) { artUrl = t.artUrl; cover.src = t.artUrl; }
    cover.alt = t.album ? `Album cover: ${t.album}` : '';

    if (performance.now() >= holdUntil) {
      const drift = Math.abs(t.progressMs - current());
      if (drift > 1500 || t.isPlaying !== playing || t.durationMs !== duration) {
        posMs = t.progressMs; anchor = performance.now();
      }
    }
    duration = t.durationMs; playing = t.isPlaying;
    if (!playing) posMs = t.progressMs;
    paint(); if (playing) kick();

    if (playBtn.getAttribute('aria-label') !== (t.isPlaying ? 'Pause' : 'Play')) {
      playBtn.innerHTML = t.isPlaying ? ICONS.pause : ICONS.play; // static icon markup only
      playBtn.setAttribute('aria-label', t.isPlaying ? 'Pause' : 'Play');
    }
    shuffleBtn.classList.toggle('on', t.shuffling); shuffleBtn.setAttribute('aria-pressed', String(t.shuffling));
    repeatBtn.classList.toggle('on', t.repeating); repeatBtn.setAttribute('aria-pressed', String(t.repeating));
    if (!volDrag && !volTimer && Number(vol.value) !== t.volume) vol.value = String(t.volume);
  };
}
