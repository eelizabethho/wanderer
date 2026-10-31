import { noise1D } from '../noise';
import type { Layer, Mode } from '../types';
import { clouds, h2, offset, pal, ridge, ridgeTop, trees, type RidgeOpts } from './shared';

const WATER = 0.64;
const waterRow = (rows: number, t: number) => Math.round(rows * WATER + Math.sin(t * 0.4) * 0.6);

const peaks: RidgeOpts = { speed: 0.1, seed: 131, scale: 0.02, base: 0.6, amp: 0.38, bottom: 0.6, chars: '/\\^', ink: 0, d0: 0.4, d1: 0.1, ridged: true };
const foothills: RidgeOpts = { speed: 0.2, seed: 132, scale: 0.045, base: 0.6, amp: 0.15, bottom: 0.6, chars: '/\\', ink: 1, d0: 0.25, d1: 0.06, ridged: true, octaves: 3 };
const shore = { speed: 0.3, seed: 133, scale: 0.1, base: 0.62, amp: 0.01, prob: 0.3, hMin: 0.05, hMax: 0.1, ink: 2, fill: '', d0: 0, d1: 0 };

/** Water surface, faint wobbling reflections of the far shore, and slow ripples. */
const water: Layer = {
  speed: 1,
  draw(g, sx, t, p) {
    const rows = g.rows, S = waterRow(rows, t) + 1, off = offset(sx, 1);
    const offP = offset(sx, peaks.speed), offT = offset(sx, shore.speed);
    const refl = Math.max(3, Math.round(rows * 0.17)), treeH = Math.max(3, Math.round(rows * 0.075));
    for (let col = 0; col < g.cols; col++) {
      const w = col + off, v0 = noise1D(139, (w - t * 0.3) * 0.25);
      g.set(col, S, v0 > 0.6 ? '~' : v0 < 0.3 ? '_' : '-', p.ink[3]!);
      for (let r = S + 1; r < rows; r++) {
        const d = r - S, f = d / (rows - S);
        let ch = ' ', color = p.ink[2]!;
        if (d <= refl) {
          const sh = Math.round(Math.sin(d * 1.3 + t * 0.7 + col * 0.08) * 1.3);
          const tree = d <= treeH * (0.4 + 0.6 * noise1D(133, (col + offT + sh) * 0.7));
          const mount = S - d >= ridgeTop(peaks, col + offP + sh, rows);
          if ((tree || mount) && h2(134, w, r) < 0.6 * (1 - d / (refl + 1))) {
            ch = tree ? '-' : '.';
            color = p.ink[tree ? 1 : 0]!;
          }
        }
        if (ch === ' ') {
          const v = noise1D(135 + r, (w - t * (0.5 + 0.1 * d)) * 0.17);
          const thr = 0.8 - 0.18 * f;
          if (v > thr) {
            ch = v > thr + 0.07 ? '~' : f > 0.5 ? '_' : '-';
            if (h2(136, w >> 3, r) < 0.04 && Math.sin(t * 0.8 + w) > 0.2) { ch = '.'; color = p.accent; }
          }
        }
        g.set(col, r, ch, color);
      }
    }
  },
};

export const lake: Mode = {
  name: 'lake',
  pose: 'paddle',
  palettes: {
    day: pal('#e5e3d6', ['#a3a9a6', '#889092', '#667073', '#434b4e', '#272d30'], '#c0735a'),
    night: pal('#1a1b1c', ['#454a4d', '#5b6266', '#788085', '#9ca4a9', '#c4ccd1'], '#d6cf9c'),
  },
  layers: [clouds(141, 0), ridge(peaks), ridge(foothills), trees(shore), water],
  groundRow: (g, _sx, _col, t) => waterRow(g.rows, t),
};
