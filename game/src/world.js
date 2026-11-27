// Turkey Run — the farm and kitchen world: backdrop, haystacks, ovens,
// corn pickups, flying carving knives and particles.
// One clear job: everything the turkey runs through and dodges.

import { clamp, distanceBetween, GATE_X } from './config.js';

export function createWorld(stage, random) {
  const corn = [];
  for (let i = 0; i < stage.cornCount; i++) {
    corn.push({
      x: 220 + random() * 900, y: 200 + random() * 420,
      golden: i === 0, taken: false, bob: random() * 6,
    });
  }
  const haystacks = [
    { x: 340, y: 560, r: 52 }, { x: 700, y: 250, r: 52 }, { x: 980, y: 580, r: 52 },
  ];
  const ovens = [];
  for (let i = 0; i < stage.ovenCount; i++) {
    ovens.push({ x: 420 + i * 320, y: 560, w: 110, h: 70, heatMs: 0 });
  }
  return { corn, haystacks, ovens, knives: [], particles: [], clouds: makeClouds(random) };
}

function makeClouds(random) {
  const clouds = [];
  for (let i = 0; i < 5; i++) clouds.push({ x: random() * 1280, y: 40 + random() * 90, s: 0.7 + random() * 0.8 });
  return clouds;
}

export function spawnKnife(world, fromX, fromY, targetX, targetY, speed) {
  const dx = targetX - fromX, dy = targetY - fromY;
  const len = Math.hypot(dx, dy) || 1;
  world.knives.push({
    x: fromX, y: fromY, vx: (dx / len) * speed, vy: (dy / len) * speed,
    angle: 0, spin: 9, lifeMs: 2600,
  });
}

export function updateKnives(world, dtMs) {
  const dt = dtMs / 1000;
  for (const knife of world.knives) {
    knife.x += knife.vx * dt; knife.y += knife.vy * dt;
    knife.angle += knife.spin * dt; knife.lifeMs -= dtMs;
  }
  world.knives = world.knives.filter((k) => k.lifeMs > 0 && k.x > -60 && k.x < 1340 && k.y > 60 && k.y < 700);
}

export function updateParticles(world, dtMs) {
  const dt = dtMs / 1000;
  for (const p of world.particles) {
    p.ageMs += dtMs;
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt;
    if (p.kind === 'feather') p.vy = Math.min(p.vy, 60);
  }
  world.particles = world.particles.filter((p) => p.ageMs < p.lifeMs);
}

export function spawnCornSparkle(world, x, y) {
  for (let i = 0; i < 10; i++) {
    world.particles.push({
      kind: 'spark', x, y, vx: (Math.random() - 0.5) * 200, vy: -Math.random() * 180,
      lifeMs: 500, ageMs: 0, size: 3 + Math.random() * 3, color: '#ffd94d',
    });
  }
}

export function drawBackdrop(ctx, stage, timeMs) {
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, stage.skyTop); sky.addColorStop(0.55, stage.skyBottom); sky.addColorStop(1, stage.ground);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1280, 720);
  // Sun or moon.
  ctx.fillStyle = stage.sun;
  ctx.beginPath(); ctx.arc(1120, 90, 42, 0, Math.PI * 2); ctx.fill();
  // Distant barn and trees in the farm stages; kitchen walls in stage 3.
  if (stage.place === 'Kitchen') {
    ctx.fillStyle = '#7a4a3a'; ctx.fillRect(0, 60, 1280, 110);
    ctx.fillStyle = '#8a5a44';
    for (let x = 0; x < 1280; x += 90) ctx.fillRect(x, 60, 6, 110);
    ctx.fillStyle = '#4a2e22'; ctx.fillRect(0, 150, 1280, 20);
  } else {
    ctx.fillStyle = '#a03d2d';
    ctx.beginPath(); ctx.moveTo(120, 170); ctx.lineTo(220, 100); ctx.lineTo(320, 170); ctx.closePath(); ctx.fill();
    ctx.fillRect(130, 170, 180, 90);
    ctx.fillStyle = '#6e2a1e'; ctx.fillRect(205, 210, 30, 50);
    ctx.fillStyle = '#3f7a2e';
    for (const [tx, ty, tr] of [[60, 200, 46], [420, 190, 56], [560, 205, 40], [1080, 195, 50]]) {
      ctx.beginPath(); ctx.arc(tx, ty, tr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6e451f'; ctx.fillRect(tx - 6, ty, 12, 55); ctx.fillStyle = '#3f7a2e';
    }
  }
  // Ground and grass strip.
  ctx.fillStyle = stage.ground; ctx.fillRect(0, 260, 1280, 460);
  ctx.fillStyle = stage.grass; ctx.fillRect(0, 260, 1280, 26);
  // Fence posts along the top of the yard.
  ctx.fillStyle = '#8a6b3f';
  for (let x = 20; x < 1280; x += 80) ctx.fillRect(x, 236, 10, 40);
  ctx.fillRect(0, 246, 1280, 6);
}

