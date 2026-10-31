import type { Mode } from '../types';
import { clouds, ground, h2, pal, ridge } from './shared';

// Fence stretches live in 64-column world slots; flowers are scattered by hash.
const floor = ground({
  seed: 81, scale: 0.02, base: 0.79, amp: 0.05, surf: '====_===', fill: "_'.,\"=", d0: 0.03, d1: 0.18, ink: 4,
  decor(g, col, w, gr, p) {
    const slot = Math.floor(w / 64), x = w - slot * 64;
    if (h2(82, slot, 0) < 0.4 && x >= 8 && x < 8 + 8 * (2 + Math.floor(h2(83, slot, 0) * 4))) {
      if (x % 4 === 0) { g.set(col, gr, '|', p.ink[3]!); g.set(col, gr - 1, '|', p.ink[3]!); }
      else g.set(col, gr - 1, '-', p.ink[1]!);
      return;
    }
    const u = h2(84, w, 0);
    if (u < 0.045) { g.set(col, gr, u < 0.02 ? '*' : 'o', p.accent); }
    else if (u < 0.1) g.set(col, gr, "'", p.ink[3]!);
  },
});

export const hills: Mode = {
  name: 'hills',
  pose: 'pedal',
  palettes: {
    day: pal('#e5e3d6', ['#ada594', '#92897a', '#6f665a', '#4c443a', '#2d2822'], '#b2553f'),
    night: pal('#1d1d1c', ['#4b4944', '#635f58', '#827d74', '#a6a196', '#cbc6ba'], '#d9a066'),
  },
  layers: [
    clouds(91, 0),
    ridge({ speed: 0.1, seed: 92, scale: 0.012, base: 0.66, amp: 0.4, bottom: 0.7, chars: ".:'", ink: 0, d0: 0.35, d1: 0.12, octaves: 2, flat: '_' }),
    ridge({ speed: 0.3, seed: 93, scale: 0.02, base: 0.73, amp: 0.3, bottom: 0.76, chars: ".,:'", ink: 1, d0: 0.4, d1: 0.12, octaves: 2, flat: '_' }),
    ridge({ speed: 0.6, seed: 94, scale: 0.03, base: 0.79, amp: 0.2, bottom: 0.82, chars: "',\"/\\", ink: 2, d0: 0.35, d1: 0.15, octaves: 2, flat: '_' }),
    floor.layer,
  ],
  groundRow: (g, sx, col) => floor.row(g, sx, col),
};
