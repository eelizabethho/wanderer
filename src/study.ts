// study session timer, catch schedule and saved fish journal

import { FISH, RARITY, TIERS, byId, type Fish, type Rarity } from './fish';

export interface Catch {
  id: string;
  /** studied ms when caught */
  atMs: number;
}

export interface Session {
  /** wall ms */
  startedAt: number;
  /** studied ms from finished segments */
  bankedMs: number;
  /** wall ms the running segment began, null while paused */
  segStart: number | null;
  /** wall ms of the last tick, for the sleep guard */
  lastBeat: number;
  /** studied ms when the next fish bites */
  nextBiteMs: number;
  catches: Catch[];
}

export interface Journal {
  /** fish id to times caught */
  caught: Record<string, number>;
  points: number;
  sessions: number;
}

export type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type Rand = () => number;

export const BITE_MIN_MS = 8 * 60000;
export const BITE_MAX_MS = 10 * 60000;
export const SLEEP_GAP_MS = 5 * 60000;
/** studied minutes where the odds stop sliding */
export const RAMP_MIN = 180;

const JOURNAL_KEY = 'wanderer.journal.v1';
const SESSION_KEY = 'wanderer.session.v1';

// studied ms until the next bite after a bite
const biteGap = (rand: Rand): number => BITE_MIN_MS + rand() * (BITE_MAX_MS - BITE_MIN_MS);

export const studiedMs = (s: Session, now: number, speed = 1): number =>
  s.bankedMs + (s.segStart == null ? 0 : (now - s.segStart) * speed);

export const startSession = (now: number, rand: Rand): Session => ({
  startedAt: now,
  bankedMs: 0,
  segStart: now,
  lastBeat: now,
  nextBiteMs: biteGap(rand),
  catches: [],
});

// a long gap since the last beat means the machine slept so bank only up to that beat
const guardSleep = (s: Session, now: number, speed: number): Session =>
  s.segStart != null && now - s.lastBeat > SLEEP_GAP_MS
    ? { ...s, bankedMs: s.bankedMs + (s.lastBeat - s.segStart) * speed, segStart: null }
    : s;

export const pause = (s: Session, now: number, speed = 1): Session => {
  const g = guardSleep(s, now, speed);
  return g.segStart == null ? g : { ...g, bankedMs: studiedMs(g, now, speed), segStart: null };
};

export const resume = (s: Session, now: number): Session =>
  s.segStart != null ? s : { ...s, segStart: now, lastBeat: now };

export const tierWeights = (studiedMin: number): Record<Rarity, number> => {
  const k = Math.min(1, Math.max(0, (Number.isFinite(studiedMin) ? studiedMin : 0) / RAMP_MIN));
  return Object.fromEntries(TIERS.map((t) => [t, RARITY[t].w0 + (RARITY[t].w180 - RARITY[t].w0) * k])) as Record<Rarity, number>;
};

export const rollFish = (studiedMin: number, rand: Rand, list: readonly Fish[] = FISH): Fish => {
  const w = tierWeights(studiedMin);
  const tiers = TIERS.filter((t) => list.some((f) => f.rarity === t));
  let r = rand() * tiers.reduce((a, t) => a + w[t], 0);
  const tier = tiers.find((t) => (r -= w[t]) < 0) ?? tiers[tiers.length - 1];
  const pool = list.filter((f) => f.rarity === tier);
  return pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];
};

export const tick = (s: Session, now: number, rand: Rand, speed = 1): { s: Session; caught: Fish[] } => {
  let cur = guardSleep(s, now, speed);
  if (cur.segStart != null) cur = { ...cur, lastBeat: now };
  const studied = studiedMs(cur, now, speed);
  const caught: Fish[] = [];
  const catches = [...cur.catches];
  let next = cur.nextBiteMs;
  while (studied >= next) {
    const f = rollFish(next / 60000, rand);
    caught.push(f);
    catches.push({ id: f.id, atMs: next });
    next += biteGap(rand);
  }
  return { s: { ...cur, catches, nextBiteMs: next }, caught };
};

export const points = (catches: Catch[]): number =>
  catches.reduce((a, c) => {
    const f = byId(c.id);
    return a + (f ? RARITY[f.rarity].points : 0);
  }, 0);

const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const read = (store: Store, key: string): unknown => {
  try {
    const raw = store.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
};

const write = (store: Store, key: string, v: unknown | null): void => {
  try {
    if (v == null) store.removeItem(key);
    else store.setItem(key, JSON.stringify(v));
  } catch {
    // storage full or blocked so the app keeps running unsaved
  }
};

export const loadJournal = (store: Store): Journal => {
  const j = read(store, JOURNAL_KEY) as Partial<Journal> | null;
  const c = j?.caught;
  const ok =
    j != null && typeof c === 'object' && c != null && !Array.isArray(c) &&
    Object.values(c).every((n) => num(n) && n >= 0) && num(j.points) && num(j.sessions);
  return ok ? { caught: { ...c }, points: j.points as number, sessions: j.sessions as number } : { caught: {}, points: 0, sessions: 0 };
};

export const saveJournal = (store: Store, j: Journal): void => write(store, JOURNAL_KEY, j);

export const addCatch = (j: Journal, fish: Fish): Journal => ({
  ...j,
  caught: { ...j.caught, [fish.id]: (j.caught[fish.id] ?? 0) + 1 },
  points: j.points + RARITY[fish.rarity].points,
});

export const loadSession = (store: Store): Session | null => {
  const s = read(store, SESSION_KEY) as Partial<Session> | null;
  const ok =
    s != null && typeof s === 'object' && num(s.startedAt) && num(s.bankedMs) && (s.segStart === null || num(s.segStart)) &&
    num(s.lastBeat) && num(s.nextBiteMs) && Array.isArray(s.catches) &&
    s.catches.every((c) => c != null && typeof c.id === 'string' && num(c.atMs));
  return ok ? (s as Session) : null;
};

export const saveSession = (store: Store, s: Session | null): void => write(store, SESSION_KEY, s);
