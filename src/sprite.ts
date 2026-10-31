import type { SpriteFrames } from './types';

// STUB: Sprite agent replaces this file.
export const FRAMES: SpriteFrames = { walk: [], paddle: [], pedal: [] };
export const SPRITE_COLORS: Record<string, string> = {};

/** Draw one frame with its top-left at (x, y) CSS px, each art pixel `scale` px square. */
export function drawSprite(_ctx: CanvasRenderingContext2D, _frame: string[], _x: number, _y: number, _scale: number): void {}
