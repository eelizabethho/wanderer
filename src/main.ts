import { watchTrack, control } from './spotify';
import { mountPlayer } from './player';
import { mountStudy } from './study-ui';
import { RARITY, TIERS, type Fish } from './fish';
import {
  RAMP_MIN, addCatch, loadJournal, loadSession, pause, resume, saveJournal, saveSession, startSession, studiedMs, tick,
  type Session, type Store,
} from './study';
import { ORDER, STUDY_ORDER, clockHours, nextBiome, transitionFor, type Biome } from './journey';

// The scene engine is the Wanderer v2 design, loaded as plain scripts from public/design/ (see index.html).
declare global {
  interface Window { WE: any }
}
const WE = window.WE;

const BIOME_MS = 6 * 60_000; // design: 6–10 min per biome
const STUDY_BIOME_MS = 20 * 60_000; // fishing spot swap while studying
const TRANSITION_MS = 6000;
const CATCH_MS = 2500; // scene catch animation
const FRAME_MS = 1000 / 15; // the design animates at ~10fps; 15 keeps motion smooth without burning a study laptop's battery
const PIXEL_SCALE = 3;
const WICK_X = 0.62; // right of the song title (design default is 0.36)
const params = new URLSearchParams(location.search);
// ?switch=song changes biome on every new song instead of on a timer.
const switchOnSong = params.get('switch') === 'song';
// ?hour=21.5 pins the time of day (handy for previewing night); otherwise the sky follows the real clock.
const pinnedHour = params.has('hour') ? Number(params.get('hour')) : null;
// ?studyspeed=120 runs study time 120x faster for demos and checks
const sp = Number(params.get('studyspeed'));
const speed = Number.isFinite(sp) && sp > 0 ? Math.min(600, sp) : 1;

const canvas = document.getElementById('scene') as HTMLCanvasElement;

type Transition = { from: Biome; to: Biome; t0: number; mode: 'h' | 'v'; dir: 1 | -1; seedA: number; seedB: number };
let biome: Biome = ORDER[0];
let seed = Math.floor(Math.random() * 1000); // rerolls Wick's props each visit
let biomeStart = performance.now();
let tr: Transition | null = null;

function go(to: Biome, now: number) {
  if (tr) biome = tr.to;
  if (to === biome) return;
  tr = { from: biome, to, t0: now, ...transitionFor(biome, to), seedA: seed, seedB: seed + 1 };
  seed++;
  biomeStart = now;
}

// localStorage can throw when site data is blocked so study state then lives in memory only
let store: Store;
try {
  store = localStorage;
} catch {
  const m = new Map<string, string>();
  store = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}
let journal = loadJournal(store);
let session: Session | null = loadSession(store);
// the scene catch playing now and the rarest one waiting behind it and t0 starts once it is on screen
let reel: { fish: Fish; t0?: number } | null = null;
let nextReel: Fish | null = null;
// catches from a hidden tab wait for it to show so they land as one toast
let unseen: [Fish, boolean][] = [];
const rank = (f: Fish) => TIERS.indexOf(f.rarity);

// only the fishing spots while studying
const order = () => (session ? STUDY_ORDER : ORDER);
const skip = (now = performance.now()) => go(nextBiome(tr ? tr.to : biome, order()), now);

// Draw at the design's 1280×800 and let CSS cover the window; scale the backing store so text stays crisp.
const dpr = () => Math.min(3, (devicePixelRatio || 1) * Math.max(innerWidth / WE.W, innerHeight / WE.H));

let engine: any;
let lastFrame = 0;
function frame(now: number) {
  requestAnimationFrame(frame);
  if (now - lastFrame < FRAME_MS) return;
  lastFrame = now;
  studyTick();
  if (!switchOnSong && !tr && now - biomeStart > (session ? STUDY_BIOME_MS : BIOME_MS)) skip(now);

  let p = 0;
  if (tr) {
    p = (now - tr.t0) / TRANSITION_MS;
    if (p >= 1) {
      biome = tr.to;
      tr = null;
    }
  }
  const st = tr
    ? { a: tr.from, b: tr.to, mode: tr.mode, dir: tr.dir, p: WE.ease(p), seed: tr.seedA, seedB: tr.seedB }
    : { a: biome, seed };
  const tod = pinnedHour ?? clockHours(new Date());
  WE.renderFrame(canvas, { ...st, tod, t: now / 1000, S: PIXEL_SCALE, card: false, pipX: WICK_X }, engine, dpr());
  drawFishing(st, tod, now);
  const ms = session ? studiedMs(session, Date.now(), speed) : 0;
  ui.render({
    status: session ? (session.segStart == null ? 'paused' : 'running') : 'off',
    studiedMs: ms,
    catches: session?.catches ?? [],
    luck: Math.min(1, ms / 60000 / RAMP_MIN),
  });
}

// line bobber and catch on clawd in the biome and with the prop seed renderFrame picked for him
function drawFishing(st: any, tod: number, now: number) {
  if (session?.segStart == null) return; // paused reels the line in
  const C = engine.C, c0 = C * (1.15 - 1.45 * st.p), c1 = c0 + C * 0.26;
  const onB = st.b && (st.mode === 'v' ? st.p > 0.5 : (c0 + c1) / 2 < C * 0.38);
  const b = WE.BM[onB ? st.b : st.a];
  if (b.act !== 'fish') return;
  let p = 0;
  if (reel) {
    reel.t0 ??= now;
    p = (now - reel.t0) / CATCH_MS;
    if (p >= 1) {
      reel = nextReel && { fish: nextReel, t0: now };
      nextReel = null;
      p = 0;
    }
  }
  const fish = reel?.fish, night = WE.nightFrac(tod) > 0.5;
  WE.drawFishing(canvas.getContext('2d'), {
    x: Math.round(WE.W * WICK_X),
    y: b.ground * WE.LH + 10 - (WE.SPR.fish.anchor + 1) * PIXEL_SCALE,
    S: PIXEL_SCALE,
    t: now / 1000,
    night,
    phase: fish ? 'catch' : 'wait',
    p,
    art: fish?.art,
    color: fish && RARITY[fish.rarity].color,
    props: WE.pickProps(b.id, 'fish', onB ? st.seedB : st.seed, night),
  });
}

