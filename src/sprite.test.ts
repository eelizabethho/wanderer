import { describe, expect, it } from 'vitest';
import { FRAMES, SPRITE_COLORS, SPRITE_H, SPRITE_W } from './sprite';

describe('sprite frames', () => {
  for (const [pose, frames] of Object.entries(FRAMES)) {
    it(`${pose}: >=2 frames, uniform size, known colors`, () => {
      expect(frames.length).toBeGreaterThanOrEqual(2);
      for (const f of frames) {
        expect(f.length).toBe(SPRITE_H);
        for (const row of f) {
          expect(row.length).toBe(SPRITE_W);
          for (const ch of row) if (ch !== '.') expect(SPRITE_COLORS[ch]).toBeDefined();
        }
      }
    });
  }
});
