// fish species and rarity tiers for study mode

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Fish {
  id: string;
  name: string;
  rarity: Rarity;
  /** ascii art, 1 to 3 rows, 16 chars wide at most */
  art: string[];
  fact: string;
}

/** w0 and w180 are the tier's odds in percent at 0 and at 180+ studied minutes */
export const RARITY: Record<Rarity, { label: string; points: number; w0: number; w180: number; color: string }> = {
  common: { label: 'Common', points: 5, w0: 70, w180: 28, color: '#9FB08F' },
  uncommon: { label: 'Uncommon', points: 15, w0: 22, w180: 30, color: '#7FA8C9' },
  rare: { label: 'Rare', points: 40, w0: 6, w180: 22, color: '#A993D6' },
  epic: { label: 'Epic', points: 100, w0: 1.8, w180: 13, color: '#E3A062' },
  legendary: { label: 'Legendary', points: 300, w0: 0.2, w180: 7, color: '#F2CC6B' },
};

export const TIERS = Object.keys(RARITY) as Rarity[];

// placeholder list until the catalog thread fills in all 19 species
export const FISH: readonly Fish[] = [
  { id: 'bluegill', name: 'Bluegill', rarity: 'common', art: ['><>'], fact: 'A small sunfish found in lakes and ponds.' },
  { id: 'rainbow-trout', name: 'Rainbow Trout', rarity: 'uncommon', art: ["><(('>"], fact: 'Named for the pink stripe along its side.' },
  { id: 'northern-pike', name: 'Northern Pike', rarity: 'rare', art: ["><((((('>"], fact: 'A long ambush hunter of weedy lakes.' },
  { id: 'lake-sturgeon', name: 'Lake Sturgeon', rarity: 'epic', art: ["<'))))))))><"], fact: 'Can live for more than a hundred years.' },
  { id: 'moon-koi', name: 'Moon Koi', rarity: 'legendary', art: ["*><(((('>*"], fact: 'Only rises when the water holds the moon.' },
];

export const byId = (id: string): Fish | undefined => FISH.find((f) => f.id === id);
