import './playlists.css';
import { fetchPlaylists, playUri } from './spotify';
import type { Playlist } from './types';

const CLOSE_SVG =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Render the playlist drawer inside root (hidden until toggled). */
export function mountPlaylists(root: HTMLElement): { toggle(): void; close(): void } {
  const backdrop = el('div', 'pd-backdrop');
  const panel = el('aside', 'pd-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Playlists');
  panel.inert = true;

  const header = el('div', 'pd-header');
  const closeBtn = el('button', 'pd-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close playlists');
  closeBtn.innerHTML = CLOSE_SVG; // static markup, no playlist data
  header.append(el('h2', 'pd-title', 'Playlists'), closeBtn);

  const list = el('div', 'pd-list');
  panel.append(header, list);
  root.append(backdrop, panel);

  let isOpen = false;
  let loadId = 0;
  let returnFocus: HTMLElement | null = null;
  let closeTimer = 0;
  let shown: Playlist[] = [];

  function renderRow(p: Playlist): HTMLButtonElement {
    const row = el('button', 'pd-row');
    row.type = 'button';
    let cover: HTMLElement;
    if (p.imageUrl.startsWith('https://')) {
      const img = el('img', 'pd-cover');
      img.alt = '';
      img.loading = 'lazy';
      img.src = p.imageUrl;
      cover = img;
    } else {
      cover = el('div', 'pd-cover pd-cover-ph', '♫');
    }
    const name = el('span', 'pd-name', p.name);
    name.title = p.name;
    row.append(cover, name);
    row.addEventListener('click', () => {
      if (closeTimer) return;
      playUri(p.uri).catch(() => {});
      name.textContent = 'now starting…';
      row.classList.add('starting');
      closeTimer = window.setTimeout(close, 600);
    });
    return row;
  }

  function render(items: Playlist[]) {
    shown = items;
    if (!items.length) {
      const hint = el('p', 'pd-empty', 'No playlists yet. Paste Spotify playlist links into ');
      hint.append(el('code', '', 'playlists.json'), ' in the project folder.');
      list.replaceChildren(hint);
      return;
    }
    list.replaceChildren(...items.map(renderRow));
  }

  async function load() {
    const id = ++loadId;
    try {
      const items = await fetchPlaylists();
      if (id !== loadId) return;
      render(items);
      if (isOpen && !panel.contains(document.activeElement)) focusFirst();
    } catch {
      // keep whatever is on screen
    }
  }

  function focusFirst() {
    (list.querySelector<HTMLElement>('.pd-row') ?? closeBtn).focus();
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.inert = false;
    backdrop.classList.add('open');
    panel.classList.add('open');
    focusFirst(); // close button until the first load lands
    load();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    clearTimeout(closeTimer);
    closeTimer = 0;
    panel.inert = true;
    backdrop.classList.remove('open');
    panel.classList.remove('open');
    if (list.querySelector('.starting')) render(shown); // clear "now starting" once hidden
    returnFocus?.focus();
    returnFocus = null;
  }

  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  return { toggle: () => (isOpen ? close() : open()), close };
}
