// Shared contract. Every module builds against these types; change them only in the coordinator.

/** A character grid. Row 0 is the top, col 0 the left. Out-of-range set() calls are ignored. */
export interface Grid {
  readonly cols: number;
  readonly rows: number;
  set(col: number, row: number, ch: string, color: string): void;
  get(col: number, row: number): { ch: string; color: string } | undefined;
  clear(): void;
}

/** Owns the canvas. Paints grids as monospace text; several grids can be layered with alpha for crossfades. */
export interface Renderer {
  readonly ctx: CanvasRenderingContext2D;
  readonly cols: number;
  readonly rows: number;
  /** Size of one character cell in CSS pixels. */
  readonly cellW: number;
  readonly cellH: number;
  /** Recompute cols/rows from the canvas size (call on window resize). Grids made before resize are stale. */
  resize(): void;
  newGrid(): Grid;
  /** Fill the whole canvas with a background color. */
  fill(bg: string): void;
  /** Draw a grid's characters with the given opacity (0..1). Blank cells are skipped. */
  paint(grid: Grid, alpha: number): void;
}

export interface Palette {
  bg: string;
  /** Text colors from farthest/dimmest to nearest/brightest. At least 4 entries. */
  ink: string[];
  /** One highlight color for small details (stars, sun glints, flowers). */
  accent: string;
}

/** One parallax layer. scrollX is world distance travelled in columns; a layer moves at scrollX * speed. */
export interface Layer {
  speed: number;
  draw(grid: Grid, scrollX: number, t: number, palette: Palette): void;
}

export type Pose = 'walk' | 'paddle' | 'pedal';

export interface Mode {
  name: string;
  pose: Pose;
  palettes: { day: Palette; night: Palette };
  /** Drawn in order, back to front. */
  layers: Layer[];
  /**
   * Grid row the character's feet (or boat / wheels) rest on at column `col`, given the same scrollX
   * the layers received. Lets the character sit on the terrain instead of floating.
   */
  groundRow(grid: Grid, scrollX: number, col: number, t: number): number;
}

/** Pixel art: each frame is a list of equal-length rows; each char is a key into SPRITE_COLORS, '.' = transparent. */
export type SpriteFrames = Record<Pose, string[][]>;

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

