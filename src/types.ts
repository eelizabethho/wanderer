// Shared types for the Spotify bridge and the player.

export interface Track {
  title: string;
  artist: string;
  album: string;
  artUrl: string;
  progressMs: number;
  durationMs: number;
  isPlaying: boolean;
  shuffling: boolean;
  repeating: boolean;
  /** 0..100 */
  volume: number;
}

/** shuffle / repeat toggle the current setting; open brings the Spotify app to the front. */
export type Control = 'playpause' | 'next' | 'previous' | 'shuffle' | 'repeat' | 'open';

