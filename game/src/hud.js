// HUD and menu screens for Turkey Run!
// One job: everything drawn on top of the world — scores, hearts, buttons,
// title screen, pause, caught and escaped screens.

import { GOAL_DISTANCE, VIEW_H, VIEW_W } from './config.js';

export const BUTTONS = {
  start: { x: VIEW_W / 2 - 150, y: 424, w: 300, h: 56 },
  restart: { x: VIEW_W / 2 - 150, y: 408, w: 300, h: 56 },
  again: { x: VIEW_W / 2 - 150, y: 420, w: 300, h: 56 },
  mute: { x: VIEW_W - 52, y: 10, w: 42, h: 34 },
  pause: { x: VIEW_W - 100, y: 10, w: 42, h: 34 },
};

function inRect(r, p) {
  return p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

export function hitButton(name, point) {
  return inRect(BUTTONS[name], point);
}

function panel(ctx, x, y, w, h, alpha = 0.88) {
  ctx.save();
  ctx.fillStyle = `rgba(46,26,10,${alpha})`;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#e8c98a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function button(ctx, rect, label, sub) {
  ctx.save();
  ctx.fillStyle = '#d43d2a';
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 - (sub ? 8 : 0));
  if (sub) {
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(sub, rect.x + rect.w / 2, rect.y + rect.h - 16);
  }
  ctx.restore();
}

function heart(ctx, x, y, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = filled ? '#d43d2a' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -7, -13, 0, -6);
  ctx.bezierCurveTo(7, -13, 11, -4, 0, 6);
  ctx.fill();
  ctx.restore();
}

