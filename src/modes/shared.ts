// Shared building blocks for the scenes. Everything is a pure function of (world column, row, t):
// no Math.random at draw time, so nothing flickers and terrain is endless.
import { fbm, noise1D } from '../noise';
import type { Grid, Layer, Palette } from '../types';

/** Hash in [0,1) of a world cell. */
export function h2(seed: number, x: number, y: number): number {
  return noise1D(seed, (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) | 0);
}
export const offset = (scrollX: number, speed: number): number => Math.floor(scrollX * speed);
const pick = (s: string, u: number): string => s.charAt(Math.min(s.length - 1, Math.floor(u * s.length)));
export const pal = (bg: string, ink: string[], accent: string): Palette => ({ bg, ink, accent });

function edgeChar(a: number, b: number, c: number, flat: string): string {
  if (a > b && c > b) return '^';
  if (c < a) return '/';
  if (c > a) return '\\';
  return flat;
}

export interface RidgeOpts {
  speed: number; seed: number; scale: number;
  /** base/amp/bottom are fractions of grid.rows. Surface row = rows * (base - amp * fbm). */
  base: number; amp: number; bottom: number;
  chars: string; ink: number;
  /** Fill density at the crest and at the bottom. */
  d0: number; d1: number;
  octaves?: number;
  /** Peaky skyline (1 - |2n - 1| noise) instead of rolling hills. base is the valley row, base - amp the tallest peak. */
  ridged?: boolean;
  /** Crest character where the ridge is level (default '-'). */
  flat?: string;
}
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
function shape(o: RidgeOpts, w: number): number {
  const oct = o.octaves ?? (o.ridged ? 2 : 3);
  if (!o.ridged) return clamp01((fbm(o.seed, w * o.scale, oct) - 0.25) * 2);
  let s = 0, a = 1, n = 0;
  for (let i = 0; i < oct; i++, a /= 2) { s += a * (1 - Math.abs(2 * noise1D(o.seed + i * 101, w * o.scale * 2 ** i) - 1)); n += a; }
  return clamp01((s / n - 0.3) * 1.6);
}
export const ridgeTop = (o: RidgeOpts, w: number, rows: number): number =>
  Math.round(rows * (o.base - o.amp * shape(o, w)));

/** A filled silhouette: edge characters on the crest, sparse texture below, blanks elsewhere (occludes farther layers). */
export function ridge(o: RidgeOpts): Layer {
  return {
    speed: o.speed,
    draw(g, sx, _t, p) {
      const off = offset(sx, o.speed), color = p.ink[o.ink]!, rows = g.rows;
      const bot = Math.min(rows - 1, Math.floor(rows * o.bottom));
      let a = ridgeTop(o, off - 1, rows), b = ridgeTop(o, off, rows);
      for (let col = 0; col < g.cols; col++) {
        const w = col + off, c = ridgeTop(o, w + 1, rows);
        g.set(col, b, edgeChar(a, b, c, o.flat ?? '-'), color);
        const k = (o.d1 - o.d0) / (bot - b + 1);
        for (let r = b + 1; r <= bot; r++) {
          const d = o.d0 + k * (r - b);
          g.set(col, r, h2(o.seed + 5, w, r) < d ? pick(o.chars, h2(o.seed + 6, w, r)) : ' ', color);
        }
        a = b; b = c;
      }
    },
  };
}

export interface TreeOpts {
  speed: number; seed: number; scale: number;
  base: number; amp: number;
  /** Tree odds per world column. */
  prob: number;
  /** Tree height range as fractions of rows. */
  hMin: number; hMax: number;
  ink: number;
  /** Soil texture below the tree base (down to the bottom of the grid). */
  fill: string; d0: number; d1: number;
}

