// Tuning, stages and the autumn palette for Turkey Run!
// One job: every number the rest of the game agrees on lives here.

export const VIEW_W = 960;
export const VIEW_H = 540;
export const GROUND_Y = 462;
export const PLAYER_X = 190;

export const GOAL_DISTANCE = 1000; // metres to the forest gate
export const START_LIVES = 3;
export const GRAVITY = 2600;
export const JUMP_VELOCITY = -880;
export const DASH_TIME = 0.45;
export const DASH_COOLDOWN = 2.2;
export const DASH_SPEED_BONUS = 260;

// Speed in px/s at the start, growing with distance. px per metre is 6.
export const BASE_SPEED = 300;
export const MAX_SPEED = 620;
export const PX_PER_METRE = 6;

export const STAGES = [
  {
    id: 'farmyard',
    name: 'The Farmyard',
    from: 0,
    to: 300,
    skyTop: '#f9b95c',
    skyBottom: '#ffe9b8',
    hill: '#c98f3d',
    hillFar: '#e0aa58',
    ground: '#b97e35',
    groundTop: '#d9a44a',
    accent: '#7a4a1f',
  },
  {
    id: 'barn',
    name: 'The Old Barn',
    from: 300,
    to: 650,
    skyTop: '#e08a4e',
    skyBottom: '#f7cf8e',
    hill: '#8a5a2b',
    hillFar: '#b57a3a',
    ground: '#8a5a28',
    groundTop: '#a9743a',
    accent: '#5d3a17',
  },
  {
    id: 'kitchen',
    name: 'The Kitchen!',
    from: 650,
    to: 1000,
    skyTop: '#c96a3e',
    skyBottom: '#f2b06a',
    hill: '#6e3f22',
    hillFar: '#96582e',
    ground: '#7c4a26',
    groundTop: '#9c6238',
    accent: '#4a2a12',
  },
];

export function stageFor(distance) {
  for (const s of STAGES) {
    if (distance < s.to) return s;
  }
  return STAGES[STAGES.length - 1];
}

// Hazard kinds. w/h are collision box sizes; drawHeight is visual height.
export const HAZARDS = {
  fence: { w: 26, h: 74, score: 10, label: 'fence' },
  hay: { w: 64, h: 58, score: 10, label: 'hay bale' },
  crate: { w: 56, h: 62, score: 10, label: 'crate' },
  pitchfork: { w: 22, h: 88, score: 15, label: 'pitchfork' },
  oven: { w: 92, h: 118, score: 20, label: 'oven' },
  knife: { w: 30, h: 96, score: 20, label: 'carving knife' },
  pin: { w: 54, h: 54, score: 15, label: 'rolling pin' },
};

// Which hazards each stage may spawn, with relative weights.
export const STAGE_HAZARDS = {
  farmyard: [['fence', 5], ['hay', 4], ['mud', 3]],
  barn: [['crate', 4], ['pitchfork', 4], ['fence', 3], ['hay', 3], ['mud', 2]],
  kitchen: [['oven', 4], ['knife', 5], ['pin', 4], ['crate', 2]],
};

export const COLLECTIBLES = {
  corn: { points: 50, gap: 6, label: 'corn' },
  feather: { points: 150, gap: 10, label: 'golden feather' },
  pie: { points: 100, gap: 4, label: 'pumpkin pie' },
};

export const PALETTE = {
  turkeyBody: '#8a5a2b',
  turkeyDark: '#6b4420',
  turkeyLight: '#b07a3e',
  turkeyHead: '#e8b04b',
  wattle: '#d43d2a',
  beak: '#e8912d',
  featherBrown: '#a06a30',
  featherCream: '#e8c98a',
  farmerShirt: '#4a7ab5',
  farmerOveralls: '#3d5a80',
  farmerSkin: '#f2c89b',
  farmerHat: '#7a5a2e',
  knifeBlade: '#dfe6ea',
  knifeHandle: '#5a3a1e',
  ovenBody: '#5e5e66',
  ovenDoor: '#2e2e33',
  cornYellow: '#ffd23e',
  gold: '#ffc93c',
};