// every session change she makes is saved at once so a reload loses nothing
function update(s: Session) {
  session = s;
  saveSession(store, s);
}
const save = () => {
  if (session) saveSession(store, session);
};
const setPaused = (paused: boolean) => {
  if (session) update(paused ? pause(session, Date.now(), speed) : resume(session, Date.now()));
};
const setAct = (act: 'fish' | 'boat') => STUDY_ORDER.forEach((id) => (WE.BM[id].act = act));
// the summary's open journal still shows the session that just ended
let ended: Session | null = null;
const openJournal = () => ui.openJournal(journal, (session ?? ended)?.catches ?? []);

// head for the lake unless already at a fishing spot
function enterStudy() {
  setAct('fish');
  if (!STUDY_ORDER.includes(tr ? tr.to : biome)) go(STUDY_ORDER[0], performance.now());
  biomeStart = performance.now();
}

function start() {
  if (session) return;
  update(startSession(Date.now(), Math.random));
  enterStudy();
}

function stop() {
  if (!session) return;
  const now = Date.now(), done = pause(session, now, speed);
  journal = loadJournal(store);
  journal = { ...journal, sessions: journal.sessions + 1 };
  saveJournal(store, journal);
  saveSession(store, null);
  session = null;
  ended = done;
  reel = nextReel = null;
  setAct('boat');
  biomeStart = performance.now();
  ui.summary(done.catches, studiedMs(done, now, speed), journal);
}

// awards the fish that bit since the last tick and the sleep guard may pause the session
function studyTick() {
  if (session?.segStart == null) return;
  const r = tick(session, Date.now(), Math.random, speed);
  session = r.s;
  if (r.caught.length) land(r.caught);
  if (r.caught.length || session.segStart == null) save();
}

function land(fish: Fish[]) {
  // reread so a catch saved by another tab is never overwritten
  journal = loadJournal(store);
  // new means never caught before so a second one in the same batch is not
  for (const f of fish) {
    unseen.push([f, !journal.caught[f.id]]);
    journal = addCatch(journal, f);
  }
  saveJournal(store, journal);
  toast();
  const best = fish.reduce((a, f) => (rank(f) > rank(a) ? f : a));
  if (!reel) reel = { fish: best };
  else if (!nextReel || rank(best) > rank(nextReel)) nextReel = best;
}

function toast() {
  if (document.hidden || !unseen.length) return;
  ui.caught(unseen.map(([f]) => f), unseen.map(([, isNew]) => isNew));
  unseen = [];
}

addEventListener('keydown', (e) => {
  // the open journal or summary owns the keyboard and browser shortcuts keep their modifier keys
  if (document.querySelector('.st-dlg[open]') || e.metaKey || e.ctrlKey) return;
  // Focused buttons/sliders own Space and arrows; other shortcuts (M, F, O, S, P, J) still apply.
  if ([' ', 'ArrowLeft', 'ArrowRight'].includes(e.key) && (e.target as Element).closest?.('input, button')) return;
  if (e.key === 'm' || e.key === 'M') skip();
  else if ((e.key === 's' || e.key === 'S') && !session) start();
  else if ((e.key === 'p' || e.key === 'P') && session) setPaused(session.segStart != null);
  else if (e.key === 'j' || e.key === 'J') openJournal();
  else if (e.key === 'f' || e.key === 'F') {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  } else if (e.key === ' ') control('playpause');
  else if (e.key === 'ArrowRight') control('next');
  else if (e.key === 'ArrowLeft') control('previous');
  else if (e.key === 'o' || e.key === 'O') control('open');
  else return;
  e.preventDefault();
});

let idleTimer = 0;
addEventListener('mousemove', () => {
  document.body.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => document.body.classList.add('idle'), 5000);
});

const showTrack = mountPlayer(document.getElementById('player')!, { onOpenSpotify: () => control('open') });
let lastSong = '';
watchTrack((track) => {
  showTrack(track);
  const song = track ? `${track.title}\u0000${track.artist}` : '';
  if (switchOnSong && song && lastSong && song !== lastSong) skip();
  if (song) lastSong = song;
});

const ui = mountStudy(document.getElementById('study')!, {
  onStart: start,
  onPause: () => setPaused(true),
  onResume: () => setPaused(false),
  onStop: stop,
  onJournal: openJournal,
});

// a saved session comes back on the lake as it was and the first tick runs the sleep guard
if (session) {
  biome = STUDY_ORDER[0];
  enterStudy();
  studyTick();
}
// rAF stops in hidden tabs but intervals keep running so catches and the sleep guard keep up
setInterval(() => {
  studyTick();
  save();
}, 20_000);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  studyTick();
  toast();
});
addEventListener('pagehide', save);
// another tab changed study storage so take its journal and session instead of writing over them
addEventListener('storage', (e) => {
  if (e.key && !e.key.startsWith('wanderer.')) return;
  journal = loadJournal(store);
  const was = session;
  session = loadSession(store);
  if (was && !session) {
    reel = nextReel = null;
    setAct('boat');
  } else if (!was && session) enterStudy();
});

// The engine measures the monospace cell width once, so the font must be loaded first.
document.fonts.load(WE.FONT).catch(() => {}).finally(() => {
  engine = WE.makeEngine();
  requestAnimationFrame(frame);
});
