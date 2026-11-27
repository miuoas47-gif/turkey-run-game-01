# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/miuoas47-gif/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/miuoas47-gif/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Turkey Run! — The Great Thanksgiving Escape. Tilly the turkey has been picked
for Thanksgiving dinner, so she runs: outrun Farmer Jed through the farmyard,
the old barn and the kitchen, jump fences and hay bales, slide under swinging
carving knives, leap the oven, grab corn and golden feathers, and reach the
forest gate 1000 m away to live free. Three hearts, a chasing farmer who
closes in every time you stumble, stages that grow harder, a HUD of score,
distance, lives and farmer gap, title / pause / caught / escaped screens with
restart, and synthesised WebAudio sound (gobbles, a farmer's shout, a plucky
jig). Original art, music and code, drawn and written for this bounty — no
libraries, no network, no build step.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 and play with keyboard or mouse:

- **SPACE / ↑ / click** — jump
- **↓ / S** — slide
- **SHIFT / X** — dash
- **P** — pause, **M** — mute, **R** — restart

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=6gvkzysc&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
