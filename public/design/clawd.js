// Swaps the design's Wick for Clawd in all four activities and re-anchors the props to Clawd's head and arm.
// Loads after wanderer-core.js / wanderer-biomes.js and only replaces WE.SPR frames and WE.PROPS anchors.
// Clawd's 15×7 body is from github.com/marciogranzotto/clawd-tank (MIT); each Clawd pixel is drawn 2×2 so
// Clawd stands about as tall as Wick did.
(function () {
  const WE = window.WE;
  Object.assign(WE.PIP_C, { c: '#DE886D', x: '#B8664E', k: '#000000' }); // body, far legs, eyes

  const BODY = [
    '..ccccccccccc..',
    '..ccccccccccc..',
    '..cckccccckcc..',
    'cccckccccckcccc',
    'ccccccccccccccc',
    '..ccccccccccc..',
    '..ccccccccccc..',
  ];
  const LEGS_NEAR = [3, 9];
  const LEGS_FAR = [5, 11];
  const BW = 30, BH = 14; // body size in sprite pixels (2× scale)
  const ARM = { x: 26, y: 6 }; // right arm, relative to the body origin

  const grid = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
  const set = (g, x, y, c) => { if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = c; };
  const rect = (g, x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, c); };
  const line = (g, x0, y0, x1, y1, c, t = 1) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) rect(g, Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), t, 1, c);
  };
  const body = (g, ox, oy) => BODY.forEach((r, j) => [...r].forEach((c, i) => c !== '.' && rect(g, ox + i * 2, oy + j * 2, 2, 2, c)));
  const legs = (g, ox, oy, xs, dx, len, c) => xs.forEach((lx) => rect(g, ox + lx * 2 + dx, oy + BH, 2, len, c));
  const rows = (g) => g.map((r) => r.join(''));

  // Walk: legs alternate, lifted pair is shorter; body bobs 1px on the passing frames.
  const walk = [[-1, 1, 4, 4, 0], [0, 0, 2, 4, 1], [1, -1, 4, 4, 0], [0, 0, 4, 2, 1]].map(([dn, df, ln, lf, bob]) => {
    const g = grid(32, 18), ox = 1, oy = bob;
    legs(g, ox, oy, LEGS_FAR, df, lf - bob, 'x');
    body(g, ox, oy);
    legs(g, ox, oy, LEGS_NEAR, dn, ln - bob, 'c');
    return rows(g);
  });

  // Paddle: Clawd sits in the hull; oar goes catch → pull → finish → recover.
  const OAR = [[33, 17], [27, 19], [21, 19], [32, 11]];
  const boat = OAR.map(([bx, by], f) => {
    const g = grid(35, 20), ox = 2, oy = 1 + (f % 2);
    body(g, ox, oy);
    rect(g, 0, 13, 1, 1, 'w'); rect(g, 33, 13, 1, 1, 'w'); rect(g, 34, 12, 1, 2, 'w');
    rect(g, 0, 14, 35, 1, 'w'); rect(g, 1, 15, 33, 1, 'W'); rect(g, 2, 16, 31, 1, 'd'); rect(g, 3, 17, 29, 1, 'W'); rect(g, 5, 18, 25, 1, 'd');
    const hx = ox + ARM.x + 2, hy = oy + ARM.y + 2;
    line(g, hx, hy, bx, by, 'd');
    rect(g, bx - 1, by - 2, 2, 3, 'w');
    return rows(g);
  });

  // Cycle: spokes turn 22.5° per frame, near pedal orbits the crank, Clawd bobs 1px.
  const CR = [16, 20], PED = [[0, -2], [2, 0], [0, 2], [-2, 0]];
  const bike = PED.map(([px, py], f) => {
    const g = grid(35, 25), ox = 3, oy = 1 + (f % 2);
    const near = [CR[0] + px, CR[1] + py], far = [CR[0] - px, CR[1] - py];
    line(g, 14, oy + BH + 1, far[0], far[1], 'x', 2); rect(g, far[0] - 1, far[1], 3, 1, 'T');
    for (const cx of [6, 28]) {
      for (let a = 0; a < 6.3; a += 0.04) set(g, Math.round(cx + 4 * Math.cos(a)), Math.round(20 + 4 * Math.sin(a)), 'T');
      const an = (f * Math.PI) / 8;
      for (const q of [an, an + Math.PI / 2]) line(g, Math.round(cx - 3 * Math.cos(q)), Math.round(20 - 3 * Math.sin(q)), Math.round(cx + 3 * Math.cos(q)), Math.round(20 + 3 * Math.sin(q)), 'm');
      set(g, cx, 20, 'M');
    }
    line(g, 6, 20, 16, 20, 'M'); line(g, 6, 20, 12, 16, 'M'); line(g, 12, 16, 16, 20, 'M'); line(g, 16, 20, 26, 16, 'M'); line(g, 26, 16, 28, 20, 'M'); line(g, 26, 16, 30, 12, 'M');
    rect(g, 29, 12, 3, 1, 'M'); rect(g, 9, 16, 5, 1, 'T');
    body(g, ox, oy);
    line(g, 16, oy + BH, near[0], near[1], 'c', 2); rect(g, near[0] - 1, near[1], 3, 1, 'T');
    line(g, ox + ARM.x + 2, oy + ARM.y + 3, 30, 12, 'c', 2); // arm to handlebar
    return rows(g);
  });

  // Swim: goggles + snorkel, legs kick in three heights, body bobs; snorkel sits at x=17 where the engine emits bubbles.
  const swim = [0, 1, 2, 1].map((k, f) => {
    const g = grid(33, 22), ox = 2, oy = 4 + (f === 1 || f === 2 ? 1 : 0);
    legs(g, ox, oy, LEGS_FAR, -k, 2 + k, 'x');
    body(g, ox, oy);
    legs(g, ox, oy, LEGS_NEAR, k - 1, 4 - k, 'c');
    rect(g, ox + 2, oy + 5, BW - 4, 1, 'g'); // strap
    for (const ex of [8, 20]) { rect(g, ox + ex - 1, oy + 3, 4, 5, 'G'); rect(g, ox + ex, oy + 4, 2, 3, 'k'); }
    rect(g, 17, oy - 4, 1, 6, 'K'); rect(g, 16, oy - 4, 2, 1, 'K');
    return rows(g);
  });

  const S = WE.SPR;
  Object.assign(S.walk, { w: 32, h: 18, anchor: 17, frames: walk, off: [[1, 0], [1, 1], [1, 0], [1, 1]] });
  Object.assign(S.boat, { w: 35, h: 20, anchor: 16, frames: boat, off: [[2, 1], [2, 2], [2, 1], [2, 2]] });
  Object.assign(S.bike, { w: 35, h: 25, anchor: 24, frames: bike, off: [[3, 1], [3, 2], [3, 1], [3, 2]] });
  Object.assign(S.swim, { w: 33, h: 22, anchor: 21, frames: swim, off: [[2, 4], [2, 5], [2, 5], [2, 4]] });

  // Props: hats centred on the head with one row of overlap, hand props held at the right arm, backpack on the left.
  for (const p of Object.values(WE.PROPS)) {
    const w = p.rows[0].length, h = p.rows.length;
    if (p.slot === 'head') p.at = [Math.round(BW / 2) - Math.floor(w / 2), 1 - h];
    else if (p.slot === 'hand') p.at = [ARM.x + 3, ARM.y + 3 - h];
    else p.at = [-3, 4];
    if (p.glow) p.glow = [p.at[0] + 1, p.at[1] + 3];
  }
})();
