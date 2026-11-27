// Turkey Run — entry point: find the canvas and hand it to the game.
// One clear job: bootstrap only.

import { attachGame } from './game.js';

const canvas = document.getElementById('turkey-run-canvas');
if (canvas) attachGame(canvas);
