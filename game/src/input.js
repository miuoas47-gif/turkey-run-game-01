// Keyboard, mouse and touch input for Turkey Run!
// One job: turn raw events into edge-triggered game actions, and report
// clicks in canvas coordinates so menus can use them.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.jumpQueued = false;
    this.dashQueued = false;
    this.pauseQueued = false;
    this.restartQueued = false;
    this.muteQueued = false;
    this.slideHeld = false;
    this.click = null; // {x, y} in canvas coordinates, consumed by the game
    this.anyGesture = false;

    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.repeat) return;
      this.keys.add(e.code);
      this.anyGesture = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') this.jumpQueued = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX') this.dashQueued = true;
      if (e.code === 'KeyP' || e.code === 'Escape') this.pauseQueued = true;
      if (e.code === 'KeyR' || e.code === 'Enter') this.restartQueued = true;
      if (e.code === 'KeyM') this.muteQueued = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.slideHeld = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.slideHeld = false;
    });

    const press = (clientX, clientY) => {
      this.anyGesture = true;
      this.jumpQueued = true;
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      this.click = { x, y };
    };
    canvas.addEventListener('mousedown', (e) => press(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      press(t.clientX, t.clientY);
    }, { passive: false });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.slideHeld = false;
    });
  }

  // Edge-triggered actions: each returns true once, then clears.
  takeJump() { const v = this.jumpQueued; this.jumpQueued = false; return v; }
  takeDash() { const v = this.dashQueued; this.dashQueued = false; return v; }
  takePause() { const v = this.pauseQueued; this.pauseQueued = false; return v; }
  takeRestart() { const v = this.restartQueued; this.restartQueued = false; return v; }
  takeMute() { const v = this.muteQueued; this.muteQueued = false; return v; }
  takeClick() { const v = this.click; this.click = null; return v; }

  // Held state, for sliding.
  sliding() { return this.slideHeld || this.keys.has('ArrowDown') || this.keys.has('KeyS'); }

  clearQueues() {
    this.jumpQueued = false;
    this.dashQueued = false;
    this.pauseQueued = false;
    this.restartQueued = false;
    this.muteQueued = false;
    this.click = null;
  }
}
