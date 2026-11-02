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

export const FISH: readonly Fish[] = [
  {
    id: 'bluegill',
    name: 'Bluegill',
    rarity: 'common',
    art: ["><>"],
    fact: "A sunfish with a dark spot on its gill flap.",
  },
  {
    id: 'yellow-perch',
    name: 'Yellow Perch',
    rarity: 'common',
    art: ["><|||>"],
    fact: "Dark bars on a yellow-green body. It often swims in schools.",
  },
  {
    id: 'pumpkinseed',
    name: 'Pumpkinseed',
    rarity: 'common',
    art: ["><(o>"],
    fact: "A bright sunfish with a red spot on its gill flap.",
  },
  {
    id: 'creek-chub',
    name: 'Creek Chub',
    rarity: 'common',
    art: ["><==>"],
    fact: "A hardy minnow of small streams and creeks.",
  },
  {
    id: 'largemouth-bass',
    name: 'Largemouth Bass',
    rarity: 'uncommon',
    art: ["><((((o_>"],
    fact: "Its upper jaw reaches back past its eye.",
  },
  {
    id: 'rainbow-trout',
    name: 'Rainbow Trout',
    rarity: 'uncommon',
    art: ["><(~~('>"],
    fact: "Named for the pink stripe along its side.",
  },
  {
    id: 'channel-catfish',
    name: 'Channel Catfish',
    rarity: 'uncommon',
    art: ["><(((o>=="],
    fact: "Whiskers near its mouth help it taste and feel for food.",
  },
  {
    id: 'black-crappie',
    name: 'Black Crappie',
    rarity: 'uncommon',
    art: ["><(.:.:o>"],
    fact: "A speckled panfish that gathers around sunken brush.",
  },
  {
    id: 'brook-trout',
    name: 'Brook Trout',
    rarity: 'rare',
    art: ["   _/\\_", "><(o.o.o.'>"],
    fact: "Red dots ringed in blue mark this fish of cold streams.",
  },
  {
    id: 'northern-pike',
    name: 'Northern Pike',
    rarity: 'rare',
    art: ["    ,-^-,", "><((((((((:=>"],
    fact: "A long ambush hunter of weedy lakes.",
  },
  {
    id: 'walleye',
    name: 'Walleye',
    rarity: 'rare',
    art: ["   /\\/\\/\\", "><(((((@(_>"],
    fact: "Its eyes catch dim light, so it hunts well at dusk.",
  },
  {
    id: 'koi',
    name: 'Koi',
    rarity: 'rare',
    art: ["     .-.", "~><(O.o.O)>"],
    fact: "A colorful carp that can live for decades.",
  },
  {
    id: 'lake-sturgeon',
    name: 'Lake Sturgeon',
    rarity: 'epic',
    art: ["   .^.^.^.^.", "><((((((((((-->", "   `````````"],
    fact: "Can live for more than a hundred years.",
  },
  {
    id: 'golden-trout',
    name: 'Golden Trout',
    rarity: 'epic',
    art: ["    _*_*_", "><((o.o.o.o)'>", "    ~ ~ ~"],
    fact: "California's state freshwater fish, from high Sierra streams.",
  },
  {
    id: 'muskellunge',
    name: 'Muskellunge',
    rarity: 'epic',
    art: ["    ,--.__,", "><(|||||||||=-->", "    '--'"],
    fact: "A giant of the pike family. Anglers call it the fish of ten thousand casts.",
  },
  {
    id: 'paddlefish',
    name: 'Paddlefish',
    rarity: 'epic',
    art: ["     __.-.__", "><(((((((=====]>", "     '-' '-'"],
    fact: "Its long paddle snout senses faint electric signals from prey.",
  },
  {
    id: 'moon-koi',
    name: 'Moon Koi',
    rarity: 'legendary',
    art: ["  *  .  +", "~><(O.o.O)'>", "  .  +  *"],
    fact: "Only rises when the water holds the moon.",
  },
  {
    id: 'ghost-pike',
    name: 'Ghost Pike',
    rarity: 'legendary',
    art: ["  . ~ . ~ .", "><(.......=-->", "  ~ . ~ . ~"],
    fact: "Seen at dawn in the canyon mist, gone when you look twice.",
  },
  {
    id: 'ember-eel',
    name: 'Ember Eel',
    rarity: 'legendary',
    art: ["  +  .  *  +", "><~~~~~~~~~~o>", "  . * . +  ."],
    fact: "Glows like a coal in the river after the canyon walls go dark.",
  },
];

export const byId = (id: string): Fish | undefined => FISH.find((f) => f.id === id);
