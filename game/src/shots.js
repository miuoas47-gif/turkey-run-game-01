// Screenshot mode: ?shot=start|play|kitchen|end&seed=N puts the game into a
// fixed, readable pose and freezes it, so a headless browser captures the
// exact frame the maker wants. These are real states of the real game —
// the title screen, a mid-run frame, the kitchen stage, the escape —
// posed by playing the game forward with scripted inputs, never by drawing
// a fake picture.

import { VIEW } from './config.js';

// Play the game forward with a simple autopilot until the turkey is in a
// good pose: an obstacle just ahead and corn in the air.
function autopilotToPose(game, maxSteps = 60 * 40) {
  const t = game.turkey;
  for (let i = 0; i < maxSteps; i++) {
    const twx = game.distancePx + VIEW.turkeyX;
    // Find the next obstacle ahead.
    const next = game.layout.obstacles.find((o) => o.x + o.w > twx - 10 && !o.hit);
    if (next) {
      const dist = next.x - twx;
      if (t.onGround && dist < 190 && dist > 0) {
        if (next.counter === 'slide') {
          game.input.pressed.add('slide');
        } else {
          game.input.pressed.add('jump');
        }
      }
      // A nice frame: turkey near the top of its jump, hazard close ahead.
      if (!t.onGround && t.y < VIEW.ground - 70 && next.x - twx < 350 && next.x - twx > 150) return;
    }
    game.step(1 / 60);
    if (game.state !== 'playing') return;
  }
}

export function applyShot(game, name, seed) {
  game.seed = seed;
  if (name === 'start') {
    game.state = 'title';
    game.stateTimer = 0;
    game.gap = 45; // farmer visible at the edge of the frame, closing in
  } else if (name === 'play' || name === 'kitchen') {
    const stage = name === 'kitchen' ? 3 : 1;
    game.resetRun();
    game.loadStage(stage);
    game.state = 'playing';
    game.stateTimer = 0;
    game.score = name === 'kitchen' ? 2840 : 1250;
    game.combo = 6;
    game.comboMult = 2;
    game.cornCount = name === 'kitchen' ? 31 : 14;
    game.gap = name === 'kitchen' ? 42 : 58;
    game.hearts = 3;
    autopilotToPose(game);
    game.banner = null; // the stage banner would cover the action
    game.render();
  } else if (name === 'end') {
    game.resetRun();
    game.loadStage(4);
    game.state = 'escaped';
    game.stateTimer = 1;
    game.score = 12840;
    game.totalDistanceM = 4850;
    game.cornCount = 96;
    game.bestComboMult = 4;
    game.best = 12840;
    game.gap = 35; // the farmer, left behind at the forest gate
    game.confetti();
    game.step(1 / 60);
  }
  game.frozen = true;
  game.render();
}
