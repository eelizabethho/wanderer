import './study.css';
import { FISH, RARITY, TIERS, byId, type Fish } from './fish';
import { points, type Catch, type Journal } from './study';

type Status = 'off' | 'running' | 'paused';
// a caught fish and whether it is a first ever catch
type Hit = [Fish, boolean];

const I = (body: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
const ICONS = {
  watch: I('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M9.5 2.75h5M18.5 6.5 20 5"/>'),
  fish: I('<path d="M3 12c2.6-4 8.4-5.6 13 0-4.6 5.6-10.4 4-13 0zM16 12l5-4v8z"/><circle class="st-solid" cx="7.5" cy="11.3" r="1"/>'),
  close: I('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
};

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
};
const rank = (f: Fish) => TIERS.indexOf(f.rarity);
const pts = (f: Fish) => RARITY[f.rarity].points;

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text?: string) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};
// tier color for everything inside e
const tint = <T extends HTMLElement>(e: T, f: Fish) => {
  e.style.setProperty('--c', RARITY[f.rarity].color);
  return e;
};
// fish art or a same shape silhouette for species not caught yet
const art = (f: Fish, ghost = false) => {
  const e = el('span', ghost ? 'st-art st-ghost' : f.rarity === 'legendary' ? 'st-art st-legend' : 'st-art');
  e.textContent = (ghost ? f.art.map((r) => r.replace(/\S/g, '?')) : f.art).join('\n');
  e.setAttribute('aria-hidden', 'true');
  return e;
};
const tier = (f: Fish) => el('span', 'st-tier', RARITY[f.rarity].label);
const badge = () => el('span', 'st-new', 'NEW!');
const btn = (cls: string, text: string, onClick: () => void) => {
  const b = el('button', cls, text);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
};

