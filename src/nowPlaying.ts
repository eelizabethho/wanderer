import type { Track } from './types';
import './nowPlaying.css';

const HIDE_PAUSED_MS = 10_000;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, parent?: HTMLElement) {
  const e = document.createElement(tag);
  e.className = cls;
  parent?.append(e);
  return e;
}

/** Render the corner card inside root; returns an update fn. */
export function mountNowPlaying(root: HTMLElement): (t: Track | null) => void {
  const card = el('div', 'np-card', root);
  el('span', 'np-note', card).textContent = '♫';
  const art = el('img', 'np-art', card);
  art.alt = '';
  const text = el('div', 'np-text', card);
  const title = el('div', 'np-title', text);
  const artist = el('div', 'np-artist', text);
  const fill = el('div', 'np-fill', el('div', 'np-bar', card));

  let pausedSince: number | null = null;

  return (t) => {
    if (!t) { pausedSince = null; card.classList.remove('np-on'); return; }
    if (t.isPlaying) pausedSince = null;
    else pausedSince ??= Date.now();
    card.classList.toggle('np-on', Date.now() - (pausedSince ?? Date.now()) < HIDE_PAUSED_MS);

    title.textContent = t.title;
    artist.textContent = t.artist;
    if (t.artUrl) { if (art.src !== t.artUrl) art.src = t.artUrl; art.hidden = false; } else art.hidden = true;
    fill.style.width = `${t.durationMs > 0 ? Math.min(100, (t.progressMs / t.durationMs) * 100) : 0}%`;
  };
}
