// The screenshot scenes behind ?shot=title|play|chase|end. Each scene builds a real game
// state — staged by hand at a dramatic moment, with the farmer, dangers, corn and HUD in
// their true places — and lets the game's own drawing code render it, so a screenshot is
// always a frame the game itself can produce, and the same scene always draws the same.

import { ESCAPE_METRES, PIXELS_PER_METRE } from './config.js';
import { OBSTACLE_SIZE, createGame } from './game.js';

function place(state, kind, screenX) {
  const size = OBSTACLE_SIZE[kind];
  state.obstacles.push({ kind, worldX: state.scroll + screenX, w: size.w, h: size.h, hit: false });
}

function cornRow(state, screenX, yOff, count, golden = false) {
  for (let i = 0; i < count; i += 1) {
    state.corns.push({ worldX: state.scroll + screenX + i * 46, yOff, golden, taken: false });
  }
}

/** Title: the lettering over the farm at golden hour, the stars flanking the panel. */
function stageTitle(state) {
  state.screen = 'title';
  state.scroll = 2600;
}

/** Play: mid-cornfield, the turkey flapping over a chopping block toward a corn arc. */
function stagePlay(state) {
  state.screen = 'play';
  state.scroll = 780 * PIXELS_PER_METRE;
  state.distanceM = 780;
  state.score = 8240;
  state.best = 9100;
  state.cornEaten = 14;
  state.zoneIndex = 1;
  state.farmerGap = 192;
  state.turkey.y = 118;
  state.turkey.grounded = false;
  state.turkey.flapped = true;
  state.turkey.runPhase = 7.4;
  place(state, 'block', 300);
  place(state, 'hay', 830);
  place(state, 'fence', 1120);
  cornRow(state, 420, 150, 3);
  cornRow(state, 980, 34, 2);
  state.corns.push({ worldX: state.scroll + 640, yOff: 120, golden: true, taken: false });
}

/** Chase: deep in the kitchen yard, the farmer's knife a breath from the tail fan. */
function stageChase(state) {
  state.screen = 'play';
  state.scroll = 1240 * PIXELS_PER_METRE;
  state.distanceM = 1240;
  state.score = 13975;
  state.best = 14100;
  state.cornEaten = 23;
  state.feathers = 2;
  state.zoneIndex = 2;
  state.farmerGap = 118;
  state.turkey.runPhase = 9.1;
  place(state, 'oven', 700);
  place(state, 'knives', 1010);
  cornRow(state, 520, 34, 3);
  cornRow(state, 1060, 30, 2);
}

/** End: through the gate — the escaped screen over the Wildwood scene. */
function stageEnd(state) {
  state.screen = 'escaped';
  state.scroll = (ESCAPE_METRES - 6) * PIXELS_PER_METRE;
  state.distanceM = ESCAPE_METRES - 6;
  state.score = 16840;
  state.cornEaten = 27;
  state.zoneIndex = 2;
  state.farmerGap = 320;
  state.turkey.runPhase = 3.3;
  state.endStats = { distance: ESCAPE_METRES, score: 16840, corn: 27, escaped: true };
}

/**
 * Set `state` to the named scene (title, play, chase or end; any other name is title) and
 * freeze its clock at a photogenic instant.
 */
export function stageShot(name, state) {
  const fresh = createGame(state.seed);
  Object.assign(state, fresh);
  if (name === 'play') stagePlay(state);
  else if (name === 'chase') stageChase(state);
  else if (name === 'end') stageEnd(state);
  else stageTitle(state);
  state.time = name === 'play' ? 12.35 : 8.8; // 8.8 lands the blinking prompts mid-"on" beat
  return state;
}