/** study pills, timer card, catch toast, fish journal and session summary inside root */
export function mountStudy(
  root: HTMLElement,
  h: { onStart(): void; onPause(): void; onResume(): void; onStop(): void; onJournal(): void },
) {
  // static markup only, fish data goes in through textContent below
  root.innerHTML = `
  <div class="st-pills">
    <button type="button" class="st-pill st-start" title="Start studying (S)">${ICONS.watch}Study</button>
    <button type="button" class="st-pill st-open" title="Fish journal (J)">${ICONS.fish}Journal</button>
  </div>
  <section class="st-card" aria-label="Study timer" hidden>
    <div class="st-over">STUDYING</div>
    <div class="st-clock" role="timer">0:00:00</div>
    <div class="st-luck">
      <span class="st-cap" aria-hidden="true">LUCK</span>
      <div class="st-bar" role="meter" aria-label="Luck" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="st-fill"></div></div>
      <span class="st-luck-tier" aria-hidden="true"></span>
    </div>
    <div class="st-count">
      <span><span class="st-glyph" aria-hidden="true">&gt;&lt;&gt;</span><b class="st-n">0</b> fish</span>
      <span><b class="st-p">0</b> pts</span>
    </div>
    <div class="st-actions"><div>
      <button type="button" class="st-btn st-pause" title="Pause or resume (P)">Pause</button>
      <button type="button" class="st-btn st-stop">Stop</button>
      <button type="button" class="st-btn st-fishbtn" title="Fish journal (J)" aria-label="Fish journal">Fish</button>
    </div></div>
  </section>
  <div class="st-toasts" role="status" aria-live="polite"></div>
  <dialog class="st-dlg"></dialog>`;
  const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const pills = $('.st-pills'), card = $('.st-card'), over = $('.st-over'), clk = $('.st-clock');
  const bar = $('.st-bar'), fill = $('.st-fill'), luckTier = $('.st-luck-tier'), luckRow = $('.st-luck');
  const nEl = $('.st-n'), pEl = $('.st-p'), pauseBtn = $<HTMLButtonElement>('.st-pause'), stopBtn = $<HTMLButtonElement>('.st-stop');
  const toasts = $('.st-toasts'), dlg = $<HTMLDialogElement>('.st-dlg');

  let status: Status | '' = '';
  $('.st-start').addEventListener('click', h.onStart);
  $('.st-open').addEventListener('click', h.onJournal);
  $('.st-fishbtn').addEventListener('click', h.onJournal);
  pauseBtn.addEventListener('click', () => (status === 'paused' ? h.onResume() : h.onPause()));

  // stop needs a second click within 3 s so a long session cannot end by accident
  let armed = 0;
  const disarm = () => {
    clearTimeout(armed);
    armed = 0;
    stopBtn.textContent = 'Stop';
    stopBtn.classList.remove('armed');
  };
  stopBtn.addEventListener('click', () => {
    if (armed) {
      disarm();
      h.onStop();
      return;
    }
    stopBtn.textContent = 'End session?';
    stopBtn.classList.add('armed');
    armed = window.setTimeout(disarm, 3000);
  });

  // the toast showing now and how long it stays
  let toast: HTMLElement | null = null, toastMs = 0, toastTimer = 0;
  // the dismiss timer only runs while the tab is visible so no catch vanishes unseen
  const armToast = () => {
    clearTimeout(toastTimer);
    const t = toast;
    if (!t || document.visibilityState !== 'visible') return;
    toastTimer = window.setTimeout(() => {
      toast = null;
      t.classList.add('out');
      setTimeout(() => t.remove(), 400);
    }, toastMs);
  };
  document.addEventListener('visibilitychange', armToast);
  const showToast = (items: Hit[], when = 'while you were away') => {
    if (!items.length) return;
    // rarest first so a legendary never hides in and n more
    items.sort((a, b) => rank(b[0]) - rank(a[0]));
    const best = items[0][0];
    const t = tint(el('div', `st-toast st-toast-${best.rarity}`), best);
    if (items.length === 1) {
      t.append(fishLine(best, items[0][1], 'st-one'));
    } else {
      const head = el('div', 'st-toast-head');
      head.append(el('span', '', `+${items.length} fish ${when}`), el('span', 'st-pts', `+${items.reduce((a, [f]) => a + pts(f), 0)} pts`));
      const list = el('div', 'st-toast-list');
      list.append(...items.slice(0, 5).map(([f, isNew]) => fishLine(f, isNew, 'st-small')));
      if (items.length > 5) list.append(el('div', 'st-more', `and ${items.length - 5} more`));
      t.append(head, list);
    }
    toasts.replaceChildren(t);
    toast = t;
    toastMs = rank(best) >= TIERS.indexOf('epic') ? 10000 : 6000;
    armToast();
  };
  // catches that land while the modal is open wait for it to close since everything behind it is dimmed and inert
  const waiting: Hit[] = [];

  // one dialog holds the journal or the summary, modal so the dimmed scene and player stay behind it
  let back: HTMLElement | null = null;
  const show = (kind: string, label: string, focus: HTMLElement, ...parts: HTMLElement[]) => {
    dlg.className = `st-dlg st-dlg-${kind}`;
    dlg.setAttribute('aria-label', label);
    dlg.replaceChildren(...parts);
    if (!dlg.open) {
      back = document.activeElement as HTMLElement | null;
      dlg.showModal();
    }
    focus.focus({ preventScroll: true });
  };
  dlg.addEventListener('close', () => {
    // opened by a shortcut key so focus stays on the page and the idle card can dim
    if (back !== document.body) {
      // the opener can be gone, like stop once the session ends
      const opener = back?.checkVisibility() ? back : null;
      (opener ?? $(card.hidden ? '.st-start' : '.st-fishbtn')).focus();
    }
    back = null;
    showToast(waiting.splice(0), 'caught');
  });
  // a click on the dimmed backdrop lands on the dialog itself
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());

  // last values shown, so per frame renders only touch the dom on change
  let sec = -1, n = -1, luck = -1, tierIdx = -1;

  return {
    render(v: { status: Status; studiedMs: number; catches: Catch[]; luck: number }) {
      if (v.status !== status) {
        status = v.status;
        pills.hidden = status !== 'off';
        card.hidden = status === 'off';
        card.classList.toggle('paused', status === 'paused');
        over.textContent = status === 'paused' ? 'PAUSED' : 'STUDYING';
        pauseBtn.textContent = status === 'paused' ? 'Resume' : 'Pause';
        if (status === 'off') disarm();
      }
      const s = Math.floor(v.studiedMs / 1000);
      if (s !== sec) clk.textContent = clock((sec = s) * 1000);
      if (v.catches.length !== n) {
        n = v.catches.length;
        nEl.textContent = String(n);
        pEl.textContent = points(v.catches).toLocaleString();
      }
      const l = Math.round(Math.min(1, Math.max(0, v.luck)) * 1000);
      if (l !== luck) {
        luck = l;
        fill.style.transform = `scaleX(${l / 1000})`;
        // each quarter of the 3 hours boosts the next tier, legendary from 2 h 15 m
        const t = Math.ceil(l / 250);
        if (t !== tierIdx) {
          tierIdx = t;
          const r = RARITY[TIERS[t]];
          luckRow.style.setProperty('--c', r.color);
          luckTier.textContent = r.label;
        }
        bar.setAttribute('aria-valuenow', String(Math.round(l / 10)));
        bar.setAttribute('aria-valuetext', `${Math.round(l / 10)}%, boosts up to ${RARITY[TIERS[t]].label}`);
      }
    },

    caught(fish: Fish[], isNew: boolean[]) {
      const items = fish.map((f, i): Hit => [f, isNew[i]]);
      if (dlg.open) waiting.push(...items);
      else showToast(items);
    },

    summary(catches: Catch[], studiedMs: number, j: Journal) {
      const list = catches.map((c) => byId(c.id)).filter((f): f is Fish => !!f);
      const counts = new Map<Fish, number>();
      for (const f of list) counts.set(f, (counts.get(f) ?? 0) + 1);
      const isNew = (f: Fish) => j.caught[f.id] === counts.get(f);
      const best = list.reduce<Fish | null>((b, f) => (!b || rank(f) > rank(b) ? f : b), null);

      const body = el('div', 'st-sum');
      const stats = el('div', 'st-stats');
      for (const [v, cap] of [[clock(studiedMs), 'studied'], [String(list.length), 'fish'], [points(catches).toLocaleString(), 'points']]) {
        const s = el('div', 'st-stat');
        s.append(el('b', '', v), el('span', '', cap));
        stats.append(s);
      }
      body.append(el('h2', '', 'Session complete'), stats);

      if (best) {
        const b = tint(el('div', 'st-best'), best);
        const meta = el('div', 'st-meta');
        meta.append(tier(best), el('span', 'st-pts', `+${pts(best)}`));
        if (isNew(best)) meta.append(badge());
        b.append(el('div', 'st-cap', 'BEST CATCH'), art(best), el('div', 'st-name', best.name), meta, el('p', 'st-fact', best.fact));
        const ul = el('ul', 'st-species');
        for (const [f, c] of [...counts].sort((a, b) => rank(b[0]) - rank(a[0]))) {
          const li = tint(el('li'), f);
          const glyph = el('span', 'st-glyph', '><>');
          glyph.setAttribute('aria-hidden', 'true');
          li.append(glyph, el('span', 'st-name', f.name), el('span', 'st-x', `x${c}`));
          if (isNew(f)) li.append(badge());
          ul.append(li);
        }
        body.append(b, el('div', 'st-cap', `SPECIES · ${counts.size}`), ul);
      } else {
        const e = el('div', 'st-empty');
        e.append(el('span', 'st-art', '~ ~ ~ o ~ ~ ~'), el('div', 'st-name', 'No bites this time'), el('p', 'st-fact', 'Fish start biting after about 8 minutes of study.'));
        body.append(e);
      }

      const done = btn('st-btn st-primary', 'Done', () => dlg.close());
      const acts = el('div', 'st-dlg-actions');
      acts.append(btn('st-btn', 'Open journal', h.onJournal), done);
      // actions sit outside the scrolling body so done stays on screen with many species
      show('sum', 'Session summary', done, body, acts);
    },

    openJournal(j: Journal, catches: Catch[]) {
      const body = el('div', 'st-jr');
      const head = el('div', 'st-head');
      const titles = el('div');
      const found = FISH.filter((f) => j.caught[f.id] > 0).length;
      const total = Object.values(j.caught).reduce((a, c) => a + c, 0);
      titles.append(el('h2', '', 'Fish journal'), el('p', 'st-sub', `${found}/${FISH.length} species found · ${total} fish · ${j.points.toLocaleString()} lifetime pts`));
      const close = btn('st-x-btn', '', () => dlg.close());
      close.innerHTML = ICONS.close; // static icon markup only
      close.setAttribute('aria-label', 'Close');
      head.append(titles, close);

      const tabs = el('div', 'st-tabs');
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-label', 'Fish lists');
      const panes = [sessionPane(catches), journalPane(j)];
      const tabBtns = [`This session · ${catches.length}`, 'Journal'].map((label, i) => {
        const b = btn('st-tab', label, () => pick(i));
        b.setAttribute('role', 'tab');
        b.id = `st-tab-${i}`;
        b.setAttribute('aria-controls', `st-pane-${i}`);
        panes[i].id = `st-pane-${i}`;
        panes[i].setAttribute('aria-labelledby', b.id);
        return b;
      });
      const pick = (i: number) => {
        tabBtns.forEach((b, k) => {
          b.setAttribute('aria-selected', String(k === i));
          b.tabIndex = k === i ? 0 : -1;
          panes[k].hidden = k !== i;
        });
      };
      tabs.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        const i = tabBtns[0].tabIndex === 0 ? 1 : 0;
        pick(i);
        tabBtns[i].focus();
      });
      tabs.append(...tabBtns);
      const first = catches.length ? 0 : 1;
      pick(first);
      body.append(head, tabs, ...panes);
      show('jr', 'Fish journal', tabBtns[first], body);
    },
  };
}

