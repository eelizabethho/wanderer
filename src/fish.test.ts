import { describe, expect, it } from 'vitest';
import { FISH, TIERS } from './fish';

describe('fish catalog', () => {
  it('has 19 species with at least 3 per tier', () => {
    expect(FISH).toHaveLength(19);
    for (const t of TIERS) expect(FISH.filter((f) => f.rarity === t).length).toBeGreaterThanOrEqual(3);
  });

  it('has unique kebab-case ids', () => {
    const ids = FISH.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it('has art that fits the box', () => {
    for (const f of FISH) {
      expect(f.art.length).toBeGreaterThanOrEqual(1);
      expect(f.art.length).toBeLessThanOrEqual(3);
      for (const row of f.art) expect(row).toMatch(/^[\x20-\x7e]{1,16}$/);
      for (const row of f.art) expect(row).not.toMatch(/ $/);
    }
  });

  it('has short facts that end with a period', () => {
    for (const f of FISH) {
      expect(f.fact.length).toBeLessThanOrEqual(90);
      expect(f.fact.endsWith('.')).toBe(true);
    }
  });
});
