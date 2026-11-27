// Farmer Jed: the chaser. Gap 0..100 (100 = far behind, safe).
// One job: the pursuit pressure — how close he gets, and how he looks.

import { GROUND_Y, PALETTE } from './config.js';

export class Farmer {
  constructor() {
    this.gap = 100; // starts far behind
    this.runPhase = 0;
    this.shoutTimer = 0;
    this.angry = false;
  }

  reset() {
    this.gap = 100;
    this.shoutTimer = 0;
    this.angry = false;
  }

  // Called every frame: the gap drifts toward the player when they stumble
  // or dawdle, and opens up when they run clean and grab corn.
  update(dt, speed, stageIndex) {
    this.runPhase += dt * (speed / 24);
    // Base pressure: later stages, he runs faster.
    const pressure = 1.6 + stageIndex * 0.9;
    this.gap -= pressure * dt;
    if (this.gap < 28 && this.shoutTimer <= 0) {
      this.shoutTimer = 1.6;
      this.angry = true;
    }
    if (this.shoutTimer > 0) this.shoutTimer -= dt;
    else this.angry = false;
    if (this.gap < 0) this.gap = 0;
    if (this.gap > 100) this.gap = 100;
  }

  stumbleHit() { this.gap -= 22; }
  reward(amount) { this.gap = Math.min(100, this.gap + amount); }
  dashBonus() { this.gap = Math.min(100, this.gap + 4); }

  caught() { return this.gap <= 0; }

  // Screen x of the farmer's feet: off-screen left while the gap is wide,
  // creeping in as it closes, right behind the turkey at gap 0.
  screenX(playerX) {
    const t = 1 - this.gap / 100;
    return -90 + t * (playerX - 40 + 90);
  }

  draw(ctx, playerX, time) {
    const x = this.screenX(playerX);
    if (x < -100) return; // too far behind to see
    const legSwing = Math.sin(this.runPhase * 2) * 12;
    const bob = Math.abs(Math.sin(this.runPhase * 2)) * 4;
    ctx.save();
    ctx.translate(x, GROUND_Y - bob);
    if (this.angry && Math.floor(time * 10) % 2 === 0) {
      ctx.shadowColor = '#d43d2a';
      ctx.shadowBlur = 18;
    }
    // Legs (overalls)
    ctx.strokeStyle = PALETTE.farmerOveralls;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -52);
    ctx.lineTo(-8 + legSwing, 0);
    ctx.moveTo(8, -52);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();
    // Body: checked shirt
    ctx.fillStyle = PALETTE.farmerShirt;
    ctx.fillRect(-20, -96, 40, 48);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 12, -96);
      ctx.lineTo(i * 12, -48);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-20, -72);
    ctx.lineTo(20, -72);
    ctx.stroke();
    // Overalls straps
    ctx.strokeStyle = PALETTE.farmerOveralls;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-12, -96);
    ctx.lineTo(-12, -72);
    ctx.moveTo(12, -96);
    ctx.lineTo(12, -72);
    ctx.stroke();
    // Arm reaching forward, pitchfork in hand
    ctx.strokeStyle = PALETTE.farmerSkin;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(14, -88);
    ctx.lineTo(40, -70);
    ctx.stroke();
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(38, -110);
    ctx.lineTo(46, -44);
    ctx.stroke();
    ctx.strokeStyle = '#c9c9c9';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(38 + i * 5, -110);
      ctx.lineTo(38 + i * 5, -124);
      ctx.stroke();
    }
    // Head
    ctx.fillStyle = PALETTE.farmerSkin;
    ctx.beginPath();
    ctx.arc(0, -112, 15, 0, Math.PI * 2);
    ctx.fill();
    // Straw hat
    ctx.fillStyle = PALETTE.farmerHat;
    ctx.beginPath();
    ctx.ellipse(0, -122, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -126, 13, 8, 0, Math.PI, 0);
    ctx.fill();
    // Angry brows + moustache
    ctx.strokeStyle = '#4a2f14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -118);
    ctx.lineTo(-3, -114);
    ctx.moveTo(10, -118);
    ctx.lineTo(3, -114);
    ctx.stroke();
    ctx.fillStyle = '#4a2f14';
    ctx.fillRect(-8, -104, 16, 4);
    // Shout bubble when he is close
    if (this.angry) {
      ctx.fillStyle = '#fff8e6';
      ctx.strokeStyle = '#7a4a1f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x + 18, GROUND_Y - 190, 150, 34, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7a2a12';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('COME BACK HERE!', x + 28, GROUND_Y - 172);
    }
    ctx.restore();
  }
}