/** ASCII pines: '^' tip, '/ \' stepped sides, '|' trunk. Soil below the base occludes what is behind. */
export function trees(o: TreeOpts): Layer {
  const baseAt = (w: number, rows: number) => Math.round(rows * (o.base - o.amp * fbm(o.seed + 9, w * o.scale, 2)));
  return {
    speed: o.speed,
    draw(g, sx, _t, p) {
      const off = offset(sx, o.speed), color = p.ink[o.ink]!, rows = g.rows;
      const hMin = Math.max(3, Math.round(o.hMin * rows)), hMax = Math.max(hMin + 1, Math.round(o.hMax * rows));
      const reach = Math.ceil(hMax / 2);
      for (let col = 0; col < g.cols; col++) {
        const w = col + off, b = baseAt(w, rows);
        for (let r = b + 1; r < rows; r++) {
          const d = o.d0 + ((o.d1 - o.d0) * (r - b)) / (rows - b);
          g.set(col, r, h2(o.seed + 5, w, r) < d ? pick(o.fill, h2(o.seed + 6, w, r)) : ' ', color);
        }
        for (let k = -reach; k <= reach; k++) {
          const c = w + k;
          if (noise1D(o.seed, c) >= o.prob) continue;
          const ht = hMin + Math.floor(noise1D(o.seed + 1, c) * (hMax - hMin + 1)), ak = Math.abs(k);
          if (ak > Math.ceil((ht - 1) / 2)) continue;
          const top = baseAt(c, rows) - ht - 1;
          for (let y = Math.max(0, 2 * ak - 1); y < ht; y++) {
            const hw = Math.ceil(y / 2);
            if (ak < hw) g.set(col, top + y, ' ', color);
            else if (ak === hw) g.set(col, top + y, ak === 0 ? '^' : k > 0 ? '/' : '\\', color);
          }
          if (k === 0) for (let r = top + ht; r <= top + ht + 1; r++) g.set(col, r, '|', color);
        }
      }
    },
  };
}

export interface GroundOpts {
  seed: number; scale: number; base: number; amp: number;
  /** Characters of the visible surface line (drawn on groundRow + 1, so the creature's feet row is clear). */
  surf: string;
  /** Marks below the surface, denser toward the bottom. */
  fill: string; d0: number; d1: number;
  ink: number;
  /** Optional per-column extras drawn on and above groundRow (grass, fences, flowers, rocks). */
  decor?: (g: Grid, col: number, w: number, gr: number, p: Palette, t: number) => void;
}

/** The nearest layer (speed 1). `row` doubles as the mode's groundRow. */
export function ground(o: GroundOpts): { layer: Layer; row: (g: Grid, sx: number, col: number) => number } {
  const rowAt = (w: number, rows: number) =>
    Math.min(rows - 2, Math.max(Math.ceil(rows / 2), Math.round(rows * (o.base + o.amp * (fbm(o.seed, w * o.scale, 2) - 0.5)))));
  return {
    row: (g, sx, col) => rowAt(col + offset(sx, 1), g.rows),
    layer: {
      speed: 1,
      draw(g, sx, t, p) {
        const off = offset(sx, 1), color = p.ink[o.ink]!, rows = g.rows;
        let a = rowAt(off - 1, rows), b = rowAt(off, rows);
        for (let col = 0; col < g.cols; col++) {
          const w = col + off, c = rowAt(w + 1, rows);
          const ch = c < a ? '/' : c > a ? '\\' : pick(o.surf, h2(o.seed + 3, w, 0));
          g.set(col, b + 1, ch, color);
          for (let r = b + 2; r < rows; r++) {
            const d = o.d0 + ((o.d1 - o.d0) * (r - b - 1)) / (rows - b);
            g.set(col, r, h2(o.seed + 5, w, r) < d ? pick(o.fill, h2(o.seed + 6, w, r)) : ' ', color);
          }
          o.decor?.(g, col, w, b, p, t);
          a = b; b = c;
        }
      },
    },
  };
}

/** Outline clouds of ( ) / \ - _ drifting a little with t. Placed per 56-column world slot. */
export function clouds(seed: number, ink: number, speed = 0.05): Layer {
  const S = 56;
  return {
    speed,
    draw(g, sx, t, p) {
      const off = Math.floor(sx * speed - t * 0.4), color = p.ink[ink]!;
      for (let col = 0; col < g.cols; col++) {
        const w = col + off, slot = Math.floor(w / S);
        if (noise1D(seed, slot) > 0.55) continue;
        const wd = 12 + Math.floor(noise1D(seed + 1, slot) * 10);
        const x = w - (slot * S + Math.floor(noise1D(seed + 2, slot) * (S - 24)));
        if (x < 0 || x >= wd) continue;
        const r0 = 1 + Math.floor(noise1D(seed + 3, slot) * g.rows * 0.22);
        if (x >= 3 && x <= wd - 4) { g.set(col, r0, '_', color); g.set(col, r0 + 2, '-', color); }
        if (x === 1) g.set(col, r0 + 1, '(', color);
        if (x === wd - 2) g.set(col, r0 + 1, ')', color);
        if (x === 2) g.set(col, r0 + 2, '\\', color);
        if (x === wd - 3) g.set(col, r0 + 2, '/', color);
      }
    },
  };
}
