# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/miuoas47-gif/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/miuoas47-gif/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Gobble Dash — The Great Turkey Escape.** Thanksgiving is coming, and one plucky turkey is not going to be dinner. Outrun the farmer across five stages — Farmyard, Cornfield, Barn, Kitchen, Forest — jumping fences and ovens, sliding under beams and hanging pots, dashing through rolling pumpkins, and dodging the carving knife, while the farmer gains on you every second you dawdle.

## How it plays

- **Auto-runner with real choices:** jump (Space / ↑ / click), slide (↓), dash (Shift) — dashing smashes pumpkins and buys distance from the farmer.
- **Farmer gap meter:** every obstacle you hit and every second you waste lets the farmer close in; corn and dashes push him back. Gap hits zero and you're caught.
- **Scoring & combos:** corn builds a combo multiplier (up to x4+), golden corn pays big, stage clears pay a bonus.
- **Power-ups:** feather shield (blocks one hit), hot chili (3 s of unstoppable dashing), pumpkin pie (+1 heart).
- **Five stages, rising speed and density**, each with its own palette, scenery and hazards — the Kitchen's oven and swinging carving knife, the Cornfield's dog, the Barn's low beams.
- **Synthesized sound:** a looping folk reel plus jump/coin/hit/win effects, all WebAudio, no audio files. M to mute.
- **Deterministic:** every stage layout is generated from a seed (`?seed=N` replays the same run), so the game is fair and reproducible.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network, just static files under `game/`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=6gvkzysc&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
