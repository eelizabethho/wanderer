import { describe, expect, it } from 'vitest';
import { TIERS, byId } from './fish';
import {
  addCatch, loadJournal, loadSession, pause, resume, rollFish, saveJournal, saveSession, startSession, studiedMs, tick,
  tierWeights, type Rand, type Session, type Store,
} from './study';

const mulberry32 = (a: number): Rand => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const MIN = 60000;
const fakeStore = (): Store & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};
const throwing: Store = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('quota'); },
  removeItem: () => { throw new Error('blocked'); },
};

// run ticks every stepMs from the session start up to untilMs
const run = (s: Session, rand: Rand, untilMs: number, stepMs = 60000, speed = 1) => {
  let cur = s;
  let n = 0;
  for (let t = s.startedAt + stepMs; t <= s.startedAt + untilMs; t += stepMs) {
    const r = tick(cur, t, rand, speed);
    cur = r.s;
    n += r.caught.length;
  }
  return { s: cur, n };
};

describe('odds', () => {
  it('keeps every tier above zero and climbs for legendary', () => {
    for (const t of TIERS) expect(tierWeights(0)[t]).toBeGreaterThan(0);
    expect(tierWeights(180).legendary).toBeGreaterThan(tierWeights(90).legendary);
    expect(tierWeights(90).legendary).toBeGreaterThan(tierWeights(0).legendary);
    expect(tierWeights(400)).toEqual(tierWeights(180));
    expect(tierWeights(NaN)).toEqual(tierWeights(0));
  });

  it('keeps legendary rare early and common late in full sessions', () => {
    const share = (from: number, to: number) => {
      let hit = 0;
      let all = 0;
      for (let seed = 0; seed < 500; seed++) {
        const rand = mulberry32(seed);
        for (const c of run(startSession(0, rand), rand, 180 * MIN).s.catches) {
          if (c.atMs < from * MIN || c.atMs >= to * MIN) continue;
          all++;
          if (byId(c.id)?.rarity === 'legendary') hit++;
        }
      }
      return hit / all;
    };
    expect(share(0, 30)).toBeLessThan(0.02);
    expect(share(120, 181)).toBeGreaterThan(0.04);
  });

  it('lands near the table over 20k rolls', () => {
    const share = (min: number) => {
      const rand = mulberry32(7);
      const n: Record<string, number> = {};
      for (let i = 0; i < 20000; i++) {
        const r = rollFish(min, rand).rarity;
        n[r] = (n[r] ?? 0) + 1;
      }
      return (t: string) => ((n[t] ?? 0) / 20000) * 100;
    };
    const at0 = share(0);
    expect(at0('common')).toBeGreaterThan(67);
    expect(at0('common')).toBeLessThan(73);
    expect(at0('legendary')).toBeGreaterThan(0.05);
    expect(at0('legendary')).toBeLessThan(0.5);
    const at180 = share(180);
    expect(at180('legendary')).toBeGreaterThan(6);
    expect(at180('legendary')).toBeLessThan(8);
    expect(at180('common')).toBeGreaterThan(25);
    expect(at180('common')).toBeLessThan(31);
  });
});

