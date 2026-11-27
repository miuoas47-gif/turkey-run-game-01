// Turkey Run — game state machine, main loop, collisions and scoring.
// One clear job: run the game (title → play → caught/escaped → restart).

import { CANVAS_WIDTH, CANVAS_HEIGHT, GATE_X, SCORE, STAGES, TURKEY, makeSeededRandom, distanceBetween } from './config.js';
import { createTurkey, moveTurkey, drawTurkey, burstFeathers } from './turkey.js';
import { createFarmer, updateFarmer, farmerShouldThrowKnife, drawFarmer } from './farmer.js';
import { createWorld, spawnKnife, updateKnives, updateParticles, spawnCornSparkle, drawBackdrop, drawClouds, drawHaystacks, drawOvens, drawCorn, drawGate, drawKnives, drawParticles, turkeyInOven, turkeyHiddenInHay } from './world.js';
import { drawHud, drawTitleScreen, drawEndScreen, TITLE_START_BUTTON, END_RESTART_BUTTON, pointInButton } from './hud.js';
import { createInputState, attachInputHandlers, readMoveDirection } from './input.js';
import { playGobble, playCornPickup, playGoldenPickup, playDashFlap, playSpottedAlarm, playHitThud, playKnifeWhizz, playStageClear, playEscapeFanfare, playCaughtSadTrombone, startFarmMusic, stopFarmMusic, toggleMute, ensureAudioContext } from './audio.js';

export function createGameState(canvas) {
  const random = makeSeededRandom(20261127);
  return {
    canvas, ctx: canvas.getContext('2d'),
    mode: 'title', // title | playing | ended
    endKind: null, // caught | escaped
    stageIndex: 0, score: 0, distanceM: 0, cornCollected: 0,
    stagesCleared: 0, bestScore: loadBestScore(),
    turkey: createTurkey(), farmer: createFarmer(),
    world: createWorld(STAGES[0], random),
    random, input: createInputState(),
    clickTarget: null, lastTimeMs: 0, elapsedMs: 0,
    bannerMs: 0, toast: '', toastMs: 0,
    paused: false, muted: false, knifeTimerMs: 2600, graceMs: 0,
    stageProgress: 0, shotMode: null, frameCount: 0,
  };
}

function loadBestScore() {
  try { return Number(window.localStorage.getItem('turkey-run-best') || 0) || 0; } catch (e) { return 0; }
}

function saveBestScore(score) {
  try { window.localStorage.setItem('turkey-run-best', String(score)); } catch (e) { /* storage unavailable */ }
}

export function startRun(state) {
  state.mode = 'playing';
  state.endKind = null;
  state.stageIndex = 0;
  state.score = 0; state.distanceM = 0; state.cornCollected = 0;
  state.stagesCleared = 0; state.stageProgress = 0;
  state.turkey = createTurkey();
  state.farmer = createFarmer();
  state.world = createWorld(STAGES[0], state.random);
  state.bannerMs = 2600; state.toast = ''; state.paused = false;
  state.knifeTimerMs = 2600; state.clickTarget = null; state.graceMs = 3000;
  ensureAudioContext(); startFarmMusic(); playGobble();
}

export function advanceStage(state) {
  state.stagesCleared += 1;
  state.score += SCORE.stageClear;
  if (state.stageIndex >= STAGES.length - 1) {
    endRun(state, 'escaped');
    return;
  }
  state.stageIndex += 1;
  const stage = STAGES[state.stageIndex];
  state.turkey.x = 130; state.turkey.y = 430;
  state.farmer.x = 60; state.farmer.y = 220; state.farmer.mode = 'patrol';
  state.graceMs = 2000;
  state.world = createWorld(stage, state.random);
  state.world.knives = [];
  state.stageProgress = 0; state.bannerMs = 2600;
  state.knifeTimerMs = 2000;
  state.toast = `Stage cleared! +${SCORE.stageClear}`; state.toastMs = 1800;
  playStageClear();
}

export function endRun(state, kind) {
  state.mode = 'ended';
  state.endKind = kind;
  state.bannerMs = 0; state.toast = ''; state.toastMs = 0;
  if (kind === 'escaped') { state.score += SCORE.escape; playEscapeFanfare(); }
  else playCaughtSadTrombone();
  stopFarmMusic();
  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    saveBestScore(state.score);
  }
}

