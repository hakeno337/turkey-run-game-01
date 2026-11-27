// Bootstrap: fit the canvas to the window, wire the keyboard and mouse, run the fixed-step
// loop, and honour ?shot=<scene> by staging one still frame instead of playing. Input is
// read as held keys plus a jump edge, so the game itself never touches the DOM.

import { VIEW } from './config.js';
import { createGame, drawGame, startRun, update } from './game.js';
import { stageShot } from './shots.js';
import { toggleMute, wakeAudio } from './sound.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = Math.round(VIEW.width * scale * (window.devicePixelRatio > 1 ? 1.5 : 1));
  canvas.height = Math.round(VIEW.height * scale * (window.devicePixelRatio > 1 ? 1.5 : 1));
  canvas.style.width = `${Math.round(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.round(VIEW.height * scale)}px`;
  canvas.style.marginLeft = `${Math.round((window.innerWidth - VIEW.width * scale) / 2)}px`;
  canvas.style.marginTop = `${Math.round((window.innerHeight - VIEW.height * scale) / 2)}px`;
  ctx.setTransform(canvas.width / VIEW.width, 0, 0, canvas.height / VIEW.height, 0, 0);
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') ?? 7) || 7;
const state = createGame(seed);
window.gobbleRun = state; // a handle for playtest harnesses: the live game state, nothing more

const held = { jump: false, slide: false };
let jumpEdge = false;

function pressJump() {
  wakeAudio();
  if (state.screen === 'title') { startRun(state); return; }
  if (state.screen === 'caught' || state.screen === 'escaped') { startRun(state); return; }
  if (!held.jump) jumpEdge = true;
  held.jump = true;
}

function pressSlide(down) {
  held.slide = down;
}

const KEYMAP = {
  Space: 'jump', ArrowUp: 'jump', KeyW: 'jump',
  ArrowDown: 'slide', KeyS: 'slide',
};
window.addEventListener('keydown', (event) => {
  const action = KEYMAP[event.code];
  if (action === 'jump') { event.preventDefault(); pressJump(); }
  else if (action === 'slide') { event.preventDefault(); pressSlide(true); }
  else if (event.code === 'Enter') {
    wakeAudio();
    if (state.screen !== 'play') startRun(state);
  } else if (event.code === 'KeyR' && state.screen !== 'play') startRun(state);
  else if (event.code === 'KeyM') {
    const mutedNow = toggleMute();
    status.textContent = mutedNow ? 'Sound off' : 'Sound on';
  } else if (event.code === 'KeyP' && state.screen === 'play') state.paused = !state.paused;
});
window.addEventListener('keyup', (event) => {
  const action = KEYMAP[event.code];
  if (action === 'jump') held.jump = false;
  if (action === 'slide') pressSlide(false);
});
canvas.addEventListener('pointerdown', (event) => {
  if (event.clientY > window.innerHeight * 0.62 && state.screen === 'play') pressSlide(true);
  else pressJump();
});
canvas.addEventListener('pointerup', () => { held.jump = false; pressSlide(false); });

if (params.has('shot')) {
  stageShot(params.get('shot'), state);
  drawGame(ctx, state);
  status.textContent = `Screenshot scene: ${params.get('shot')}`;
} else {
  let last = performance.now();
  let accumulator = 0;
  const STEP = 1 / 120;
  function frame(now) {
    accumulator += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (accumulator >= STEP) {
      update(state, STEP, { jumpPressed: jumpEdge, slideHeld: held.slide });
      jumpEdge = false;
      accumulator -= STEP;
    }
    drawGame(ctx, state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
