import type { Control, Track } from './types';

async function fetchTrack(): Promise<Track | null> {
  try {
    const r = await fetch('/api/now-playing');
    return r.status === 200 ? ((await r.json()) as Track) : null;
  } catch {
    return null;
  }
}

let repoll: () => void = () => {};

/** Poll the bridge; call onChange with the current track (null when nothing is playing / Spotify closed). Returns a stop fn. */
export function watchTrack(onChange: (t: Track | null) => void, intervalMs = 2000): () => void {
  let stopped = false;
  const poll = async () => {
    const t = await fetchTrack();
    if (!stopped) onChange(t); // delivered every poll so the progress bar moves; consumers diff themselves
  };
  const id = setInterval(poll, intervalMs);
  repoll = poll;
  poll();
  return () => {
    stopped = true;
    clearInterval(id);
  };
}

export async function control(c: Control): Promise<void> {
  try {
    await fetch(`/api/control/${c}`, { method: 'POST' });
  } catch {
    /* bridge down: ignore */
  }
  repoll();
}

async function post(path: string): Promise<void> {
  try {
    await fetch(path, { method: 'POST' });
  } catch {
    /* bridge down: ignore */
  }
  repoll();
}

export const setVolume = (volume: number) => post(`/api/volume/${Math.round(Math.min(100, Math.max(0, volume)))}`);
export const seek = (ms: number) => post(`/api/seek/${(Math.max(0, ms) / 1000).toFixed(3)}`);
