// Hazards, collectibles and the spawn director for Turkey Run!
// One job: what stands between the turkey and the forest gate, and when.

import {
  GROUND_Y, HAZARDS, STAGE_HAZARDS, COLLECTIBLES, PALETTE, VIEW_W,
} from './config.js';

export class ObstacleField {
  constructor(rng) {
    this.rng = rng;
    this.items = []; // {kind, x, y, w, h, ...}
    this.nextSpawnAt = 320; // distance (m) of the next hazard cluster
    this.nextCornAt = 40;
  }

  reset() {
    this.items = [];
    this.nextSpawnAt = 320;
    this.nextCornAt = 40;
  }

  // distance in metres, speed in px/s. Spawns ahead of the right edge.
  update(dt, distance, speed, stage) {
    const pxPerMetre = 6;
    for (const it of this.items) it.x -= speed * dt;
    // Swinging knives pivot; rolling pins roll toward the player.
    for (const it of this.items) {
      if (it.kind === 'knife') it.swing += dt * it.swingSpeed;
      if (it.kind === 'pin') it.x -= 60 * dt;
    }
    this.items = this.items.filter((it) => it.x > -160);

    // Hazard clusters get denser and closer together as stages advance.
    const stageIndex = stage.id === 'farmyard' ? 0 : stage.id === 'barn' ? 1 : 2;
    const gapBase = [150, 115, 90][stageIndex];
    while (distance * pxPerMetre + VIEW_W + 240 > this.nextSpawnAt * pxPerMetre) {
      this.spawnCluster(this.nextSpawnAt, stage);
      this.nextSpawnAt += this.rng.range(gapBase * 0.8, gapBase * 1.5);
    }
    while (distance * pxPerMetre + VIEW_W + 240 > this.nextCornAt * pxPerMetre) {
      this.spawnCorn(this.nextCornAt, stage);
      this.nextCornAt += this.rng.range(55, 130);
    }
  }

  spawnCluster(atMetres, stage) {
    const table = STAGE_HAZARDS[stage.id];
    const kind = this.rng.weighted(table);
    const x = VIEW_W + 80 + this.rng.range(0, 140);
    if (kind === 'mud') {
      this.items.push({ kind: 'mud', x, y: GROUND_Y - 8, w: 90, h: 16, mud: true });
      return;
    }
    if (kind === 'knife') {
      this.items.push({
        kind, x, y: GROUND_Y, w: HAZARDS.knife.w, h: HAZARDS.knife.h,
        swing: this.rng.range(0, Math.PI), swingSpeed: this.rng.range(2.2, 3.4),
      });
      return;
    }
    const def = HAZARDS[kind];
    this.items.push({ kind, x, y: GROUND_Y, w: def.w, h: def.h });
    // Sometimes a second hazard right behind the first, for a double jump.
    if (this.rng.chance(0.28) && kind !== 'oven') {
      const kind2 = this.rng.weighted(table);
      if (kind2 !== 'mud' && kind2 !== 'knife') {
        const d2 = HAZARDS[kind2];
        this.items.push({ kind: kind2, x: x + def.w + this.rng.range(70, 110), y: GROUND_Y, w: d2.w, h: d2.h });
      }
    }
  }

  spawnCorn(atMetres, stage) {
    const x = VIEW_W + 80 + this.rng.range(0, 120);
    const roll = this.rng.next();
    if (roll < 0.12) {
      // Rare golden feather, high up: jump for it.
      this.items.push({ kind: 'feather', x, y: GROUND_Y - 170, w: 34, h: 30, bob: this.rng.range(0, 6) });
    } else if (roll < 0.2) {
      // Pumpkin pie: a heart, sitting on the ground.
      this.items.push({ kind: 'pie', x, y: GROUND_Y - 26, w: 40, h: 26, bob: 0 });
    } else {
      // A little arc of corn, three kernels to hop through.
      const high = this.rng.chance(0.4);
      for (let i = 0; i < 3; i++) {
        this.items.push({
          kind: 'corn', x: x + i * 34, y: high ? GROUND_Y - 150 : GROUND_Y - 46,
          w: 28, h: 30, bob: i * 1.3,
        });
      }
    }
  }

