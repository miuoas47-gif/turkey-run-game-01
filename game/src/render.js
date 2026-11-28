// Renderer: every pixel of Gobble Dash is drawn here with canvas paths —
// the turkey, the farmer, the farm, the kitchen, the HUD and the screens.
// No images, no fonts from the network; the only font is the system stack.

import { VIEW, STAGES } from './config.js';

const { w: W, h: H, ground: G } = VIEW;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------- turkey
export function drawTurkey(ctx, t, time, opts = {}) {
  const x = t.x;
  const feet = t.y;
  const sliding = t.sliding;
  const blink = t.invincible > 0 && Math.floor(time * 14) % 2 === 0;
  ctx.save();
  if (blink) ctx.globalAlpha = 0.35;
  if (opts.ghost) ctx.globalAlpha = 0.9;
  const bob = t.onGround && !sliding ? Math.sin(t.runCycle * 2) * 2 : 0;
  const bodyY = feet - (sliding ? 16 : 26) + bob;
  const lean = t.dashing ? 0.25 : (t.onGround ? 0.06 : -0.12);
  ctx.translate(x, bodyY);
  ctx.rotate(lean);

  // Tail feathers — a fan of autumn colours.
  const tailCols = ['#d63c2f', '#f2a541', '#e2574c', '#c96a2b', '#f2c14e'];
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.45;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = tailCols[i];
    ellipse(ctx, -26, -6, 7, 17);
    ctx.fillStyle = '#fff3d6';
    ellipse(ctx, -26, -14, 3, 6);
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = '#8a5a2b';
  ellipse(ctx, 0, 0, 22, 19);
  ctx.fillStyle = '#a9713a';
  ellipse(ctx, 2, -4, 17, 14);
  // Wing.
  ctx.fillStyle = '#6e4526';
  ctx.save();
  ctx.rotate(t.onGround ? Math.sin(t.runCycle * 2) * 0.35 : -0.7);
  ellipse(ctx, -4, -2, 13, 7);
  ctx.restore();
  // Head + beak + wattle.
  ctx.fillStyle = '#8a5a2b';
  ellipse(ctx, 16, -20, 10, 10);
  ctx.fillStyle = '#f2a541';
  ctx.beginPath();
  ctx.moveTo(24, -22);
  ctx.lineTo(33, -18);
  ctx.lineTo(24, -15);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d63c2f';
  ellipse(ctx, 22, -12, 3, 6);
  // Eye — wide with panic, as it should be.
  ctx.fillStyle = '#fff';
  ellipse(ctx, 18, -23, 4, 4);
  ctx.fillStyle = '#1c1c1c';
  ellipse(ctx, 19, -23, 2, 2);
  // Legs.
  ctx.strokeStyle = '#f2a541';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const legSwing = t.onGround ? Math.sin(t.runCycle * 2) * 7 : 5;
  ctx.beginPath();
  ctx.moveTo(-6, 14);
  ctx.lineTo(-6 + legSwing, feet - bodyY + 1);
  ctx.moveTo(6, 14);
  ctx.lineTo(6 - legSwing, feet - bodyY + 1);
  ctx.stroke();
  // Shield ring.
  if (t.shield) {
    ctx.strokeStyle = 'rgba(120,200,255,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -6, 34, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- farmer
export function drawFarmer(ctx, f, gap, time) {
  const x = f.x;
  const feet = G;
  const bob = Math.sin(f.runCycle * 2) * 2;
  ctx.save();
  ctx.translate(x, feet - 30 + bob);
  const near = gap < 30;
  // Legs.
  ctx.strokeStyle = '#3a2c1c';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const swing = Math.sin(f.runCycle * 2) * 9;
  ctx.beginPath();
  ctx.moveTo(-5, 22);
  ctx.lineTo(-5 + swing, 30);
  ctx.moveTo(5, 22);
  ctx.lineTo(5 - swing, 30);
  ctx.stroke();
  // Overalls.
  ctx.fillStyle = '#3f6fb5';
  rr(ctx, -13, -8, 26, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#3f6fb5';
  ctx.fillRect(-13, -8, 26, 10);
  // Shirt.
  ctx.fillStyle = near ? '#c0392b' : '#d63c2f';
  rr(ctx, -15, -26, 30, 22, 8);
  ctx.fill();
  // Arms reaching forward, clutching a net.
  ctx.strokeStyle = '#e8b88a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(10, -20);
  ctx.lineTo(26, -12 + Math.sin(time * 6) * 2);
  ctx.stroke();
  // Net.
  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(34, -10, 12, 9, 0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(28, -16);
  ctx.lineTo(40, -4);
  ctx.moveTo(40, -16);
  ctx.lineTo(28, -4);
  ctx.stroke();
  // Head + straw hat.
  ctx.fillStyle = '#e8b88a';
  ellipse(ctx, 0, -36, 11, 11);
  ctx.fillStyle = '#f2c14e';
  ellipse(ctx, 0, -42, 17, 5);
  ctx.fillStyle = '#d8a13c';
  rr(ctx, -8, -52, 16, 9, 4);
  ctx.fill();
  // Angry eyes + moustache.
  ctx.fillStyle = '#1c1c1c';
  ellipse(ctx, 4, -38, 1.8, 1.8);
  ellipse(ctx, 9, -38, 1.8, 1.8);
  ctx.strokeStyle = '#6e4526';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -31);
  ctx.lineTo(12, -31);
  ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------- obstacles
export function drawObstacle(ctx, o, sx, time) {
  ctx.save();
  switch (o.type) {
    case 'fence': {
      ctx.fillStyle = '#7a4a22';
      ctx.fillRect(sx, G - 52, 6, 52);
      ctx.fillRect(sx + 28, G - 52, 6, 52);
      ctx.fillStyle = '#9c6b3d';
      ctx.fillRect(sx - 4, G - 48, 42, 8);
      ctx.fillRect(sx - 4, G - 28, 42, 8);
      break;
    }
    case 'haybale': {
      ctx.fillStyle = '#e0aa4e';
      ellipse(ctx, sx + 31, G - 20, 31, 21);
      ctx.strokeStyle = '#b07f35';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx + 31, G - 20, 22, 14, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'puddle': {
      ctx.fillStyle = '#5aa7d6';
      ellipse(ctx, sx + 37, G - 4, 37, 7);
      ctx.fillStyle = '#8ecfec';
      ellipse(ctx, sx + 30, G - 5, 18, 3);
      break;
    }
    case 'pumpkin': {
      const roll = time * 6 + o.x * 0.01;
      ctx.translate(sx + 22, G - 22);
      ctx.rotate(roll % (Math.PI * 2));
      ctx.fillStyle = '#e07b28';
      ellipse(ctx, 0, 0, 22, 20);
      ctx.strokeStyle = '#b85c14';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -19);
      ctx.quadraticCurveTo(4, 0, 0, 19);
      ctx.moveTo(-11, -16);
      ctx.quadraticCurveTo(-6, 0, -11, 16);
      ctx.moveTo(11, -16);
      ctx.quadraticCurveTo(6, 0, 11, 16);
      ctx.stroke();
      ctx.fillStyle = '#4c7a34';
      ctx.fillRect(-3, -26, 6, 8);
      break;
    }
    case 'scarecrow': {
      ctx.fillStyle = '#7a4a22';
      ctx.fillRect(sx + 18, G - 78, 5, 78);
      ctx.fillRect(sx + 2, G - 58, 36, 5);
      ctx.fillStyle = '#d63c2f';
      ctx.beginPath();
      ctx.moveTo(sx + 20, G - 78);
      ctx.lineTo(sx + 32, G - 62);
      ctx.lineTo(sx + 8, G - 62);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f2c14e';
      ellipse(ctx, sx + 20, G - 82, 9, 8);
      ctx.fillStyle = '#3a2c1c';
      ellipse(ctx, sx + 17, G - 83, 1.5, 1.5);
      ellipse(ctx, sx + 23, G - 83, 1.5, 1.5);
      break;
    }
    case 'dog': {
      const bob = Math.sin(time * 10) * 2;
      ctx.fillStyle = '#5d3a1e';
      ellipse(ctx, sx + 33, G - 22 + bob, 30, 16);
      ellipse(ctx, sx + 58, G - 34 + bob, 12, 11);
      ctx.fillStyle = '#7a4a22';
      ctx.beginPath();
      ctx.moveTo(sx + 66, G - 40 + bob);
      ctx.lineTo(sx + 72, G - 50 + bob);
      ctx.lineTo(sx + 60, G - 42 + bob);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1c1c1c';
      ellipse(ctx, sx + 62, G - 36 + bob, 2, 2);
      ctx.fillStyle = '#d63c2f';
      ctx.fillRect(sx + 66, G - 30 + bob, 10, 3);
      ctx.strokeStyle = '#5d3a1e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sx + 12, G - 12 + bob);
      ctx.lineTo(sx + 4, G - 2);
      ctx.moveTo(sx + 54, G - 12 + bob);
      ctx.lineTo(sx + 62, G - 2);
      ctx.stroke();
      break;
    }
    case 'beam': {
      ctx.fillStyle = '#5d3a1e';
      ctx.fillRect(sx - 4, G - 72, o.w + 8, 26);
      ctx.fillStyle = '#7a4a22';
      ctx.fillRect(sx - 4, G - 72, o.w + 8, 6);
      ctx.fillStyle = '#e0aa4e';
      ellipse(ctx, sx + 20, G - 46, 6, 8);
      break;
    }
    case 'oven': {
      ctx.fillStyle = '#3a3a3a';
      rr(ctx, sx, G - 96, 96, 96, 8);
      ctx.fill();
      ctx.fillStyle = '#565656';
      rr(ctx, sx + 8, G - 88, 80, 60, 5);
      ctx.fill();
      ctx.fillStyle = '#ff9a3c';
      rr(ctx, sx + 16, G - 78, 64, 40, 4);
      ctx.fill();
      ctx.fillStyle = '#ffd23c';
      ctx.beginPath();
      ctx.moveTo(sx + 28, G - 40);
      ctx.quadraticCurveTo(sx + 36, G - 66, sx + 44, G - 40);
      ctx.quadraticCurveTo(sx + 52, G - 66, sx + 60, G - 40);
      ctx.quadraticCurveTo(sx + 68, G - 66, sx + 76, G - 40);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.fillRect(sx + 20, G - 26, 56, 6);
      ctx.fillStyle = '#f2c14e';
      for (let i = 0; i < 3; i++) ctx.fillRect(sx + 26 + i * 18, G - 92, 8, 5);
      break;
    }
    case 'knife': {
      const swing = Math.sin(time * 3 + o.x * 0.05) * 0.5;
      ctx.translate(sx + 15, G - 88);
      ctx.rotate(swing);
      ctx.fillStyle = '#c0c8d0';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(14, 0);
      ctx.lineTo(10, 62);
      ctx.lineTo(7, 74);
      ctx.lineTo(4, 62);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a2c1c';
      ctx.fillRect(-2, -14, 19, 16);
      ctx.fillStyle = '#8a8f96';
      ctx.fillRect(4, 0, 2, 60);
      break;
    }
    case 'pot': {
      ctx.fillStyle = '#2f2f2f';
      rr(ctx, sx, G - 76, o.w, 30, 8);
      ctx.fill();
      ctx.fillStyle = '#565656';
      ellipse(ctx, sx + o.w / 2, G - 76, o.w / 2, 6);
      ctx.fillStyle = '#ff9a3c';
      ellipse(ctx, sx + o.w / 2, G - 46, 5, 5);
      break;
    }
    case 'log': {
      ctx.fillStyle = '#6e4526';
      rr(ctx, sx, G - 34, 78, 34, 16);
      ctx.fill();
      ctx.fillStyle = '#a9713a';
      ellipse(ctx, sx + 6, G - 17, 6, 14);
      ctx.strokeStyle = '#8a5a2b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx + 6, G - 17, 3, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'branch': {
      ctx.fillStyle = '#4c6e3a';
      ctx.fillRect(sx - 4, G - 68, o.w + 8, 20);
      ctx.fillStyle = '#6fa055';
      for (let i = 0; i < 6; i++) {
        ellipse(ctx, sx + 8 + i * 15, G - 68, 9, 6);
      }
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// --------------------------------------------------------------- pickups
export function drawPickup(ctx, kind, x, y, time) {
  const bob = Math.sin(time * 4 + x * 0.02) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  if (kind === 'corn') {
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 14, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d8a13c';
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 4, -11);
      ctx.lineTo(i * 4, 11);
      ctx.stroke();
    }
    ctx.fillStyle = '#6fa055';
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(-6, 20);
    ctx.lineTo(6, 20);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'golden') {
    ctx.fillStyle = '#ffd23c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 18, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3d6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 13, 0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', 0, -20);
  } else if (kind === 'feather') {
    ctx.fillStyle = '#7ec8f2';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 16, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 14);
    ctx.stroke();
  } else if (kind === 'chili') {
    ctx.fillStyle = '#d63c2f';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(12, -4, 8, 12);
    ctx.quadraticCurveTo(4, 18, -2, 12);
    ctx.quadraticCurveTo(-10, 0, 0, -16);
    ctx.fill();
    ctx.strokeStyle = '#4c7a34';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(4, -22, 9, -22);
    ctx.stroke();
  } else if (kind === 'pie') {
    ctx.fillStyle = '#e0aa4e';
    ctx.beginPath();
    ctx.moveTo(-12, 8);
    ctx.lineTo(12, 8);
    ctx.lineTo(0, -12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d63c2f';
    ellipse(ctx, 0, 2, 4, 3);
    ctx.fillStyle = '#fff3d6';
    ctx.fillRect(-12, 8, 24, 3);
  }
  ctx.restore();
}

// ----------------------------------------------------------------- scene
export function drawScene(ctx, g) {
  const stage = STAGES[g.stageIndex];
  const t = g.time;
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, stage.sky[0]);
  sky.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Sun: a soft glow, not a ring.
  ctx.fillStyle = 'rgba(255,243,214,0.45)';
  ellipse(ctx, 880, 62, 46, 46);
  ctx.fillStyle = '#ffe9a8';
  ellipse(ctx, 880, 62, 28, 28);
  // Hills (parallax).
  const off = g.distancePx * 0.25;
  ctx.fillStyle = stage.hill;
  ctx.beginPath();
  ctx.moveTo(0, G - 40);
  for (let x = 0; x <= W; x += 40) {
    ctx.lineTo(x, G - 60 - Math.sin((x + off) * 0.008) * 26);
  }
  ctx.lineTo(W, G);
  ctx.lineTo(0, G);
  ctx.closePath();
  ctx.fill();
  // Stage props drifting past (fence posts, corn stalks, trees, tiles).
  drawProps(ctx, g, stage);
  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, G, W, H - G);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, G, W, 8);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  const dash = g.distancePx * 1.0;
  for (let x = -((dash % 60) + 60); x < W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, G + 26);
    ctx.lineTo(x + 24, G + 26);
    ctx.stroke();
  }
  // Pickups, obstacles, farmer, turkey, particles.
  for (const p of g.layout.pickups) {
    if (p.taken) continue;
    const sx = p.x - g.distancePx + VIEW.turkeyX;
    if (sx < -40 || sx > W + 40) continue;
    drawPickup(ctx, p.kind, sx, G - p.yOff, t);
  }
  for (const o of g.layout.obstacles) {
    const sx = o.x - g.distancePx + VIEW.turkeyX;
    if (sx < -140 || sx > W + 140) continue;
    drawObstacle(ctx, o, sx, t);
  }
  // Stage gate at the end of the stage.
  const gateX = g.layout.lengthPx - g.distancePx + VIEW.turkeyX;
  if (gateX > -40 && gateX < W + 200) {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(gateX, G - 150, 8, 150);
    ctx.fillRect(gateX + 120, G - 150, 8, 150);
    ctx.fillStyle = stage.accent;
    ctx.fillRect(gateX, G - 150, 128, 34);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.stageIndex === 4 ? 'FREEDOM!' : 'NEXT STAGE', gateX + 64, G - 128);
  }
  drawFarmer(ctx, g.farmer, g.gap, t);
  drawTurkey(ctx, g.turkey, t);
  for (const pt of g.particles) {
    ctx.globalAlpha = Math.max(0, pt.life / pt.max);
    ctx.fillStyle = pt.color;
    ellipse(ctx, pt.x, pt.y, pt.r, pt.r);
  }
  ctx.globalAlpha = 1;
}

