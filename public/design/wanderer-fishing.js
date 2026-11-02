// study mode fishing line bobber and catch drawn over the clawd fish sprite and loaded after clawd.js
// main calls drawFishing right after renderFrame so ctx is already in design coords
// f = { x, y, S, t, night, phase: 'off' | 'wait' | 'catch', p, art, color, props } and props is the pickProps list renderFrame drew
// x y is the sprite top left exactly as renderFrame computes px py and t is the same st.t
(function () {
  const WE = window.WE, { hh, mix, FONT, LH } = WE;
  const BX = 58; // bobber column in sprite pixels a little right of the bow
  const LAND = 17; // hull column the fish drops into
  const MIRROR = { '<': '>', '>': '<', '(': ')', ')': '(', '/': '\\', '\\': '/', '{': '}', '}': '{', '[': ']', ']': '[' };
  const flip = (r) => [...r].reverse().map((c) => MIRROR[c] || c).join(''); // catalog fish face right and the leap goes left
  const lerp = (a, b, s) => a + (b - a) * s;
  // one pixel wide path along a quadratic curve with no l corners
  const path = (x0, y0, cx, cy, x1, y1) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 3) + 1, out = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n, u = 1 - s, p = [Math.round(u * u * x0 + 2 * u * s * cx + s * s * x1), Math.round(u * u * y0 + 2 * u * s * cy + s * s * y1)], l = out[out.length - 1];
      if (l && l[0] === p[0] && l[1] === p[1]) continue;
      const a = out[out.length - 2];
      if (a && Math.abs(a[0] - p[0]) === 1 && Math.abs(a[1] - p[1]) === 1) out.pop();
      out.push(p);
    }
    return out;
  };

  WE.drawFishing = function (ctx, f) {
    if (f.phase === 'off') return;
    const a = WE.SPR.fish, { x, y, S, t, night } = f, fr = Math.floor(t * a.fps) % 4, wr = a.anchor; // wr is the water row the hull sits on
    const [tx, ty] = a.tip[fr];
    const px = (i, j, w = 1, h = 1) => ctx.fillRect(x + i * S, y + j * S, w * S, h * S);
    const water = night ? '#A9C2D2' : '#5F7F90';
    const line = (x0, y0, x1, y1, sag, al = .62) => {
      ctx.fillStyle = (night ? 'rgba(214,224,232,' : 'rgba(78,72,66,') + al + ')';
      path(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2 + sag, x1, y1).slice(1).forEach(([i, j]) => px(i, j));
    };
    const ring = (i, r, al) => { ctx.globalAlpha = al; ctx.fillStyle = water; px(i - r - 1, wr + 1, 2, 1); px(i + r, wr + 1, 2, 1); ctx.globalAlpha = 1; };
    const text = (s, cx, cy, c, al) => { ctx.globalAlpha = al; ctx.fillStyle = c; ctx.fillText(s, cx, cy); ctx.globalAlpha = 1; };
    const bobber = (dy, b = BX) => {
      if (night) [[6, .08], [3.5, .12]].forEach(([r, al]) => { ctx.fillStyle = 'rgba(246,195,107,' + al + ')'; ctx.beginPath(); ctx.arc(x + (b + .5) * S, y + (wr - .5 + dy) * S, r * S, 0, 6.283); ctx.fill(); });
      const row = (i, j, w, c) => { if (j <= wr) { ctx.fillStyle = c; px(i, j, w, 1); } }; // a dip hides the rows under the water
      row(b, wr - 2 + dy, 1, '#D0583F'); row(b - 1, wr - 1 + dy, 3, '#D0583F'); row(b - 1, wr + dy, 3, night ? '#F7F3EC' : '#C9C1B4'); row(b, wr + dy, 1, '#FFFFFF');
      if (dy >= 0) { ctx.globalAlpha = night ? .45 : .6; ctx.fillStyle = water; px(b - 1, wr + 1, 3, 1); ctx.globalAlpha = 1; } // waterline it floats in
    };
    ctx.save();
    ctx.font = FONT; ctx.textBaseline = 'top';
    const cw = ctx.measureText('M').width;

    if (f.phase === 'wait') {
      // gentle bob plus a fake nibble now and then
      const k = Math.floor(t / 3), u = t - k * 3 - .3 - hh(k, 5) * 2, nib = hh(k, 4) < .35 && u > 0 && u < 1.2;
      const dy = (Math.sin(t * 2.1) > .5 ? 1 : 0) + (nib && (u < .12 || (u > .26 && u < .36)) ? 1 : 0);
      ring(BX, 3 + ((t * 1.6) % 4), .55 * (1 - ((t * 1.6) % 4) / 4));
      if (nib) ring(BX, 1 + u * 4, .6 * (1 - u / 1.2));
      line(tx, ty, BX, wr - 3 + dy, 4);
      bobber(dy);
    } else {
      const p = WE.clamp(f.p);
      if (p < .25) {
        // bite with a twitch then the bobber is pulled under
        const q = p / .25, under = q >= .5, dy = q < .2 || (q > .35 && q < .5) ? 1 : 0;
        ring(BX, 1 + q * 6, .7 * (1 - q * .6));
        line(tx, ty, BX, under ? wr : wr - 3 + dy, 4 * (1 - q));
        if (under) text(q % .2 < .1 ? 'o' : '.', x + (BX + .5) * S - cw / 2, y + (wr - 1) * S - LH / 2, water, 1 - q);
        else bobber(dy);
      } else if (p < .45) {
        // taut line and the rod tip bends with each tug while the fish runs side to side
        const bend = Math.floor(t * 6) % 2 ? 4 : 2, ex = tx + 1, ey = ty + bend, hx = BX + Math.round(Math.sin(t * 5) * 2);
        ctx.fillStyle = WE.PIP_C.R; path(tx, ty, tx + 1, ty, ex, ey).slice(1).forEach(([i, j]) => px(i, j));
        line(ex, ey, hx, wr, 0, .85);
        ring(hx, 2 + Math.sin(t * 9) * .8, .55);
        for (let i = 0; i < 3; i++) text(hh(i, Math.floor(t * 8)) < .5 ? '~' : '*', x + (hx - 3 + i * 3) * S, y + (wr - 1) * S - LH / 2 + 2, water, .7);
      } else {
        // the fish leaps out and arcs over clawd into the hull behind him
        const q = (p - .45) / .55, raw = f.art, n = Math.max(...raw.map((r) => r.length));
        const art = raw.map((r) => flip(r.padEnd(n))), rows = art.length, aw = n * cw, hS = (rows * LH) / S, rim = wr - 2;
        const at = (s) => [lerp(BX, LAND, s), lerp(wr, rim + hS + 1, s * s) - 24 * 4 * s * (1 - s)]; // bottom centre of the art
        const [fx, fy] = at(q), left = x + fx * S - aw / 2, top = y + fy * S - rows * LH;
        const br = rows >> 1, mouth = [(left + art[br].search(/\S/) * cw - x) / S, (top + (br + .5) * LH - y) / S]; // left end of the body row once mirrored
        const col = night ? f.color : mix(f.color, '#3B3530', .3);
        if (q < .45) {
          // splash where it broke the surface
          const s = q / .45;
          ring(BX, 1 + s * 7, .7 * (1 - s));
          for (let i = 0; i < 9; i++) {
            const dx = (hh(i, 1) - .5) * 18 * s, dy = -(5 + hh(i, 2) * 9) * s + 16 * s * s;
            text(".'o,"[i % 4], x + (BX + dx) * S, y + (wr - 1 + dy) * S, water, 1 - s);
          }
        }
        if (q < .55) {
          // still hooked so it dangles from the line with a short sparkle trail
          line(tx, ty, mouth[0], mouth[1], 0, .85);
          for (let k = 1; k <= 3; k++) {
            const [sx, sy] = at(Math.max(0, q - k * .05));
            text(k === 1 ? '*' : '.', x + sx * S + aw / 2 + 2, y + (sy - hS / 2) * S - LH / 2, col, .55 - k * .13);
          }
        }
        // show the fish only above the rim and around clawd so it lands behind him in the boat
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, WE.W, y + rim * S);
        a.frames[fr].slice(0, rim).forEach((r, j) => { for (const m of r.matchAll(/[^.]+/g)) ctx.rect(x + m.index * S, y + j * S, m[0].length * S, S); });
        ctx.clip('evenodd');
        // and outside the props renderFrame drew so his hat stays in front without painting it twice
        ctx.beginPath(); ctx.rect(0, 0, WE.W, WE.H);
        WE.drawProps({ fillRect: (...r) => ctx.rect(...r), beginPath() {}, arc() {}, fill() {} }, 'fish', fr, x, y, S, f.props, night);
        ctx.clip('evenodd');
        art.forEach((r, j) => text(r, left, top + j * LH, col, 1));
        ctx.restore();
        if (q > .8) {
          // a few sparkles rise over his head as it lands
          const s = (q - .8) / .2;
          for (let i = 0; i < 4; i++) text(i % 2 ? '+' : '*', x + (LAND - 9 + i * 6) * S, y + (3 - s * (3 + hh(i, 9) * 4)) * S - LH, col, Math.min(1, 3 * (1 - s)));
        }
        if (p > .9) {
          // recast so the line and bobber are back in the water before the next wait
          const s = (p - .9) / .1, k = Math.min(1, s / .6), u = Math.max(0, (s - .6) / .4), bx = Math.round(lerp(tx, BX, k));
          const dy = Math.round(lerp(ty + 3 - wr, 0, k) - 16 * k * (1 - k)) + (u > 0 && u < .3 ? 1 : 0); // lob out from the tip then a one pixel plop
          if (u > 0) ring(BX, 1 + u * 4, .6 * (1 - u));
          line(tx, ty, bx, wr - 3 + dy, 4 * u);
          bobber(dy, bx);
        }
      }
    }
    ctx.restore();
  };
})();
