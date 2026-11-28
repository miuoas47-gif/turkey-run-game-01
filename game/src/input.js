// Keyboard + mouse + touch input. Actions are edge-triggered: the game asks
// "was jump pressed since the last frame?" so a held key never double-jumps.
// Arrow keys / WASD / Space jump, Down / S slides, Shift / X dashes, P
// pauses, M mutes, R restarts, Enter starts. Click (or tap) jumps; a
// right-click or a long press slides.

const KEYMAP = {
  Space: 'jump', ArrowUp: 'jump', KeyW: 'jump',
  ArrowDown: 'slide', KeyS: 'slide',
  ShiftLeft: 'dash', ShiftRight: 'dash', KeyX: 'dash', KeyD: 'dash',
  KeyP: 'pause', Escape: 'pause',
  KeyM: 'mute',
  KeyR: 'restart',
  Enter: 'start',
};

export class Input {
  constructor(canvas) {
    this.pressed = new Set();
    this.held = new Set();
    this.canvas = canvas;
    this.onFirstGesture = null;
    this._gestured = false;

    window.addEventListener('keydown', (e) => {
      const action = KEYMAP[e.code];
      if (action) {
        e.preventDefault();
        if (!e.repeat) this.pressed.add(action);
        this.held.add(action);
      }
      this._gesture();
    });
    window.addEventListener('keyup', (e) => {
      const action = KEYMAP[e.code];
      if (action) this.held.delete(action);
    });

    canvas.addEventListener('pointerdown', (e) => {
      this._gesture();
      if (e.button === 2) this.pressed.add('slide');
      else this.pressed.add('jump');
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _gesture() {
    if (!this._gestured) {
      this._gestured = true;
      if (this.onFirstGesture) this.onFirstGesture();
    }
  }

  // True once per press; the game calls this every frame.
  wasPressed(action) {
    if (this.pressed.has(action)) {
      this.pressed.delete(action);
      return true;
    }
    return false;
  }

  isHeld(action) {
    return this.held.has(action);
  }

  endFrame() {
    this.pressed.clear();
  }
}
