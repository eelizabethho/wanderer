import type { Track } from './types';

// STUB: Player UI agent replaces this file.
/** Render the Spotify-TV-style player inside root; returns an update fn called on every poll. */
export function mountPlayer(_root: HTMLElement, _opts: { onOpenPlaylists: () => void }): (t: Track | null) => void {
  return () => {};
}
