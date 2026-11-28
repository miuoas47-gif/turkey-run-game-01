// Gobble Dash — bootstrap. One job: read the URL, build the game, run the
// loop. ?seed=N fixes the run's random seed; ?shot=start|play|kitchen|end
// poses a frozen frame for screenshots.

import { Game } from './game.js';
import { applyShot } from './shots.js';
import { DEFAULT_SEED } from './config.js';

const canvas = document.getElementById('game');
const params = new URLSearchParams(location.search);
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isFinite(seedParam) ? seedParam : DEFAULT_SEED;

const game = new Game(canvas, { seed });
window.__TURKEY = game; // for play-testing and debugging

const shot = params.get('shot');
if (shot) {
  applyShot(game, shot, seed);
} else {
  game.render();
  let last = performance.now();
  const loop = (now) => {
    const dt = (now - last) / 1000;
    last = now;
    // window.__TURKEY_HOLD lets a play-test drive the game step by step
    // without the live loop double-stepping it.
    if (!window.__TURKEY_HOLD) game.step(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
