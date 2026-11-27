// Deterministic seeded random numbers (mulberry32) for Turkey Run!
// One job: every random choice in the game comes from here, so a fixed seed
// always plays the same run.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed) {
  const next = mulberry32(seed);
  return {
    next,
    // float in [min, max)
    range(min, max) {
      return min + next() * (max - min);
    },
    // integer in [min, max]
    int(min, max) {
      return Math.floor(min + next() * (max - min + 1));
    },
    // pick one entry from a weighted table of [value, weight]
    weighted(table) {
      let total = 0;
      for (const [, w] of table) total += w;
      let roll = next() * total;
      for (const [value, w] of table) {
        roll -= w;
        if (roll <= 0) return value;
      }
      return table[table.length - 1][0];
    },
    // true with probability p
    chance(p) {
      return next() < p;
    },
  };
}