// fish art beside its name, tier and points, used by the toast
function fishLine(f: Fish, isNew: boolean, cls: string) {
  const row = tint(el('div', `st-fish ${cls}`), f);
  const text = el('div', 'st-fish-text');
  const meta = el('div', 'st-meta');
  meta.append(tier(f), el('span', 'st-pts', `+${pts(f)}`));
  if (isNew) meta.append(badge());
  text.append(el('div', 'st-name', f.name), meta);
  row.append(art(f), text);
  return row;
}

function pane() {
  const p = el('div', 'st-pane');
  p.setAttribute('role', 'tabpanel');
  p.tabIndex = 0;
  return p;
}

// catches newest first, each one opens its fact
function sessionPane(catches: Catch[]) {
  const p = pane();
  const list = catches.map((c) => [byId(c.id), c.atMs] as const).filter((x): x is [Fish, number] => !!x[0]).reverse();
  if (!list.length) {
    const e = el('div', 'st-empty');
    e.append(el('span', 'st-art', '~ ~ ~ o ~ ~ ~'), el('div', 'st-name', 'Nothing yet'), el('p', 'st-fact', "Clawd's line is in the water. Your catches show up here."));
    p.append(e);
    return p;
  }
  const ul = el('ul', 'st-rows');
  list.forEach(([f, at], i) => {
    const li = tint(el('li'), f);
    const fact = el('p', 'st-fact st-row-fact', f.fact);
    fact.id = `st-fact-${i}`;
    fact.hidden = true;
    const row = btn('st-row', '', () => {
      fact.hidden = !fact.hidden;
      row.setAttribute('aria-expanded', String(!fact.hidden));
    });
    row.setAttribute('aria-expanded', 'false');
    row.setAttribute('aria-controls', fact.id);
    const text = el('span', 'st-fish-text');
    text.append(el('span', 'st-name', f.name), tier(f));
    row.append(art(f), text, el('span', 'st-pts', `+${pts(f)}`), el('span', 'st-time', clock(at)));
    li.append(row, fact);
    ul.append(li);
  });
  p.append(ul);
  return p;
}

