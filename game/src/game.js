// Game state machine, loop, collisions and scoring for Turkey Run!
// One job: tie the turkey, the farmer, the obstacles and the world together.

import {
  BASE_SPEED, DASH_SPEED_BONUS, GOAL_DISTANCE, GROUND_Y, HAZARDS,
  MAX_SPEED, PX_PER_METRE, START_LIVES, VIEW_H, VIEW_W, stageFor,
} from './config.js';
import { makeRng } from './random.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { ObstacleField } from './obstacles.js';
import { World } from './world.js';
import { drawHUD, drawTitle, drawPaused, drawCaught, drawEscaped, hitButton } from './hud.js';
import { SoundBank } from './audio.js';

export class Game {
  constructor(canvas, input, seed = 20261128) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = input;
    this.sound = new SoundBank();
    this.seed = seed;
    this.rng = makeRng(seed);
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.field = new ObstacleField(this.rng);
    this.world = new World(this.rng);
    this.state = 'title';
    this.time = 0;
    this.distance = 0;
    this.score = 0;
    this.lives = START_LIVES;
    this.best = 0;
    this.corn = 0;
    this.speed = BASE_SPEED;
    this.speedBurst = 0;
    this.shake = 0;
    this.particles = [];
    this.stageIndex = 0;
    this.escapedAt = 0;
  }

  start() {
    this.rng = makeRng(this.seed + Math.floor(this.time * 1000) % 97);
    this.turkey.reset();
    this.farmer.reset();
    this.field = new ObstacleField(this.rng);
    this.world = new World(this.rng);
    this.state = 'playing';
    this.distance = 0;
    this.score = 0;
    this.lives = START_LIVES;
    this.corn = 0;
    this.speed = BASE_SPEED;
    this.speedBurst = 0;
    this.shake = 0;
    this.particles = [];
    this.stageIndex = 0;
    this.sound.unlock();
    this.sound.startMusic();
    this.sound.gobble();
  }

  burst(x, y, color, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = this.rng.range(0, Math.PI * 2);
      const v = this.rng.range(60, 260);
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80,
        life: this.rng.range(0.4, 0.9), max: 0.9, color, size: this.rng.range(2, 5),
      });
    }
  }

  stumble(hit) {
    this.lives -= 1;
    this.farmer.stumbleHit();
    this.turkey.stumbleTimer = 0.9;
    this.shake = 0.45;
    this.sound.thud();
    this.sound.gobble();
    this.burst(this.turkey.x, this.turkey.y - 40, '#e8c98a', 18);
    this.burst(this.turkey.x, this.turkey.y - 40, '#a06a30', 10);
    if (hit) this.field.remove(hit);
    if (this.lives <= 0) this.endCaught();
    else if (this.farmer.caught()) this.endCaught();
  }

  endCaught() {
    this.state = 'caught';
    if (this.score > this.best) this.best = Math.floor(this.score);
    this.sound.stopMusic();
    this.sound.lose();
    this.sound.yell();
  }

  endEscaped() {
    this.state = 'escaped';
    this.score += this.lives * 250;
    if (this.score > this.best) this.best = Math.floor(this.score);
    this.sound.stopMusic();
    this.sound.winFanfare();
    for (let i = 0; i < 5; i++) {
      this.burst(this.turkey.x + this.rng.range(-60, 60), GROUND_Y - this.rng.range(60, 200), '#ffd23e', 12);
    }
  }

  update(dt) {
    this.time += dt;
    if (this.shake > 0) this.shake -= dt;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    if (this.state === 'title') {
      this.turkey.update(dt, 0, false);
      this.turkey.blink = this.rng.chance(0.01) ? 0.12 : this.turkey.blink;
      const click = this.input.takeClick();
      if (this.input.takeJump() || (click && hitButton('start', click))) {
        this.input.clearQueues();
        this.start();
      }
      if (this.input.takeMute()) this.toggleMute();
      return;
    }

    if (this.state === 'paused') {
      const click = this.input.takeClick();
      if (this.input.takePause() || click) {
        this.state = 'playing';
        this.input.clearQueues();
      }
      return;
    }

    if (this.state === 'caught' || this.state === 'escaped') {
      const click = this.input.takeClick();
      const btn = this.state === 'caught' ? 'restart' : 'again';
      if (this.input.takeRestart() || this.input.takeJump() || (click && hitButton(btn, click))) {
        this.input.clearQueues();
        this.start();
      }
      return;
    }

    // ---- playing ----
    if (this.input.takePause()) {
      this.state = 'paused';
      this.input.clearQueues();
      return;
    }
    if (this.input.takeMute()) this.toggleMute();
    const click = this.input.takeClick();
    if (click) {
      if (hitButton('mute', click)) this.toggleMute();
      else if (hitButton('pause', click)) { this.state = 'paused'; return; }
    }

    const stage = stageFor(this.distance);
    this.stageIndex = stage.id === 'farmyard' ? 0 : stage.id === 'barn' ? 1 : 2;

    let target = Math.min(MAX_SPEED, BASE_SPEED + this.distance * 0.32);
    if (this.speedBurst > 0) { target += 120; this.speedBurst -= dt; }
    if (this.turkey.dashing) target += DASH_SPEED_BONUS;
    const box = this.turkey.box();
    if (this.field.inMud(box)) target *= 0.55;
    this.speed = target;

    if (this.input.takeJump()) {
      if (this.turkey.jump()) this.sound.jump();
    }
    if (this.input.takeDash()) {
      if (this.turkey.dash()) {
        this.sound.dash();
        this.farmer.dashBonus();
      }
    }

    this.turkey.update(dt, this.speed, this.input.sliding());
    this.distance += (this.speed * dt) / PX_PER_METRE;
    this.score += (this.speed * dt) / PX_PER_METRE * 2;
    this.farmer.update(dt, this.speed, this.stageIndex);
    this.field.update(dt, this.distance, this.speed, stage);

    // Hazard cleared: points for every danger you get past.
    for (const it of this.field.items) {
      if (!it.counted && HAZARDS[it.kind] && it.x + it.w < this.turkey.x - 40) {
        it.counted = true;
        this.score += HAZARDS[it.kind].score;
      }
    }

    // Collectibles.
    for (const it of this.field.collect(this.turkey.box())) {
      if (it.kind === 'corn') {
        this.score += 50;
        this.corn += 1;
        this.farmer.reward(6);
        this.sound.coin();
        this.burst(it.x, it.y, '#ffd23e', 8);
      } else if (it.kind === 'feather') {
        this.score += 150;
        this.farmer.reward(10);
        this.turkey.dashCooldown = 0;
        this.speedBurst = 1.2;
        this.sound.feather();
        this.burst(it.x, it.y, '#ffc93c', 14);
      } else if (it.kind === 'pie') {
        this.score += 100;
        this.lives = Math.min(3, this.lives + 1);
        this.farmer.reward(4);
        this.sound.coin();
        this.burst(it.x, it.y, '#e8912d', 10);
      }
    }

    // Hit a hazard: lose a heart, Jed closes in.
    const hit = this.field.hitTest(this.turkey.box());
    if (hit && this.turkey.stumbleTimer <= 0) this.stumble(hit);

    if (this.farmer.caught() && this.state === 'playing') this.endCaught();
    if (this.distance >= GOAL_DISTANCE && this.state === 'playing') {
      this.distance = GOAL_DISTANCE;
      this.endEscaped();
    }
  }

  toggleMute() {
    this.sound.unlock();
    this.sound.setMuted(!this.sound.muted);
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0) {
      const s = this.shake * 22;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }
    const stage = stageFor(this.distance);
    this.world.draw(ctx, stage, this.distance, this.time);
    this.field.draw(ctx, this.time);
    if (this.state !== 'title') this.farmer.draw(ctx, this.turkey.x, this.time);
    // The forest gate at the end of the run.
    if (this.distance > GOAL_DISTANCE - 90) {
      const gateX = VIEW_W + (GOAL_DISTANCE - this.distance) * PX_PER_METRE * 1.6;
      ctx.save();
      ctx.fillStyle = '#4e8a2f';
      ctx.fillRect(gateX, GROUND_Y - 150, 14, 150);
      ctx.fillRect(gateX + 120, GROUND_Y - 150, 14, 150);
      ctx.fillStyle = '#6aa844';
      ctx.fillRect(gateX, GROUND_Y - 150, 134, 16);
      ctx.fillStyle = '#fff8e6';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FOREST — FREEDOM!', gateX + 67, GROUND_Y - 162);
      ctx.restore();
    }
    this.turkey.draw(ctx, this.time);
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    const hudState = {
      score: Math.floor(this.score),
      distance: this.distance,
      lives: this.lives,
      best: this.best,
      stageName: stage.name,
      farmerGap: Math.round(this.farmer.gap),
      dashReady: this.turkey.dashCooldown <= 0 ? 1 : 1 - this.turkey.dashCooldown / 2.2,
      muted: this.sound.muted,
      corn: this.corn,
    };
    if (this.state === 'playing' || this.state === 'paused') drawHUD(ctx, hudState);
    if (this.state === 'title') drawTitle(ctx, hudState, this.time);
    if (this.state === 'paused') drawPaused(ctx);
    if (this.state === 'caught') drawCaught(ctx, hudState);
    if (this.state === 'escaped') drawEscaped(ctx, hudState);
  }

  // ---- screenshot scenes: fixed, deterministic states of the real game ----
  shot(mode, seed) {
    this.seed = seed;
    if (mode === 'title') {
      this.state = 'title';
      return;
    }
    this.start();
    if (mode === 'play') {
      this.fastForward(7, true); // ~420 m, mid-run in the barn stage
      return;
    }
    if (mode === 'caught') {
      this.fastForward(6, true); // ~350 m, then Jed catches her
      this.lives = 1;
      this.farmer.gap = 2;
      this.stumble(this.field.items.find((it) => HAZARDS[it.kind]) || null);
      return;
    }
    if (mode === 'escaped') {
      this.fastForward(12, true); // ~840 m, then she bursts through the gate
      this.distance = GOAL_DISTANCE;
      this.score = 3120;
      this.corn = 18;
      this.endEscaped();
    }
  }

  // Step the real update loop forward, auto-jumping over hazards, so a
  // screenshot shows a mid-run scene with the HUD alive.
  fastForward(seconds, autoPlay) {
    const steps = Math.floor(seconds * 60);
    for (let i = 0; i < steps; i++) {
      if (this.state !== 'playing') break;
      if (autoPlay) {
        const box = this.turkey.box();
        for (const it of this.field.items) {
          if (!HAZARDS[it.kind]) continue;
          const ahead = it.x - (box.x + box.w);
          if (ahead > 0 && ahead < 190 && this.turkey.onGround) {
            if (it.kind === 'knife') {
              // Wait for the blade to swing away, then jump late.
              if (Math.sin(it.swing) < 0.2) this.turkey.jump();
            } else {
              this.turkey.jump();
            }
            break;
          }
        }
        // Grab low corn by staying grounded; nothing else to do.
      }
      this.update(1 / 60);
      // Screenshot autopilot: Tilly cannot die mid-scene, so the shot
      // always shows a run in play (a skilled player would survive this).
      if (this.state === 'playing') {
        this.lives = Math.max(this.lives, 2);
        this.farmer.gap = Math.max(this.farmer.gap, 40);
      }
    }
  }
}