function drawProps(ctx, g, stage) {
  const off = g.distancePx * 0.6;
  for (let i = 0; i < 14; i++) {
    const wx = i * 220 - (off % 220);
    const x = wx - 220;
    const idx = g.stageIndex;
    if (idx === 1) {
      // Corn stalks.
      ctx.strokeStyle = '#8a7a2b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, G - 40);
      ctx.lineTo(x, G - 110);
      ctx.stroke();
      ctx.fillStyle = '#d8b13c';
      ellipse(ctx, x + 4, G - 88, 6, 16);
    } else if (idx === 3) {
      // Kitchen window + hanging pans.
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x, G - 170, 70, 80);
      ctx.strokeStyle = '#8a4f2c';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, G - 170, 70, 80);
    } else if (idx === 4) {
      // Pine trees.
      ctx.fillStyle = '#3f6e2e';
      ctx.beginPath();
      ctx.moveTo(x, G - 150);
      ctx.lineTo(x - 26, G - 60);
      ctx.lineTo(x + 26, G - 60);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5d3a1e';
      ctx.fillRect(x - 5, G - 62, 10, 22);
    } else {
      // Fence posts / haystacks.
      ctx.fillStyle = '#9c6b3d';
      ctx.fillRect(x, G - 66, 8, 26);
      ctx.fillRect(x + 40, G - 66, 8, 26);
      ctx.fillRect(x - 6, G - 62, 60, 5);
    }
  }
}

