import { describe, expect, it } from 'vitest';
import type { Grid } from '../types';
import { MODES } from './index';

function makeGrid(cols: number, rows: number): Grid & { cells: string[]; colors: string[] } {
  const cells = new Array<string>(cols * rows).fill(' ');
  const colors = new Array<string>(cols * rows).fill('');
  return {
    cols, rows, cells, colors,
    set(c, r, ch, color) { if (c >= 0 && c < cols && r >= 0 && r < rows) { cells[r * cols + c] = ch; colors[r * cols + c] = color; } },
    get(c, r) { const ch = cells[r * cols + c]; return ch && ch !== ' ' ? { ch, color: colors[r * cols + c]! } : undefined; },
    clear() { cells.fill(' '); },
  };
}

const render = (mi: number, cols: number, rows: number, sx: number, t: number, pal: 'day' | 'night' = 'night') => {
  const m = MODES[mi]!, g = makeGrid(cols, rows);
  for (const l of m.layers) l.draw(g, sx, t, m.palettes[pal]);
  return g;
};

describe('modes', () => {
  it('exports forest, lake, hills, night', () => {
    expect(MODES.map((m) => m.name)).toEqual(['forest', 'lake', 'hills', 'night']);
  });

  for (let mi = 0; mi < 4; mi++) {
    const m = MODES[mi]!;
    describe(m.name, () => {
      it('has valid palettes and 3+ layers', () => {
        expect(m.layers.length).toBeGreaterThanOrEqual(3);
        for (const p of [m.palettes.day, m.palettes.night]) expect(p.ink.length).toBeGreaterThanOrEqual(4);
      });

      for (const [cols, rows] of [[120, 40], [260, 80], [90, 30]] as const) {
        for (const sx of [0, 1234.5, -500, 98765]) {
          for (const pal of ['day', 'night'] as const) {
            it(`draws sensibly at ${cols}x${rows} scrollX=${sx} ${pal}`, () => {
              const g = render(mi, cols, rows, sx, 3.7, pal);
              const filled = g.cells.filter((c) => c !== ' ').length / g.cells.length;
              expect(filled).toBeGreaterThanOrEqual(0.05);
              expect(filled).toBeLessThanOrEqual(0.6);
              for (let c = 0; c < cols; c += 7) {
                const gr = m.groundRow(g, sx, c, 3.7);
                expect(gr).toBeGreaterThanOrEqual(rows / 2);
                expect(gr).toBeLessThanOrEqual(rows - 1);
              }
              expect(render(mi, cols, rows, sx, 3.7, pal).cells).toEqual(g.cells);
            });
          }
        }
      }
    });
  }
});