  // The turkey's box vs every solid thing. Returns the first hit, or null.
  // Mud only slows; it never hurts.
  hitTest(box) {
    for (const it of this.items) {
      if (it.kind === 'corn' || it.kind === 'feather' || it.kind === 'pie' || it.kind === 'mud') continue;
      const hb = this.hazardBox(it);
      if (box.x < hb.x + hb.w && box.x + box.w > hb.x &&
          box.y < hb.y + hb.h && box.y + box.h > hb.y) {
        return it;
      }
    }
    return null;
  }

  hazardBox(it) {
    if (it.kind === 'knife') {
      // The blade swings; its box follows the swing angle.
      const tip = Math.sin(it.swing) * 46;
      return { x: it.x - 12 + tip * 0.4, y: GROUND_Y - 108, w: 26, h: 108 };
    }
    return { x: it.x, y: it.y - it.h, w: it.w, h: it.h };
  }

  // Collect anything the turkey's box touches. Returns list of taken items.
  collect(box) {
    const taken = [];
    this.items = this.items.filter((it) => {
      if (it.kind !== 'corn' && it.kind !== 'feather' && it.kind !== 'pie') return true;
      const b = { x: it.x - it.w / 2, y: it.y - it.h / 2, w: it.w, h: it.h };
      const hit = box.x < b.x + b.w && box.x + box.w > b.x &&
        box.y < b.y + b.h && box.y + box.h > b.y;
      if (hit) taken.push(it);
      return !hit;
    });
    return taken;
  }

  inMud(box) {
    for (const it of this.items) {
      if (it.kind !== 'mud') continue;
      if (box.x + box.w > it.x && box.x < it.x + it.w) return true;
    }
    return false;
  }

  // Remove a hazard the turkey just stumbled on, so it is not hit twice.
  remove(it) {
    const i = this.items.indexOf(it);
    if (i >= 0) this.items.splice(i, 1);
  }

  draw(ctx, time) {
    for (const it of this.items) {
      if (it.kind === 'corn') this.drawCorn(ctx, it, time);
      else if (it.kind === 'feather') this.drawFeather(ctx, it, time);
      else if (it.kind === 'pie') this.drawPie(ctx, it, time);
      else if (it.kind === 'mud') this.drawMud(ctx, it);
      else if (it.kind === 'fence') this.drawFence(ctx, it);
      else if (it.kind === 'hay') this.drawHay(ctx, it);
      else if (it.kind === 'crate') this.drawCrate(ctx, it);
      else if (it.kind === 'pitchfork') this.drawPitchfork(ctx, it);
      else if (it.kind === 'oven') this.drawOven(ctx, it, time);
      else if (it.kind === 'knife') this.drawKnife(ctx, it);
      else if (it.kind === 'pin') this.drawPin(ctx, it, time);
    }
  }

