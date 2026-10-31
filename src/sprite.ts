import type { SpriteFrames } from './types';

export const SPRITE_W = 24;
export const SPRITE_H = 20;

export const SPRITE_COLORS: Record<string, string> = {
  o: '#d97757', // body
  d: '#a8512f', // body shade / legs
  l: '#f0a883', // body highlight
  k: '#1a1412', // eyes
  b: '#9a6a3c', // boat wood
  B: '#5e3b20', // boat dark
  p: '#d2b27a', // paddle
  g: '#6f8f9a', // bike frame
  w: '#3a3a42', // tire
  s: '#a3a8b0', // spokes
};

type Canvas = string[][];
const blank = (): Canvas => Array.from({ length: SPRITE_H }, () => Array<string>(SPRITE_W).fill('.'));
const px = (c: Canvas, x: number, y: number, ch: string) => {
  if (x >= 0 && x < SPRITE_W && y >= 0 && y < SPRITE_H) c[y][x] = ch;
};
const rect = (c: Canvas, x: number, y: number, w: number, h: number, ch: string) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(c, x + i, y + j, ch);
};
const line = (c: Canvas, x0: number, y0: number, x1: number, y1: number, ch: string) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) px(c, Math.round(x0 + ((x1 - x0) * i) / (n || 1)), Math.round(y0 + ((y1 - y0) * i) / (n || 1)), ch);
};
const stamp = (c: Canvas, rows: string[], x: number, y: number) =>
  rows.forEach((r, j) => [...r].forEach((ch, i) => ch !== '.' && px(c, x + i, y + j, ch)));
const out = (c: Canvas) => c.map((r) => r.join(''));

// 12x8 round blob, facing right (eyes toward the right edge).
const BODY = [
  '...oooooo...',
  '..llooooooo.',
  '.llooooooooo',
  '.oooooookoko',
  'oooooooooooo',
  '.ooooooooooo',
  '.dooooooodd.',
  '..dddddddd..',
];

function walk(h: number, legs: number[], liftedLast = false): string[] {
  const c = blank();
  const y = SPRITE_H - h - 8;
  stamp(c, BODY, 6, y);
  legs.forEach((lx, i) => rect(c, 6 + lx, y + 8, 2, liftedLast && i === legs.length - 1 ? 1 : h, 'd'));
  return out(c);
}

function paddle(shaft: [number, number][], blades: [number, number][]): string[] {
  const c = blank();
  stamp(c, BODY, 4, 10);
  rect(c, 2, 17, 20, 1, 'b');
  rect(c, 3, 18, 18, 1, 'b');
  rect(c, 4, 19, 16, 1, 'B');
  px(c, 2, 16, 'b');
  px(c, 21, 16, 'b');
  for (let i = 0; i < shaft.length - 1; i++) line(c, ...shaft[i], ...shaft[i + 1], 'p');
  blades.forEach(([x, y]) => rect(c, x, y, 2, 2, 'p'));
  return out(c);
}

function wheel(c: Canvas, cx: number, cy: number, diag: boolean) {
  stamp(c, ['..www..', '.w...w.', 'w.....w', 'w.....w', 'w.....w', '.w...w.', '..www..'], cx - 3, cy - 3);
  for (let i = -2; i <= 2; i++) {
    if (diag) {
      px(c, cx + i, cy + i, 's');
      px(c, cx + i, cy - i, 's');
    } else {
      px(c, cx + i, cy, 's');
      px(c, cx, cy + i, 's');
    }
  }
}

// crank centre (9,17); `near` is the near pedal, the far pedal is opposite
function pedal(diag: boolean, near: [number, number]): string[] {
  const c = blank();
  wheel(c, 3, 16, diag);
  wheel(c, 20, 16, diag);
  line(c, 18 - near[0], 34 - near[1], 8, 11, 'd'); // far leg
  line(c, 3, 16, 9, 17, 'g'); // chainstay
  line(c, 9, 17, 7, 12, 'g'); // seat tube
  line(c, 8, 12, 16, 12, 'g'); // top tube
  line(c, 9, 17, 16, 12, 'g'); // down tube
  line(c, 16, 12, 20, 16, 'g'); // fork
  line(c, 16, 12, 16, 10, 'g'); // stem
  px(c, 17, 10, 'g');
  rect(c, 5, 11, 4, 1, 'g'); // saddle
  stamp(c, BODY, 3, 3);
  line(c, 8, 11, ...near, 'd'); // near leg
  line(c, 9, 11, near[0] + 1, near[1], 'd');
  return out(c);
}

export const FRAMES: SpriteFrames = {
  walk: [
    walk(2, [2, 8]),
    walk(3, [5, 8], true),
    walk(2, [3, 7]),
    walk(3, [5, 2], true),
  ],
  paddle: [
    paddle([[15, 12], [21, 18]], [[22, 18]]),
    paddle([[1, 15], [22, 15]], []),
    paddle([[6, 12], [2, 16]], [[0, 18]]),
    paddle([[1, 15], [22, 15]], []),
  ],
  pedal: [
    pedal(false, [11, 17]),
    pedal(true, [9, 19]),
    pedal(false, [7, 17]),
    pedal(true, [9, 15]),
  ],
};

/** Draw one frame with its top-left at (x, y) CSS px, each art pixel `scale` px square. */
export function drawSprite(ctx: CanvasRenderingContext2D, frame: string[], x: number, y: number, scale: number): void {
  for (let j = 0; j < frame.length; j++) {
    const row = frame[j];
    for (let i = 0; i < row.length; ) {
      const ch = row[i];
      let e = i + 1;
      while (e < row.length && row[e] === ch) e++;
      const color = ch === '.' ? undefined : SPRITE_COLORS[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + i * scale, y + j * scale, (e - i) * scale, scale);
      }
      i = e;
    }
  }
}
