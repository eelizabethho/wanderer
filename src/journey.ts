// Biome order and transition rules from the Wanderer v2 design (public/design/*).

export const ORDER = ['forest', 'hills', 'town', 'lake', 'sea', 'peaks', 'tundra', 'desert', 'canyon'] as const;
export type Biome = (typeof ORDER)[number];

// while studying the journey only visits the fishing spots
export const STUDY_ORDER: readonly Biome[] = ['lake', 'canyon'];

// a biome outside order starts it over
export const nextBiome = (b: Biome, order: readonly Biome[] = ORDER): Biome => order[(order.indexOf(b) + 1) % order.length];

/** Into or out of the sea scrolls vertically (dive down / rise up); everything else dissolves sideways. */
export function transitionFor(from: Biome, to: Biome): { mode: 'h' | 'v'; dir: 1 | -1 } {
  return { mode: to === 'sea' || from === 'sea' ? 'v' : 'h', dir: to === 'sea' ? 1 : -1 };
}

/** Local time as fractional hours, 0..24, which drives the design's day–night sky. */
export const clockHours = (d: Date): number => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
