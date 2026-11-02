import { describe, expect, it } from 'vitest';
import core from '../public/design/wanderer-core.js?raw';
import biomes from '../public/design/wanderer-biomes.js?raw';
import clawd from '../public/design/clawd.js?raw';
import fishing from '../public/design/wanderer-fishing.js?raw';
import { FISH } from './fish';

// The scene engine is a browser script that publishes window.WE; building layers needs no DOM.
const g = globalThis as any;
g.window = g;
for (const src of [core, biomes, clawd, fishing]) new Function(src)();
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

describe('fishing scene', () => {
  it('draws clawd fishing as 4 full frames in the sprite palette with the rod tip on the rod', () => {
    const a = WE.SPR.fish;
    expect(a.frames).toHaveLength(4);
    for (const fr of a.frames) {
      expect(fr).toHaveLength(a.h);
      for (const row of fr) {
        expect(row).toHaveLength(a.w);
        for (const c of row) expect(c === '.' || c in WE.PIP_C, `pixel key ${c}`).toBe(true);
      }
    }
    expect(a.tip).toHaveLength(4);
    a.tip.forEach(([x, y]: [number, number], f: number) => {
      expect(x >= 0 && x < a.w && y >= 0 && y < a.h, `tip ${f} inside the sprite`).toBe(true);
      expect(a.frames[f][y][x], `tip ${f} sits on a rod pixel`).not.toBe('.');
    });
    expect(WE.SLOTS.fish).toEqual(['head']);
  });

  it('draws every phase without leaking canvas state, and nothing when off', () => {
    const calls: string[] = [];
    const ctx = new Proxy({} as Record<string, unknown>, {
      get: (o, k: string) => (k in o ? o[k] : k === 'measureText' ? () => ({ width: 7.2 }) : () => calls.push(k)),
      set: (o, k: string, v) => ((o[k] = v), true),
    });
    const f = { x: 794, y: 577, S: 3, t: 12.3, art: ['   _/\\_', "><(o.o.o.'>"], color: '#A993D6' };
    WE.drawFishing(ctx, { ...f, phase: 'off', p: 0, night: false });
    expect(calls).toEqual([]);
    for (const night of [false, true]) {
      WE.drawFishing(ctx, { ...f, phase: 'wait', p: 0, night });
      for (let p = 0; p <= 1; p += 0.05) WE.drawFishing(ctx, { ...f, phase: 'catch', p, night });
    }
    expect(calls.filter((c) => c === 'save').length).toBe(calls.filter((c) => c === 'restore').length);
    expect(calls).toContain('fillText');
  });

  it('keeps the hat in front of a big fish as it lands behind clawd', () => {
    type Box = { x: number; y: number; w: number; h: number };
    const inside = (b: Box, px: number, py: number) => px >= b.x && px < b.x + b.w && py >= b.y && py < b.y + b.h;
    // a tiny painter with rect paths and clips that reports what ends up on top of each sample point
    const painter = (pts: [number, number][]) => {
      const top = pts.map(() => 'scene'), saved: Box[][][] = [];
      let path: Box[] = [], clips: Box[][] = [];
      const shown = (px: number, py: number) => clips.every((c) => c.filter((b) => inside(b, px, py)).length % 2 === 1);
      const paint = (b: Box, what: string) => pts.forEach(([px, py], i) => { if (inside(b, px, py) && shown(px, py)) top[i] = what; });
      const o: Record<string, unknown> = {
        measureText: () => ({ width: 7.2 }),
        save: () => saved.push(clips.slice()),
        restore: () => { clips = saved.pop()!; },
        beginPath: () => { path = []; },
        rect: (x: number, y: number, w: number, h: number) => path.push({ x, y, w, h }),
        clip: (rule: string) => { expect(rule).toBe('evenodd'); clips.push(path); },
        fillRect: (x: number, y: number, w: number, h: number) => paint({ x, y, w, h }, String(o.fillStyle)),
        // fish art rows are the multi glyph texts and each glyph is one cell wide
        fillText: (s: string, x: number, y: number) => s.length > 1 && [...s].forEach((ch, k) => ch !== ' ' && paint({ x: x + k * 7.2, y, w: 7.2, h: WE.LH }, 'fish')),
      };
      return { top, ctx: new Proxy(o, { get: (t, k: string) => (k in t ? t[k] : () => {}), set: (t, k: string, v) => ((t[k] = v), true) }) };
    };
    const x = 794, y = 577, seen = { before: 0, after: 0 };
    for (const fish of FISH.filter((f) => ['koi', 'paddlefish', 'ember-eel'].includes(f.id)))
      for (const hat of ['straw', 'beanie'])
        for (let fr = 0; fr < 4; fr++)
          for (let p = 0.8; p < 0.96; p += 0.01) {
            const cells: [number, number][] = []; // centres of the hat pixels renderFrame drew
            WE.drawProps({ fillRect: (i: number, j: number, w: number, h: number) => cells.push([i + w / 2, j + h / 2]) }, 'fish', fr, x, y, 3, [hat], false);
            const f = { x, y, S: 3, t: (fr + 0.5) / WE.SPR.fish.fps, night: false, phase: 'catch', p, art: fish.art, color: '#A993D6' };
            const before = painter(cells), after = painter(cells);
            WE.drawFishing(before.ctx, f);
            WE.drawFishing(after.ctx, { ...f, props: [hat] });
            seen.before += before.top.filter((c) => c === 'fish').length;
            seen.after += after.top.filter((c) => c === 'fish').length;
          }
    expect(seen.before, 'without props the fish lands on the hat').toBeGreaterThan(0);
    expect(seen.after, 'hat cells left showing the fish').toBe(0);
  });
});
