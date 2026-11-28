// Stage layout generation: from a stage definition and a seed, lay out the
// obstacles and pickups along the whole stage in world pixels. The layout is
// pure data — the game only scrolls through it — so the same seed always
// builds the same run. Gaps between hazards scale with the stage speed, so a
// jump is always landable: the generator never stacks two jump hazards
// closer than the turkey's air time allows.

import { OBSTACLES, TUNING, STAGES } from './config.js';
import { makeRng } from './random.js';

const PX = TUNING.pxPerMetre;

function obstacleEntries(stage) {
  return stage.obstacles.map((name) => ({ item: name, weight: OBSTACLES[name].weight }));
}

export function buildStageLayout(stageIndex, seed) {
  const stage = STAGES[stageIndex];
  const rng = makeRng(seed + stageIndex * 7919);
  const lengthPx = stage.lengthM * PX;
  const speed = TUNING.baseSpeed + stage.speed;
  // Minimum front-to-front runway between hazards. A turkey that jumps a
  // hazard at the last fair moment lands airTime*speed - 100 px past its
  // front, and needs ~60 px more to see the next hazard and jump again. At
  // stage-5 speed that is ~240 px: a tighter gap is not hard, it is
  // unplayable, so the generator never builds one.
  const airTime = (2 * Math.abs(TUNING.jumpVelocity)) / TUNING.gravity; // ~0.77 s
  const minClear = Math.ceil(speed * airTime - 40);
  const minGap = Math.max(150, speed * airTime * 0.9);
  const gapBase = minGap / stage.density;

  const obstacles = [];
  const pickups = [];
  let x = 700; // first hazard never before the turkey finds its feet
  let lastType = '';

  while (x < lengthPx - 500) {
    const type = rng.weighted(obstacleEntries(stage));
    const def = OBSTACLES[type];
    obstacles.push({ type, x, w: def.w, h: def.h, counter: def.counter, hang: !!def.hang, swing: !!def.swing, passed: false, hit: false });

    // Corn trails reward the hazard's counter-move: an arc over a jump
    // hazard, a low line through a slide hazard.
    const r = rng.next();
    if (r < 0.55) {
      if (def.counter === 'slide') {
        for (let i = 0; i < 3; i++) {
          pickups.push({ kind: 'corn', x: x + 10 + i * 26, y: 'low', taken: false });
        }
      } else {
        for (let i = 0; i < 3; i++) {
          pickups.push({ kind: 'corn', x: x - 30 + i * 34, y: 'arc', taken: false, arc: i });
        }
      }
    } else if (r < 0.68) {
      pickups.push({ kind: rng.pick(['golden', 'feather', 'chili']), x: x + 130, y: 'mid', taken: false });
    }

    // Sometimes two hazards in a row — a "double" — with a bigger gap after.
    // Every gap respects minClear, front to front, so a jump over one hazard
    // always lands with room to meet the next.
    let gap = Math.max(minClear - def.w, gapBase * rng.range(0.9, 1.7));
    if (rng.chance(0.22) && x < lengthPx - 1100) {
      const type2 = rng.weighted(obstacleEntries(stage));
      const def2 = OBSTACLES[type2];
      const x2 = x + def.w + Math.max(minClear - def.w, rng.range(150, 230));
      obstacles.push({ type: type2, x: x2, w: def2.w, h: def2.h, counter: def2.counter, hang: !!def2.hang, swing: !!def2.swing, passed: false, hit: false });
      gap = (x2 - x) + def2.w + Math.max(minClear - def2.w, rng.range(170, 260));
    }
    // A pie (extra heart) is rare: one per stage at most, mid-stage.
    if (lastType === '' && rng.chance(0.5)) {
      pickups.push({ kind: 'pie', x: x + gap * 0.5, y: 'mid', taken: false });
      lastType = 'pie';
    }
    x += def.w + gap;
  }

  // A final corn fanfare before the stage gate.
  for (let i = 0; i < 5; i++) {
    pickups.push({ kind: 'corn', x: lengthPx - 320 + i * 30, y: 'arc', taken: false, arc: 2 });
  }

  return { lengthPx, obstacles, pickups };
}

// Where a pickup floats, in screen space, relative to the ground.
export function pickupY(kind, y, arc = 2) {
  if (y === 'low') return 34; // just above the dirt: grab it while running
  if (y === 'mid') return 110;
  // arc: 0,1,2 -> a little hop arc over the hazard
  return [150, 185, 165][arc] ?? 165;
}
