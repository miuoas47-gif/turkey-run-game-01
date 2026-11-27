# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/miuoas47-gif/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/miuoas47-gif/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Turkey Run!** — a turkey escape game. You are the turkey, and Thanksgiving is coming. Outrun the farmer across the farmyard, the barn yard and the kitchen, dodge the roaring ovens and the flying carving knives, grab corn (golden corn gives you a feather shield), hide in the haystacks to lose the farmer, and reach the forest gate to freedom. Three lives, a flap-dash, rising difficulty, and a synthesized farm tune — all art drawn in code and all sound made with WebAudio, no assets downloaded.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That builds the hand-in (game + screenshots + dossier.json) into `out/`. To play, serve `game/` and open it in a desktop browser:

```sh
node serve.ts
# open http://localhost:8080
```

Move with WASD / arrow keys or click to run there, Space to flap-dash, P to pause, M to mute. Reach the glowing gate on the right to clear each stage; escape the kitchen to win.

---

<sub>Entered on [make.fun](https://make.fun/?ref=6gvkzysc&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
