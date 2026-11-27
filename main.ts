// Gobble & Run — The Great Turkey Escape: the hand-in program for turkey-run-game-01.
//
// The game itself is the static site in game/ (plain files, no build step, loads offline in
// a desktop browser). This program's one job is to hand it in: copy game/ and screenshots/
// into the output directory and write the dossier the judge reads, using the kit's vendored
// library exactly as shipped so the gate's rebuild matches byte for byte.
//
// Run it the way the grader does, or locally with an output directory of your own:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the game for a play with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The dossier caps are the gate's own (see the kit's RULES.txt): at most 4 screenshots of
// 256 KiB each, at most 993 files and 48 MiB under game/, no game path over 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
