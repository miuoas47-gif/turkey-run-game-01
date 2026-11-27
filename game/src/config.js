// Turkey Run — shared constants, stage plan and seeded randomness.
// One clear job: every tunable number and stage definition lives here.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const GROUND_TOP = 150;
export const GROUND_BOTTOM = 668;
export const GATE_X = 1196;
export const START_X = 130;
export const START_Y = 430;

// The escape route: farmyard by day, barn yard at dusk, the kitchen at night.
export const STAGES = [
  {
    name: 'STAGE 1 — THE FARMYARD',
    place: 'Farmyard',
    skyTop: '#7ec8f7', skyBottom: '#ffe9b0', sun: '#ffd94d',
    ground: '#8a6b3f', grass: '#7fae4e', mood: 'Morning — the farmer is still yawning.',
    farmerSpeed: 168, knifeEveryMs: 3400, ovenCount: 1, cornCount: 9,
  },
  {
    name: 'STAGE 2 — THE BARN YARD',
    place: 'Barn Yard',
    skyTop: '#e8915a', skyBottom: '#f7c98a', sun: '#ff9d45',
    ground: '#7d5f38', grass: '#8f9a44', mood: 'Dusk — the farmer is angry now. Hide in the hay!',
    farmerSpeed: 196, knifeEveryMs: 2700, ovenCount: 2, cornCount: 10,
  },
  {
    name: 'STAGE 3 — THE KITCHEN',
    place: 'Kitchen',
    skyTop: '#5a3a4a', skyBottom: '#8a5a3a', sun: '#f2e6c9',
    ground: '#6b4a3a', grass: '#a8876a', mood: 'Night — ovens roaring, knives flying. The back door is near!',
    farmerSpeed: 224, knifeEveryMs: 2100, ovenCount: 3, cornCount: 10,
  },
];

export const TURKEY = {
  walkSpeed: 250, dashSpeed: 470, dashMs: 240, dashCooldownMs: 1400,
  radius: 30, startLives: 3,
};

export const FARMER = { radius: 34, spotRange: 330, loseRange: 430 };

export const SCORE = { corn: 10, goldenCorn: 50, stageClear: 150, escape: 500 };

// Small deterministic RNG (mulberry32) so screenshot states are reproducible.
export function makeSeededRandom(seed) {
  let a = seed >>> 0;
  return function seededRandom() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function distanceBetween(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}
