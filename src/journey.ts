// Biome order and transition rules from the Wanderer v2 design (public/design/*).

export const ORDER = ['forest', 'hills', 'town', 'lake', 'sea', 'peaks'] as const;
export type Biome = (typeof ORDER)[number];

export const nextBiome = (b: Biome): Biome => ORDER[(ORDER.indexOf(b) + 1) % ORDER.length];

/** Into or out of the sea scrolls vertically (dive down / rise up); everything else dissolves sideways. */
export function transitionFor(from: Biome, to: Biome): { mode: 'h' | 'v'; dir: 1 | -1 } {
  return { mode: to === 'sea' || from === 'sea' ? 'v' : 'h', dir: to === 'sea' ? 1 : -1 };
}

/** Local time as fractional hours, 0..24, which drives the design's day–night sky. */
export const clockHours = (d: Date): number => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
