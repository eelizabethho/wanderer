// Seeded 1D value noise, smooth and endless, for terrain heights.

function hash(seed: number, i: number): number {
  let h = Math.imul(i ^ seed, 0x27d4eb2d);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967295;
}

/** Smooth noise in [0, 1]. Features are about 1 unit of x wide. */
export function noise1D(seed: number, x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(seed, i) * (1 - u) + hash(seed, i + 1) * u;
}

/** Layered noise in [0, 1]: big hills plus smaller bumps. */
export function fbm(seed: number, x: number, octaves = 3): number {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise1D(seed + o * 101, x * 2 ** o) * amp;
    norm += amp;
    amp /= 2;
  }
  return sum / norm;
}
