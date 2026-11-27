// Parallax scenery for Turkey Run!: sky, hills, farm / barn / kitchen backdrops.
// One job: the world behind the turkey — a different scene per stage.

import { GROUND_Y, VIEW_H, VIEW_W } from './config.js';

export class World {
  constructor(rng) {
    this.rng = rng;
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: rng.range(0, VIEW_W), y: rng.range(30, 130),
        s: rng.range(0.7, 1.4), v: rng.range(4, 10),
      });
    }
    this.leaves = [];
    for (let i = 0; i < 26; i++) {
      this.leaves.push({
        x: rng.range(0, VIEW_W), y: rng.range(0, VIEW_H),
        s: rng.range(2, 5), v: rng.range(14, 40), sway: rng.range(0, 6.28),
        c: ['#d43d2a', '#e8912d', '#c97e2e', '#8a5a2b'][i % 4],
      });
    }
  }

  draw(ctx, stage, distance, time) {
    const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    grad.addColorStop(0, stage.skyTop);
    grad.addColorStop(1, stage.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_W, GROUND_Y);

    // Sun
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(830, 70, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,243,196,0.35)';
    ctx.beginPath();
    ctx.arc(830, 70, 48, 0, Math.PI * 2);
    ctx.fill();

    // Clouds drift slowly.
    ctx.fillStyle = 'rgba(255,250,235,0.9)';
    for (const c of this.clouds) {
      const x = ((c.x - distance * 2 + time * c.v) % (VIEW_W + 160) + VIEW_W + 160) % (VIEW_W + 160) - 80;
      ctx.beginPath();
      ctx.ellipse(x, c.y, 42 * c.s, 16 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 30 * c.s, c.y + 4, 30 * c.s, 13 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(x - 30 * c.s, c.y + 5, 26 * c.s, 12 * c.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (stage.id === 'kitchen') this.drawKitchenBackdrop(ctx, distance);
    else this.drawOutdoorBackdrop(ctx, stage, distance);

    // Ground
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    ctx.fillStyle = stage.groundTop;
    ctx.fillRect(0, GROUND_Y, VIEW_W, 10);
    // Scattered pumpkins and grass tufts on the ground line.
    ctx.fillStyle = '#c96a1e';
    for (let i = 0; i < 8; i++) {
      const wx = i * 137 + 40;
      const x = ((wx - distance * 6 * 2) % (VIEW_W + 160) + VIEW_W + 160) % (VIEW_W + 160) - 80;
      ctx.beginPath();
      ctx.ellipse(x, GROUND_Y + 46, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a4a10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + 34);
      ctx.lineTo(x + 2, GROUND_Y + 28);
      ctx.stroke();
    }

    // Falling autumn leaves in front of the scene.
    for (const leaf of this.leaves) {
      const y = (leaf.y + time * leaf.v) % (VIEW_H + 20);
      const x = leaf.x + Math.sin(time * 1.5 + leaf.sway) * 18 - (distance * 6 * 0.15) % VIEW_W;
      const lx = ((x % (VIEW_W + 20)) + VIEW_W + 20) % (VIEW_W + 20) - 10;
      ctx.save();
      ctx.translate(lx, y);
      ctx.rotate(time + leaf.sway);
      ctx.fillStyle = leaf.c;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.s, leaf.s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawOutdoorBackdrop(ctx, stage, distance) {
    // Far hills
    ctx.fillStyle = stage.hillFar;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = 0; x <= VIEW_W; x += 60) {
      const wx = x + distance * 6 * 0.3;
      ctx.lineTo(x, GROUND_Y - 70 - Math.sin(wx * 0.008) * 34);
    }
    ctx.lineTo(VIEW_W, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    // Near hill with trees / fence line
    ctx.fillStyle = stage.hill;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = 0; x <= VIEW_W; x += 60) {
      const wx = x + distance * 6 * 0.6;
      ctx.lineTo(x, GROUND_Y - 26 - Math.sin(wx * 0.011 + 2) * 16);
    }
    ctx.lineTo(VIEW_W, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    if (stage.id === 'farmyard') {
      // The farmhouse, far behind the start line.
      const hx = 700 - distance * 6 * 0.6;
      if (hx > -220 && hx < VIEW_W + 40) this.drawFarmhouse(ctx, hx);
      // Windmill in the distance.
      const wx = 180 - distance * 6 * 0.3;
      if (wx > -120 && wx < VIEW_W + 40) this.drawWindmill(ctx, wx);
    } else if (stage.id === 'barn') {
      // The big red barn you are running through.
      const bx = 620 - (distance - 300) * 6 * 0.6;
      if (bx > -320 && bx < VIEW_W + 40) this.drawBarn(ctx, bx);
    }
  }

  drawFarmhouse(ctx, x) {
    const base = GROUND_Y - 26;
    ctx.fillStyle = '#f2e3c2';
    ctx.fillRect(x, base - 110, 170, 110);
    ctx.fillStyle = '#a03d2a';
    ctx.beginPath();
    ctx.moveTo(x - 12, base - 110);
    ctx.lineTo(x + 85, base - 158);
    ctx.lineTo(x + 182, base - 110);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5d3a17';
    ctx.fillRect(x + 70, base - 62, 30, 62);
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(x + 18, base - 92, 30, 26);
    ctx.fillRect(x + 122, base - 92, 30, 26);
    ctx.fillStyle = '#7a4a1f';
    ctx.fillRect(x + 30, base - 92, 4, 26);
    ctx.fillRect(x + 134, base - 92, 4, 26);
  }

  drawWindmill(ctx, x) {
    const base = GROUND_Y - 26;
    ctx.fillStyle = '#c9b18a';
    ctx.beginPath();
    ctx.moveTo(x - 26, base);
    ctx.lineTo(x - 14, base - 150);
    ctx.lineTo(x + 14, base - 150);
    ctx.lineTo(x + 26, base);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.translate(x, base - 150);
    ctx.rotate(0.5);
    ctx.fillStyle = '#8a6a3a';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, -64);
      ctx.lineTo(-8, -64);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawBarn(ctx, x) {
    const base = GROUND_Y - 26;
    ctx.fillStyle = '#a03d2a';
    ctx.fillRect(x, base - 150, 260, 150);
    ctx.fillStyle = '#7c2e1e';
    ctx.beginPath();
    ctx.moveTo(x - 14, base - 150);
    ctx.lineTo(x + 130, base - 210);
    ctx.lineTo(x + 274, base - 150);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7c2e1e';
    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 52, base - 150);
      ctx.lineTo(x + i * 52, base);
      ctx.stroke();
    }
    ctx.fillStyle = '#5d3a17';
    ctx.fillRect(x + 100, base - 96, 60, 96);
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 100, base - 96);
    ctx.lineTo(x + 160, base);
    ctx.moveTo(x + 160, base - 96);
    ctx.lineTo(x + 100, base);
    ctx.stroke();
  }

  drawKitchenBackdrop(ctx, distance) {
    // Tiled kitchen wall, window with the farm outside, hanging pots.
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
    ctx.strokeStyle = 'rgba(122,74,31,0.25)';
    ctx.lineWidth = 2;
    for (let y = 0; y < GROUND_Y; y += 46) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIEW_W, y);
      ctx.stroke();
    }
    for (let x = 0; x < VIEW_W; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
    }
    // Window: the farm you are running from, still visible.
    const wx = 640 - (distance - 650) * 6 * 0.4;
    const winX = ((wx % (VIEW_W + 420)) + VIEW_W + 420) % (VIEW_W + 420) - 210;
    ctx.fillStyle = '#f9b95c';
    ctx.fillRect(winX, 60, 170, 130);
    ctx.fillStyle = '#c98f3d';
    ctx.beginPath();
    ctx.moveTo(winX, 190);
    ctx.lineTo(winX + 85, 130);
    ctx.lineTo(winX + 170, 190);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7a4a1f';
    ctx.lineWidth = 6;
    ctx.strokeRect(winX, 60, 170, 130);
    ctx.beginPath();
    ctx.moveTo(winX + 85, 60);
    ctx.lineTo(winX + 85, 190);
    ctx.stroke();
    // Hanging copper pots.
    for (let i = 0; i < 4; i++) {
      const px = 90 + i * 220 - ((distance * 6 * 0.5) % 220);
      ctx.strokeStyle = '#6e4a22';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, 34);
      ctx.stroke();
      ctx.fillStyle = '#b87333';
      ctx.beginPath();
      ctx.arc(px, 56, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a5a24';
      ctx.beginPath();
      ctx.arc(px, 56, 13, 0, Math.PI * 2);
      ctx.fill();
    }
    // The dreaded oven range along the back wall.
    ctx.fillStyle = '#5e5e66';
    ctx.fillRect(0, GROUND_Y - 120, VIEW_W, 120);
    ctx.fillStyle = '#3a3a40';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(30 + i * 190, GROUND_Y - 96, 150, 60);
    }
  }
}
