// The world rolling past the turkey: an autumn sunset sky, layered hills, and a landmark
// for each zone of the escape — the barn and windmill of the farmyard, the tall corn of the
// cornfield, the farmhouse windows of the kitchen yard. Everything scrolls at its own
// depth, and the ground carries the fastest texture so the speed reads at a glance.

import { GROUND_Y, VIEW } from './config.js';
import { drawPumpkin } from './art.js';

const SKY_STOPS = [
  ['#ffd98a', '#ffb35c', '#e2703a'], // farmyard gold
  ['#ffc978', '#f59a4e', '#cf5f33'], // cornfield amber
  ['#f7a856', '#e2703a', '#a83e2c'], // kitchen-yard ember
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function mixHex(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return `rgb(${Math.round(lerp(ca[0], cb[0], t))},${Math.round(lerp(ca[1], cb[1], t))},${Math.round(lerp(ca[2], cb[2], t))})`;
}

/** Sky colours for a point in the run: zoneIndex whole, zoneBlend 0..1 toward the next. */
function skyColours(zoneIndex, zoneBlend) {
  const from = SKY_STOPS[Math.min(zoneIndex, 2)];
  const to = SKY_STOPS[Math.min(zoneIndex + 1, 2)];
  return [mixHex(from[0], to[0], zoneBlend), mixHex(from[1], to[1], zoneBlend), mixHex(from[2], to[2], zoneBlend)];
}

function drawSun(ctx, scroll, colours) {
  const x = VIEW.width * 0.78 - (scroll * 0.01) % 60;
  const y = 148;
  const glow = ctx.createRadialGradient(x, y, 10, x, y, 260);
  glow.addColorStop(0, 'rgba(255,240,190,0.95)');
  glow.addColorStop(0.22, 'rgba(255,205,110,0.5)');
  glow.addColorStop(0.55, 'rgba(255,180,90,0.18)');
  glow.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 270, y - 270, 540, 540);
  ctx.beginPath();
  ctx.arc(x, y, 62, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,214,120,0.35)';
  ctx.fill();
  const disc = ctx.createRadialGradient(x - 12, y - 12, 6, x, y, 47);
  disc.addColorStop(0, '#fff3c4');
  disc.addColorStop(0.75, '#ffdf8e');
  disc.addColorStop(1, '#ffc46a');
  ctx.beginPath();
  ctx.arc(x, y, 46, 0, Math.PI * 2);
  ctx.fillStyle = disc;
  ctx.fill();
  void colours;
}