// every species by tier, uncaught ones as silhouettes
function journalPane(j: Journal) {
  const p = pane();
  for (const t of TIERS) {
    const fish = FISH.filter((f) => f.rarity === t);
    const sec = el('section', 'st-group');
    sec.style.setProperty('--c', RARITY[t].color);
    const h3 = el('h3', '', RARITY[t].label);
    h3.append(el('span', '', `${fish.filter((f) => j.caught[f.id] > 0).length}/${fish.length}`));
    const grid = el('ul', 'st-grid');
    for (const f of fish) {
      const c = j.caught[f.id] ?? 0;
      const li = el('li', c ? `st-entry${t === 'legendary' ? ' st-entry-legend' : ''}` : 'st-entry st-locked');
      const top = el('div', 'st-entry-top');
      if (c) {
        top.append(el('span', 'st-name', f.name), el('span', 'st-x', `x${c}`));
        li.append(art(f), top, el('p', 'st-fact', f.fact));
      } else {
        const name = el('span', 'st-name', '???');
        name.setAttribute('aria-hidden', 'true');
        top.append(name, el('span', 'st-sr', 'Not caught yet'));
        li.append(art(f, true), top, tier(f));
      }
      grid.append(li);
    }
    sec.append(h3, grid);
    p.append(sec);
  }
  return p;
}
