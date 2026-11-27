// Turkey Run — the farmer: patrol, chase, search and cornering.
// One clear job: the farmer AI and his drawing.

import { clamp, distanceBetween, FARMER } from './config.js';

export function createFarmer() {
  return {
    x: 60, y: 220, speed: 168, mode: 'patrol', // patrol | chase | search
    lastSeenX: 0, lastSeenY: 0, searchMs: 0, patrolDir: 1,
    spotted: false, walkPhase: 0, throwCooldownMs: 1800,
  };
}

export function updateFarmer(farmer, turkey, stage, dtMs, random, graceMs = 0) {
  const dt = dtMs / 1000;
  const dist = distanceBetween(farmer.x, farmer.y, turkey.x, turkey.y);
  const wasChasing = farmer.mode === 'chase';
  // During the opening grace the farmer is still yawning and only patrols.
  if (graceMs > 0 && farmer.mode !== 'chase') farmer.mode = 'patrol';
  // The farmer spots the turkey up close, or whenever it is out in the open.
  if (graceMs <= 0 && !turkey.hidden && dist < FARMER.spotRange) {
    farmer.mode = 'chase';
    farmer.lastSeenX = turkey.x; farmer.lastSeenY = turkey.y;
    farmer.searchMs = 0;
  } else if (farmer.mode === 'chase' && (dist > FARMER.loseRange || turkey.hidden)) {
    farmer.mode = 'search'; farmer.searchMs = 2600;
  }
  if (farmer.mode === 'search') {
    farmer.searchMs -= dtMs;
    if (farmer.searchMs <= 0) farmer.mode = 'patrol';
  }
  farmer.spotted = farmer.mode === 'chase';
  let targetX = farmer.x, targetY = farmer.y;
  if (farmer.mode === 'chase') {
    // Chase, but cut toward the gate to corner the turkey: aim slightly ahead.
    targetX = turkey.x + turkey.vx * 0.25 + 26;
    targetY = turkey.y + turkey.vy * 0.25;
  } else if (farmer.mode === 'search') {
    targetX = farmer.lastSeenX; targetY = farmer.lastSeenY;
  } else {
    // Patrol the yard, sweeping back and forth.
    targetX = farmer.x + farmer.patrolDir * 120;
    targetY = 330 + Math.sin(farmer.walkPhase / 40) * 60;
    if (farmer.x < 80) farmer.patrolDir = 1;
    if (farmer.x > 520) farmer.patrolDir = -1;
  }
  const dx = targetX - farmer.x, dy = targetY - farmer.y;
  const len = Math.hypot(dx, dy);
  const speed = farmer.mode === 'chase' ? stage.farmerSpeed : stage.farmerSpeed * 0.55;
  if (len > 6) {
    farmer.x += (dx / len) * speed * dt;
    farmer.y += (dy / len) * speed * dt;
    farmer.walkPhase += dtMs / 70;
  }
  farmer.x = clamp(farmer.x, 40, 1240);
  farmer.y = clamp(farmer.y, 175, 648);
  farmer.throwCooldownMs -= dtMs;
  return { caught: dist < FARMER.radius + 26 && farmer.mode === 'chase', newlySpotted: farmer.spotted && !wasChasing };
}

export function farmerShouldThrowKnife(farmer) {
  if (farmer.mode !== 'chase' || farmer.throwCooldownMs > 0) return false;
  farmer.throwCooldownMs = 2200 + Math.random() * 600;
  return true;
}

export function drawFarmer(ctx, farmer, timeMs) {
  const step = Math.sin(farmer.walkPhase) * 5;
  ctx.save();
  ctx.translate(farmer.x, farmer.y);
  const facing = farmer.mode === 'chase' ? 1 : farmer.patrolDir;
  // Legs (overalls).
  ctx.strokeStyle = '#2b4a8a'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-8 + step, 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(8 - step, 30); ctx.stroke();
  // Body: checked shirt and denim overalls.
  ctx.fillStyle = '#c94f3d';
  ctx.beginPath(); ctx.roundRect(-20, -18, 40, 30, 8); ctx.fill();
  ctx.fillStyle = '#2b4a8a';
  ctx.beginPath(); ctx.roundRect(-18, -4, 36, 18, 6); ctx.fill();
  // Arms, one raised holding the carving knife when chasing.
  ctx.strokeStyle = '#c94f3d'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-18, -10); ctx.lineTo(-30, 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(18, -10); ctx.lineTo(30, farmer.mode === 'chase' ? -22 : 4); ctx.stroke();
  if (farmer.mode === 'chase') {
    ctx.save(); ctx.translate(30, -26); ctx.rotate(0.7);
    ctx.fillStyle = '#dfe6ee'; ctx.fillRect(0, -3, 30, 6);
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-10, -3, 10, 6);
    ctx.restore();
  }
  // Head, beard, straw hat.
  ctx.fillStyle = '#f2c79b';
  ctx.beginPath(); ctx.arc(0, -30, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8e0d0';
  ctx.beginPath(); ctx.arc(0, -20, 11, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#e8b04b';
  ctx.beginPath(); ctx.ellipse(0, -42, 24, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -46, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Angry eyes.
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(-5, -32, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -32, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-9, -38); ctx.lineTo(-1, -35); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9, -38); ctx.lineTo(1, -35); ctx.stroke();
  // Spotted "!" and shout.
  if (farmer.spotted) {
    ctx.fillStyle = '#ff2e2e';
    ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!', 0, -66);
    ctx.font = 'bold 15px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText('THERE YOU ARE!', 0, -84);
  }
  ctx.restore();
}
