// Gobble Dash — configuration: view, tuning, and the five escape stages.
// One clear job: every number the game balances on lives here, so tuning
// never hides inside the update loop or the renderer.

export const VIEW = {
  w: 960,
  h: 540,
  ground: 470, // y of the dirt the turkey runs on
  turkeyX: 170, // the turkey stays here; the world scrolls past it
};

export const TUNING = {
  gravity: 2300,
  jumpVelocity: -880,
  baseSpeed: 265, // px/s on stage 1
  speedPerStage: 26,
  dashSpeed: 2.05, // speed multiplier while dashing
  dashTime: 0.45,
  dashCooldown: 2.2,
  slideTime: 0.75,
  invincibleTime: 1.3,
  gapStart: 68, // farmer gap meter, 0 = caught, 100 = far behind
  gapDrain: 1.15, // farmer gains this much per second, always
  gapHit: 20, // gap lost when an obstacle is hit
  gapCorn: 2.5, // gap regained per corn
  gapDash: 1.6, // gap regained per second of dashing
  gapStageBonus: 14, // gap regained when a stage is cleared
  hearts: 3,
  pxPerMetre: 12,
  cornScore: 25,
  goldenScore: 150,
  smashScore: 50, // dashing through a rolling pumpkin
  stageBonus: 500,
};

// Five stages of one escape: the farmyard, the cornfield, the barn, the
// kitchen (oven and carving knives), and the forest road to freedom.
export const STAGES = [
  {
    name: '1 · THE FARMYARD',
    sub: 'Out of the pen — mind the fences!',
    lengthM: 650,
    speed: 0,
    sky: ['#ffd9a0', '#ffb36b'],
    hill: '#c98f4a',
    ground: '#a9713a',
    grass: '#7fae4e',
    accent: '#e2574c',
    obstacles: ['fence', 'haybale', 'puddle', 'pumpkin'],
    density: 1.0,
  },
  {
    name: '2 · THE CORNFIELD',
    sub: 'Hide between the stalks — the dog is loose!',
    lengthM: 800,
    speed: 26,
    sky: ['#ffe9a8', '#ffc46b'],
    hill: '#d9a441',
    ground: '#b07f35',
    grass: '#d8b13c',
    accent: '#8a5a2b',
    obstacles: ['fence', 'scarecrow', 'dog', 'puddle', 'pumpkin'],
    density: 1.12,
  },
  {
    name: '3 · THE BARN',
    sub: 'Dark, dusty, full of low beams. Slide!',
    lengthM: 950,
    speed: 52,
    sky: ['#e8b07e', '#c97e4e'],
    hill: '#8a5a34',
    ground: '#6e4526',
    grass: '#9c6b3d',
    accent: '#5d3a1e',
    obstacles: ['haybale', 'beam', 'puddle', 'pumpkin', 'fence'],
    density: 1.25,
  },
  {
    name: '4 · THE KITCHEN',
    sub: 'The oven! The carving knife! Run, turkey, run!',
    lengthM: 1100,
    speed: 78,
    sky: ['#ffcf9e', '#f59a5e'],
    hill: '#b06a3c',
    ground: '#8a4f2c',
    grass: '#c97e4e',
    accent: '#d63c2f',
    obstacles: ['oven', 'knife', 'pot', 'puddle', 'haybale'],
    density: 1.4,
  },
  {
    name: '5 · THE FOREST ROAD',
    sub: 'Almost free — the gate is just ahead!',
    lengthM: 1250,
    speed: 104,
    sky: ['#cfe8b0', '#8fc47a'],
    hill: '#5d8a4a',
    ground: '#4c6e3a',
    grass: '#6fa055',
    accent: '#f2c14e',
    obstacles: ['log', 'branch', 'dog', 'pumpkin', 'fence', 'puddle'],
    density: 1.55,
  },
];

// Obstacle catalogue: how big it is, how the turkey beats it, and how hard
// it is to clear. counter: 'jump' | 'slide' | 'either' | 'dash' (dash smashes
// it, jumping over it also works).
export const OBSTACLES = {
  fence: { w: 34, h: 52, counter: 'jump', weight: 3 },
  haybale: { w: 62, h: 44, counter: 'jump', weight: 3 },
  puddle: { w: 60, h: 12, counter: 'jump', weight: 2 },
  pumpkin: { w: 44, h: 44, counter: 'dash', weight: 2 },
  scarecrow: { w: 40, h: 78, counter: 'jump', weight: 2 },
  dog: { w: 66, h: 40, counter: 'jump', weight: 2 },
  beam: { w: 72, h: 26, counter: 'slide', hang: true, weight: 3 },
  oven: { w: 96, h: 96, counter: 'jump', weight: 3 },
  knife: { w: 30, h: 88, counter: 'jump', swing: true, weight: 2 },
  pot: { w: 56, h: 30, counter: 'slide', hang: true, weight: 2 },
  log: { w: 78, h: 34, counter: 'jump', weight: 3 },
  branch: { w: 76, h: 22, counter: 'slide', hang: true, weight: 2 },
};

// Pickup catalogue.
export const PICKUPS = {
  corn: { score: 25, gap: 2.5 },
  golden: { score: 150, gap: 5 },
  feather: { score: 50, gap: 0 }, // shield: blocks one hit
  chili: { score: 75, gap: 0 }, // hot dash: instant dash + 3 s invincible
  pie: { score: 100, gap: 8 }, // restores one heart
};

export const DEFAULT_SEED = 20261128;
