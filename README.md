# Gobble & Run — The Great Turkey Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/hakeno337/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/hakeno337/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

An original turkey escape game for the make.fun **turkey-run-game-01** bounty. Dinner is at
six — and the turkey plans to be elsewhere. You are a wild turkey sprinting 1,500 metres
across the farm to the Wildwood gate, with the farmer and his carving knife a step behind
your tail fan the whole way.

## How to play

- **Space / ↑ / click** — jump. Press again mid-air to **flap** once for extra height.
- **↓ / S** — slide, to duck under the hanging knives of the kitchen yard.
- **P** — pause · **M** — sound on/off · **R** — run again from an end screen.

Run clean and the farmer falls back; clip a danger and he lurches closer. Lose all three
feathers — or let his hand reach your tail — and the run ends on a platter. Reach the
Wildwood gate at 1,500 m and you are free.

## The run, in three stages

| Stage | Distance | New dangers |
|---|---|---|
| The Farmyard | 0–500 m | split-rail fences, hay bales |
| The Cornfield | 500–1,000 m | chopping blocks with carving knives |
| The Kitchen Yard | 1,000–1,500 m | lit ovens, hanging knives to slide under |

Corn cobs score 25, the rare golden cob 100. Everything is drawn and sounded in code —
canvas art, synthesized WebAudio effects, no image or audio files, no network requests.

## Layout

- `game/index.html` — the page
- `game/src/config.js` — all tuning: speed curve, farmer pressure, zones
- `game/src/game.js` — state, physics, spawning, collisions, HUD and screens
- `game/src/art.js` — the turkey, the farmer and every danger, drawn in code
- `game/src/world.js` — the parallax autumn world: barn, corn, farmhouse, Wildwood gate
- `game/src/sound.js` — synthesized sound effects
- `game/src/shots.js` — the staged scenes behind the screenshots
- `game/src/main.js` — bootstrap, input and the fixed-step loop
- `main.ts` — hands the entry in: copies `game/` and `screenshots/` out and writes the dossier

Play it locally with `node serve.ts`, then open http://localhost:8080.