export function drawHUD(ctx, s) {
  // Top bar
  ctx.save();
  ctx.fillStyle = 'rgba(46,26,10,0.55)';
  ctx.fillRect(0, 0, VIEW_W, 52);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(`SCORE ${s.score}`, 16, 18);
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#ffe9b8';
  ctx.fillText(`BEST ${s.best}`, 16, 40);
  // Distance, centred
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillStyle = '#fff8e6';
  ctx.fillText(`${Math.floor(s.distance)} m / ${GOAL_DISTANCE} m`, VIEW_W / 2, 18);
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillStyle = '#ffd23e';
  ctx.fillText(s.stageName, VIEW_W / 2, 40);
  // Hearts
  for (let i = 0; i < 3; i++) heart(ctx, VIEW_W - 190 - i * 30, 26, i < s.lives);
  // Farmer gap bar: how close Jed is behind you.
  const barX = 16, barY = VIEW_H - 30, barW = 260, barH = 14;
  ctx.fillStyle = 'rgba(46,26,10,0.6)';
  ctx.beginPath();
  ctx.roundRect(barX - 6, barY - 18, barW + 12, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('FARMER JED', barX, barY - 8);
  ctx.fillStyle = '#3a2a16';
  ctx.fillRect(barX, barY, barW, barH);
  const gapW = (s.farmerGap / 100) * barW;
  ctx.fillStyle = s.farmerGap < 28 ? '#d43d2a' : '#4e8a2f';
  ctx.fillRect(barX, barY, gapW, barH);
  ctx.fillStyle = '#fff8e6';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(s.farmerGap < 28 ? 'HE IS RIGHT BEHIND YOU!' : 'keep running!', barX + barW + 10, barY + 7);
  // Dash meter, bottom right
  const dashW = 130;
  ctx.fillStyle = 'rgba(46,26,10,0.6)';
  ctx.beginPath();
  ctx.roundRect(VIEW_W - dashW - 22, barY - 18, dashW + 12, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('DASH (SHIFT)', VIEW_W - dashW - 16, barY - 8);
  ctx.fillStyle = '#3a2a16';
  ctx.fillRect(VIEW_W - dashW - 16, barY, dashW, barH);
  ctx.fillStyle = '#ffd23e';
  ctx.fillRect(VIEW_W - dashW - 16, barY, dashW * s.dashReady, barH);
  // Small mute / pause buttons
  ctx.fillStyle = 'rgba(46,26,10,0.6)';
  ctx.beginPath();
  ctx.roundRect(BUTTONS.mute.x, BUTTONS.mute.y, BUTTONS.mute.w, BUTTONS.mute.h, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(BUTTONS.pause.x, BUTTONS.pause.y, BUTTONS.pause.w, BUTTONS.pause.h, 8);
  ctx.fill();
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(s.muted ? '✕' : '♪', BUTTONS.mute.x + 21, BUTTONS.mute.y + 18);
  ctx.fillText('II', BUTTONS.pause.x + 21, BUTTONS.pause.y + 18);
  ctx.restore();
}

export function drawTitle(ctx, s, time) {
  ctx.save();
  ctx.fillStyle = 'rgba(46,26,10,0.45)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('TURKEY RUN!', VIEW_W / 2, 96);
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillStyle = '#ffd23e';
  ctx.fillText('The Great Thanksgiving Escape', VIEW_W / 2, 140);
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillStyle = '#fff8e6';
  ctx.fillText('Thanksgiving is coming and Farmer Jed has picked YOU for dinner.', VIEW_W / 2, 188);
  ctx.fillText('Outrun him through the farmyard, the barn and the kitchen —', VIEW_W / 2, 214);
  ctx.fillText('dodge fences, ovens and carving knives, grab the corn,', VIEW_W / 2, 240);
  ctx.fillText('and reach the forest gate 1000 m away to live free!', VIEW_W / 2, 266);
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillStyle = '#ffe9b8';
  ctx.fillText('SPACE / CLICK — jump      ↓ — slide      SHIFT — dash      P — pause      M — mute', VIEW_W / 2, 312);
  if (s.best > 0) {
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = '#ffd23e';
    ctx.fillText(`BEST SCORE: ${s.best}`, VIEW_W / 2, 348);
  }
  button(ctx, BUTTONS.start, '▶  START THE ESCAPE', 'or press SPACE');
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,248,230,0.75)';
  ctx.fillText('An original game — art, music and code made for this bounty.', VIEW_W / 2, 508);
  ctx.restore();
}

export function drawPaused(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(46,26,10,0.6)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  panel(ctx, VIEW_W / 2 - 220, VIEW_H / 2 - 90, 440, 180);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText('PAUSED', VIEW_W / 2, VIEW_H / 2 - 40);
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText('Tilly is catching her breath.', VIEW_W / 2, VIEW_H / 2 + 8);
  ctx.fillText('Press P or click to keep running.', VIEW_W / 2, VIEW_H / 2 + 36);
  ctx.restore();
}

export function drawCaught(ctx, s) {
  ctx.save();
  ctx.fillStyle = 'rgba(60,10,5,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  panel(ctx, VIEW_W / 2 - 300, 84, 600, 300);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff9d8a';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText('CAUGHT!', VIEW_W / 2, 138);
  ctx.fillStyle = '#fff8e6';
  ctx.font = '19px system-ui, sans-serif';
  ctx.fillText('Farmer Jed got you. The oven was already warm…', VIEW_W / 2, 190);
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = '#ffd23e';
  ctx.fillText(`SCORE ${s.score}   •   ${Math.floor(s.distance)} m of ${GOAL_DISTANCE} m`, VIEW_W / 2, 232);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = '#fff8e6';
  ctx.fillText(s.distance >= GOAL_DISTANCE - 120
    ? 'So close to the forest gate! One more run?'
    : 'Tip: grab corn to slow Jed down — and save your dash for the knives.', VIEW_W / 2, 264);
  if (s.score >= s.best && s.score > 0) {
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = '#ffd23e';
    ctx.fillText('★ NEW BEST SCORE! ★', VIEW_W / 2, 300);
  }
  ctx.fillText('Best: ' + s.best, VIEW_W / 2, 330);
  button(ctx, BUTTONS.restart, '↻  RUN AGAIN', 'or press R');
  ctx.restore();
}

export function drawEscaped(ctx, s) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,50,20,0.45)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  panel(ctx, VIEW_W / 2 - 300, 84, 600, 312);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9fe870';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText('ESCAPED!', VIEW_W / 2, 138);
  ctx.fillStyle = '#fff8e6';
  ctx.font = '19px system-ui, sans-serif';
  ctx.fillText('Tilly burst through the forest gate — free at last!', VIEW_W / 2, 190);
  ctx.fillText('Farmer Jed is still looking for her. Somewhere.', VIEW_W / 2, 218);
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = '#ffd23e';
  ctx.fillText(`SCORE ${s.score}   •   ${GOAL_DISTANCE} m in one brave run`, VIEW_W / 2, 258);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = '#fff8e6';
  ctx.fillText(`Hearts left: ${s.lives}   •   Corn eaten: ${s.corn}`, VIEW_W / 2, 290);
  if (s.score >= s.best && s.score > 0) {
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = '#ffd23e';
    ctx.fillText('★ NEW BEST SCORE! ★', VIEW_W / 2, 322);
  }
  ctx.fillText('Best: ' + s.best, VIEW_W / 2, 352);
  button(ctx, BUTTONS.again, '↻  RUN AGAIN', 'or press R');
  ctx.restore();
}
