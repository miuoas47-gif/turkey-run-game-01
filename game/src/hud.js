// Turkey Run — HUD, title screen and end screens, all drawn on the canvas.
// One clear job: everything the player reads on screen.

import { CANVAS_WIDTH, STAGES } from './config.js';

export function drawHud(ctx, state) {
  const stage = STAGES[state.stageIndex];
  // Top bar.
  ctx.fillStyle = 'rgba(20,16,10,0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 64);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`SCORE ${state.score}`, 18, 40);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`DISTANCE ${Math.floor(state.distanceM)} m`, 250, 38);
  ctx.fillText(stage.place.toUpperCase(), 520, 38);
  // Lives as hearts.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < state.turkey.lives ? '#ff4d6d' : 'rgba(255,255,255,0.25)';
    drawHeart(ctx, 760 + i * 36, 30, 13);
  }
  ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`CORN ${state.cornCollected}`, 880, 38);
  if (state.turkey.shield) { ctx.fillStyle = '#7ec8ff'; ctx.fillText('SHIELD', 1000, 38); }
  ctx.fillStyle = state.muted ? '#ffb84d' : '#cfe8ff';
  ctx.fillText(state.muted ? 'MUTED (M)' : 'M = MUTE', 1120, 38);
  // Escape progress bar, on a dark pill so clouds never wash it out.
  const progress = Math.min(1, state.stageProgress);
  ctx.fillStyle = 'rgba(20,16,10,0.55)';
  ctx.fillRect(10, 68, 500, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(18, 72, 300, 12);
  ctx.fillStyle = '#7ed957';
  ctx.fillRect(18, 72, 300 * progress, 12);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
  ctx.fillText('ESCAPE PROGRESS', 330, 84);
  // Dash cooldown.
  const dashReady = state.turkey.dashCooldownMs <= 0;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(18, 92, 140, 8);
  ctx.fillStyle = dashReady ? '#ffd94d' : '#8a8a8a';
  ctx.fillRect(18, 92, 140 * (dashReady ? 1 : 1 - state.turkey.dashCooldownMs / 1400), 8);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
  ctx.fillText(dashReady ? 'DASH READY (SPACE)' : 'DASH…', 166, 100);
  // Stage banner and danger toast.
  if (state.bannerMs > 0) {
    ctx.fillStyle = 'rgba(20,16,10,0.8)';
    ctx.fillRect(340, 120, 600, 64);
    ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(stage.name, 640, 150);
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
    ctx.fillText(stage.mood, 640, 174);
    ctx.textAlign = 'left';
  }
  if (state.toast) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(state.toast, 640, 210);
    ctx.textAlign = 'left';
  }
  if (state.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, CANVAS_WIDTH, 720);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PAUSED — press P to run again', 640, 360);
    ctx.textAlign = 'left';
  }
}

function drawHeart(ctx, x, y, size) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 10, size / 10);
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(-8, -5, -4, -11, 0, -5);
  ctx.bezierCurveTo(4, -11, 8, -5, 0, 3);
  ctx.fill(); ctx.restore();
}

