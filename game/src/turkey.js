// Turkey Run — the player turkey: movement, dash, drawing, feathers.
// One clear job: everything about the turkey itself.

import { clamp, TURKEY } from './config.js';

export function createTurkey() {
  return {
    x: 130, y: 430, vx: 0, vy: 0, facing: 1,
    lives: TURKEY.startLives, invulnerableMs: 0, dashMs: 0,
    dashCooldownMs: 0, shield: false, speedBoostMs: 0,
    walkPhase: 0, moving: false, hidden: false,
  };
}

export function moveTurkey(turkey, dir, dtMs, dashRequested) {
  const dt = dtMs / 1000;
  if (dashRequested && turkey.dashCooldownMs <= 0 && turkey.dashMs <= 0) {
    turkey.dashMs = TURKEY.dashMs;
    turkey.dashCooldownMs = TURKEY.dashCooldownMs;
  }
  let speed = TURKEY.walkSpeed;
  if (turkey.speedBoostMs > 0) speed *= 1.35;
  if (turkey.dashMs > 0) speed = TURKEY.dashSpeed;
  turkey.x += dir.x * speed * dt;
  turkey.y += dir.y * speed * dt;
  turkey.x = clamp(turkey.x, 50, 1230);
  turkey.y = clamp(turkey.y, 175, 648);
  turkey.moving = dir.x !== 0 || dir.y !== 0;
  if (dir.x !== 0) turkey.facing = dir.x > 0 ? 1 : -1;
  if (turkey.moving) turkey.walkPhase += dtMs / 90;
  turkey.dashMs = Math.max(0, turkey.dashMs - dtMs);
  turkey.dashCooldownMs = Math.max(0, turkey.dashCooldownMs - dtMs);
  turkey.invulnerableMs = Math.max(0, turkey.invulnerableMs - dtMs);
  turkey.speedBoostMs = Math.max(0, turkey.speedBoostMs - dtMs);
}

export function burstFeathers(particles, x, y, count, random) {
  for (let i = 0; i < count; i++) {
    particles.push({
      kind: 'feather', x, y,
      vx: (random() - 0.5) * 260, vy: -random() * 220 - 40,
      lifeMs: 700 + random() * 500, ageMs: 0,
      size: 5 + random() * 7, color: ['#8a5a2b', '#a06a35', '#e8b04b', '#fff3d6'][i % 4],
    });
  }
}

export function drawTurkey(ctx, turkey, timeMs) {
  const bob = turkey.moving ? Math.sin(turkey.walkPhase) * 3 : Math.sin(timeMs / 500) * 1.5;
  const blink = turkey.invulnerableMs > 0 && Math.floor(timeMs / 90) % 2 === 0;
  ctx.save();
  ctx.translate(turkey.x, turkey.y + bob);
  if (blink) ctx.globalAlpha = 0.35;
  // Tail feathers, fanned behind.
  const tailColors = ['#7a4a1f', '#a06a35', '#c98a3f', '#8a5a2b', '#b5762f'];
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.38 * turkey.facing - (turkey.facing < 0 ? Math.PI : 0) * 0);
    ctx.fillStyle = tailColors[i + 2];
    ctx.beginPath();
    ctx.ellipse(-26 * turkey.facing, -14 - Math.abs(i) * -4, 26, 9, i * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath(); ctx.ellipse(0, 0, 32, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a06a35';
  ctx.beginPath(); ctx.ellipse(-4, 6, 24, 16, 0, 0, Math.PI * 2); ctx.fill();
  // Wing, flapping when dashing.
  const flap = turkey.dashMs > 0 ? Math.sin(timeMs / 40) * 0.5 : Math.sin(turkey.walkPhase) * 0.12;
  ctx.save(); ctx.rotate(-0.3 + flap);
  ctx.fillStyle = '#6e451f';
  ctx.beginPath(); ctx.ellipse(-6, -2, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Neck and head.
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(18 * turkey.facing, -12); ctx.lineTo(26 * turkey.facing, -30); ctx.stroke();
  ctx.fillStyle = '#a06a35';
  ctx.beginPath(); ctx.arc(28 * turkey.facing, -34, 13, 0, Math.PI * 2); ctx.fill();
  // Beak and wattle.
  ctx.fillStyle = '#ff9d2e';
  ctx.beginPath();
  ctx.moveTo(28 * turkey.facing + 10 * turkey.facing, -36);
  ctx.lineTo(28 * turkey.facing + 22 * turkey.facing, -31);
  ctx.lineTo(28 * turkey.facing + 10 * turkey.facing, -28);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath(); ctx.ellipse(30 * turkey.facing, -24, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Eye.
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(31 * turkey.facing, -38, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(32 * turkey.facing, -38, 2.2, 0, Math.PI * 2); ctx.fill();
  // Legs.
  const step = turkey.moving ? Math.sin(turkey.walkPhase) * 7 : 0;
  ctx.strokeStyle = '#ff9d2e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-8, 20); ctx.lineTo(-8 + step, 32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, 20); ctx.lineTo(8 - step, 32); ctx.stroke();
  // Shield ring when a feather shield is held.
  if (turkey.shield) {
    ctx.strokeStyle = 'rgba(120,200,255,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -4, 44, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}
