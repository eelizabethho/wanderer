import type { Grid, Renderer } from './types';

const FONT_PX = 11;
const FONT = `${FONT_PX}px "JetBrains Mono", "SF Mono", Menlo, monospace`;

class CellGrid implements Grid {
  readonly chars: string[];
  readonly colors: string[];
  constructor(readonly cols: number, readonly rows: number) {
    this.chars = new Array<string>(cols * rows).fill('');
    this.colors = new Array<string>(cols * rows).fill('');
  }
  set(col: number, row: number, ch: string, color: string): void {
    col = Math.floor(col);
    row = Math.floor(row);
    if (!(col >= 0 && col < this.cols && row >= 0 && row < this.rows)) return; // also rejects NaN
    const i = row * this.cols + col;
    this.chars[i] = ch;
    this.colors[i] = color;
  }
  get(col: number, row: number) {
    col = Math.floor(col);
    row = Math.floor(row);
    if (!(col >= 0 && col < this.cols && row >= 0 && row < this.rows)) return undefined;
    const i = row * this.cols + col;
    return { ch: this.chars[i], color: this.colors[i] };
  }
  clear(): void {
    this.chars.fill('');
    this.colors.fill('');
  }
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const ctx = canvas.getContext('2d')!;
  const r = { ctx, cols: 0, rows: 0, cellW: 0, cellH: FONT_PX * 1.3 } as {
    -readonly [K in keyof Renderer]: Renderer[K];
  };
  let dpr = 1;
  let w = 0;
  let h = 0;

  const setup = () => {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // resizing the backing store resets ctx state
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    r.cellW = ctx.measureText('M').width;
    r.cols = Math.ceil(w / r.cellW);
    r.rows = Math.ceil(h / r.cellH);
  };

  r.resize = setup;
  r.newGrid = () => new CellGrid(r.cols, r.rows);
  r.fill = (bg) => {
    ctx.globalAlpha = 1;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  };
  r.paint = (grid, alpha) => {
    const g = grid as CellGrid;
    const byColor = new Map<string, number[]>();
    for (let i = 0; i < g.chars.length; i++) {
      const ch = g.chars[i];
      if (ch === '' || ch === ' ') continue;
      const list = byColor.get(g.colors[i]);
      if (list) list.push(i);
      else byColor.set(g.colors[i], [i]);
    }
    ctx.globalAlpha = alpha;
    for (const [color, idx] of byColor) {
      ctx.fillStyle = color;
      for (const i of idx) {
        ctx.fillText(g.chars[i], (i % g.cols) * r.cellW, Math.floor(i / g.cols) * r.cellH);
      }
    }
    ctx.globalAlpha = 1;
  };

  setup();
  return r;
}