describe('session', () => {
  it('pause stops time and bites', () => {
    const rand = mulberry32(1);
    const a = run(startSession(0, rand), rand, 5 * MIN);
    const p = pause(a.s, 5 * MIN);
    const r = tick(p, 35 * MIN, rand);
    expect(studiedMs(r.s, 35 * MIN)).toBe(5 * MIN);
    expect(r.caught).toEqual([]);
  });

  it('catches up after a hidden tab', () => {
    const rand = mulberry32(2);
    const beats = run(startSession(0, rand), rand, 25 * MIN);
    expect(beats.n).toBeGreaterThanOrEqual(2);
    expect(beats.n).toBeLessThanOrEqual(3);
    const rand2 = mulberry32(2);
    const s = run(startSession(0, rand2), rand2, 24 * MIN).s;
    const last = tick(s, 25 * MIN, rand2);
    expect(s.catches.length + last.caught.length).toBeGreaterThanOrEqual(2);
    expect(s.catches.length + last.caught.length).toBeLessThanOrEqual(3);
  });

  it('auto pauses at the last beat after a sleep and catches nothing', () => {
    const rand = mulberry32(3);
    const a = run(startSession(0, rand), rand, 2 * MIN);
    const r = tick(a.s, 12 * MIN, rand);
    expect(r.s.segStart).toBeNull();
    expect(studiedMs(r.s, 12 * MIN)).toBe(2 * MIN);
    expect(r.caught).toEqual([]);
  });

  it('pause after a sleep banks only the time up to the last beat', () => {
    const rand = mulberry32(3);
    const a = run(startSession(0, rand), rand, 2 * MIN);
    const p = pause(a.s, 12 * MIN);
    expect(p.segStart).toBeNull();
    expect(studiedMs(p, 12 * MIN)).toBe(2 * MIN);
  });

  it('keeps counting after a long pause and resume', () => {
    const rand = mulberry32(8);
    const a = run(startSession(0, rand), rand, 5 * MIN);
    const r = resume(pause(a.s, 5 * MIN), 15 * MIN);
    const t = tick(r, 16 * MIN, rand);
    expect(t.s.segStart).not.toBeNull();
    expect(studiedMs(t.s, 16 * MIN)).toBe(6 * MIN);
  });

  it('pause banks studied time at the given speed', () => {
    const rand = mulberry32(9);
    const p = pause(startSession(0, rand), 70000, 120);
    expect(studiedMs(p, 70000, 120)).toBe(140 * MIN);
  });

  it('spaces every bite 8 to 10 studied minutes apart', () => {
    for (let seed = 0; seed < 200; seed++) {
      const rand = mulberry32(seed);
      const times = [0, ...run(startSession(0, rand), rand, 25 * MIN).s.catches.map((c) => c.atMs)];
      for (let i = 1; i < times.length; i++) {
        expect(times[i] - times[i - 1]).toBeGreaterThanOrEqual(8 * MIN);
        expect(times[i] - times[i - 1]).toBeLessThanOrEqual(10 * MIN);
      }
    }
  });

  it('scales study time by speed', () => {
    const rand = mulberry32(4);
    const r = tick(startSession(0, rand), 5000, rand, 120);
    expect(studiedMs(r.s, 5000, 120)).toBe(10 * MIN);
  });
});

describe('storage', () => {
  it('loads an empty journal from bad storage', () => {
    const empty = { caught: {}, points: 0, sessions: 0 };
    const bad = fakeStore();
    bad.setItem('wanderer.journal.v1', '{nope');
    expect(loadJournal(bad)).toEqual(empty);
    bad.setItem('wanderer.journal.v1', JSON.stringify({ caught: { a: -1 }, points: 1, sessions: 1 }));
    expect(loadJournal(bad)).toEqual(empty);
    bad.setItem('wanderer.journal.v1', JSON.stringify({ caught: [], points: 'x' }));
    expect(loadJournal(bad)).toEqual(empty);
    const good = startSession(0, mulberry32(1));
    const wrong = [
      { ...good, bankedMs: undefined },
      { ...good, startedAt: '5' },
      { ...good, catches: {} },
      { ...good, catches: [{ id: 7, atMs: 1 }] },
    ];
    for (const w of wrong) {
      bad.setItem('wanderer.session.v1', JSON.stringify(w));
      expect(loadSession(bad)).toBeNull();
    }
    expect(loadJournal(throwing)).toEqual(empty);
    expect(loadSession(throwing)).toBeNull();
    expect(() => saveJournal(throwing, empty)).not.toThrow();
    expect(() => saveSession(throwing, null)).not.toThrow();
  });

  it('round trips journal and session', () => {
    const store = fakeStore();
    const fish = rollFish(0, mulberry32(5));
    const j = addCatch(addCatch({ caught: {}, points: 0, sessions: 1 }, fish), fish);
    expect(j.caught[fish.id]).toBe(2);
    saveJournal(store, j);
    expect(loadJournal(store)).toEqual(j);
    const s = startSession(1000, mulberry32(6));
    saveSession(store, s);
    expect(loadSession(store)).toEqual(s);
    saveSession(store, null);
    expect(loadSession(store)).toBeNull();
  });
});
