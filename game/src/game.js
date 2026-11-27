// The game itself: state, physics, spawning, collisions, the farmer's chase, the HUD and
// the three screens (title, play, caught / escaped). The turkey runs on the spot while the
// world scrolls; the farmer's gap behind him is the real clock of the game — run clean and
// he falls back, clip a danger and he lurches closer, let him touch the tail fan and the
// run ends on a platter.

import {
  ESCAPE_METRES, FARMER, GROUND_Y, PIXELS_PER_METRE, RUN, SCORE, TURKEY, VIEW, ZONES,
} from './config.js';
import { between, makeRandom, pick } from './random.js';
import {
  drawChoppingBlock, drawCorn, drawFarmer, drawFeatherIcon, drawFence, drawHangingKnives,
  drawHayBale, drawOven, drawTurkey,
} from './art.js';import { drawBackdrop, drawEscapeGate, drawLeaves } from './world.js';
import { playCaught, playCorn, playEscaped, playFlap, playHit, playJump } from './sound.js';

export const OBSTACLE_SIZE = {
  fence: { w: 64, h: 54 },
  hay: { w: 66, h: 52 },
  block: { w: 58, h: 72 },
  oven: { w: 92, h: 106 },
  knives: { w: 124, h: 172 },
};

const ZONE_LINES = [
  'Mind the fences and the hay!',
  'Chopping blocks ahead — jump them!',
  'Ovens lit and knives hung low — slide!',
];

export function zoneIndexFor(metres) {
  for (let i = 0; i < ZONES.length; i += 1) if (metres < ZONES[i].until) return i;
  return ZONES.length - 1;
}

export function createGame(seed) {
  return {
    screen: 'title',
    paused: false,
    seed,
    random: makeRandom(seed),
    time: 0,
    scroll: 0,
    distanceM: 0,
    score: 0,
    best: 0,
    cornEaten: 0,
    feathers: RUN.feathers,
    speed: RUN.startSpeed,
    farmerGap: FARMER.startGap,
    turkey: {
      y: 0, vy: 0, grounded: true, flapped: false,
      sliding: false, slideTimer: 0, runPhase: 0,
      invulnerable: 0, blink: 0, blinkTimer: 2.4, stumble: 0,
    },
    obstacles: [],
    corns: [],
    particles: [],
    nextObstacleAt: 700,
    nextCornAt: 420,
    zoneIndex: 0,
    zoneBanner: 0,
    flash: 0,
    endStats: null,
  };
}

export function startRun(state) {
  const fresh = createGame(state.seed + Math.floor(state.time * 7) + 1);
  fresh.best = Math.max(state.best, state.score);
  fresh.screen = 'play';
  fresh.zoneBanner = 2.4;
  Object.assign(state, fresh);
}

/** The turkey's hitbox: feet at GROUND_Y - y, narrower than the sprite on purpose. */
function turkeyBox(state) {
  const height = state.turkey.sliding && state.turkey.grounded ? TURKEY.slideHeight : TURKEY.height;
  return {
    left: TURKEY.x - 30,
    right: TURKEY.x + 38,
    top: GROUND_Y - state.turkey.y - height,
    bottom: GROUND_Y - state.turkey.y - 4,
  };
}

function spawnObstacle(state) {
  const zone = ZONES[state.zoneIndex];
  const kind = pick(state.random, zone.dangers);
  const size = OBSTACLE_SIZE[kind];
  state.obstacles.push({ kind, worldX: state.scroll + VIEW.width + 120, w: size.w, h: size.h, hit: false });
  const speedFactor = 1 - (state.speed - RUN.startSpeed) / (RUN.topSpeed - RUN.startSpeed) * 0.3;
  state.nextObstacleAt = state.scroll + VIEW.width + 120 + between(state.random, 430, 760) * speedFactor;
  // A reward line sometimes arcs over the danger, for the brave.
  if (state.random() < 0.4) {
    const count = 3;
    for (let i = 0; i < count; i += 1) {
      state.corns.push({
        worldX: state.scroll + VIEW.width + 120 + i * 44 - 20,
        yOff: kind === 'knives' ? 30 : 118 + Math.sin((i / (count - 1)) * Math.PI) * 26,
        golden: false, taken: false,
      });
    }
  }
}

