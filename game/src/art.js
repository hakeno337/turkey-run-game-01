// The cast and the props, drawn in code: a wild turkey with a fanned tail and a flapping
// wing, the farmer with his carving knife, and every danger of the run — fence, hay bale,
// chopping block, oven and the hanging knives of the kitchen yard. Each figure is drawn
// around its own origin so the game can pose it freely: run cycle, leap, slide, stumble.

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundedRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** One tail feather: a tapered plume with a darker tip and a pale eye spot. */
function tailFeather(ctx, length, width, base, tip) {
  const grad = ctx.createLinearGradient(0, 0, 0, -length);
  grad.addColorStop(0, base);
  grad.addColorStop(0.72, base);
  grad.addColorStop(0.8, '#3a2415');
  grad.addColorStop(1, tip);
  ctx.beginPath();
  ctx.moveTo(-width / 2, 0);
  ctx.quadraticCurveTo(-width / 2, -length * 0.7, 0, -length);
  ctx.quadraticCurveTo(width / 2, -length * 0.7, width / 2, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ellipse(ctx, 0, -length * 0.86, width * 0.2, length * 0.07, 'rgba(240,220,180,0.55)');
}

/**
 * The turkey, facing right, feet at (0, 0). `pose` carries the animation: runPhase for the
 * leg cycle, wingLift from 0 (folded) to 1 (raised), neckStretch when sliding, dizzy for
 * the caught screen and blink for the occasional eye blink.
 */
export function drawTurkey(ctx, pose) {
  const { runPhase, wingLift, airborne, sliding, dizzy, blink } = pose;
  ctx.save();
  if (sliding) ctx.transform(1, 0, -0.18, 0.82, 0, 14);

  // Tail fan: seven plumes spread behind the body, swaying with the run.
  ctx.save();
  ctx.translate(-34, -44);
  const sway = Math.sin(runPhase * 0.5) * 0.03;
  for (let i = 0; i < 7; i += 1) {
    const angle = -0.95 + i * 0.3 + sway;
    ctx.save();
    ctx.rotate(angle);
    tailFeather(ctx, 74 - Math.abs(i - 3) * 5, 17, i % 2 ? '#8a5a28' : '#9c6a30', '#5d3a17');
    ctx.restore();
  }
  ctx.restore();

  // Legs: two orange legs trading strides; tucked up when airborne, trailing when sliding.
  const legSwing = airborne ? 0.5 : Math.sin(runPhase) * 0.75;
  ctx.strokeStyle = '#e8862a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (const side of [1, -1]) {
    const swing = legSwing * side;
    const hipX = -4 + side * 9;
    const kneeX = hipX + (sliding ? -16 : Math.sin(swing) * 13);
    const footY = sliding ? -4 : -Math.max(0, Math.cos(swing)) * 13;
    ctx.beginPath();
    ctx.moveTo(hipX, -26);
    ctx.lineTo(kneeX, -13);
    ctx.lineTo(kneeX + 6, footY - 1);
    ctx.stroke();
    ctx.beginPath(); // three-toed foot
    ctx.moveTo(kneeX + 1, footY);
    ctx.lineTo(kneeX + 12, footY);
    ctx.moveTo(kneeX + 4, footY);
    ctx.lineTo(kneeX + 10, footY - 4);
    ctx.stroke();
  }

  // Body: a shaded chestnut oval with a cream belly and barred feather strokes.
  const bodyGrad = ctx.createLinearGradient(0, -84, 0, -18);
  bodyGrad.addColorStop(0, '#7c4a20');
  bodyGrad.addColorStop(0.55, '#96602c');
  bodyGrad.addColorStop(1, '#c99a58');
  ellipse(ctx, 0, -50, 47, 35, bodyGrad);
  ellipse(ctx, 10, -38, 32, 19, 'rgba(238,214,164,0.75)');
  ctx.strokeStyle = 'rgba(70,40,14,0.35)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 3; row += 1) {
    ctx.beginPath();
    ctx.arc(-6, -62 + row * 11, 30 - row * 4, 0.35, Math.PI - 0.6);
    ctx.stroke();
  }
  // The beard: a little black tuft on the chest, as every proud tom turkey wears.
  ctx.strokeStyle = '#241407';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(38, -52);
  ctx.quadraticCurveTo(44, -40, 41, -30);
  ctx.stroke();

  // Wing: folded along the body at rest, sweeping up and down with wingLift.
  ctx.save();
  ctx.translate(2, -58);
  ctx.rotate(-0.25 - wingLift * 1.15);
  const wingGrad = ctx.createLinearGradient(0, 0, -38, 26);
  wingGrad.addColorStop(0, '#6e3f1a');
  wingGrad.addColorStop(1, '#a8743a');
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-34, 6, -40, 28);
  ctx.quadraticCurveTo(-16, 30, 8, 16);
  ctx.quadraticCurveTo(14, 6, 0, 0);
  ctx.closePath();
  ctx.fillStyle = wingGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(46,26,8,0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-6 - i * 8, 6 + i * 3);
    ctx.lineTo(-22 - i * 6, 22 + i * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Neck and head: bare blue-grey skin, a red wattle, and a determined eye.
  const neckBaseX = sliding ? 52 : 40;
  ctx.strokeStyle = '#7f9bb3';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(34, -64);
  ctx.quadraticCurveTo(neckBaseX + 6, -78, neckBaseX + 2, -92);
  ctx.stroke();
  ellipse(ctx, neckBaseX + 4, -97, 14, 12, '#8fa9bf');
  ellipse(ctx, neckBaseX + 8, -101, 8, 6, '#a7bfd2');
  // Wattle: the red flap under the beak, swinging as he runs.
  ctx.fillStyle = '#c93a2e';
  ctx.beginPath();
  ctx.ellipse(neckBaseX + 13, -86, 5, 9 + Math.sin(runPhase * 0.5) * 1.5, 0.25, 0, Math.PI * 2);
  ctx.fill();
  // Snood over the beak.
  ctx.beginPath();
  ctx.ellipse(neckBaseX + 16, -95, 3, 6, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Beak.
  ctx.beginPath();
  ctx.moveTo(neckBaseX + 14, -100);
  ctx.lineTo(neckBaseX + 30, -95);
  ctx.lineTo(neckBaseX + 14, -90);
  ctx.closePath();
  ctx.fillStyle = '#e8a91c';
  ctx.fill();
  // Eye: wide and worried, spiral when dizzy, a slit when blinking.
  if (dizzy) {
    ctx.strokeStyle = '#1d2733';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(neckBaseX + 5, -99, 5, runPhase, runPhase + Math.PI * 4.4);
    ctx.stroke();
  } else if (blink) {
    ctx.strokeStyle = '#1d2733';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(neckBaseX, -99);
    ctx.lineTo(neckBaseX + 10, -99);
    ctx.stroke();
  } else {
    ellipse(ctx, neckBaseX + 5, -99, 5.4, 5.4, '#ffffff');
    ellipse(ctx, neckBaseX + 6.5, -99, 3, 3, '#1d2733');
    ellipse(ctx, neckBaseX + 7.5, -100.5, 1.1, 1.1, '#ffffff');
  }
  ctx.restore();
}

/**
 * The farmer, facing right, feet at (0, 0): straw hat, plaid shirt, denim overalls and one
 * arm raised with the carving knife. `reach` from 0 to 1 stretches the knife arm toward
 * the turkey as he closes in.
 */
export function drawFarmer(ctx, pose) {
  const { runPhase, reach } = pose;
  ctx.save();
  const stride = Math.sin(runPhase);
  // Legs in overalls, boots trading strides.
  ctx.lineCap = 'round';
  for (const side of [1, -1]) {
    const swing = stride * side;
    ctx.strokeStyle = '#33507e';
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(side * 7, -62);
    ctx.lineTo(side * 7 + swing * 20, -30);
    ctx.lineTo(side * 7 + swing * 27, -3);
    ctx.stroke();
    ctx.strokeStyle = '#4a2f18';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(side * 7 + swing * 27 - 3, -3);
    ctx.lineTo(side * 7 + swing * 27 + 10, -3);
    ctx.stroke();
  }
  // Torso: plaid shirt under overall bib.
  roundedRect(ctx, -21, -118, 44, 60, 9, '#b0402f');
  ctx.strokeStyle = 'rgba(255,220,190,0.4)';
  ctx.lineWidth = 3;
  for (let i = -1; i < 3; i += 1) {
    ctx.beginPath(); ctx.moveTo(-21, -108 + i * 14); ctx.lineTo(23, -108 + i * 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10 + i * 13, -118); ctx.lineTo(-10 + i * 13, -58); ctx.stroke();
  }
  roundedRect(ctx, -15, -104, 32, 46, 5, '#3c5c8c');
  ctx.fillStyle = '#e8c33a';
  ellipse(ctx, -8, -96, 3, 3, '#e8c33a');
  ellipse(ctx, 10, -96, 3, 3, '#e8c33a');
  // Back arm pumps; front arm reaches with the knife.
  ctx.strokeStyle = '#b0402f';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(-16, -108);
  ctx.lineTo(-30, -84 + stride * 10);
  ctx.lineTo(-24, -64 + stride * 12);
  ctx.stroke();
  const handX = 26 + reach * 30;
  const handY = -96 - reach * 8;
  ctx.beginPath();
  ctx.moveTo(18, -108);
  ctx.lineTo(handX - 8, handY + 12);
  ctx.lineTo(handX, handY);
  ctx.stroke();
  ellipse(ctx, handX, handY, 6, 6, '#e8b98d');
  // The carving knife: a long blade with a glint, angled at the turkey.
  ctx.save();
  ctx.translate(handX, handY);
  ctx.rotate(-0.32 - reach * 0.15);
  roundedRect(ctx, 0, -4, 15, 8, 3, '#5d3a17');
  const bladeGrad = ctx.createLinearGradient(0, -6, 0, 6);
  bladeGrad.addColorStop(0, '#f4f7fa');
  bladeGrad.addColorStop(0.5, '#c3ccd4');
  bladeGrad.addColorStop(1, '#8d99a5');
  ctx.beginPath();
  ctx.moveTo(14, -6);
  ctx.lineTo(56, -3);
  ctx.quadraticCurveTo(64, 0, 56, 3);
  ctx.lineTo(14, 5);
  ctx.closePath();
  ctx.fillStyle = bladeGrad;
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(46, -4);
  ctx.lineTo(52, -4);
  ctx.lineTo(49, 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Head: sunburnt face, gritted grin, straw hat.
  ellipse(ctx, 2, -134, 16, 15, '#e8b98d');
  ellipse(ctx, 15, -130, 4, 5, '#e8b98d');
  ctx.fillStyle = '#7c4a20';
  ctx.fillRect(-4, -124, 15, 4); // moustache under the grin
  ellipse(ctx, 7, -138, 2.4, 3, '#1d2733');
  ctx.strokeStyle = '#1d2733';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(1, -146); ctx.lineTo(12, -144); ctx.stroke(); // eyebrow, lowered
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.ellipse(2, -148, 27, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  roundedRect(ctx, -11, -164, 27, 13, 5, '#e3b34e');
  ctx.fillStyle = '#a8742a';
  ctx.fillRect(-11, -154, 27, 3);
  ctx.restore();
}

/** A split-rail fence panel the turkey must hurdle: weathered posts and two rails. */
export function drawFence(ctx, w, h) {
  ctx.fillStyle = '#8a6844';
  ctx.fillRect(4, -h, 11, h);
  ctx.fillRect(w - 15, -h, 11, h);
  ctx.fillStyle = '#9c774e';
  ctx.fillRect(0, -h + 8, w, 10);
  ctx.fillRect(0, -h / 2 - 2, w, 10);
  ctx.fillStyle = 'rgba(60,38,16,0.35)';
  ctx.fillRect(0, -h + 16, w, 2);
  ctx.fillRect(0, -h / 2 + 6, w, 2);
  ctx.fillStyle = '#6e5233';
  ellipse(ctx, 9, -h + 4, 3, 3, '#6e5233');
  ellipse(ctx, w - 10, -h + 4, 3, 3, '#6e5233');
}

/** A round hay bale: golden spiral rolls with two twine bands. */
export function drawHayBale(ctx, w, h) {
  const r = h / 2;
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 1.2, r * 0.2, 0, -r, r * 1.15);
  grad.addColorStop(0, '#eec95e');
  grad.addColorStop(0.7, '#d9a83a');
  grad.addColorStop(1, '#b4832a');
  ctx.beginPath();
  ctx.ellipse(0, -r, w / 2, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(140,95,25,0.55)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(0, -r, (w / 2) * (i / 4), r * (i / 4), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#8a5a1e';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-w * 0.22, -h + 2); ctx.lineTo(-w * 0.22, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.22, -h + 2); ctx.lineTo(w * 0.22, -2); ctx.stroke();
}

/** A chopping block with the carving knife buried in it, waiting to trip a careless bird. */
export function drawChoppingBlock(ctx, w, h, glintPhase) {
  const grad = ctx.createLinearGradient(0, -h, 0, 0);
  grad.addColorStop(0, '#a4763f');
  grad.addColorStop(1, '#7c5527');
  roundedRect(ctx, -w / 2, -h, w, h, 5, grad);
  ctx.strokeStyle = 'rgba(80,52,18,0.5)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(0, -h + 3, (w / 2) * (i / 4), 3.4, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(60,38,14,0.45)';
  ctx.beginPath(); ctx.moveTo(-w / 2 + 6, -h + 14); ctx.lineTo(-w / 2 + 6, -4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w / 2 - 9, -h + 10); ctx.lineTo(w / 2 - 9, -6); ctx.stroke();
  // The knife, handle up, blade in the wood.
  ctx.save();
  ctx.translate(6, -h);
  ctx.rotate(0.22);
  roundedRect(ctx, -5, -44, 11, 32, 5, '#4a2c10');
  ctx.fillStyle = '#e8c33a';
  ctx.beginPath(); ctx.arc(0, -38, 3, 0, Math.PI * 2); ctx.fill();
  const blade = ctx.createLinearGradient(0, -14, 0, 2);
  blade.addColorStop(0, '#e8edf2');
  blade.addColorStop(1, '#97a3ae');
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.lineTo(9, -14);
  ctx.lineTo(3, 3);
  ctx.lineTo(-4, 3);
  ctx.closePath();
  ctx.fillStyle = blade;
  ctx.fill();
  ctx.restore();
  // A star glint that pulses on the blade tip.
  const glint = 0.5 + 0.5 * Math.sin(glintPhase);
  ctx.strokeStyle = `rgba(255,255,255,${0.35 + glint * 0.6})`;
  ctx.lineWidth = 2;
  const gx = 15;
  const gy = -h - 38;
  ctx.beginPath();
  ctx.moveTo(gx - 7, gy); ctx.lineTo(gx + 7, gy);
  ctx.moveTo(gx, gy - 7); ctx.lineTo(gx, gy + 7);
  ctx.stroke();
}

/** A cast-iron oven, door ajar on a fire inside: the tallest danger of the kitchen yard. */
export function drawOven(ctx, w, h, time) {
  const grad = ctx.createLinearGradient(0, -h, 0, 0);
  grad.addColorStop(0, '#3d4148');
  grad.addColorStop(1, '#23262b');
  roundedRect(ctx, -w / 2, -h, w, h, 8, grad);
  ctx.fillStyle = '#17191d';
  ctx.fillRect(-w / 2 + 8, -h + 10, w - 16, 12); // top plate rim
  ellipse(ctx, -w * 0.22, -h + 16, 9, 4, '#0e0f12');
  ellipse(ctx, w * 0.22, -h + 16, 9, 4, '#0e0f12');
  // Chimney pipe with drifting smoke.
  ctx.fillStyle = '#2c2f34';
  ctx.fillRect(w * 0.22, -h - 30, 14, 32);
  ctx.fillStyle = 'rgba(220,220,225,0.5)';
  for (let i = 0; i < 3; i += 1) {
    const rise = ((time * 22 + i * 26) % 78);
    ellipse(ctx, w * 0.22 + 7 + Math.sin(time * 2 + i) * 4, -h - 36 - rise, 6 + rise * 0.16, 5 + rise * 0.12, `rgba(220,220,225,${0.5 - rise / 170})`);
  }
  // The door, swung a crack open, firelight spilling out.
  const fire = 0.75 + Math.sin(time * 11) * 0.15 + Math.sin(time * 23) * 0.1;
  const doorGrad = ctx.createRadialGradient(0, -h * 0.38, 4, 0, -h * 0.38, w * 0.42);
  doorGrad.addColorStop(0, `rgba(255,214,90,${fire})`);
  doorGrad.addColorStop(0.55, `rgba(244,120,32,${fire * 0.9})`);
  doorGrad.addColorStop(1, 'rgba(120,30,8,0.95)');
  roundedRect(ctx, -w * 0.32, -h * 0.72, w * 0.64, h * 0.52, 6, doorGrad);
  ctx.strokeStyle = '#101216';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(-w * 0.32, -h * 0.72, w * 0.64, h * 0.52, 6);
  ctx.stroke();
  // Flames licking inside the door.
  ctx.fillStyle = 'rgba(255,236,160,0.9)';
  for (let i = 0; i < 3; i += 1) {
    const fx = -w * 0.18 + i * w * 0.17;
    const fh = h * (0.16 + 0.05 * Math.sin(time * 13 + i * 2.1));
    ctx.beginPath();
    ctx.moveTo(fx - 7, -h * 0.24);
    ctx.quadraticCurveTo(fx, -h * 0.24 - fh, fx + 7, -h * 0.24);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#c8ccd2';
  ellipse(ctx, w * 0.36, -h * 0.46, 4, 4, '#c8ccd2'); // door knob
  ctx.fillStyle = 'rgba(255,140,40,0.16)';
  ctx.fillRect(-w / 2 - 8, -26, w + 16, 26); // heat glow pooling at the base
}

/** A beam strung with hanging carving knives: low enough that the turkey must slide. */
export function drawHangingKnives(ctx, w, h, time) {
  ctx.fillStyle = '#6e4a26';
  ctx.fillRect(-w / 2, -h, 10, h);
  ctx.fillRect(w / 2 - 10, -h, 10, h);
  ctx.fillRect(-w / 2 - 4, -h, w + 8, 12);
  ctx.fillStyle = 'rgba(50,30,10,0.4)';
  ctx.fillRect(-w / 2 - 4, -h + 9, w + 8, 3);
  const count = 3;
  for (let i = 0; i < count; i += 1) {
    const x = -w / 2 + (i + 0.5) * (w / count);
    const sway = Math.sin(time * 2.2 + i * 1.7) * 0.07;
    ctx.save();
    ctx.translate(x, -h + 12);
    ctx.rotate(sway);
    ctx.strokeStyle = '#3a3f45';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 12); ctx.stroke();
    roundedRect(ctx, -4, 12, 9, 20, 4, '#4a2c10');
    const blade = ctx.createLinearGradient(0, 32, 0, 74);
    blade.addColorStop(0, '#eef2f6');
    blade.addColorStop(1, '#8d99a5');
    ctx.beginPath();
    ctx.moveTo(-7, 32);
    ctx.lineTo(8, 32);
    ctx.lineTo(1, 74);
    ctx.closePath();
    ctx.fillStyle = blade;
    ctx.fill();
    ctx.restore();
  }
}

/** A corn cob pickup, golden or the rare glowing prize cob. */
export function drawCorn(ctx, x, y, golden, time) {
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 3 + x * 0.05) * 4);
  ctx.rotate(-0.5);
  if (golden) {
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
    glow.addColorStop(0, 'rgba(255,214,80,0.55)');
    glow.addColorStop(1, 'rgba(255,214,80,0)');
    ellipse(ctx, 0, 0, 30, 30, glow);
  }
  const grad = ctx.createLinearGradient(-8, 0, 8, 0);
  grad.addColorStop(0, golden ? '#ffca3a' : '#f2b93a');
  grad.addColorStop(1, golden ? '#f59e0b' : '#d99322');
  roundedRect(ctx, -8, -17, 16, 34, 8, grad);
  ctx.strokeStyle = 'rgba(146,90,10,0.55)';
  ctx.lineWidth = 1.4;
  for (let i = -1; i < 2; i += 1) {
    ctx.beginPath(); ctx.moveTo(i * 5.4, -16); ctx.lineTo(i * 5.4, 16); ctx.stroke();
  }
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath(); ctx.moveTo(-8, -10 + i * 7); ctx.lineTo(8, -10 + i * 7); ctx.stroke();
  }
  // Husk leaves peeling from the base.
  ctx.fillStyle = '#5d8a3c';
  ctx.beginPath();
  ctx.moveTo(-7, 12);
  ctx.quadraticCurveTo(-16, 22, -13, 30);
  ctx.quadraticCurveTo(-5, 24, -2, 15);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(7, 12);
  ctx.quadraticCurveTo(15, 20, 12, 29);
  ctx.quadraticCurveTo(5, 23, 2, 15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A small tail-feather icon, used for the lives display. */
export function drawFeatherIcon(ctx, x, y, scale, lost) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(0.5);
  ctx.globalAlpha = lost ? 0.25 : 1;
  const grad = ctx.createLinearGradient(0, 0, 0, -30);
  grad.addColorStop(0, '#9c6a30');
  grad.addColorStop(0.8, '#3a2415');
  grad.addColorStop(1, '#c98a3a');
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.quadraticCurveTo(-6, -22, 0, -30);
  ctx.quadraticCurveTo(6, -22, 6, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#e8d9ae';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -27); ctx.stroke();
  ctx.restore();
}
