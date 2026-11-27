// A small seeded random generator (mulberry32): the same seed always deals the same run of
// obstacles and corn, which is what makes the screenshot scenes reproducible and lets a
// player learn a run they keep failing.

export function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random float in [min, max) drawn from `next`. */
export function between(next, min, max) {
  return min + next() * (max - min);
}

/** A random whole number in [min, max] drawn from `next`. */
export function wholeBetween(next, min, max) {
  return Math.floor(between(next, min, max + 1));
}

/** One element of `list`, chosen by `next`. */
export function pick(next, list) {
  return list[Math.floor(next() * list.length)];
}