function spawnCornRow(state) {
  const golden = state.random() < 0.14;
  const count = golden ? 1 : 4;
  const yOff = state.random() < 0.5 ? 34 : 96;
  for (let i = 0; i < count; i += 1) {
    state.corns.push({ worldX: state.scroll + VIEW.width + 100 + i * 46, yOff, golden, taken: false });
  }
  state.nextCornAt = state.scroll + VIEW.width + 100 + between(state.random, 900, 1500);
}

function burst(state, x, y, colour, count, spread = 90) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x, y,
      vx: between(state.random, -spread, spread),
      vy: between(state.random, -160, -20),
      life: between(state.random, 0.3, 0.7),
      age: 0, colour, size: between(state.random, 2, 5),
    });
  }
}

function endRun(state, escaped) {
  state.screen = escaped ? 'escaped' : 'caught';
  state.best = Math.max(state.best, state.score);
  state.endStats = {
    distance: Math.floor(state.distanceM),
    score: Math.floor(state.score),
    corn: state.cornEaten,
    escaped,
  };
  if (escaped) playEscaped(); else playCaught();
}

function hitObstacle(state, ob) {
  ob.hit = true;
  state.feathers -= 1;
  state.farmerGap -= FARMER.stumbleLoss;
  state.turkey.invulnerable = RUN.invulnerableSeconds;
  state.turkey.stumble = 0.35;
  state.flash = 0.25;
  burst(state, TURKEY.x + 10, GROUND_Y - state.turkey.y - 40, '#e8d9ae', 10, 130);
  playHit();
  if (state.feathers <= 0 || state.farmerGap <= FARMER.caughtGap) endRun(state, false);
}

/** Advance the simulation by dt seconds. `input` is { jump, slide } held-state plus edges. */
export function update(state, dt, input) {
  state.time += dt;
  const t = state.turkey;
  t.blinkTimer -= dt;
  if (t.blinkTimer <= 0) { t.blink = 0.12; t.blinkTimer = between(state.random, 1.8, 4.2); }
  if (t.blink > 0) t.blink -= dt;
  if (state.flash > 0) state.flash -= dt;
  if (state.zoneBanner > 0) state.zoneBanner -= dt;
  updateParticles(state, dt);
  if (state.screen !== 'play' || state.paused) return;

  // Speed and distance.
  state.speed = Math.min(RUN.topSpeed, RUN.startSpeed + state.distanceM * RUN.speedGainPerMetre);
  const dx = state.speed * dt;
  state.scroll += dx;
  state.distanceM = state.scroll / PIXELS_PER_METRE;
  state.score += (dx / PIXELS_PER_METRE) * SCORE.perMetre;

  // Zone changes: announce the new stage of the escape.
  const zone = zoneIndexFor(state.distanceM);
  if (zone !== state.zoneIndex) {
    state.zoneIndex = zone;
    state.zoneBanner = 2.6;
  }

  // Turkey movement: jump, flap once mid-air, slide on the ground.
  if (input.jumpPressed) {
    if (t.grounded) {
      t.vy = TURKEY.jumpVelocity;
      t.grounded = false;
      t.flapped = false;
      t.sliding = false;
      playJump();
      burst(state, TURKEY.x - 20, GROUND_Y - 2, '#c9a05e', 5, 60);
    } else if (!t.flapped) {
      t.vy = TURKEY.flapVelocity;
      t.flapped = true;
      playFlap();
      burst(state, TURKEY.x - 26, GROUND_Y - t.y - 30, '#f0e2c0', 6, 70);
    }
  }
  if (!t.grounded) {
    t.vy += TURKEY.gravity * dt;
    t.y -= t.vy * dt;
    if (t.y <= 0) {
      t.y = 0;
      t.vy = 0;
      t.grounded = true;
      burst(state, TURKEY.x - 8, GROUND_Y - 2, '#c9a05e', 6, 70);
    }
  }
  if (input.slideHeld && t.grounded) {
    if (!t.sliding) { t.sliding = true; t.slideTimer = RUN.slideSeconds; }
  } else if (t.sliding) {
    t.slideTimer -= dt;
    if (t.slideTimer <= 0 || !t.grounded) t.sliding = false;
  }
  t.runPhase += dt * TURKEY.runCycleSpeed * (state.speed / RUN.startSpeed);
  if (t.invulnerable > 0) t.invulnerable -= dt;
  if (t.stumble > 0) t.stumble -= dt;

  // The farmer: falls back on a clean run, presses harder in the later zones.
  state.farmerGap += (FARMER.driftBack - FARMER.zonePressure[state.zoneIndex]) * dt;
  state.farmerGap = Math.min(430, state.farmerGap);
  if (state.farmerGap <= FARMER.caughtGap) { endRun(state, false); return; }

  // Spawning.
  if (state.scroll + VIEW.width + 120 >= state.nextObstacleAt && state.distanceM < ESCAPE_METRES - 60) spawnObstacle(state);
  if (state.scroll + VIEW.width + 100 >= state.nextCornAt) spawnCornRow(state);

  // Collisions with dangers.
  const box = turkeyBox(state);
  for (const ob of state.obstacles) {
    const sx = ob.worldX - state.scroll;
    if (sx < -160 || sx > VIEW.width + 80) continue;
    let oTop;
    let oBottom = GROUND_Y - 2;
    if (ob.kind === 'knives') { oTop = GROUND_Y - 100; oBottom = GROUND_Y - 68; }
    else oTop = GROUND_Y - ob.h + 6;
    const oLeft = sx + 5;
    const oRight = sx + ob.w - 5;
    if (!ob.hit && t.invulnerable <= 0 && box.right > oLeft && box.left < oRight && box.bottom > oTop && box.top < oBottom) {
      hitObstacle(state, ob);
      if (state.screen !== 'play') return;
    }
  }
  state.obstacles = state.obstacles.filter((ob) => ob.worldX - state.scroll > -200);

  // Corn pickups.
  for (const corn of state.corns) {
    if (corn.taken) continue;
    const sx = corn.worldX - state.scroll;
    const sy = GROUND_Y - corn.yOff;
    if (Math.abs(sx - TURKEY.x) < 52 && Math.abs(sy - (GROUND_Y - t.y - 42)) < 56) {
      corn.taken = true;
      state.cornEaten += 1;
      state.score += corn.golden ? SCORE.goldenCorn : SCORE.corn;
      burst(state, sx, sy, corn.golden ? '#ffd94d' : '#f2b93a', corn.golden ? 12 : 6, 80);
      playCorn(corn.golden);
    }
  }
  state.corns = state.corns.filter((corn) => !corn.taken && corn.worldX - state.scroll > -80);

  // Running dust at both pairs of feet.
  if (t.grounded && state.random() < 0.5) {
    state.particles.push({
      x: TURKEY.x - 34, y: GROUND_Y - 3,
      vx: between(state.random, -70, -20), vy: between(state.random, -46, -8),
      life: between(state.random, 0.25, 0.5), age: 0, colour: '#caa066', size: between(state.random, 2, 4.4),
    });
  }

  // The gate: close enough to see, then through it.
  if (state.distanceM >= ESCAPE_METRES) endRun(state, true);
}

