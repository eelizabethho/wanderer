import { describe, expect, it } from 'vitest';
import { ORDER, clockHours, nextBiome, transitionFor, type Biome } from './journey';

describe('journey', () => {
  it('visits every biome once and loops', () => {
    let b: Biome = ORDER[0];
    const seen: Biome[] = [b];
    for (let i = 1; i < ORDER.length; i++) seen.push((b = nextBiome(b)));
    expect(seen).toEqual([...ORDER]);
    expect(nextBiome(b)).toBe(ORDER[0]);
  });

  it('dives into the sea and rises out of it', () => {
    expect(transitionFor('lake', 'sea')).toEqual({ mode: 'v', dir: 1 });
    expect(transitionFor('sea', 'peaks')).toEqual({ mode: 'v', dir: -1 });
    expect(transitionFor('forest', 'hills').mode).toBe('h');
  });

  it('reads the clock as fractional hours', () => {
    expect(clockHours(new Date(2026, 0, 1, 18, 30, 0))).toBe(18.5);
  });
});
