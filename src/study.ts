// study session timer, catch schedule and saved fish journal
// contract stub: thread A replaces every body below and keeps the signatures

import { FISH, type Fish, type Rarity } from './fish';

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

const todo = (): never => {
  throw new Error('study.ts not implemented yet');
};

export const startSession = (_now: number, _rand: Rand): Session => todo();
export const pause = (_s: Session, _now: number): Session => todo();
export const resume = (_s: Session, _now: number): Session => todo();
export const studiedMs = (_s: Session, _now: number, _speed = 1): number => todo();
export const tick = (_s: Session, _now: number, _rand: Rand, _speed = 1): { s: Session; caught: Fish[] } => todo();
export const tierWeights = (_studiedMin: number): Record<Rarity, number> => todo();
export const rollFish = (_studiedMin: number, _rand: Rand, _list: readonly Fish[] = FISH): Fish => todo();
export const points = (_catches: Catch[]): number => todo();
export const loadJournal = (_store: Store): Journal => todo();
export const saveJournal = (_store: Store, _j: Journal): void => todo();
export const addCatch = (_j: Journal, _fish: Fish): Journal => todo();
export const loadSession = (_store: Store): Session | null => todo();
export const saveSession = (_store: Store, _s: Session | null): void => todo();