export function hurtTurkey(state, reason) {
  const turkey = state.turkey;
  if (turkey.invulnerableMs > 0 || state.mode !== 'playing') return;
  if (turkey.shield) {
    turkey.shield = false; turkey.invulnerableMs = 1200;
    state.toast = 'Feather shield saved you!'; state.toastMs = 1500;
    burstFeathers(state.world.particles, turkey.x, turkey.y, 14, state.random);
    playHitThud();
    return;
  }
  turkey.lives -= 1;
  turkey.invulnerableMs = 1600;
  burstFeathers(state.world.particles, turkey.x, turkey.y, 22, state.random);
  playHitThud();
  state.toast = reason; state.toastMs = 1500;
  // Knock the turkey away from danger.
  turkey.x = Math.max(60, turkey.x - 90);
  if (turkey.lives <= 0) endRun(state, 'caught');
}

function collectCorn(state) {
  const turkey = state.turkey;
  for (const cob of state.world.corn) {
    if (cob.taken) continue;
    if (distanceBetween(turkey.x, turkey.y, cob.x, cob.y) < 46) {
      cob.taken = true;
      state.cornCollected += 1;
      state.score += cob.golden ? SCORE.goldenCorn : SCORE.corn;
      if (cob.golden) { state.turkey.shield = true; playGoldenPickup(); state.toast = 'GOLDEN CORN! Feather shield up!'; }
      else playCornPickup();
      state.toastMs = 1400;
      spawnCornSparkle(state.world, cob.x, cob.y);
      if (state.cornCollected % 5 === 0) { state.turkey.speedBoostMs = 3000; state.toast = 'Corn rush! Speed boost!'; }
    }
  }
}

export function updatePlaying(state, dtMs) {
  const stage = STAGES[state.stageIndex];
  const turkey = state.turkey;
  const dir = readMoveDirection(state.input, state.clickTarget ? { x: state.clickTarget.x, y: state.clickTarget.y, px: turkey.x, py: turkey.y } : null);
  if (state.clickTarget && distanceBetween(turkey.x, turkey.y, state.clickTarget.x, state.clickTarget.y) < 18) state.clickTarget = null;
  const dashRequested = state.input.dashPressed;
  if (dashRequested) playDashFlap();
  state.input.dashPressed = false;
  const prevX = turkey.x;
  moveTurkey(turkey, dir, dtMs, dashRequested);
  turkey.vx = (turkey.x - prevX) / (dtMs / 1000 || 1);
  turkey.vy = 0;
  if (turkey.x > prevX) state.distanceM += (turkey.x - prevX) / 8;
  state.stageProgress = Math.min(1, (turkey.x - 130) / (GATE_X - 130));
  turkey.hidden = turkeyHiddenInHay(turkey, state.world.haystacks);
  // Farmer chase.
  state.graceMs = Math.max(0, state.graceMs - dtMs);
  const farmerResult = updateFarmer(state.farmer, turkey, stage, dtMs, state.random, state.graceMs);
  if (farmerResult.newlySpotted) { playSpottedAlarm(); state.toast = 'SPOTTED! RUN!'; state.toastMs = 1200; }
  if (farmerResult.caught) hurtTurkey(state, 'The farmer grabbed you!');
  if (state.mode !== 'playing') return;
  // Carving knives: the farmer throws, and in the kitchen they fly from the right too.
  state.knifeTimerMs -= dtMs;
  if (state.knifeTimerMs <= 0) {
    state.knifeTimerMs = stage.knifeEveryMs;
    spawnKnife(state.world, state.farmer.x + 30, state.farmer.y - 20, turkey.x, turkey.y, 380 + state.stageIndex * 60);
    playKnifeWhizz();
  }
  if (farmerShouldThrowKnife(state.farmer)) {
    spawnKnife(state.world, state.farmer.x + 30, state.farmer.y - 20, turkey.x, turkey.y, 420);
    playKnifeWhizz();
  }
  updateKnives(state.world, dtMs);
  for (const knife of state.world.knives) {
    if (distanceBetween(turkey.x, turkey.y, knife.x, knife.y) < 34) {
      knife.lifeMs = 0;
      hurtTurkey(state, 'A carving knife nicked you!');
      if (state.mode !== 'playing') return;
    }
  }
  // Ovens burn on contact.
  if (turkeyInOven(turkey, state.world.ovens)) hurtTurkey(state, 'Ouch — the oven is hot!');
  if (state.mode !== 'playing') return;
  collectCorn(state);
  updateParticles(state.world, dtMs);
  state.bannerMs = Math.max(0, state.bannerMs - dtMs);
  state.toastMs = Math.max(0, state.toastMs - dtMs);
  if (state.toastMs <= 0) state.toast = '';
  // Reaching the gate advances the escape.
  if (turkey.x >= GATE_X - 20) advanceStage(state);
}

