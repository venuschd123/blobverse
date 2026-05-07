// =================================================================
// RENDER — canvas drawing
// =================================================================
import { CONFIG } from './config.js';
import { state } from './state.js';

let canvas = null;
let ctx = null;
let dpr = 1;
let scaleX = 1;
let scaleY = 1;
let zoomT = 0;       // ms when zoom punch ends
let zoomAmt = 0;     // current zoom amount
let zoomStart = 0;
let zoomDuration = 0;

export function getScale() { return { scaleX, scaleY }; }
export function getCanvas() { return canvas; }

export function bumpZoom(amount = 0.04, duration = 280) {
  zoomAmt = amount;
  zoomStart = performance.now();
  zoomDuration = duration;
  zoomT = zoomStart + duration;
}

export function initRender() {
  canvas = document.getElementById('stage');
  ctx = canvas.getContext('2d', { alpha: true });
  fitCanvas();
  new ResizeObserver(fitCanvas).observe(canvas);
  window.addEventListener('orientationchange', () => setTimeout(fitCanvas, 200));
}

export function fitCanvas() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  scaleX = canvas.width / CONFIG.W;
  scaleY = canvas.height / CONFIG.H;
}

export function drawFrame(now) {
  if (!ctx) return;
  drawBg(now);
  let sx = 0, sy = 0;
  if (now < state.shakeUntil && !state.settings.reducedMotion) {
    const m = (state.shakeUntil - now) / 200;
    sx = (Math.random() - 0.5) * 4 * m * scaleX;
    sy = (Math.random() - 0.5) * 4 * m * scaleY;
  }
  // Camera zoom punch
  let zoom = 1;
  if (now < zoomT && !state.settings.reducedMotion) {
    const t = (now - zoomStart) / zoomDuration;
    // ease-out punch: starts big, decays
    zoom = 1 + zoomAmt * (1 - t) * Math.cos(t * Math.PI * 0.5);
  }
  ctx.save();
  if (zoom !== 1) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }
  ctx.translate(sx, sy);
  for (const b of state.bodies) drawBlob(b, now);
  drawFlashes();
  drawParticles();
  if (!state.over) drawDropper(now);
  drawPopups();
  ctx.restore();
}

