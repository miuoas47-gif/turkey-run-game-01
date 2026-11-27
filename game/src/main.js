// Boot for Turkey Run!: canvas, input, the game loop, screenshot scenes.
// One job: start the game and keep its frames coming.

import { VIEW_H, VIEW_W } from './config.js';
import { Input } from './input.js';
import { Game } from './game.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '20261128') || 20261128;
const shot = params.get('shot');

const input = new Input(canvas);
const game = new Game(canvas, input, seed);

// Deterministic screenshot scenes (?shot=title|play|caught|escaped&seed=N):
// the game itself renders them, so the screenshots are real renders.
if (shot) {
  game.shot(shot, seed);
  game.draw();
} else {
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (input.anyGesture) game.sound.unlock();
    game.update(dt);
    game.draw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// Mark the page ready (used by the screenshot harness, not by the game).
document.body.dataset.ready = '1';
document.title = 'Turkey Run! — The Great Thanksgiving Escape';
window.__game = game;