export function drawGame(state, timeMs) {
  const ctx = state.ctx;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (state.mode === 'title') { drawTitleScreen(ctx, state.bestScore, timeMs); return; }
  const stage = STAGES[state.stageIndex];
  drawBackdrop(ctx, stage, timeMs);
  drawClouds(ctx, state.world.clouds, 16);
  drawGate(ctx, state.stageIndex);
  drawHaystacks(ctx, state.world.haystacks, state.turkey);
  drawOvens(ctx, state.world.ovens, timeMs);
  drawCorn(ctx, state.world.corn, timeMs);
  drawKnives(ctx, state.world.knives);
  drawFarmer(ctx, state.farmer, timeMs);
  drawTurkey(ctx, state.turkey, timeMs);
  drawParticles(ctx, state.world.particles);
  drawHud(ctx, state);
  if (state.mode === 'ended') drawEndScreen(ctx, state);
}

export function gameLoop(state, timeMs) {
  const dtMs = state.lastTimeMs ? Math.min(50, timeMs - state.lastTimeMs) : 16;
  state.lastTimeMs = timeMs;
  state.elapsedMs += dtMs;
  state.frameCount += 1;
  if (state.mode === 'playing' && !state.paused) updatePlaying(state, dtMs);
  else updateParticles(state.world, dtMs);
  drawGame(state, timeMs);
  window.requestAnimationFrame((t) => gameLoop(state, t));
}

// Deterministic screenshot states: same code path, fixed seed, no network.
// ?shot=title | ?shot=play | ?shot=end — used only to capture honest renders.
export function applyShotMode(state) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  state.shotMode = shot;
  state.random = makeSeededRandom(7);
  if (shot === 'title') { state.mode = 'title'; return; }
  if (shot === 'play') {
    startRun(state);
    state.turkey.x = 620; state.turkey.y = 420;
    state.farmer.x = 430; state.farmer.y = 400; state.farmer.mode = 'chase';
    state.score = 180; state.distanceM = 214; state.cornCollected = 7;
    state.stageProgress = 0.45; state.bannerMs = 0;
    state.world.corn[0].taken = true;
    spawnKnife(state.world, 900, 300, 620, 420, 380);
    state.world.knives[0].x = 820; state.world.knives[0].y = 380;
    burstFeathers(state.world.particles, 560, 460, 6, state.random);
    // Settle the scene with fixed simulation steps so the shot is lively.
    for (let i = 0; i < 40; i++) updatePlaying(state, 16);
    state.input.right = true;
    return;
  }
  if (shot === 'end') {
    startRun(state);
    state.score = 340; state.distanceM = 486; state.cornCollected = 12;
    state.stagesCleared = 1; state.turkey.lives = 0;
    endRun(state, 'caught');
    return;
  }
}

export function attachGame(canvas) {
  const state = createGameState(canvas);
  attachInputHandlers(canvas, state.input, {
    onEnter: () => {
      if (state.mode === 'title' || state.mode === 'ended') startRun(state);
    },
    onMute: () => { state.muted = toggleMute(); },
    onPause: () => { if (state.mode === 'playing') state.paused = !state.paused; },
    onClick: (x, y) => {
      ensureAudioContext();
      if (state.mode === 'title') {
        if (pointInButton(x, y, TITLE_START_BUTTON)) startRun(state);
        return;
      }
      if (state.mode === 'ended') {
        if (pointInButton(x, y, END_RESTART_BUTTON)) startRun(state);
        return;
      }
      if (state.mode === 'playing') state.clickTarget = { x, y };
    },
  });
  applyShotMode(state);
  window.requestAnimationFrame((t) => gameLoop(state, t));
  return state;
}