export function drawTitleScreen(ctx, bestScore, timeMs) {
  ctx.fillStyle = '#2b1a08'; ctx.fillRect(0, 0, CANVAS_WIDTH, 720);
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, '#7ec8f7'); sky.addColorStop(0.6, '#ffe9b0'); sky.addColorStop(1, '#8a6b3f');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath(); ctx.arc(1100, 100, 48, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3f7a2e';
  ctx.beginPath(); ctx.arc(120, 560, 90, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.arc(1160, 580, 80, Math.PI, 0); ctx.fill();
  // Big friendly turkey mascot, drawn in code.
  drawTitleTurkey(ctx, 640, 300, timeMs);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff'; ctx.font = 'bold 84px sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
  ctx.fillText('TURKEY RUN!', 640, 130);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#7a2e00'; ctx.font = 'bold 30px sans-serif';
  ctx.fillText('Gobble or be gobbled — escape Thanksgiving dinner!', 640, 175);
  ctx.fillStyle = '#2b1a08'; ctx.font = '20px sans-serif';
  ctx.fillText('The farmer is after you. Dodge the ovens and the carving knives,', 640, 480);
  ctx.fillText('grab the corn, hide in the hay — and reach the forest gate!', 640, 510);
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Move: WASD / Arrow keys or click to run there  •  SPACE: flap-dash  •  P: pause  •  M: mute', 640, 552);
  // Start button.
  const pulse = 1 + Math.sin(timeMs / 300) * 0.03;
  ctx.save(); ctx.translate(640, 620); ctx.scale(pulse, pulse);
  ctx.fillStyle = '#ff6a1a';
  ctx.beginPath(); ctx.roundRect(-170, -32, 340, 64, 32); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 32px sans-serif';
  ctx.fillText('▶  START THE ESCAPE', 0, 11);
  ctx.restore();
  ctx.fillStyle = '#2b1a08'; ctx.font = '18px sans-serif';
  ctx.fillText(`Best escape score: ${bestScore}`, 640, 692);
  ctx.textAlign = 'left';
}

function drawTitleTurkey(ctx, x, y, timeMs) {
  const bob = Math.sin(timeMs / 400) * 6;
  ctx.save(); ctx.translate(x, y + bob);
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = ['#7a4a1f', '#a06a35', '#c98a3f', '#8a5a2b', '#b5762f'][i + 2];
    ctx.beginPath(); ctx.ellipse(i * 26 - 10, -30, 30, 13, i * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath(); ctx.ellipse(0, 0, 62, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a06a35';
  ctx.beginPath(); ctx.ellipse(-6, 12, 46, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(40, -20); ctx.lineTo(56, -58); ctx.stroke();
  ctx.fillStyle = '#a06a35';
  ctx.beginPath(); ctx.arc(58, -66, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff9d2e';
  ctx.beginPath(); ctx.moveTo(80, -70); ctx.lineTo(108, -60); ctx.lineTo(80, -52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath(); ctx.ellipse(62, -46, 8, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(66, -74, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(68, -74, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawEndScreen(ctx, state) {
  const escaped = state.endKind === 'escaped';
  ctx.fillStyle = escaped ? 'rgba(20,60,30,0.82)' : 'rgba(60,10,10,0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 720);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff'; ctx.font = 'bold 72px sans-serif';
  ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', 640, 190);
  ctx.font = 'bold 30px sans-serif';
  ctx.fillStyle = '#ffd94d';
  ctx.fillText(
    escaped ? 'You made it to the forest. No Thanksgiving dinner for you!' : 'The farmer got you… Thanksgiving dinner it is.',
    640, 245,
  );
  ctx.fillStyle = '#fff'; ctx.font = '26px sans-serif';
  ctx.fillText(`Score: ${state.score}    •    Distance: ${Math.floor(state.distanceM)} m    •    Corn: ${state.cornCollected}`, 640, 320);
  ctx.fillText(`Stages cleared: ${state.stagesCleared}    •    Best score: ${state.bestScore}`, 640, 360);
  ctx.font = '20px sans-serif';
  ctx.fillText('Press ENTER or click below to run again — the farmer never gives up.', 640, 410);
  ctx.fillStyle = '#ff6a1a';
  ctx.beginPath(); ctx.roundRect(470, 450, 340, 64, 32); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif';
  ctx.fillText('↻  RUN AGAIN', 640, 492);
  ctx.textAlign = 'left';
}

// Button hit areas, shared by the click handler.
export const TITLE_START_BUTTON = { x: 470, y: 588, w: 340, h: 64 };
export const END_RESTART_BUTTON = { x: 470, y: 450, w: 340, h: 64 };

export function pointInButton(x, y, button) {
  return x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h;
}