function drawClouds(ctx, scroll, time) {
  // High wisps first: long, thin, barely there.
  ctx.fillStyle = 'rgba(255,244,220,0.35)';
  for (let i = 0; i < 4; i += 1) {
    const spacing = 460;
    const wrappedX = ((i * spacing - scroll * 0.03 + 140) % (VIEW.width + 420)) - 210;
    const y = 30 + (i % 2) * 26;
    ctx.beginPath();
    ctx.ellipse(wrappedX, y, 130, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(wrappedX + 60, y + 3, 80, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Puff clouds with a shaded underside and a lit top, so they read as volumes.
  for (let i = 0; i < 8; i += 1) {
    const spacing = 300;
    const wrappedX = ((i * spacing - scroll * 0.06 + Math.sin(time * 0.1 + i) * 6) % (VIEW.width + 320)) - 160;
    const y = 56 + (i % 3) * 46;
    const s = 0.75 + (i % 4) * 0.24;
    ctx.fillStyle = 'rgba(214,130,80,0.5)';
    ctx.beginPath();
    ctx.ellipse(wrappedX, y + 7 * s, 54 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(wrappedX - 30 * s, y + 11 * s, 34 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(wrappedX + 33 * s, y + 10 * s, 38 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,242,218,0.88)';
    ctx.beginPath();
    ctx.ellipse(wrappedX, y, 52 * s, 15 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(wrappedX - 30 * s, y + 5 * s, 34 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(wrappedX + 32 * s, y + 4 * s, 38 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(wrappedX - 12 * s, y - 6 * s, 26 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Two loose flocks of small birds crossing the sky, wings beating in shallow chevrons. */
function drawBirds(ctx, scroll, time) {
  ctx.strokeStyle = 'rgba(74,36,16,0.65)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  for (let flock = 0; flock < 2; flock += 1) {
    const rawX = (flock * 760 + 240 - scroll * 0.1 - time * 9) % (VIEW.width + 420);
    const baseX = ((rawX + VIEW.width + 420) % (VIEW.width + 420)) - 210;
    const baseY = 92 + flock * 74 + Math.sin(time * 0.8 + flock * 2) * 6;
    for (let i = 0; i < 5; i += 1) {
      const bx = baseX + (i % 3) * 34 - Math.floor(i / 3) * 20;
      const by = baseY + Math.abs(i % 3 - 1) * 10 + Math.floor(i / 3) * 16;
      const flap = Math.sin(time * 7 + i * 1.3 + flock) * 5;
      ctx.beginPath();
      ctx.moveTo(bx - 9, by - flap * 0.4);
      ctx.quadraticCurveTo(bx - 3, by - 3 - flap, bx, by);
      ctx.quadraticCurveTo(bx + 3, by - 3 - flap, bx + 9, by - flap * 0.4);
      ctx.stroke();
    }
  }
}

function ridgeFarY(worldX) {
  return GROUND_Y - 128 - Math.sin(worldX * 0.004) * 26 - Math.sin(worldX * 0.013) * 9;
}

function ridgeNearY(worldX) {
  return GROUND_Y - 62 - Math.sin(worldX * 0.006 + 2) * 18 - Math.sin(worldX * 0.02) * 6;
}

function drawHills(ctx, scroll) {
  // Far ridge, lit along its crest and falling into shade at its foot.
  const farGrad = ctx.createLinearGradient(0, GROUND_Y - 190, 0, GROUND_Y);
  farGrad.addColorStop(0, '#d98e46');
  farGrad.addColorStop(0.6, '#c97e3d');
  farGrad.addColorStop(1, '#b06a2e');
  ctx.fillStyle = farGrad;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW.width; x += 32) {
    ctx.lineTo(x, ridgeFarY(x + scroll * 0.18));
  }
  ctx.lineTo(VIEW.width, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  // A pine tree line riding the far ridge, for depth.
  ctx.fillStyle = '#a8642a';
  const treeSpacing = 74;
  const treeOffset = -((scroll * 0.18) % treeSpacing);
  for (let x = treeOffset - treeSpacing; x < VIEW.width + treeSpacing; x += treeSpacing) {
    const worldX = x + scroll * 0.18;
    const ridgeY = ridgeFarY(worldX);
    const h = 26 + ((Math.round(worldX / treeSpacing) * 37) % 14 + 14) % 14;
    ctx.beginPath();
    ctx.moveTo(x - 11, ridgeY + 4);
    ctx.lineTo(x, ridgeY - h);
    ctx.lineTo(x + 11, ridgeY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,205,130,0.35)';
    ctx.beginPath();
    ctx.moveTo(x - 5, ridgeY + 2);
    ctx.lineTo(x, ridgeY - h + 5);
    ctx.lineTo(x + 1, ridgeY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#a8642a';
  }
  // Near ridge with its own light falloff.
  const nearGrad = ctx.createLinearGradient(0, GROUND_Y - 120, 0, GROUND_Y);
  nearGrad.addColorStop(0, '#bc7434');
  nearGrad.addColorStop(1, '#9c5a26');
  ctx.fillStyle = nearGrad;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW.width; x += 32) {
    ctx.lineTo(x, ridgeNearY(x + scroll * 0.34));
  }
  ctx.lineTo(VIEW.width, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  // Autumn canopy trees standing on the near ridge: round crowns in turning colours.
  const canopySpacing = 168;
  const canopyOffset = -((scroll * 0.34) % canopySpacing);
  const canopyColours = ['#c95f27', '#d97c2b', '#b84a24', '#e3a83a', '#a85f2a'];
  for (let x = canopyOffset - canopySpacing; x < VIEW.width + canopySpacing; x += canopySpacing) {
    const worldX = x + scroll * 0.34;
    const idx = Math.round(worldX / canopySpacing);
    const ridgeY = ridgeNearY(worldX);
    const s = 0.8 + (((idx * 53) % 40) + 40) % 40 / 55;
    ctx.strokeStyle = '#6e4520';
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(x, ridgeY + 6);
    ctx.lineTo(x + 2, ridgeY - 20 * s);
    ctx.stroke();
    ctx.fillStyle = canopyColours[((idx % 5) + 5) % 5];
    ctx.beginPath();
    ctx.ellipse(x, ridgeY - 34 * s, 21 * s, 16 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 14 * s, ridgeY - 26 * s, 14 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 15 * s, ridgeY - 27 * s, 15 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,214,140,0.4)';
    ctx.beginPath();
    ctx.ellipse(x - 6 * s, ridgeY - 40 * s, 11 * s, 6 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The red barn, silo and windmill that open the run. Drawn around x = 0 at ground level. */
function drawBarn(ctx, x, time) {
  ctx.save();
  ctx.translate(x, GROUND_Y - 62);
  // Silo.
  ctx.fillStyle = '#b9bec6';
  ctx.fillRect(118, -168, 44, 168);
  ctx.fillStyle = '#9aa1ab';
  ctx.fillRect(118, -168, 10, 168);
  ctx.beginPath();
  ctx.ellipse(140, -168, 22, 12, 0, Math.PI, 0);
  ctx.fillStyle = '#8a4a34';
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,96,104,0.6)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath(); ctx.moveTo(118, -168 + i * 42); ctx.lineTo(162, -168 + i * 42); ctx.stroke();
  }
  // Barn body and roof.
  ctx.fillStyle = '#a03a2a';
  ctx.fillRect(-96, -118, 150, 118);
  ctx.fillStyle = '#7e2c1f';
  ctx.beginPath();
  ctx.moveTo(-108, -118);
  ctx.lineTo(-21, -168);
  ctx.lineTo(66, -118);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f3e3c2';
  ctx.fillRect(-52, -76, 62, 76);
  ctx.strokeStyle = '#7e2c1f';
  ctx.lineWidth = 5;
  ctx.strokeRect(-52, -76, 62, 76);
  ctx.beginPath(); ctx.moveTo(-52, -76); ctx.lineTo(10, 0); ctx.moveTo(10, -76); ctx.lineTo(-52, 0); ctx.stroke();
  ctx.fillStyle = '#f7ecd2';
  ctx.fillRect(-30, -140, 24, 24);
  ctx.strokeStyle = '#7e2c1f';
  ctx.lineWidth = 3;
  ctx.strokeRect(-30, -140, 24, 24);
  // Windmill turning slowly behind the barn.
  ctx.save();
  ctx.translate(196, -150);
  ctx.strokeStyle = '#6d543a';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, 150); ctx.moveTo(0, 0); ctx.lineTo(14, 150); ctx.stroke();
  ctx.rotate(time * 0.7);
  ctx.fillStyle = 'rgba(240,230,205,0.9)';
  for (let i = 0; i < 4; i += 1) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(7, -12);
    ctx.lineTo(4, -44);
    ctx.lineTo(-4, -44);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

/** A stand of tall corn, drawn around x = 0, stalks swaying. */
function drawCornStand(ctx, x, time, seed) {
  ctx.save();
  ctx.translate(x, GROUND_Y - 40);
  for (let i = 0; i < 7; i += 1) {
    const sx = -70 + i * 24 + Math.sin(seed + i * 3.7) * 5;
    const h = 128 + Math.sin(seed * 2 + i * 5.3) * 22;
    const sway = Math.sin(time * 1.4 + i * 1.3 + seed) * 4;
    ctx.strokeStyle = '#7d8f2e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.quadraticCurveTo(sx + sway * 0.4, -h * 0.6, sx + sway, -h);
    ctx.stroke();
    ctx.fillStyle = '#93a83a';
    for (let leaf = 0; leaf < 3; leaf += 1) {
      const ly = -h * (0.3 + leaf * 0.24);
      ctx.beginPath();
      ctx.ellipse(sx + (leaf % 2 ? 11 : -11), ly, 15, 4.4, leaf % 2 ? 0.5 : -0.5 + Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#e9b83e';
    ctx.beginPath();
    ctx.ellipse(sx + sway + 3, -h + 16, 5.5, 11, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** The farmhouse of the kitchen yard: lit windows, a smoking chimney, washing on a line. */
function drawFarmhouse(ctx, x, time) {
  ctx.save();
  ctx.translate(x, GROUND_Y - 62);
  ctx.fillStyle = '#e6d7bd';
  ctx.fillRect(-110, -132, 190, 132);
  ctx.fillStyle = '#8a4a34';
  ctx.beginPath();
  ctx.moveTo(-124, -132);
  ctx.lineTo(-15, -186);
  ctx.lineTo(94, -132);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6e3a28';
  ctx.fillRect(38, -196, 20, 42); // chimney
  ctx.fillStyle = 'rgba(225,225,230,0.5)';
  for (let i = 0; i < 3; i += 1) {
    const rise = ((time * 20 + i * 30) % 84);
    ctx.beginPath();
    ctx.ellipse(48 + Math.sin(time * 1.8 + i) * 5, -202 - rise, 7 + rise * 0.15, 5.5 + rise * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Windows glowing with kitchen light — and one turkey-shaped silhouette in a chef's hat.
  for (const wx of [-84, 22]) {
    ctx.fillStyle = '#ffca55';
    ctx.fillRect(wx, -104, 40, 44);
    ctx.strokeStyle = '#8a4a34';
    ctx.lineWidth = 4;
    ctx.strokeRect(wx, -104, 40, 44);
    ctx.beginPath(); ctx.moveTo(wx + 20, -104); ctx.lineTo(wx + 20, -60); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(90,40,10,0.75)';
  ctx.beginPath(); // the cook's silhouette passing the right window
  const cookX = 42 + Math.sin(time * 0.7) * 12;
  ctx.ellipse(cookX, -76, 8, 12, 0, 0, Math.PI * 2);
  ctx.fillRect(cookX - 9, -96, 18, 7);
  ctx.fillRect(cookX - 5, -104, 10, 9);
  ctx.fillStyle = '#7c4a26';
  ctx.fillRect(-30, -66, 30, 66); // door
  ctx.fillStyle = '#e8c33a';
  ctx.beginPath(); ctx.arc(-6, -34, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** A scarecrow standing guard over the fields, arms out, hat tipped, crows permitting. */
function drawScarecrow(ctx, x, time) {
  ctx.save();
  ctx.translate(x, GROUND_Y - 40);
  ctx.strokeStyle = '#6e5233';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -118); ctx.stroke();
  const sway = Math.sin(time * 1.3 + x) * 2;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-40, -96 + sway); ctx.lineTo(40, -100 - sway); ctx.stroke();
  ctx.fillStyle = '#7c6a4a';
  ctx.fillRect(-15, -104, 30, 44); // jacket
  ctx.fillStyle = '#8a5a8c';
  ctx.fillRect(-15, -104, 30, 8); // scarf band
  ctx.fillStyle = '#e8d9ae';
  ctx.beginPath(); ctx.ellipse(0, -118, 13, 12, 0, 0, Math.PI * 2); ctx.fill(); // head sack
  ctx.fillStyle = '#3a2415';
  ctx.beginPath(); ctx.ellipse(-4.5, -120, 1.7, 2.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.5, -120, 1.7, 2.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a2415';
  ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(0, -112, 5.5, 0.25, Math.PI - 0.25); ctx.stroke(); // stitched grin
  ctx.fillStyle = '#c9a24a';
  ctx.beginPath(); ctx.ellipse(0, -130, 20, 4.6, 0, 0, Math.PI * 2); ctx.fill(); // hat brim
  ctx.fillRect(-9, -144, 18, 13);
  ctx.strokeStyle = '#d9a83a'; // straw poking from the sleeves and hem
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath(); ctx.moveTo(-40, -96 + sway); ctx.lineTo(-46 - (i % 3) * 3, -90 + sway + i * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, -100 - sway); ctx.lineTo(46 + (i % 3) * 3, -94 - sway + i * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8 + i * 4, -60); ctx.lineTo(-9 + i * 4, -50); ctx.stroke();
  }
  ctx.restore();
}

/** A wooden crate and a banded barrel, the clutter of every working yard. */
function drawCrateAndBarrel(ctx, x) {
  ctx.save();
  ctx.translate(x, GROUND_Y - 40);
  ctx.fillStyle = '#8a6844';
  ctx.fillRect(6, -44, 46, 44);
  ctx.strokeStyle = '#5d4020';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, -44, 46, 44);
  ctx.beginPath(); ctx.moveTo(6, -44); ctx.lineTo(52, 0); ctx.moveTo(52, -44); ctx.lineTo(6, 0); ctx.stroke();
  ctx.fillStyle = '#9c774e';
  ctx.fillRect(-2, -30, 40, 30);
  ctx.strokeStyle = '#6e5233';
  ctx.strokeRect(-2, -30, 40, 30);
  const barrelGrad = ctx.createLinearGradient(58, 0, 102, 0);
  barrelGrad.addColorStop(0, '#7c5a34');
  barrelGrad.addColorStop(0.5, '#9c774e');
  barrelGrad.addColorStop(1, '#66452a');
  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.moveTo(62, 0);
  ctx.quadraticCurveTo(54, -26, 62, -52);
  ctx.lineTo(98, -52);
  ctx.quadraticCurveTo(106, -26, 98, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3d4148';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(59, -38); ctx.quadraticCurveTo(80, -33, 101, -38); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(59, -14); ctx.quadraticCurveTo(80, -9, 101, -14); ctx.stroke();
  ctx.restore();
}

/** A patch of pumpkins ripening where they fell, vines and all. */
function drawPumpkinPatch(ctx, x) {
  ctx.save();
  ctx.translate(x, GROUND_Y - 40);
  ctx.strokeStyle = '#5d7031';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-58, -2);
  ctx.quadraticCurveTo(-20, -10, 8, -3);
  ctx.quadraticCurveTo(36, -8, 60, -2);
  ctx.stroke();
  ctx.fillStyle = '#5d8a3c';
  for (const lx of [-34, 4, 42]) {
    ctx.beginPath();
    ctx.ellipse(lx, -7, 8, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save(); ctx.translate(-38, 0); drawPumpkin(ctx, 52, 0); ctx.restore();
  ctx.save(); ctx.translate(10, 0); drawPumpkin(ctx, 66, 1); ctx.restore();
  ctx.save(); ctx.translate(52, 0); drawPumpkin(ctx, 40, 0); ctx.restore();
  ctx.restore();
}

/** Hay bales lying on their sides beside the track, two down and one up. */
function drawHayStack(ctx, x) {
  ctx.save();
  ctx.translate(x, GROUND_Y - 40);
  for (const [bx, by, rx, ry] of [[-30, 0, 36, 22], [34, 0, 32, 20], [2, -36, 33, 21]]) {
    const grad = ctx.createLinearGradient(bx - rx, by - ry * 2, bx + rx, by);
    grad.addColorStop(0, '#eec95e');
    grad.addColorStop(0.55, '#d9a83a');
    grad.addColorStop(1, '#a87a28');
    ctx.beginPath();
    ctx.ellipse(bx, by - ry, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,78,20,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bx, by - ry, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Straw banding across the roll, and the spiral showing on the near end.
    ctx.strokeStyle = 'rgba(140,95,25,0.5)';
    ctx.lineWidth = 1.6;
    for (const off of [-0.45, 0, 0.45]) {
      ctx.beginPath();
      ctx.ellipse(bx + off * rx, by - ry, rx * 0.34, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,230,150,0.35)';
    ctx.beginPath();
    ctx.ellipse(bx - rx * 0.3, by - ry * 1.45, rx * 0.4, ry * 0.3, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Mid-ground props cycling along the track at their own depth — pumpkin patch, scarecrow,
 * crate and barrel, hay stack — so no stretch of the run is ever bare dirt and sky.
 */
function drawProps(ctx, scroll, time) {
  const spacing = 690;
  const first = Math.floor((scroll * 0.8) / spacing) - 1;
  for (let k = first; k < first + 4; k += 1) {
    const x = k * spacing - scroll * 0.8 + 260;
    if (x < -260 || x > VIEW.width + 260) continue;
    const which = ((k % 4) + 4) % 4;
    if (which === 0) drawPumpkinPatch(ctx, x);
    else if (which === 1) drawScarecrow(ctx, x, time);
    else if (which === 2) drawCrateAndBarrel(ctx, x);
    else drawHayStack(ctx, x);
  }
}

/** Zone landmarks laid along the world so each stage has its own postcard moment. */
function drawLandmarks(ctx, scroll, time) {
  const spacing = 980;
  const first = Math.floor((scroll * 0.55) / spacing) - 1;
  for (let k = first; k < first + 4; k += 1) {
    const x = k * spacing - scroll * 0.55 + 500;
    if (x < -420 || x > VIEW.width + 420) continue;
    const which = ((k % 3) + 3) % 3;
    if (which === 0) drawBarn(ctx, x, time);
    else if (which === 1) drawCornStand(ctx, x, time, k * 1.71);
    else drawFarmhouse(ctx, x, time);
  }
}

/** Fence posts and grass tufts on the near layer, whipping past. */
function drawNearLayer(ctx, scroll, time) {
  ctx.strokeStyle = '#7c5a34';
  ctx.lineWidth = 5;
  const spacing = 190;
  const offset = -(scroll % spacing);
  for (let x = offset - spacing; x < VIEW.width + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y - 34);
    ctx.lineTo(x, GROUND_Y + 4);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(122,90,52,0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 26);
  ctx.lineTo(VIEW.width, GROUND_Y - 26);
  ctx.stroke();
  // Grass tufts and fallen leaves on the dirt.
  const tuftSpacing = 90;
  const tuftOffset = -(scroll % tuftSpacing);
  for (let x = tuftOffset - tuftSpacing; x < VIEW.width + tuftSpacing; x += tuftSpacing) {
    const sway = Math.sin(time * 2 + x * 0.11) * 2;
    ctx.strokeStyle = '#7d8f2e';
    ctx.lineWidth = 2.4;
    for (let blade = -1; blade < 2; blade += 1) {
      ctx.beginPath();
      ctx.moveTo(x + blade * 4, GROUND_Y + 26);
      ctx.quadraticCurveTo(x + blade * 6 + sway, GROUND_Y + 12, x + blade * 8 + sway * 1.6, GROUND_Y + 3);
      ctx.stroke();
    }
  }
}

function drawGround(ctx, scroll) {
  const grad = ctx.createLinearGradient(0, GROUND_Y, 0, VIEW.height);
  grad.addColorStop(0, '#9c6a34');
  grad.addColorStop(0.12, '#8a5a2a');
  grad.addColorStop(1, '#66401c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, GROUND_Y, VIEW.width, VIEW.height - GROUND_Y);
  ctx.fillStyle = '#c99a58';
  ctx.fillRect(0, GROUND_Y, VIEW.width, 5);
  ctx.fillStyle = 'rgba(90,54,20,0.35)';
  ctx.fillRect(0, GROUND_Y + 5, VIEW.width, 3);
  // Two wheel ruts worn into the track, running the length of the frame.
  ctx.strokeStyle = 'rgba(70,44,16,0.4)';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 34); ctx.lineTo(VIEW.width, GROUND_Y + 34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 78); ctx.lineTo(VIEW.width, GROUND_Y + 78); ctx.stroke();
  ctx.strokeStyle = 'rgba(240,200,130,0.16)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 30); ctx.lineTo(VIEW.width, GROUND_Y + 30); ctx.stroke();
  // Dirt streaks and pebbles streaming past at full scroll speed.
  ctx.fillStyle = 'rgba(70,44,16,0.5)';
  const spacing = 130;
  const offset = -(scroll % spacing);
  for (let x = offset - spacing; x < VIEW.width + spacing; x += spacing) {
    ctx.fillRect(x, GROUND_Y + 22 + ((x * 37) % 40 + 40) % 40, 34, 4);
    ctx.beginPath();
    ctx.ellipse(x + 60, GROUND_Y + 52 + ((x * 53) % 30 + 30) % 30, 6, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 24, GROUND_Y + 88 + ((x * 29) % 18 + 18) % 18, 4, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(240,200,130,0.35)';
  for (let x = offset - spacing; x < VIEW.width + spacing; x += spacing) {
    ctx.fillRect(x + 84, GROUND_Y + 12, 20, 3);
  }
  // Patches of fallen leaves resting on the dirt, in turning colours.
  const leafSpacing = 210;
  const leafOffset = -(scroll % leafSpacing);
  const patchColours = ['#c2502e', '#d97c2b', '#a85f2a'];
  for (let x = leafOffset - leafSpacing; x < VIEW.width + leafSpacing; x += leafSpacing) {
    const idx = Math.round((x + scroll) / leafSpacing);
    ctx.fillStyle = patchColours[((idx % 3) + 3) % 3];
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.ellipse(x + 20 + i * 15, GROUND_Y + 46 + ((idx * 31 + i * 17) % 44), 6.5, 3.6, i * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/**
 * The nearest layer of all: tall grass and seed heads along the bottom edge, drawn dark
 * and soft so the frame feels looked-through rather than flat.
 */
function drawForeground(ctx, scroll, time) {
  const spacing = 150;
  const offset = -((scroll * 1.18) % spacing);
  for (let x = offset - spacing; x < VIEW.width + spacing; x += spacing) {
    const idx = Math.round((x + scroll * 1.18) / spacing);
    const h = 34 + (((idx * 41) % 26) + 26) % 26;
    const sway = Math.sin(time * 1.8 + idx * 1.7) * 3;
    ctx.strokeStyle = 'rgba(46,26,8,0.55)';
    ctx.lineWidth = 4;
    for (let blade = -1; blade < 2; blade += 1) {
      ctx.beginPath();
      ctx.moveTo(x + blade * 9, VIEW.height + 4);
      ctx.quadraticCurveTo(x + blade * 11 + sway, VIEW.height - h * 0.6, x + blade * 13 + sway * 1.8, VIEW.height - h);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(46,26,8,0.5)';
    ctx.beginPath();
    ctx.ellipse(x + 13 + sway * 1.8, VIEW.height - h - 3, 5, 8, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Autumn leaves drifting down across the whole scene. */
export function drawLeaves(ctx, time, scroll) {
  for (let i = 0; i < 20; i += 1) {
    const fall = (time * (26 + (i % 5) * 7) + i * 173) % (VIEW.height + 60);
    const x = ((i * 211 + time * 18 - scroll * 0.12) % (VIEW.width + 80)) - 40;
    const y = fall - 30;
    const spin = time * (1.5 + (i % 3) * 0.6) + i;
    ctx.save();
    ctx.translate(x < 0 ? x + VIEW.width + 80 : x, y);
    ctx.rotate(spin);
    ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(spin)));
    ctx.fillStyle = ['#d97c2b', '#c2502e', '#e3a83a', '#a85f2a'][i % 4];
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * The full backdrop for a frame: `scroll` is the world distance travelled, `zoneIndex` and
 * `zoneBlend` place the sky on its way from gold to ember.
 */
export function drawBackdrop(ctx, scroll, time, zoneIndex, zoneBlend) {
  const colours = skyColours(zoneIndex, zoneBlend);
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, colours[0]);
  sky.addColorStop(0.62, colours[1]);
  sky.addColorStop(1, colours[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW.width, GROUND_Y);
  drawSun(ctx, scroll, colours);
  drawClouds(ctx, scroll, time);
  drawBirds(ctx, scroll, time);
  drawHills(ctx, scroll);
  drawLandmarks(ctx, scroll, time);
  drawProps(ctx, scroll, time);
  drawGround(ctx, scroll);
  drawNearLayer(ctx, scroll, time);
  drawForeground(ctx, scroll, time);
}

/** The Wildwood gate the turkey escapes through: two posts, a vine arch, dark trees beyond. */
export function drawEscapeGate(ctx, x) {
  ctx.save();
  ctx.translate(x, GROUND_Y);
  ctx.fillStyle = '#2e4420';
  for (let i = 0; i < 5; i += 1) {
    const tx = 60 + i * 52;
    ctx.beginPath();
    ctx.moveTo(tx, 0);
    ctx.lineTo(tx + 22, -190 - (i % 3) * 34);
    ctx.lineTo(tx + 44, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#5d4020';
  ctx.fillRect(-8, -168, 14, 168);
  ctx.fillRect(96, -168, 14, 168);
  ctx.strokeStyle = '#476b2a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(51, -164, 59, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = '#5d8a3c';
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.ellipse(6 + i * 16, -222 + Math.sin(i * 2.4) * 10, 9, 5, i, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#f7ecd2';
  ctx.font = '700 17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('WILDWOOD', 51, -128);
  ctx.font = '11px Georgia, serif';
  ctx.fillText('· NO FARMERS ·', 51, -110);
  ctx.restore();
}