  drawCorn(ctx, it, time) {
    const y = it.y + Math.sin(time * 3 + it.bob) * 4;
    ctx.save();
    ctx.translate(it.x, y);
    ctx.fillStyle = PALETTE.cornYellow;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a91c';
    for (let r = -1; r <= 1; r++) {
      ctx.beginPath();
      ctx.ellipse(r * 5, 0, 2.4, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#4e8a2f';
    ctx.beginPath();
    ctx.ellipse(0, -15, 5, 7, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawFeather(ctx, it, time) {
    const y = it.y + Math.sin(time * 3 + it.bob) * 5;
    ctx.save();
    ctx.translate(it.x, y);
    ctx.rotate(Math.sin(time * 2) * 0.15);
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 16, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(-4, -14);
    ctx.stroke();
    ctx.restore();
  }

  drawPie(ctx, it) {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.fillStyle = '#e8912d';
    ctx.beginPath();
    ctx.moveTo(-20, 10);
    ctx.lineTo(20, 10);
    ctx.lineTo(14, -8);
    ctx.lineTo(-14, -8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7c873';
    ctx.beginPath();
    ctx.ellipse(0, -8, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(0, -12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawMud(ctx, it) {
    ctx.fillStyle = '#6e4a22';
    ctx.beginPath();
    ctx.ellipse(it.x + it.w / 2, GROUND_Y - 4, it.w / 2, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a6236';
    ctx.beginPath();
    ctx.ellipse(it.x + it.w / 2 - 14, GROUND_Y - 5, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFence(ctx, it) {
    const top = GROUND_Y - it.h;
    ctx.fillStyle = '#8a6236';
    ctx.fillRect(it.x + 2, top, 7, it.h);
    ctx.fillRect(it.x + it.w - 9, top, 7, it.h);
    ctx.fillStyle = '#a9743a';
    ctx.fillRect(it.x - 4, top + 8, it.w + 8, 9);
    ctx.fillRect(it.x - 4, top + 38, it.w + 8, 9);
  }

  drawHay(ctx, it) {
    const top = GROUND_Y - it.h;
    ctx.fillStyle = '#d9a44a';
    ctx.beginPath();
    ctx.arc(it.x + it.w / 2, GROUND_Y - 6, it.w / 2, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#b57e2e';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(it.x + it.w / 2, GROUND_Y - 6, it.w / 2 - 8 - Math.abs(i) * 3, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
  }

  drawCrate(ctx, it) {
    const top = GROUND_Y - it.h;
    ctx.fillStyle = '#9c6a34';
    ctx.fillRect(it.x, top, it.w, it.h);
    ctx.strokeStyle = '#6e4a22';
    ctx.lineWidth = 3;
    ctx.strokeRect(it.x + 2, top + 2, it.w - 4, it.h - 4);
    ctx.beginPath();
    ctx.moveTo(it.x, top);
    ctx.lineTo(it.x + it.w, GROUND_Y);
    ctx.moveTo(it.x + it.w, top);
    ctx.lineTo(it.x, GROUND_Y);
    ctx.stroke();
  }

  drawPitchfork(ctx, it) {
    const top = GROUND_Y - it.h;
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(it.x + it.w / 2, GROUND_Y);
    ctx.lineTo(it.x + it.w / 2, top + 16);
    ctx.stroke();
    ctx.strokeStyle = '#c9c9c9';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(it.x + it.w / 2 + i * 7, top + 16);
      ctx.lineTo(it.x + it.w / 2 + i * 7, top);
      ctx.stroke();
    }
  }

  drawOven(ctx, it, time) {
    const top = GROUND_Y - it.h;
    const glow = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.fillStyle = PALETTE.ovenBody;
    ctx.fillRect(it.x, top, it.w, it.h);
    ctx.fillStyle = PALETTE.ovenDoor;
    ctx.fillRect(it.x + 10, top + 34, it.w - 20, 52);
    ctx.fillStyle = `rgba(255,${Math.floor(120 + glow * 80)},30,${0.5 + glow * 0.4})`;
    ctx.fillRect(it.x + 16, top + 42, it.w - 32, 36);
    ctx.fillStyle = '#3a3a40';
    ctx.fillRect(it.x + 6, top + 6, it.w - 12, 14);
    ctx.fillStyle = '#d43d2a';
    ctx.beginPath();
    ctx.arc(it.x + 20, top + 13, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT!', it.x + it.w / 2, top + 100);
  }

  drawKnife(ctx, it) {
    const angle = Math.sin(it.swing) * 0.85;
    ctx.save();
    ctx.translate(it.x + 12, GROUND_Y - 108);
    ctx.rotate(angle);
    // Rope from the ceiling hook
    ctx.strokeStyle = '#6e4a22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 18);
    ctx.stroke();
    // Handle
    ctx.fillStyle = PALETTE.knifeHandle;
    ctx.fillRect(-6, 16, 12, 26);
    // Blade
    ctx.fillStyle = PALETTE.knifeBlade;
    ctx.beginPath();
    ctx.moveTo(-11, 42);
    ctx.lineTo(11, 42);
    ctx.lineTo(0, 96);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9aa5ab';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 46);
    ctx.lineTo(0, 88);
    ctx.stroke();
    ctx.restore();
  }

  drawPin(ctx, it, time) {
    const y = GROUND_Y - it.h / 2;
    ctx.save();
    ctx.translate(it.x + it.w / 2, y);
    ctx.rotate(time * 6);
    ctx.fillStyle = '#d9b48a';
    ctx.fillRect(-26, -10, 52, 20);
    ctx.fillStyle = '#b98d5e';
    ctx.beginPath();
    ctx.arc(-28, 0, 7, 0, Math.PI * 2);
    ctx.arc(28, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
