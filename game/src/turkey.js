// Tilly the turkey: physics, animation and original canvas art.
// One job: the player character — how she moves and how she looks.

import { GRAVITY, GROUND_Y, JUMP_VELOCITY, PLAYER_X, DASH_TIME, PALETTE } from './config.js';

export class Turkey {
  constructor() {
    this.x = PLAYER_X;
    this.y = GROUND_Y;
    this.vy = 0;
    this.onGround = true;
    this.sliding = false;
    this.dashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.runPhase = 0;
    this.blink = 0;
    this.stumbleTimer = 0;
  }

  reset() {
    this.y = GROUND_Y;
    this.vy = 0;
    this.onGround = true;
    this.sliding = false;
    this.dashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.runPhase = 0;
    this.stumbleTimer = 0;
  }

  // Collision box: smaller than the art so near-misses feel fair.
  box() {
    if (this.sliding) return { x: this.x - 34, y: this.y - 34, w: 68, h: 34 };
    return { x: this.x - 26, y: this.y - 66, w: 52, h: 66 };
  }

  jump() {
    if (!this.onGround) return false;
    this.vy = JUMP_VELOCITY;
    this.onGround = false;
    this.sliding = false;
    return true;
  }

  dash() {
    if (this.dashCooldown > 0 || this.dashing) return false;
    this.dashing = true;
    this.dashTimer = DASH_TIME;
    this.dashCooldown = 2.2;
    return true;
  }

  update(dt, speed, wantSlide) {
    this.runPhase += dt * (speed / 28);
    this.blink = Math.max(0, this.blink - dt);
    if (this.stumbleTimer > 0) this.stumbleTimer -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.dashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) this.dashing = false;
    }
    this.sliding = wantSlide && this.onGround && !this.dashing;

    if (!this.onGround) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }

  draw(ctx, time) {
    const bob = this.onGround ? Math.sin(this.runPhase * 2) * 3 : 0;
    const squash = this.sliding ? 0.62 : (this.dashing ? 0.9 : 1);
    const stretch = this.sliding ? 1.25 : (this.onGround ? 1 : 1.12);
    ctx.save();
    ctx.translate(this.x, this.y + bob);
    if (this.stumbleTimer > 0 && Math.floor(time * 14) % 2 === 0) ctx.globalAlpha = 0.45;
    ctx.scale(stretch, squash);

    const legSwing = this.onGround ? Math.sin(this.runPhase * 2) * 10 : 6;
    // Legs
    ctx.strokeStyle = '#e8912d';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -26);
    ctx.lineTo(-8 + legSwing, 0);
    ctx.moveTo(8, -26);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();
    // Tail feathers: a fan of five, each a different autumn shade.
    const tailColors = ['#a06a30', '#c97e2e', '#e8c98a', '#8a5a2b', '#d43d2a'];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.42;
      ctx.save();
      ctx.translate(-26, -52);
      ctx.rotate(a + Math.PI / 2 - 0.5);
      ctx.fillStyle = tailColors[i];
      ctx.beginPath();
      ctx.ellipse(0, -26, 9, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.featherCream;
      ctx.beginPath();
      ctx.ellipse(0, -40, 4, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Body
    ctx.fillStyle = PALETTE.turkeyBody;
    ctx.beginPath();
    ctx.ellipse(0, -42, 30, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.turkeyLight;
    ctx.beginPath();
    ctx.ellipse(6, -36, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wing
    const wingFlap = this.onGround ? Math.sin(this.runPhase * 2) * 0.15 : -0.5;
    ctx.save();
    ctx.translate(2, -46);
    ctx.rotate(wingFlap);
    ctx.fillStyle = PALETTE.turkeyDark;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 11, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Neck and head
    ctx.strokeStyle = PALETTE.turkeyDark;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(20, -58);
    ctx.quadraticCurveTo(30, -72, 28, -84);
    ctx.stroke();
    ctx.fillStyle = PALETTE.turkeyHead;
    ctx.beginPath();
    ctx.arc(28, -88, 13, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = PALETTE.beak;
    ctx.beginPath();
    ctx.moveTo(38, -90);
    ctx.lineTo(52, -86);
    ctx.lineTo(38, -82);
    ctx.closePath();
    ctx.fill();
    // Wattle
    ctx.fillStyle = PALETTE.wattle;
    ctx.beginPath();
    ctx.ellipse(38, -78, 4, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Eye (blinks now and then)
    ctx.fillStyle = '#241a10';
    ctx.beginPath();
    ctx.arc(31, -91, this.blink > 0 ? 1 : 2.6, 0, Math.PI * 2);
    ctx.fill();
    // Snood
    ctx.strokeStyle = PALETTE.wattle;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(32, -98);
    ctx.quadraticCurveTo(36, -104, 34, -108);
    ctx.stroke();
    ctx.restore();
  }
}