function updateParticles(state, dt) {
  for (const p of state.particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 300 * dt;
  }
  state.particles = state.particles.filter((p) => p.age < p.life);
}

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / p.life) * 0.8;
    ctx.fillStyle = p.colour;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function turkeyPose(state, forTitle = false) {
  const t = state.turkey;
  return {
    runPhase: t.runPhase,
    wingLift: t.grounded ? Math.max(0, Math.sin(t.runPhase * 0.5)) * 0.25 : (t.flapped ? 0.9 : 0.55),
    airborne: !t.grounded,
    sliding: t.sliding && t.grounded,
    dizzy: state.screen === 'caught',
    blink: t.blink > 0 || (forTitle && Math.sin(state.time * 0.7) > 0.97),
  };
}

function drawEntities(ctx, state) {
  // The escape gate appears in the last stretch of the run.
  const gateWorldX = ESCAPE_METRES * PIXELS_PER_METRE;
  const gateX = gateWorldX - state.scroll;
  if (gateX > -260 && gateX < VIEW.width + 200) drawEscapeGate(ctx, gateX);

  for (const corn of state.corns) {
    const sx = corn.worldX - state.scroll;
    if (sx < -50 || sx > VIEW.width + 50) continue;
    drawCorn(ctx, sx, GROUND_Y - corn.yOff, corn.golden, state.time);
  }

  for (const ob of state.obstacles) {
    const sx = ob.worldX - state.scroll;
    if (sx < -200 || sx > VIEW.width + 120) continue;
    ctx.save();
    if (ob.kind === 'fence') { ctx.translate(sx, GROUND_Y); drawFence(ctx, ob.w, ob.h); }
    else if (ob.kind === 'hay') { ctx.translate(sx + ob.w / 2, GROUND_Y); drawHayBale(ctx, ob.w, ob.h); }
    else if (ob.kind === 'block') { ctx.translate(sx + ob.w / 2, GROUND_Y); drawChoppingBlock(ctx, ob.w, ob.h, state.time * 4); }
    else if (ob.kind === 'oven') { ctx.translate(sx + ob.w / 2, GROUND_Y); drawOven(ctx, ob.w, ob.h, state.time); }
    else if (ob.kind === 'knives') { ctx.translate(sx + ob.w / 2, GROUND_Y); drawHangingKnives(ctx, ob.w, ob.h, state.time); }
    ctx.restore();
  }

  // The farmer, closing in from the left.
  const farmerX = TURKEY.x - state.farmerGap - 66;
  if (farmerX > -140) {
    ctx.save();
    ctx.translate(farmerX, GROUND_Y);
    const reach = Math.max(0, Math.min(1, 1 - (state.farmerGap - FARMER.caughtGap) / 260));
    drawFarmer(ctx, { runPhase: state.turkey.runPhase * 1.06 + 1.2, reach });
    ctx.restore();
  }

  // The turkey, flashing while invulnerable, wobbling while it stumbles.
  const t = state.turkey;
  ctx.save();
  ctx.translate(TURKEY.x, GROUND_Y - t.y);
  if (t.stumble > 0) ctx.rotate(Math.sin(state.time * 40) * 0.05);
  if (t.invulnerable > 0 && Math.floor(state.time * 14) % 2 === 0) ctx.globalAlpha = 0.45;
  drawTurkey(ctx, turkeyPose(state));
  ctx.restore();
}