function drawBg(now) {
  state.bgHue = (state.bgHue + 0.03) % 360;
  const tierShift = Math.min(state.highestTier * 4, 40);
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, `hsla(${(245 + state.bgHue * 0.05 + tierShift) % 360}, 60%, ${18 + state.highestTier}%, 1)`);
  g.addColorStop(1, `hsla(${(265 + state.bgHue * 0.03) % 360}, 70%, ${8 + Math.min(state.highestTier, 5)}%, 1)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid dots
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  const step = 30 * scaleX;
  for (let x = 0; x < canvas.width; x += step) {
    for (let y = 0; y < canvas.height; y += step) {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Ambient bubbles
  for (let i = state.ambient.length - 1; i >= 0; i--) {
    const a = state.ambient[i];
    a.y += a.vy;
    a.x += a.vx;
    if (a.y < -20) { state.ambient.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = a.a;
    ctx.fillStyle = `hsl(${a.hue},80%,70%)`;
    ctx.beginPath();
    ctx.arc(a.x * scaleX, a.y * scaleY, a.r * scaleX, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Freeze tint
  if (performance.now() < state.freezeUntil) {
    ctx.fillStyle = 'rgba(186,230,253,0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(186,230,253,0.5)';
    ctx.lineWidth = 1.5 * scaleX;
    const t = (state.freezeUntil - performance.now()) / CONFIG.FREEZE_DURATION;
    for (let i = 0; i < 6; i++) {
      const x = (i + 1) / 7 * canvas.width;
      const h = 20 * scaleY * t;
      ctx.beginPath();
      ctx.moveTo(x - 6 * scaleX, 0);
      ctx.lineTo(x, h);
      ctx.lineTo(x + 6 * scaleX, 0);
      ctx.stroke();
    }
  }

  // Anti-gravity tint
  if (now < state.antiGravUntil) {
    ctx.fillStyle = 'rgba(167,139,250,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Danger line
  const dy = CONFIG.KILL_Y * scaleY;
  const pulse = 0.35 + 0.25 * Math.sin(now / 350);
  ctx.save();
  ctx.strokeStyle = `rgba(244,114,182,${pulse})`;
  ctx.lineWidth = 1.2 * scaleY;
  ctx.setLineDash([6 * scaleX, 8 * scaleX]);
  ctx.beginPath();
  ctx.moveTo(CONFIG.WALL_T * scaleX, dy);
  ctx.lineTo((CONFIG.W - CONFIG.WALL_T) * scaleX, dy);
  ctx.stroke();
  ctx.restore();

  // Wall inset visualization (jar narrowing)
  const inset = (state.stageData && state.stageData.wallInset) || 0;
  if (inset > 0) {
    ctx.fillStyle = 'rgba(167,139,250,0.1)';
    ctx.fillRect(0, 0, inset * scaleX, canvas.height);
    ctx.fillRect(canvas.width - inset * scaleX, 0, inset * scaleX, canvas.height);
  }
}

function drawBlob(body, now) {
  const t = state.tiers[body.tier];
  if (!t) return;
  const x = body.position.x * scaleX;
  const y = body.position.y * scaleY;
  const r = t.r * scaleX;

  const sinceSpawn = now - body.spawnT;
  let spawnScale = 1;
  if (sinceSpawn < 260) {
    const tt = sinceSpawn / 260;
    spawnScale = 1 + 0.4 * Math.sin(tt * Math.PI);
  }
  const sx = (1 + Math.min(0.18, Math.abs(body.velocity.x) * 0.02)) * spawnScale;
  const sy = (1 - Math.min(0.18, Math.abs(body.velocity.y) * 0.02) * 0.5) * spawnScale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);
  ctx.scale(sx, sy);

  // Halo for top tiers
  if (body.tier >= 4) {
    const haloR = r * (1.3 + Math.sin(now / 600 + body.id) * 0.05);
    const halo = ctx.createRadialGradient(0, 0, r * 0.9, 0, 0, haloR);
    halo.addColorStop(0, t.cs[0] + '55');
    halo.addColorStop(1, t.cs[0] + '00');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, haloR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow
  ctx.beginPath();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.ellipse(0, r * 0.85, r * 0.85, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body w/ skin tint
  const colors = applySkinTint(t.cs, state.equippedSkin);
  const grad = ctx.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.1, 0, 0, r);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Rim
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.stroke();

  // Gloss
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.32, r * 0.18, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  drawFace(body, x, y, r, now);
}

function applySkinTint(baseColors, skin) {
  if (!skin || skin === 'default') return baseColors;
  if (skin === 'neon') return [shiftBright(baseColors[0], 1.4), shiftBright(baseColors[1], 1.6)];
  if (skin === 'pastel') return [shiftBright(baseColors[0], 1.15), shiftBright(baseColors[1], 1.3)];
  if (skin === 'galaxy') return ['#a78bfa', '#1e1b4b'];
  if (skin === 'pixel') return [baseColors[0], baseColors[1]];
  if (skin === 'candy') return ['#fbcfe8', '#ec4899'];
  if (skin === 'mythic') return ['#fde68a', '#b45309'];
  return baseColors;
}
function shiftBright(hex, mult) {
  // crude HSL-ish brighten; not used for galaxy/pixel
  const m = hex.match(/^#([\da-f]{6})$/i);
  if (!m) return hex;
  let n = parseInt(m[1], 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.min(255, Math.round(r * mult));
  g = Math.min(255, Math.round(g * mult));
  b = Math.min(255, Math.round(b * mult));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function drawFace(body, x, y, r, now) {
  const tier = body.tier;
  const eyeSpread = r * 0.36;
  const eyeY = -r * 0.08;
  const eyeR = Math.max(2, r * 0.14);
  const pupilR = Math.max(1, r * 0.07);

  const px = state.pointerX * scaleX;
  const py = state.pointerY * scaleY;
  const dx = px - x;
  const dy2 = py - y;
  const d = Math.hypot(dx, dy2) || 1;
  const reach = Math.min(eyeR - pupilR, d * 0.05);
  const lookX = (dx / d) * reach;
  const lookY = (dy2 / d) * reach;

  const blinkPhase = (now / 2200 + (body.id || 0) * 0.13) % 1;
  const blinking = blinkPhase > 0.97;
  const scared = body.position.y - state.tiers[tier].r < CONFIG.KILL_Y + 15;

  ctx.save();
  ctx.translate(x, y);

  if (blinking) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(1.5, r * 0.05);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-eyeSpread - eyeR * 0.7, eyeY);
    ctx.lineTo(-eyeSpread + eyeR * 0.7, eyeY);
    ctx.moveTo(eyeSpread - eyeR * 0.7, eyeY);
    ctx.lineTo(eyeSpread + eyeR * 0.7, eyeY);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-eyeSpread, eyeY, eyeR, 0, Math.PI * 2);
    ctx.arc(eyeSpread, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-eyeSpread + lookX, eyeY + lookY, pupilR, 0, Math.PI * 2);
    ctx.arc(eyeSpread + lookX, eyeY + lookY, pupilR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-eyeSpread + lookX + pupilR * 0.4, eyeY + lookY - pupilR * 0.4, pupilR * 0.4, 0, Math.PI * 2);
    ctx.arc(eyeSpread + lookX + pupilR * 0.4, eyeY + lookY - pupilR * 0.4, pupilR * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  ctx.strokeStyle = 'rgba(15,23,42,0.85)';
  ctx.lineWidth = Math.max(1.5, r * 0.05);
  ctx.lineCap = 'round';
  const mouthY = r * 0.32;
  const mouthW = r * 0.32;
  let mood = tier % 5;
  if (scared) mood = 99;
  ctx.beginPath();
  if (mood === 99) {
    ctx.moveTo(-mouthW, mouthY);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(-mouthW + (i + 1) * (mouthW * 2 / 4), mouthY + (i % 2 === 0 ? -r * 0.04 : r * 0.04));
    }
  } else if (mood === 0) {
    ctx.arc(0, mouthY - r * 0.05, mouthW, 0.2, Math.PI - 0.2);
  } else if (mood === 1) {
    ctx.moveTo(-mouthW * 0.6, mouthY);
    ctx.quadraticCurveTo(0, mouthY + r * 0.18, mouthW * 0.8, mouthY - r * 0.05);
  } else if (mood === 2) {
    ctx.arc(0, mouthY + r * 0.05, mouthW * 0.45, 0, Math.PI * 2);
  } else if (mood === 3) {
    ctx.arc(0, mouthY - r * 0.05, mouthW, 0.2, Math.PI - 0.2);
  } else {
    ctx.moveTo(-mouthW * 0.7, mouthY + r * 0.04);
    ctx.lineTo(mouthW * 0.7, mouthY + r * 0.04);
  }
  ctx.stroke();
  if (mood === 3) {
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.ellipse(r * 0.05, mouthY + r * 0.18, r * 0.12, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tier extras
  if (tier === 10) {
    ctx.save();
    ctx.rotate(body.angle * -1 + 0.4);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = Math.max(2, r * 0.08);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.35, r * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (tier === 9) {
    ctx.fillStyle = 'rgba(186, 230, 253, 0.9)';
    ctx.beginPath();
    ctx.arc(0, -r * 0.95, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (tier === 8) {
    ctx.fillStyle = 'rgba(100,116,139,0.85)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.85, -r * 0.05, r * 0.18, r * 0.32, 0.5, 0, Math.PI * 2);
    ctx.ellipse(r * 0.85, -r * 0.05, r * 0.18, r * 0.32, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (tier === 7 || tier === 5) {
    ctx.fillStyle = state.tiers[tier].cs[1];
    ctx.beginPath();
    ctx.arc(-r * 0.65, -r * 0.7, r * 0.22, 0, Math.PI * 2);
    ctx.arc(r * 0.65, -r * 0.7, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (tier === 4) {
    ctx.fillStyle = state.tiers[tier].cs[1];
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.3);
    ctx.lineTo(-r * 0.55, -r * 1.05);
    ctx.lineTo(-r * 0.25, -r * 0.55);
    ctx.closePath();
    ctx.moveTo(r * 0.8, -r * 0.3);
    ctx.lineTo(r * 0.55, -r * 1.05);
    ctx.lineTo(r * 0.25, -r * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawDropper(now) {
  const t = state.tiers[state.holdTier];
  if (!t) return;
  const x = state.dropX * scaleX;
  const y = CONFIG.DROP_Y * scaleY;
  const r = t.r * scaleX;
  const cooldownPct = state.canDrop ? 1 : Math.max(0, 1 - (state.cooldownT - now) / CONFIG.COOLDOWN_MS);

  // Aim line
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.4 * scaleY;
  ctx.setLineDash([3 * scaleX, 7 * scaleX]);
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.lineTo(x, (CONFIG.H - CONFIG.WALL_T) * scaleY);
  ctx.stroke();
  ctx.restore();

  const wob = Math.sin(now / 250) * 1.5 * scaleX;

  if (!state.canDrop) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    drawGhostBlob(state.holdTier, x + wob, y, r);
    ctx.strokeStyle = 'rgba(167,139,250,0.85)';
    ctx.lineWidth = 2.5 * scaleX;
    ctx.beginPath();
    ctx.arc(x + wob, y, r + 5 * scaleX, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldownPct);
    ctx.stroke();
    ctx.restore();
  } else {
    const pulse = 1 + Math.sin(now / 350) * 0.06;
    drawGhostBlob(state.holdTier, x + wob, y, r * pulse);
  }

  // Power tool cursor preview
  if (state.activePower === 'bomb') {
    ctx.save();
    const px = state.pointerX * scaleX;
    const py = state.pointerY * scaleY;
    ctx.strokeStyle = 'rgba(251,146,60,0.9)';
    ctx.lineWidth = 2 * scaleX;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(px, py, 28 * scaleX, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = `${20 * scaleY}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💣', px, py);
    ctx.restore();
  }

  drawNextPreview(now);
}

