// Tuning for Gobble & Run: one place for every number the game balances on, so the runner's
// speed curve, the farmer's pressure and the three zones can be adjusted without hunting
// through the drawing or physics code.

export const VIEW = { width: 1280, height: 720 };
export const GROUND_Y = 604;

/** Pixels of run that count as one metre on the HUD and the escape progress bar. */
export const PIXELS_PER_METRE = 12;
/** Reaching this distance means the turkey slips through the Wildwood gate: escaped. */
export const ESCAPE_METRES = 1500;

export const TURKEY = {
  x: 318, // the turkey holds this screen position; the world scrolls past it
  width: 96,
  height: 80,
  slideHeight: 46,
  gravity: 2500,
  jumpVelocity: -1010,
  flapVelocity: -640, // the mid-air wing flap: weaker than a jump, once per leap
  runCycleSpeed: 13, // leg strides per second at full pace
};

export const FARMER = {
  startGap: 300, // pixels behind the turkey when the run begins
  caughtGap: 46, // at this gap his hand lands: caught
  scareGap: 150, // below this the HUD flashes its warning
  stumbleLoss: 138, // ground the farmer gains when the turkey clips an obstacle
  driftBack: 7.5, // ground he loses per second while the turkey runs clean
  zonePressure: [0, 2.2, 4.4], // ground he gains per second in each later zone
};

export const RUN = {
  startSpeed: 385,
  topSpeed: 665,
  speedGainPerMetre: 0.19,
  feathers: 3, // lives: one lost per obstacle hit
  invulnerableSeconds: 1.15,
  slideSeconds: 0.46,
};

/** The three stages of the escape, by distance: each adds a new danger. */
export const ZONES = [
  { until: 500, name: 'THE FARMYARD', dangers: ['fence', 'hay'] },
  { until: 1000, name: 'THE CORNFIELD', dangers: ['fence', 'hay', 'block'] },
  { until: 1501, name: 'THE KITCHEN YARD', dangers: ['block', 'oven', 'knives', 'hay'] },
];

export const SCORE = { corn: 25, goldenCorn: 100, perMetre: 1 };