function panel(ctx, x, y, w, h, fill = 'rgba(43,22,8,0.72)') {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,150,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawHUD(ctx, state) {
  // Score panel, top left.
  panel(ctx, 18, 16, 252, 74);
  ctx.fillStyle = '#ffd98a';
  ctx.font = '700 13px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('S C O R E', 34, 40);
  ctx.fillStyle = '#fff6e0';
  ctx.font = '700 30px Verdana, sans-serif';
  ctx.fillText(String(Math.floor(state.score)).padStart(6, '0'), 34, 76);
  ctx.fillStyle = 'rgba(255,246,224,0.65)';
  ctx.font = '12px Verdana, sans-serif';
  ctx.fillText(`BEST ${Math.floor(Math.max(state.best, state.score))}`, 178, 40);
  ctx.fillText(`🌽 × ${state.cornEaten}`, 178, 62);

  // Distance and feathers, top right.
  panel(ctx, VIEW.width - 268, 16, 250, 74);
  ctx.fillStyle = '#ffd98a';
  ctx.font = '700 13px Verdana, sans-serif';
  ctx.fillText('D I S T A N C E', VIEW.width - 252, 40);
  ctx.fillStyle = '#fff6e0';
  ctx.font = '700 30px Verdana, sans-serif';
  ctx.fillText(`${Math.floor(state.distanceM)} m`, VIEW.width - 252, 76);
  for (let i = 0; i < RUN.feathers; i += 1) {
    drawFeatherIcon(ctx, VIEW.width - 84 + i * 26, 66, 0.92, i >= state.feathers);
  }

  // Escape progress: a track from farm to Wildwood, turkey and farmer markers on it.
  const trackX = 330;
  const trackW = VIEW.width - 660;
  panel(ctx, trackX - 12, 16, trackW + 24, 74);
  ctx.fillStyle = '#ffd98a';
  ctx.font = '700 12px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${ZONES[state.zoneIndex].name}  →  WILDWOOD ${ESCAPE_METRES} m`, VIEW.width / 2, 38);
  ctx.fillStyle = 'rgba(255,246,224,0.25)';
  ctx.beginPath();
  ctx.roundRect(trackX, 52, trackW, 14, 7);
  ctx.fill();
  const progress = Math.min(1, state.distanceM / ESCAPE_METRES);
  ctx.fillStyle = '#8fce4e';
  ctx.beginPath();
  ctx.roundRect(trackX, 52, Math.max(14, trackW * progress), 14, 7);
  ctx.fill();
  ctx.font = '17px Verdana, sans-serif';
  ctx.fillText('🦃', trackX + trackW * progress, 68);
  const farmerMark = Math.max(0, progress - state.farmerGap / (ESCAPE_METRES * PIXELS_PER_METRE));
  ctx.fillText('🧑‍🌾', trackX + trackW * farmerMark, 68);
  ctx.fillText('🌲', trackX + trackW - 4, 68);

  // Zone banner.
  if (state.zoneBanner > 0) {
    ctx.globalAlpha = Math.min(1, state.zoneBanner);
    ctx.textAlign = 'center';
    ctx.font = '800 40px Georgia, serif';
    ctx.fillStyle = '#fff3d6';
    ctx.strokeStyle = 'rgba(80,36,8,0.9)';
    ctx.lineWidth = 7;
    const label = ZONES[state.zoneIndex].name;
    ctx.strokeText(label, VIEW.width / 2, 150);
    ctx.fillText(label, VIEW.width / 2, 150);
    ctx.font = '600 19px Georgia, serif';
    ctx.lineWidth = 5;
    ctx.strokeText(ZONE_LINES[state.zoneIndex], VIEW.width / 2, 180);
    ctx.fillText(ZONE_LINES[state.zoneIndex], VIEW.width / 2, 180);
    ctx.globalAlpha = 1;
  }

  // The warning every runner dreads.
  if (state.farmerGap < FARMER.scareGap && Math.floor(state.time * 3.2) % 2 === 0) {
    ctx.textAlign = 'center';
    ctx.font = '800 27px Verdana, sans-serif';
    ctx.fillStyle = '#ff5a3c';
    ctx.strokeStyle = 'rgba(60,8,0,0.85)';
    ctx.lineWidth = 6;
    ctx.strokeText('⚠ THE FARMER IS ON YOUR TAIL! ⚠', VIEW.width / 2, VIEW.height - 24);
    ctx.fillText('⚠ THE FARMER IS ON YOUR TAIL! ⚠', VIEW.width / 2, VIEW.height - 24);
  }
}

function bigTitle(ctx, text, y, size, fill, stroke) {
  ctx.textAlign = 'center';
  ctx.font = `900 ${size}px Georgia, 'Times New Roman', serif`;
  ctx.lineWidth = size / 7;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, VIEW.width / 2, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, VIEW.width / 2, y);
}

