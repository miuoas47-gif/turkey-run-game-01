// Turkey Run — keyboard and mouse input, kept in one place.
// One clear job: turn keys and clicks into a clean input state.

export function createInputState() {
  return {
    up: false, down: false, left: false, right: false,
    dashPressed: false, mouseX: 0, mouseY: 0,
    clicked: false, clickX: 0, clickY: 0,
  };
}

const KEY_MAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

export function attachInputHandlers(canvas, input, callbacks) {
  window.addEventListener('keydown', (event) => {
    const field = KEY_MAP[event.code];
    if (field) { input[field] = true; event.preventDefault(); }
    if (event.code === 'Space') {
      if (!event.repeat) input.dashPressed = true;
      event.preventDefault();
    }
    if (event.code === 'Enter') callbacks.onEnter();
    if (event.code === 'KeyM') callbacks.onMute();
    if (event.code === 'KeyP') callbacks.onPause();
  });
  window.addEventListener('keyup', (event) => {
    const field = KEY_MAP[event.code];
    if (field) input[field] = false;
  });
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    input.mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
  });
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.clickX = (event.clientX - rect.left) * (canvas.width / rect.width);
    input.clickY = (event.clientY - rect.top) * (canvas.height / rect.height);
    input.clicked = true;
    callbacks.onClick(input.clickX, input.clickY);
  });
}

// Direction from held keys; falls back to a mouse-click target when set.
export function readMoveDirection(input, target) {
  let dx = 0, dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  if (dx === 0 && dy === 0 && target) {
    const tx = target.x - (target.px || 0), ty = target.y - (target.py || 0);
    if (Math.hypot(tx, ty) > 14) { dx = tx; dy = ty; }
  }
  const len = Math.hypot(dx, dy);
  return len > 0 ? { x: dx / len, y: dy / len } : { x: 0, y: 0 };
}
