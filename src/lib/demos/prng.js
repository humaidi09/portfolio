// Deterministic, seedable PRNG (mulberry32) shared by the demos that need
// reproducible randomness — the Sudoku generator (so a seed reproduces a
// puzzle) and the World Cup Monte Carlo (so a run is repeatable). Same seed →
// same stream, on every machine and every reload. Not cryptographic; that is
// exactly the right trade-off here — we want repeatability, not secrecy.

/** Returns a function that yields floats in [0, 1) from the given 32-bit seed. */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fold a human-friendly string ("try-me") into a 32-bit seed. */
export function hashSeed(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return (h ^ (h >>> 16)) >>> 0
}

/** Integer in [0, n) from an rng() in [0, 1). */
export function randInt(rng, n) {
  return Math.floor(rng() * n)
}

/** In-place Fisher–Yates shuffle driven by the given rng. Returns the array. */
export function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
