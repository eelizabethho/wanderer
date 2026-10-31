import type { Layer, Mode } from '../types';
import { ground, h2, pal, ridge, trees } from './shared';

/** Fixed-on-screen moon plus a field of slowly twinkling stars that barely drift. */
const sky: Layer = {
  speed: 0.02,
  draw(g, sx, t, p) {
    const off = Math.floor(sx * 0.02), rows = g.rows, lim = Math.floor(rows * 0.55);
    for (let col = 0; col < g.cols; col++) {
      for (let r = 0; r < lim; r++) {
        if (h2(101, col + off, r) > 0.022) continue;
        const v = Math.sin(t * 0.5 + h2(102, col + off, r) * 6.283);
        g.set(col, r, v > 0.55 ? '*' : v > -0.3 ? '+' : '.', p.accent);
      }
    }
    const cx = Math.floor(g.cols * 0.76), cy = Math.round(rows * 0.2);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        if ((dx * dx) / 4 + dy * dy > 4.6) continue;
        const s = -dx / 4 - dy / 2; // lit from the upper left
        g.set(cx + dx, cy + dy, s > 0.5 ? '@' : s > -0.4 ? '#' : '*', p.accent);
      }
    }
  },
};

const rocks = ground({
  seed: 111, scale: 0.025, base: 0.8, amp: 0.05, surf: "__.__,_", fill: "/\\'.,=", d0: 0.04, d1: 0.2, ink: 4,
  decor(g, col, w, gr, p) {
    const slot = Math.floor(w / 37), x = w - slot * 37;
    if (h2(112, slot, 0) < 0.55 && x >= 5 && x < 8) g.set(col, gr, x === 5 ? '/' : x === 7 ? '\\' : '#', p.ink[4]!);
    else if (h2(113, w, 0) < 0.05) g.set(col, gr, '.', p.ink[2]!);
  },
});

export const night: Mode = {
  name: 'night',
  pose: 'walk',
  palettes: {
    day: pal('#e5e3d6', ['#a4a8a8', '#8a9092', '#686e72', '#464b50', '#2a2e33'], '#6c7fa3'),
    night: pal('#1c1c1c', ['#4a4a4e', '#616166', '#7f7f86', '#a3a3aa', '#c8c8d0'], '#e8e4c8'),
  },
  layers: [
    sky,
    ridge({ speed: 0.1, seed: 121, scale: 0.006, base: 0.78, amp: 0.55, bottom: 0.76, chars: '/\\^', ink: 0, d0: 0.6, d1: 0.35, ridged: true, octaves: 1 }),
    ridge({ speed: 0.3, seed: 122, scale: 0.05, base: 0.78, amp: 0.2, bottom: 0.8, chars: 'X#=/\\o', ink: 2, d0: 0.6, d1: 0.2, ridged: true, octaves: 3 }),
    trees({ speed: 0.6, seed: 123, scale: 0.04, base: 0.77, amp: 0.02, prob: 0.05, hMin: 0.14, hMax: 0.24, ink: 3, fill: "/\\#=.", d0: 0.2, d1: 0.1 }),
    rocks.layer,
  ],
  groundRow: (g, sx, col) => rocks.row(g, sx, col),
};
