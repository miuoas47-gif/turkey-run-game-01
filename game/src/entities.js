// Entities: the turkey, the farmer, and the boxes everything collides with.
// These are plain data + small pure helpers; the Game owns the update, the
// renderer owns the drawing.

import { VIEW } from './config.js';

// The turkey: a plump bird, 40 wide, 46 tall standing, 24 tall sliding.
export function makeTurkey() {
  return {
    x: VIEW.turkeyX,
    y: VIEW.ground, // feet y
    w: 40,
    h: 46,
    vy: 0,
    onGround: true,
    sliding: false,
    slideTimer: 0,
    dashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    invincible: 0,
    shield: false,
    chili: 0, // seconds of chili-powered invincibility left
    runCycle: 0,
    wasAir: false,
  };
}

// The farmer: chases from behind. His screen x is the turkey's x minus the
// gap in pixels; the gap meter (0..100) is the gameplay number.
export function makeFarmer() {
  return { x: 0, runCycle: 0, grabTimer: 0, angry: false };
}

export function turkeyBox(t) {
  const h = t.sliding ? 24 : t.h;
  return { x: t.x - t.w / 2 + 4, y: t.y - h, w: t.w - 8, h };
}

export function obstacleBox(o, ground) {
  const def = o;
  if (def.hang) {
    // Hanging hazard: occupies the air above the ground (slide under it).
    // Its bottom hangs low enough that a standing turkey clips it, and the
    // box is inset a few pixels so a 1 px graze from a jump never counts.
    return { x: o.x, y: ground - def.h - 27, w: o.w, h: def.h - 6 };
  }
  return { x: o.x, y: ground - def.h, w: o.w, h: def.h };
}

export function pickupBox(p, ground, yOff) {
  return { x: p.x - 14, y: ground - yOff - 26, w: 28, h: 28 };
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Is the turkey clearing this hazard right now? A jump hazard is cleared
// when the turkey's feet are above its top; a slide hazard when the turkey
// is sliding low; a dash hazard when jumping over it or dashing through it.
export function clearsHazard(t, o) {
  const box = obstacleBox(o, VIEW.ground);
  const tb = turkeyBox(t);
  if (o.counter === 'jump') return tb.y + tb.h <= box.y + 16;
  if (o.counter === 'slide') return t.sliding && tb.y >= box.y + box.h - 14;
  if (o.counter === 'either') {
    return tb.y + tb.h <= box.y + 16 || (t.sliding && tb.y >= box.y + box.h - 14);
  }
  if (o.counter === 'dash') {
    return tb.y + tb.h <= box.y + 16 || t.dashing;
  }
  return false;
}