export function drawClouds(ctx, clouds, dtMs) {
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const c of clouds) {
    c.x += dtMs / 1000 * 8;
    if (c.x > 1340) c.x = -120;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 46 * c.s, 16 * c.s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + 30 * c.s, c.y + 4, 34 * c.s, 13 * c.s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawHaystacks(ctx, haystacks, turkey) {
  for (const hay of haystacks) {
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath(); ctx.arc(hay.x, hay.y, hay.r, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#d99a2e';
    ctx.beginPath(); ctx.arc(hay.x, hay.y, hay.r * 0.7, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#b5762f'; ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(hay.x + i * 16, hay.y - hay.r + 12); ctx.lineTo(hay.x + i * 16, hay.y - 6); ctx.stroke();
    }
    const inside = distanceBetween(turkey.x, turkey.y, hay.x, hay.y) < hay.r;
    if (inside && !turkey.moving) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('HIDDEN IN THE HAY', hay.x, hay.y - hay.r - 12);
    }
  }
}

export function drawOvens(ctx, ovens, timeMs) {
  for (const oven of ovens) {
    const flicker = 0.6 + Math.sin(timeMs / 120 + oven.x) * 0.25;
    ctx.fillStyle = `rgba(255,80,20,${0.25 * flicker})`;
    ctx.beginPath(); ctx.roundRect(oven.x - 14, oven.y - 14, oven.w + 28, oven.h + 28, 16); ctx.fill();
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.roundRect(oven.x, oven.y, oven.w, oven.h, 10); ctx.fill();
    ctx.fillStyle = '#ff6a1a';
    ctx.beginPath(); ctx.roundRect(oven.x + 14, oven.y + 12, oven.w - 28, oven.h - 30, 8); ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath(); ctx.roundRect(oven.x + 24, oven.y + 20, oven.w - 48, oven.h - 46, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('OVEN — HOT!', oven.x + oven.w / 2, oven.y - 22);
  }
}

export function drawCorn(ctx, corn, timeMs) {
  for (const cob of corn) {
    if (cob.taken) continue;
    const bobY = Math.sin(timeMs / 300 + cob.bob) * 4;
    ctx.save(); ctx.translate(cob.x, cob.y + bobY);
    ctx.fillStyle = cob.golden ? '#ffd94d' : '#f2c14e';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 18, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cob.golden ? '#fff3a0' : '#ffe9a0';
    for (let r = -1; r <= 1; r++) {
      ctx.beginPath(); ctx.ellipse(r * 5, 0, 3, 14, 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#3f7a2e';
    ctx.beginPath(); ctx.moveTo(-8, 14); ctx.lineTo(8, 14); ctx.lineTo(0, 26); ctx.closePath(); ctx.fill();
    if (cob.golden) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawGate(ctx, stageIndex) {
  // The glowing back gate / forest exit on the right edge.
  const glow = 0.5 + Math.sin(Date.now() / 300) * 0.2;
  ctx.fillStyle = `rgba(120,255,150,${glow * 0.5})`;
  ctx.fillRect(GATE_X - 18, 170, 60, 480);
  ctx.fillStyle = '#2e7a3a'; ctx.fillRect(GATE_X, 170, 14, 480);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
  ctx.save(); ctx.translate(GATE_X + 34, 420); ctx.rotate(-Math.PI / 2);
  ctx.fillText(stageIndex === 2 ? 'FREEDOM!' : 'NEXT →', 0, 0); ctx.restore();
}

export function drawKnives(ctx, knives) {
  for (const knife of knives) {
    ctx.save(); ctx.translate(knife.x, knife.y); ctx.rotate(knife.angle);
    ctx.fillStyle = '#dfe6ee'; ctx.fillRect(0, -3, 30, 6);
    ctx.beginPath(); ctx.moveTo(30, -5); ctx.lineTo(42, 0); ctx.lineTo(30, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-12, -3, 12, 6);
    ctx.restore();
  }
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    const fade = 1 - p.ageMs / p.lifeMs;
    ctx.globalAlpha = Math.max(0, fade);
    ctx.fillStyle = p.color;
    if (p.kind === 'feather') {
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 0.55, p.ageMs / 200, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function turkeyInOven(turkey, ovens) {
  return ovens.find((o) => turkey.x > o.x - 8 && turkey.x < o.x + o.w + 8 && turkey.y > o.y - 8 && turkey.y < o.y + o.h + 8);
}

export function turkeyHiddenInHay(turkey, haystacks) {
  return haystacks.some((h) => distanceBetween(turkey.x, turkey.y, h.x, h.y) < h.r && !turkey.moving);
}

export function clampToGround(turkey) {
  turkey.y = clamp(turkey.y, 175, 648);
}
