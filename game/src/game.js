// Game: the state machine, physics, collisions and scoring of Gobble Dash.
// States: title → playing ⇄ paused → stageClear → playing … → caught /
// escaped. The renderer draws; this file decides what happens.

import { VIEW, TUNING, STAGES, PICKUPS } from './config.js';
import { buildStageLayout, pickupY } from './levels.js';
import { makeTurkey, makeFarmer, turkeyBox, obstacleBox, overlaps, clearsHazard } from './entities.js';
import { Sound } from './audio.js';
import { Input } from './input.js';
import { drawScene, drawHUD, drawTitle, drawBanner, drawEnd, drawPaused } from './render.js';

const { ground: G, turkeyX } = VIEW;
const PX = TUNING.pxPerMetre;

export class Game {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.seed = opts.seed ?? 20261128;
    this.sound = new Sound();
    this.input = new Input(canvas);
    this.input.onFirstGesture = () => this.sound.ensure();
    this.state = 'title';
    this.stateTimer = 0;
    this.jumpBuffer = 0; // a jump pressed just before landing still fires
    this.time = 0;
    this.frozen = false; // screenshot mode: render only, never update
    this.best = 0;
    this.particles = [];
    this.banner = null;
    this.resetRun();
  }

  resetRun() {
    this.stageIndex = 0;
    this.score = 0;
    this.totalDistanceM = 0;
    this.hearts = TUNING.hearts;
    this.gap = TUNING.gapStart;
    this.combo = 0;
    this.comboMult = 1;
    this.bestComboMult = 1;
    this.cornCount = 0;
    this.turkey = makeTurkey();
    this.farmer = makeFarmer();
    this.loadStage(0);
    this.banner = null;
  }

  loadStage(i) {
    this.stageIndex = i;
    this.layout = buildStageLayout(i, this.seed);
    // Convert pickup height tags to pixel offsets above the ground.
    for (const p of this.layout.pickups) {
      p.yOff = pickupY(p.kind, p.y, p.arc ?? 2);
    }
    this.distancePx = 0;
    this.stage = STAGES[i];
    this.speed = TUNING.baseSpeed + this.stage.speed;
    this.showBanner(this.stage.name, this.stage.sub, 1.8);
  }

  get distanceM() {
    return this.totalDistanceM + this.distancePx / PX;
  }

  showBanner(title, sub, seconds) {
    this.banner = { title, sub, timer: seconds, max: seconds };
  }

  startRun() {
    this.resetRun();
    this.state = 'playing';
    this.stateTimer = 0;
    this.sound.ensure();
    this.sound.startMusic();
    this.sound.click();
  }

  // ------------------------------------------------------------ update
  update(dt) {
    if (this.frozen) return;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    this.stateTimer += dt;

    if (this.state === 'title') {
      this.turkey.runCycle += dt * 6;
      this.farmer.runCycle += dt * 6;
      this.farmer.x = turkeyX - 40 - (this.gap / 100) * 230;
      if (this.input.wasPressed('jump') || this.input.wasPressed('start')) this.startRun();
      this.input.endFrame();
      return;
    }

    if (this.state === 'paused') {
      if (this.input.wasPressed('pause')) {
        this.state = 'playing';
        this.sound.click();
      } else if (this.input.wasPressed('restart')) {
        this.startRun();
      }
      this.input.endFrame();
      return;
    }

    if (this.state === 'caught' || this.state === 'escaped') {
      // The farmer closes in on the caught turkey.
      if (this.state === 'caught') {
        this.farmer.x += (turkeyX - 30 - this.farmer.x) * Math.min(1, dt * 4);
        this.farmer.runCycle += dt * 8;
      }
      this.updateParticles(dt);
      if (this.stateTimer > 0.7 && (this.input.wasPressed('jump') || this.input.wasPressed('restart') || this.input.wasPressed('start'))) {
        this.startRun();
      }
      this.input.endFrame();
      return;
    }

    if (this.state === 'stageClear') {
      this.updateParticles(dt);
      if (this.stateTimer > 2.2) {
        if (this.stageIndex >= STAGES.length - 1) {
          this.finishEscaped();
        } else {
          this.loadStage(this.stageIndex + 1);
          this.state = 'playing';
          this.stateTimer = 0;
        }
      }
      this.input.endFrame();
      return;
    }

    // ---- playing ----
    const t = this.turkey;

    if (this.input.wasPressed('pause')) {
      this.state = 'paused';
      this.stateTimer = 0;
      this.sound.click();
      this.input.endFrame();
      return;
    }
    if (this.input.wasPressed('mute')) {
      const muted = this.sound.toggleMute();
      this.showBanner(muted ? 'MUTED' : 'SOUND ON', '', 0.9);
    }
    if (this.input.wasPressed('restart')) {
      this.startRun();
      return;
    }

    // Moves. A jump pressed a fraction before landing is buffered, and
    // jumping ends a dash: a dash-jump would fly too far to land safely.
    if (this.input.wasPressed('jump')) this.jumpBuffer = 0.12;
    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= dt;
      if (t.onGround) {
        this.jumpBuffer = 0;
        t.vy = TUNING.jumpVelocity;
        t.onGround = false;
        t.sliding = false;
        t.slideTimer = 0;
        t.dashing = false;
        t.dashTimer = 0;
        this.sound.jump();
        this.burst(t.x - 10, G, '#d8c49a', 5);
      }
    }
    if (this.input.wasPressed('slide') && t.onGround && !t.sliding) {
      t.sliding = true;
      t.slideTimer = TUNING.slideTime;
      t.dashing = false; // sliding ends a dash, like jumping does
      t.dashTimer = 0;
      this.sound.slide();
    }
    // A dash is a ground move: it never fires mid-air, so a dash can never
    // stretch a jump past the next hazard.
    if (this.input.wasPressed('dash') && t.dashCooldown <= 0 && t.onGround) {
      t.dashing = true;
      t.dashTimer = TUNING.dashTime;
      t.dashCooldown = TUNING.dashCooldown;
      this.sound.dash();
    }

    // Timers.
    if (t.slideTimer > 0) {
      t.slideTimer -= dt;
      if (t.slideTimer <= 0) t.sliding = false;
    }
    if (t.dashTimer > 0) {
      t.dashTimer -= dt;
      if (t.dashTimer <= 0) t.dashing = false;
    }
    if (t.dashCooldown > 0) t.dashCooldown -= dt;
    if (t.invincible > 0) t.invincible -= dt;
    if (t.chili > 0) t.chili -= dt;

    // Vertical physics.
    if (!t.onGround) {
      t.vy += TUNING.gravity * dt;
      t.y += t.vy * dt;
      if (t.y >= G) {
        t.y = G;
        t.vy = 0;
        t.onGround = true;
        if (t.wasAir) this.sound.land();
        t.wasAir = false;
      }
    } else {
      t.wasAir = true;
    }

    // Forward motion. The dash multiplier only counts on the ground: a
    // chili grabbed mid-air must never stretch the jump past the next hazard.
    const speed = this.speed * (t.dashing && t.onGround ? TUNING.dashSpeed : 1);
    this.distancePx += speed * dt;
    this.score += speed * dt * 0.02;
    t.runCycle += dt * (speed / 28);
    this.farmer.runCycle += dt * (speed / 28);

    // The farmer gains ground every second; dashing and corn push him back.
    this.gap -= TUNING.gapDrain * dt;
    if (t.dashing) this.gap += TUNING.gapDash * dt;
    this.gap = Math.min(100, this.gap);
    this.farmer.x = turkeyX - 40 - (this.gap / 100) * 230;

    this.checkCollisions();
    this.updateParticles(dt);

    if (this.banner) {
      this.banner.timer -= dt;
      if (this.banner.timer <= 0) this.banner = null;
    }

    // Stage done?
    if (this.distancePx >= this.layout.lengthPx) {
      this.totalDistanceM += this.layout.lengthPx / PX;
      const bonus = TUNING.stageBonus * (this.stageIndex + 1);
      this.score += bonus;
      this.gap = Math.min(100, this.gap + TUNING.gapStageBonus);
      this.state = 'stageClear';
      this.stateTimer = 0;
      this.sound.stageClear();
      this.showBanner(
        this.stageIndex === STAGES.length - 1 ? 'FREEDOM!' : 'STAGE CLEAR!',
        `+${bonus} bonus · the farmer falls behind`,
        2.2,
      );
      this.confetti();
    } else if (this.hearts <= 0 || this.gap <= 0) {
      this.finishCaught();
    }

    this.input.endFrame();
  }

  // -------------------------------------------------------- collisions
  checkCollisions() {
    const t = this.turkey;
    const twx = this.distancePx + turkeyX;
    const tb = turkeyBox(t);
    tb.x = twx - t.w / 2 + 4; // world coordinates for the checks below

    for (const o of this.layout.obstacles) {
      if (o.hit || o.passed) continue;
      if (o.x + o.w < twx - 20) {
        o.passed = true;
        continue;
      }
      const ob = obstacleBox(o, G);
      const hitBox = { x: o.x, y: ob.y, w: o.w, h: ob.h };
      if (overlaps(tb, hitBox)) {
        if (o.type === 'pumpkin' && t.dashing) {
          // Dash-smash: the pumpkin bursts into pie crumbs.
          o.hit = true;
          this.score += TUNING.smashScore * this.comboMult;
          this.burst(o.x - this.distancePx + turkeyX, G - 22, '#e07b28', 12);
          this.sound.smash();
          continue;
        }
        if (clearsHazard(t, o)) continue;
        o.hit = true;
        this.takeHit(o);
      }
    }

    for (const p of this.layout.pickups) {
      if (p.taken) continue;
      if (p.x < twx - 60 || p.x > twx + 60) continue;
      const pb = { x: p.x - 14, y: G - p.yOff - 26, w: 28, h: 28 };
      if (overlaps(tb, pb)) {
        p.taken = true;
        this.collect(p);
      }
    }
  }

  takeHit(o) {
    const t = this.turkey;
    if (t.invincible > 0 || t.chili > 0) return;
    if (t.shield) {
      t.shield = false;
      t.invincible = TUNING.invincibleTime;
      this.gap = Math.max(0, this.gap - 6);
      this.burst(t.x, t.y - 30, '#7ec8f2', 12);
      this.sound.hit();
      return;
    }
    this.hearts -= 1;
    this.combo = 0;
    this.comboMult = 1;
    this.gap = Math.max(0, this.gap - TUNING.gapHit);
    t.invincible = TUNING.invincibleTime;
    this.burst(t.x, t.y - 24, '#e2574c', 14);
    this.sound.hit();
  }

  collect(p) {
    const t = this.turkey;
    this.cornCount += 1;
    if (p.kind === 'corn' || p.kind === 'golden') {
      this.combo += 1;
      // The multiplier tops out at x8: a long corn streak is rewarded, but
      // the score must stay bounded and fair.
      this.comboMult = Math.min(8, 1 + Math.floor(this.combo / 5));
      this.bestComboMult = Math.max(this.bestComboMult, this.comboMult);
    }
    const def = PICKUPS[p.kind];
    this.score += def.score * this.comboMult;
    this.gap = Math.min(100, this.gap + def.gap);
    if (p.kind === 'golden') {
      this.sound.golden();
      this.burst(p.x - this.distancePx + turkeyX, G - p.yOff, '#ffd23c', 10);
    } else if (p.kind === 'corn') {
      this.sound.corn(this.combo);
    } else if (p.kind === 'feather') {
      t.shield = true;
      this.sound.power();
      this.showBanner('FEATHER SHIELD!', 'One hit blocked — nice catch', 1.2);
    } else if (p.kind === 'chili') {
      t.chili = 3;
      if (t.onGround) {
        t.dashing = true;
        t.dashTimer = Math.max(t.dashTimer, 0.6);
      }
      this.sound.power();
      this.showBanner('HOT CHILI!', 'Unstoppable for 3 seconds!', 1.2);
    } else if (p.kind === 'pie') {
      this.hearts = Math.min(TUNING.hearts, this.hearts + 1);
      this.sound.power();
      this.showBanner('PUMPKIN PIE!', '+1 heart — delicious', 1.2);
    }
  }

  finishCaught() {
    this.state = 'caught';
    this.stateTimer = 0;
    this.best = Math.max(this.best, this.score);
    this.sound.stopMusic();
    this.sound.caught();
  }

  finishEscaped() {
    this.state = 'escaped';
    this.stateTimer = 0;
    this.best = Math.max(this.best, this.score);
    this.sound.stopMusic();
    this.sound.escaped();
    this.confetti();
  }

  // --------------------------------------------------------- particles
  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 40 + Math.random() * 120;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 40,
        r: 2 + Math.random() * 3,
        life: 0.5 + Math.random() * 0.4,
        max: 0.9,
        color,
      });
    }
  }

  confetti() {
    const cols = ['#ffd23c', '#e2574c', '#7ec850', '#7ec8f2', '#f2a541'];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: 100 + Math.random() * 760,
        y: 60 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 60,
        vy: 40 + Math.random() * 80,
        r: 3 + Math.random() * 3,
        life: 1.2 + Math.random() * 0.8,
        max: 2,
        color: cols[i % cols.length],
      });
    }
  }

  updateParticles(dt) {
    for (const pt of this.particles) {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 220 * dt;
      pt.life -= dt;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);
  }

  // ------------------------------------------------------------ render
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 960, 540);
    if (this.state === 'title') {
      drawTitle(ctx, this);
    } else if (this.state === 'caught' || this.state === 'escaped') {
      drawEnd(ctx, this, this.state === 'escaped');
    } else {
      drawScene(ctx, this);
      drawHUD(ctx, this);
      if (this.banner) {
        drawBanner(ctx, this.banner.title, this.banner.sub, Math.min(1, this.banner.timer / 0.4));
      }
      if (this.state === 'paused') drawPaused(ctx, this);
    }
  }

  // Step once, for headless testing: same path the live loop uses.
  step(dt) {
    this.update(dt);
    this.render();
  }

  debugState() {
    return {
      state: this.state,
      stage: this.stageIndex + 1,
      score: Math.floor(this.score),
      distanceM: Math.floor(this.distanceM),
      hearts: this.hearts,
      gap: Math.round(this.gap * 10) / 10,
      combo: this.combo,
      comboMult: this.comboMult,
      corn: this.cornCount,
      turkeyY: Math.round(this.turkey.y),
      onGround: this.turkey.onGround,
      dashCooldown: Math.round(this.turkey.dashCooldown * 100) / 100,
      obstacles: this.layout.obstacles.length,
      pickups: this.layout.pickups.length,
    };
  }
}
