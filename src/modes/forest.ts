import type { Mode } from '../types';
import { clouds, ground, h2, pal, ridge, trees } from './shared';

const floor = ground({
  seed: 61, scale: 0.03, base: 0.79, amp: 0.05, surf: '__,_.__\'_', fill: "/\\'.,=", d0: 0.04, d1: 0.22, ink: 4,
  decor(g, col, w, gr, p) {
    const u = h2(62, w, 0);
    if (u < 0.1) g.set(col, gr, u < 0.04 ? '"' : "'", p.ink[4]!);
    else if (u > 0.985) g.set(col, gr, '*', p.accent);
  },
});

export const forest: Mode = {
  name: 'forest',
  pose: 'walk',
  palettes: {
    day: pal('#e5e3d6', ['#a6aa98', '#8b9083', '#697063', '#474c43', '#2a2d27'], '#b86a4a'),
    night: pal('#1c1c1c', ['#484b48', '#5f635f', '#7d827d', '#a0a5a0', '#c6cbc6'], '#c9b87a'),
  },
  layers: [
    clouds(71, 0),
    ridge({ speed: 0.1, seed: 51, scale: 0.02, base: 0.64, amp: 0.4, bottom: 0.7, chars: '/\\^', ink: 0, d0: 0.4, d1: 0.1, ridged: true }),
    ridge({ speed: 0.2, seed: 52, scale: 0.045, base: 0.7, amp: 0.16, bottom: 0.72, chars: '/\\', ink: 1, d0: 0.25, d1: 0.08, ridged: true, octaves: 3 }),
    trees({ speed: 0.35, seed: 53, scale: 0.05, base: 0.7, amp: 0.03, prob: 0.2, hMin: 0.1, hMax: 0.17, ink: 2, fill: '.,', d0: 0.15, d1: 0.05 }),
    trees({ speed: 0.6, seed: 54, scale: 0.04, base: 0.75, amp: 0.03, prob: 0.07, hMin: 0.2, hMax: 0.34, ink: 3, fill: "/\\'.,", d0: 0.2, d1: 0.1 }),
    floor.layer,
  ],
  groundRow: (g, sx, col) => floor.row(g, sx, col),
};