function drawGhostBlob(tier, x, y, r) {
  const t = state.tiers[tier];
  if (!t) return;
  ctx.save();
  ctx.translate(x, y);
  const colors = applySkinTint(t.cs, state.equippedSkin);
  const grad = ctx.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.1, 0, 0, r);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.32, r * 0.18, -0.4, 0, Math.PI * 2);
  ctx.fill();
  const eyeR = Math.max(1.5, r * 0.13);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-r * 0.32, -r * 0.05, eyeR, 0, Math.PI * 2);
  ctx.arc(r * 0.32, -r * 0.05, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-r * 0.32, -r * 0.05, eyeR * 0.5, 0, Math.PI * 2);
  ctx.arc(r * 0.32, -r * 0.05, eyeR * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawNextPreview(now) {
  const padX = (CONFIG.W - 38) * scaleX;
  const padY = 18 * scaleY;
  const boxR = 18 * scaleX;
  ctx.save();
  ctx.fillStyle = 'rgba(15,12,36,0.55)';
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1 * scaleX;
  roundRect(ctx, padX - boxR, padY - boxR, boxR * 2, boxR * 2 + 12 * scaleY, 10 * scaleX);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `700 ${8 * scaleY}px -apple-system, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('NEXT', padX, padY + boxR + 8 * scaleY);
  const tt = state.tiers[state.nextTier];
  if (tt) {
    const tinyR = Math.min(boxR * 0.7, tt.r * scaleX * 0.55);
    const wob = Math.sin(now / 320) * 1.5;
    drawGhostBlob(state.nextTier, padX, padY + wob, tinyR);
  }
  ctx.restore();
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function drawParticles() {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.18;
    p.vx *= 0.985;
    p.life -= 0.02;
    if (p.life <= 0) { state.particles.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x * scaleX, p.y * scaleY, p.size * scaleX * Math.max(0.3, p.life), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawFlashes() {
  for (let i = state.flashes.length - 1; i >= 0; i--) {
    const f = state.flashes[i];
    f.r += (f.maxR - f.r) * 0.18;
    f.life -= 0.05;
    if (f.life <= 0) { state.flashes.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = Math.max(0, f.life * 0.8);
    ctx.strokeStyle = f.color;
    ctx.lineWidth = 2.5 * scaleX;
    ctx.beginPath();
    ctx.arc(f.x * scaleX, f.y * scaleY, f.r * scaleX, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPopups() {
  for (let i = state.popups.length - 1; i >= 0; i--) {
    const p = state.popups[i];
    p.y += p.vy;
    p.vy *= 0.96;
    p.life -= 0.014;
    if (p.life <= 0) { state.popups.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.font = `900 ${(p.big ? 17 : 14) * scaleY}px -apple-system, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3 * scaleX;
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.strokeText(p.text, p.x * scaleX, p.y * scaleY);
    ctx.fillStyle = '#fef3c7';
    ctx.fillText(p.text, p.x * scaleX, p.y * scaleY);
    ctx.restore();
  }
}
