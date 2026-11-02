import { describe, expect, it } from 'vitest';
import core from '../public/design/wanderer-core.js?raw';

// The scene engine is a browser script that publishes window.WE; building layers needs no DOM.
const g = globalThis as any;
g.window = g;
new Function(core)();
const WE = g.WE;

describe('terrain lighting', () => {
  it('inks the shadowed face of a peak by day and the moonlit face by night', () => {
    // One tent-shaped peak at x=180: a '/' face on the left (towards the light), a '\' face on the right.
    const l = WE.ridge({ seed: 1, topFn: (x: number) => 15 + Math.abs(x - 180), bottom: 57, chars: '.:/#', dens: 0.6, ci: 2, speed: 0 });
    const ink = (cells: Uint8Array, x0: number, x1: number) => {
      let n = 0;
      for (let y = 30; y < 50; y++) for (let x = x0; x < x1; x++) if (cells[y * WE.P + x]) n++;
      return n;
    };
    expect(ink(l.ch, 190, 210)).toBeGreaterThan(ink(l.ch, 150, 170) * 1.5);
    expect(ink(l.cn, 150, 170)).toBeGreaterThan(ink(l.cn, 190, 210) * 1.5);
  });
});
