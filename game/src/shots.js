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

/** One frozen particle — dust, ember or feather — placed by hand for the still frame. */
function puff(state, x, y, colour, size) {
  state.particles.push({ x, y, vx: 0, vy: 0, life: 1, age: 0.06, colour, size });
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
  // The leap's story in dust and feathers: a kicked-up cloud where he left the ground,
  // two feathers shaken loose behind him, sparkles crowning the prize cob.
  for (const [x, y, s] of [[238, 596, 5], [268, 588, 7], [300, 598, 6], [206, 580, 4], [286, 578, 4]]) {
    puff(state, x, y, '#caa066', s);
  }
  puff(state, 208, 428, '#e8d9ae', 5.5);
  puff(state, 248, 468, '#d9c491', 4.5);
  for (const [x, y] of [[618, 452], [664, 442], [640, 424]]) puff(state, x, y, '#ffd94d', 3.4);
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
  // Breathless detail: dust boiling off the farmer's boots, a feather torn from the
  // tail fan by the knife's pass, embers spitting from the oven door.
  for (const [x, y, s] of [[52, 594, 6], [84, 586, 8], [116, 597, 5], [30, 584, 4], [98, 576, 4]]) {
    puff(state, x, y, '#caa066', s);
  }
  for (const [x, y, s] of [[286, 592, 5], [312, 584, 6], [262, 598, 4]]) puff(state, x, y, '#caa066', s);
  puff(state, 226, 512, '#e8d9ae', 5.5);
  puff(state, 252, 548, '#d9c491', 4);
  for (const [x, y, c] of [[716, 556, '#ffb03a'], [742, 536, '#ff7847'], [768, 562, '#ffd94d'], [730, 578, '#ff7847']]) {
    puff(state, x, y, c, 3.2);
  }
}

/** End: through the gate — the escaped screen over the Wildwood scene. */
function stageEnd(state) {
  state.screen = 'escaped';
  state.scroll = (ESCAPE_METRES - 6) * PIXELS_PER_METRE;
  state.distanceM = ESCAPE_METRES - 6;
  state.score = 16840;
  state.cornEaten = 27;
  state.zoneIndex = 2;
  state.farmerGap = 430; // far enough back that no stray knife tip enters the frame
  state.turkey.runPhase = 3.3;
  state.endStats = { distance: ESCAPE_METRES, score: 16840, corn: 27, escaped: true };
  // A celebratory burst where he burst through: golden sparkles and shaken-loose leaves.
  for (const [x, y, c, s] of [
    [262, 500, '#ffd94d', 3.6], [352, 470, '#ffd94d', 3.2], [300, 436, '#a5e36a', 4],
    [392, 520, '#e3a83a', 4.4], [228, 548, '#d97c2b', 4.4], [330, 556, '#a5e36a', 3.6],
  ]) puff(state, x, y, c, s);
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
