import { describe, expect, it } from 'vitest';
import { fbm, noise1D } from './noise';

describe('noise', () => {
  it('is deterministic per seed', () => {
    expect(noise1D(7, 3.3)).toBe(noise1D(7, 3.3));
    expect(noise1D(7, 3.3)).not.toBe(noise1D(8, 3.3));
  });

  it('stays in [0, 1] and is continuous', () => {
    for (let x = -50; x < 50; x += 0.013) {
      const v = fbm(1, x);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(Math.abs(noise1D(1, x + 0.001) - noise1D(1, x))).toBeLessThan(0.01);
    }
  });
});
