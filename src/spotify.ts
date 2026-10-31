import type { Control, Track } from './types';

// STUB: Spotify agent replaces this file.
/** Poll the bridge; call onChange with the current track (null when nothing is playing / Spotify closed). Returns a stop fn. */
export function watchTrack(_onChange: (t: Track | null) => void, _intervalMs = 2000): () => void {
  return () => {};
}
export async function control(_c: Control): Promise<void> {}