function drawTitleScreen(ctx, state) {
  // The two stars of the chase flank the instructions panel, running on the spot.
  const phase = state.time * 9;
  ctx.save();
  ctx.translate(178, GROUND_Y);
  ctx.scale(1.28, 1.28);
  drawFarmer(ctx, { runPhase: phase * 1.06 + 1.2, reach: 0.55 });
  ctx.restore();
  ctx.save();
  ctx.translate(1092, GROUND_Y);
  ctx.scale(1.34, 1.34);
  drawTurkey(ctx, {
    runPhase: phase, wingLift: 0.3, airborne: false, sliding: false, dizzy: false,
    blink: Math.sin(state.time * 0.7) > 0.97,
  });
  ctx.restore();
  drawCorn(ctx, 1006, GROUND_Y - 30, false, state.time);
  drawCorn(ctx, 1180, GROUND_Y - 26, true, state.time);
  ctx.fillStyle = 'rgba(46,20,4,0.30)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  ctx.textAlign = 'center';
  ctx.font = '700 25px Georgia, serif';
  ctx.fillStyle = '#ffe9bb';
  ctx.fillText('· T H E   G R E A T   T U R K E Y   E S C A P E ·', VIEW.width / 2, 128);
  bigTitle(ctx, 'GOBBLE', 238, 118, '#ffb03a', '#5d2405');
  bigTitle(ctx, '& RUN!', 348, 118, '#ff7847', '#5d2405');
  ctx.font = 'italic 600 23px Georgia, serif';
  ctx.fillStyle = '#fff3d6';
  ctx.fillText('Dinner is at six. He plans to be elsewhere.', VIEW.width / 2, 398);

  panel(ctx, VIEW.width / 2 - 330, 428, 660, 118);
  ctx.fillStyle = '#ffe9bb';
  ctx.font = '700 18px Verdana, sans-serif';
  ctx.fillText('HOW TO RUN', VIEW.width / 2, 460);
  ctx.fillStyle = '#fff6e0';
  ctx.font = '16px Verdana, sans-serif';
  ctx.fillText('SPACE / CLICK — jump · press again mid-air to FLAP', VIEW.width / 2, 490);
  ctx.fillText('↓ — slide under the hanging knives', VIEW.width / 2, 516);
  ctx.fillText(`Reach the Wildwood gate at ${ESCAPE_METRES} m. Don't let him touch your tail.`, VIEW.width / 2, 542);

  if (Math.floor(state.time * 1.6) % 2 === 0) {
    ctx.font = '800 26px Verdana, sans-serif';
    ctx.fillStyle = '#ffd94d';
    ctx.strokeStyle = 'rgba(60,20,0,0.8)';
    ctx.lineWidth = 5;
    ctx.strokeText('PRESS ENTER OR CLICK TO RUN', VIEW.width / 2, 606);
    ctx.fillText('PRESS ENTER OR CLICK TO RUN', VIEW.width / 2, 606);
  }
  ctx.font = '13px Verdana, sans-serif';
  ctx.fillStyle = 'rgba(255,243,214,0.75)';
  ctx.fillText('M — sound on/off · P — pause', VIEW.width / 2, 640);
}

