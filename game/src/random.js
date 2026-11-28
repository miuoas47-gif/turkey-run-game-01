// Seeded random numbers (mulberry32). The whole escape is generated from
// one seed, so the same seed always builds the same farm, the same kitchen,
// the same forest — a run can be replayed exactly, and the screenshots are
// reproducible.

export function makeRng(seed) {
  let a = seed >>> 0;
  return {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min, max) {
      return min + this.next() * (max - min);
    },
    int(min, max) {
      return Math.floor(this.range(min, max + 1));
    },
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
    chance(p) {
      return this.next() < p;
    },
    // Weighted pick from [{item, weight}] entries.
    weighted(entries) {
      let total = 0;
      for (const e of entries) total += e.weight;
      let roll = this.next() * total;
      for (const e of entries) {
        roll -= e.weight;
        if (roll <= 0) return e.item;
      }
      return entries[entries.length - 1].item;
    },
  };
}