// ------------------------------------------------------------------- HUD
export function drawHUD(ctx, g) {
  const stage = STAGES[g.stageIndex];
  ctx.save();
  // Top bar.
  ctx.fillStyle = 'rgba(30,20,10,0.55)';
  rr(ctx, 10, 10, W - 20, 56, 10);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`SCORE ${Math.floor(g.score)}`, 22, 34);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#ffd23c';
  ctx.fillText(`${Math.floor(g.distanceM)} m  ·  ${stage.name}`, 22, 56);
  // Hearts.
  for (let i = 0; i < TUNING_HEARTS(g); i++) {
    drawHeart(ctx, 560 + i * 30, 30, i < g.hearts ? '#e2574c' : 'rgba(255,255,255,0.25)');
  }
  // Farmer gap meter.
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  rr(ctx, 660, 20, 150, 14, 7);
  ctx.fill();
  const gapW = 150 * Math.max(0, g.gap / 100);
  ctx.fillStyle = g.gap < 30 ? '#e2574c' : '#7ec850';
  rr(ctx, 660, 20, gapW, 14, 7);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(g.gap < 30 ? 'FARMER CLOSE!' : 'FARMER', 664, 45);
  // Combo.
  if (g.combo >= 3) {
    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`COMBO x${g.comboMult}  (${g.combo})`, W - 22, 88);
  }
  // Dash cooldown.
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = g.turkey.dashCooldown <= 0 ? '#7ec8f2' : 'rgba(255,255,255,0.5)';
  ctx.fillText(g.turkey.dashCooldown <= 0 ? 'DASH READY [Shift]' : 'dash recharging…', 22, 88);
  if (g.turkey.shield) {
    ctx.fillStyle = '#7ec8f2';
    ctx.fillText('🛡 SHIELD', 200, 88);
  }
  // Stage progress bar.
  const prog = Math.min(1, g.distancePx / g.layout.lengthPx);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  rr(ctx, 22, H - 26, W - 44, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#ffd23c';
  rr(ctx, 22, H - 26, (W - 44) * prog, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(g.stageIndex === 4 ? 'TO FREEDOM' : 'STAGE PROGRESS', 22, H - 32);
  ctx.restore();
}

function TUNING_HEARTS() {
  return 3;
}

function drawHeart(ctx, x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-12, -4, -6, -12, 0, -5);
  ctx.bezierCurveTo(6, -12, 12, -4, 0, 8);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- screens
export function drawTitle(ctx, g) {
  drawScene(ctx, g);
  ctx.fillStyle = 'rgba(40,20,5,0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 64px sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillText('GOBBLE DASH', W / 2, 130);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('The Great Turkey Escape', W / 2, 168);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText('Thanksgiving is coming. The farmer is coming faster. Run, turkey, run!', W / 2, 200);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('↑ / SPACE jump      ↓ slide      SHIFT dash      P pause      M mute', W / 2, 250);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText('Dodge fences, ovens and carving knives · grab corn for combos', W / 2, 276);
  ctx.fillText('Feathers shield you · chillies make you unstoppable · 5 stages to freedom', W / 2, 298);
  const pulse = 0.7 + Math.sin(g.time * 4) * 0.3;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('PRESS SPACE OR CLICK TO START', W / 2, 360);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = '15px sans-serif';
  ctx.fillText('5 stages: Farmyard → Cornfield → Barn → Kitchen → Forest', W / 2, 400);
  if (g.best > 0) {
    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Best score: ${Math.floor(g.best)}`, W / 2, 432);
  }
  ctx.restore();
}

export function drawBanner(ctx, title, sub, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(30,20,10,0.6)';
  rr(ctx, W / 2 - 260, 150, 520, 110, 14);
  ctx.fill();
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText(title, W / 2, 196);
  ctx.fillStyle = '#fff';
  ctx.font = '18px sans-serif';
  ctx.fillText(sub, W / 2, 228);
  ctx.restore();
}

export function drawEnd(ctx, g, won) {
  drawScene(ctx, g);
  ctx.fillStyle = won ? 'rgba(20,60,20,0.5)' : 'rgba(60,15,5,0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#8fe388' : '#ff9a8a';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText(won ? 'ESCAPED!' : 'CAUGHT!', W / 2, 150);
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText(
    won
      ? 'The turkey made it to the forest. Thanksgiving is cancelled!'
      : 'The farmer got his turkey… this time. Gobble again?',
    W / 2,
    188,
  );
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffd23c';
  ctx.fillText(`SCORE ${Math.floor(g.score)}`, W / 2, 240);
  ctx.fillStyle = '#fff';
  ctx.font = '17px sans-serif';
  ctx.fillText(
    `Distance ${Math.floor(g.distanceM)} m · Stage ${g.stageIndex + 1} of 5 · Corn ${g.cornCount} · Best combo x${g.bestComboMult}`,
    W / 2,
    272,
  );
  if (g.best > 0 && g.score >= g.best) {
    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('★ NEW BEST SCORE! ★', W / 2, 306);
  }
  const pulse = 0.7 + Math.sin(g.time * 4) * 0.3;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('PRESS R OR CLICK TO RUN AGAIN', W / 2, 360);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawPaused(ctx, g) {
  ctx.fillStyle = 'rgba(20,15,5,0.5)';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('PAUSED', W / 2, 250);
  ctx.font = '17px sans-serif';
  ctx.fillText('P to resume · R to restart · M to mute', W / 2, 288);
  ctx.restore();
}