function drawEndScreen(ctx, state) {
  const stats = state.endStats ?? { distance: 0, score: 0, corn: 0, escaped: state.screen === 'escaped' };
  ctx.fillStyle = stats.escaped ? 'rgba(24,44,10,0.45)' : 'rgba(50,10,4,0.5)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  if (stats.escaped) {
    bigTitle(ctx, 'ESCAPED!', 190, 96, '#a5e36a', '#1d3a08');
    ctx.font = 'italic 600 23px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2ffd9';
    ctx.fillText('Through the gate and into the Wildwood — free as a bird,', VIEW.width / 2, 238);
    ctx.fillText('and not the dinner kind. The farmer is ordering takeaway.', VIEW.width / 2, 268);
  } else {
    bigTitle(ctx, 'CAUGHT!', 190, 96, '#ff6a4d', '#4a0d02');
    ctx.font = 'italic 600 23px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe9d9';
    ctx.fillText('One feathered handful, and the chase is over.', VIEW.width / 2, 238);
    ctx.fillText('Tonight he eats well. Tomorrow, you run again.', VIEW.width / 2, 268);
  }
  panel(ctx, VIEW.width / 2 - 250, 306, 500, 158);
  ctx.fillStyle = '#ffe9bb';
  ctx.font = '700 19px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('— THE TALE OF THE RUN —', VIEW.width / 2, 342);
  ctx.fillStyle = '#fff6e0';
  ctx.font = '600 21px Verdana, sans-serif';
  ctx.fillText(`Distance run    ${stats.distance} m of ${ESCAPE_METRES} m`, VIEW.width / 2, 380);
  ctx.fillText(`Score    ${stats.score}`, VIEW.width / 2, 412);
  ctx.fillText(`Corn grabbed    ${stats.corn}`, VIEW.width / 2, 444);
  if (Math.floor(state.time * 1.6) % 2 === 0) {
    ctx.font = '800 25px Verdana, sans-serif';
    ctx.fillStyle = '#ffd94d';
    ctx.strokeStyle = 'rgba(60,20,0,0.8)';
    ctx.lineWidth = 5;
    ctx.strokeText('PRESS R OR CLICK TO RUN AGAIN', VIEW.width / 2, 528);
    ctx.fillText('PRESS R OR CLICK TO RUN AGAIN', VIEW.width / 2, 528);
  }
}

/** Draw one whole frame: backdrop, entities, then the screen furniture for the state. */
export function drawGame(ctx, state) {
  const zone = state.zoneIndex;
  const zoneStart = zone === 0 ? 0 : ZONES[zone - 1].until;
  const blend = Math.max(0, Math.min(1, (state.distanceM - (ZONES[zone].until - 90)) / 90));
  void zoneStart;
  drawBackdrop(ctx, state.scroll, state.time, zone, state.screen === 'play' ? blend : 0);
  if (state.screen === 'title') {
    drawTitleScreen(ctx, state);
  } else {
    drawEntities(ctx, state);
    drawParticles(ctx, state);
    drawLeaves(ctx, state.time, state.scroll);
    if (state.screen === 'play') drawHUD(ctx, state);
    else drawEndScreen(ctx, state);
  }
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255,60,30,${state.flash * 0.55})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
  if (state.paused && state.screen === 'play') {
    ctx.fillStyle = 'rgba(30,14,2,0.55)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    bigTitle(ctx, 'PAUSED', VIEW.height / 2, 64, '#ffe9bb', '#4a2408');
    ctx.textAlign = 'center';
    ctx.font = '600 19px Verdana, sans-serif';
    ctx.fillStyle = '#fff6e0';
    ctx.fillText('Press P to keep running', VIEW.width / 2, VIEW.height / 2 + 44);
  }
}
