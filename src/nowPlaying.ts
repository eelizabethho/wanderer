import type { Track } from './types';
import './nowPlaying.css';

const HIDE_PAUSED_MS = 10_000;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, parent?: HTMLElement) {
  const e = document.createElement(tag);
  e.className = cls;
  parent?.append(e);
  return e;
}

/**
 * Corner card showing the current song. The whole card is a button that brings the Spotify app forward;
 * with nothing playing (or paused 10s+) it shrinks to just "Open Spotify". Returns an update fn.
 */
export function mountNowPlaying(root: HTMLElement, onOpen: () => void): (t: Track | null) => void {
  const card = el('button', 'np-card np-empty', root);
  card.type = 'button';
  card.title = 'Open Spotify (O)';
  card.addEventListener('click', onOpen);
  el('span', 'np-note', card).textContent = '♫';
  const art = el('img', 'np-art', card);
  art.alt = '';
  const text = el('div', 'np-text', card);
  const title = el('div', 'np-title', text);
  const artist = el('div', 'np-artist', text);
  el('span', 'np-open', card).textContent = '↗';
  const fill = el('div', 'np-fill', el('div', 'np-bar', card));

  let pausedSince: number | null = null;

  return (t) => {
    if (t && !t.isPlaying) pausedSince ??= Date.now();
    else pausedSince = null;
    const empty = !t || Date.now() - (pausedSince ?? Date.now()) >= HIDE_PAUSED_MS;
    card.classList.toggle('np-empty', empty);
    if (!t || empty) {
      title.textContent = 'Open Spotify';
      artist.textContent = '';
      card.setAttribute('aria-label', 'Open Spotify to pick music');
      return;
    }
    title.textContent = t.title;
    artist.textContent = t.artist;
    card.setAttribute('aria-label', `Now playing ${t.title} by ${t.artist}. Open Spotify`);
    if (t.artUrl) { if (art.src !== t.artUrl) art.src = t.artUrl; art.hidden = false; } else art.hidden = true;
    fill.style.width = `${t.durationMs > 0 ? Math.min(100, (t.progressMs / t.durationMs) * 100) : 0}%`;
  };
}
