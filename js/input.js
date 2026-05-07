// =================================================================
// INPUT — pointer events
// =================================================================
import { CONFIG } from './config.js';
import { state } from './state.js';
import { vibrate } from './save.js';
import { spawnFlash, spawnParticles, addPopup, triggerShake } from './effects.js';
import { makeBlob, removeBody, pickRandomDropTier } from './physics.js';

let onDropCb = null;
let onPowerCb = null;

export function initInput(canvas, callbacks) {
  onDropCb = callbacks.onDrop;
  onPowerCb = callbacks.onPower;
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointercancel', () => {});
}

function pointerToWorld(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * CONFIG.W,
    y: ((clientY - rect.top) / rect.height) * CONFIG.H
  };
}

function onPointerMove(e) {
  if (e.cancelable) e.preventDefault();
  const cx = e.clientX;
  const cy = e.clientY;
  const p = pointerToWorld(e.currentTarget, cx, cy);
  state.pointerX = p.x;
  state.pointerY = p.y;
  const tier = state.tiers[state.holdTier];
  if (!tier) return;
  const r = tier.r;
  const inset = (state.stageData && state.stageData.wallInset) || 0;
  state.dropX = Math.max(CONFIG.WALL_T + r + 2 + inset, Math.min(CONFIG.W - CONFIG.WALL_T - r - 2 - inset, p.x));
}

function onPointerDown(e) {
  if (state.over || state.paused) return;
  if (e.cancelable) e.preventDefault();
  onPointerMove(e);

  if (state.activePower === 'bomb') {
    if (useBomb(state.pointerX, state.pointerY)) {
      vibrate(CONFIG.VIBRATE.merge);
    }
    return;
  }
  if (state.activePower === 'upgrade') {
    if (state.holdTier < state.tiers.length - 2) state.holdTier++;
    state.activePower = null;
    state.powers.upgrade--;
    state.powerUsage.upgrade = (state.powerUsage.upgrade || 0) + 1;
    if (onPowerCb) onPowerCb('upgrade');
    return;
  }
  if (state.activePower === 'swap') {
    const tmp = state.holdTier;
    state.holdTier = state.nextTier;
    state.nextTier = tmp;
    state.activePower = null;
    state.powers.swap--;
    state.powerUsage.swap = (state.powerUsage.swap || 0) + 1;
    if (onPowerCb) onPowerCb('swap');
    return;
  }
  if (!state.canDrop) return;
  dropHeldBlob();
}

function dropHeldBlob() {
  state.canDrop = false;
  state.cooldownT = performance.now() + CONFIG.COOLDOWN_MS;
  const tier = state.holdTier;
  makeBlob(tier, state.dropX, CONFIG.DROP_Y, 0.5);
  state.dropCount++;
  state.holdTier = state.nextTier;
  state.nextTier = pickRandomDropTier();
  vibrate(CONFIG.VIBRATE.drop);
  if (onDropCb) onDropCb();
}

function useBomb(worldX, worldY) {
  let best = null, bestD = Infinity;
  for (const b of state.bodies) {
    const dx = b.position.x - worldX;
    const dy = b.position.y - worldY;
    const d = dx * dx + dy * dy;
    const r = state.tiers[b.tier].r;
    if (d < r * r * 1.5 && d < bestD) {
      best = b;
      bestD = d;
    }
  }
  if (!best) return false;
  state.powers.bomb--;
  state.powerUsage.bomb = (state.powerUsage.bomb || 0) + 1;
  state.activePower = null;
  spawnFlash(best.position.x, best.position.y, '#fb923c', 70);
  spawnFlash(best.position.x, best.position.y, '#fef08a', 100);
  spawnParticles(best.position.x, best.position.y, '#fb923c', 30);
  spawnParticles(best.position.x, best.position.y, '#fef08a', 20);
  triggerShake(250);
  removeBody(best);
  addPopup(best.position.x, best.position.y, '💥 BOOM!');
  if (onPowerCb) onPowerCb('bomb');
  return true;
}
