// =================================================================
// EFFECTS — particles, popups, flashes, confetti, shake
// =================================================================
import { state } from './state.js';

export function spawnParticles(x, y, color, count = 14) {
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 4;
    state.particles.push({
      x, y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - 0.5,
      life: 1,
      size: 2 + Math.random() * 3,
      color
    });
  }
  // Cap to prevent memory issues
  if (state.particles.length > 500) {
    state.particles.splice(0, state.particles.length - 500);
  }
}

export function spawnFlash(x, y, color, radius) {
  state.flashes.push({ x, y, color, r: 4, maxR: radius, life: 1 });
}

export function addPopup(x, y, text, big = false) {
  state.popups.push({ x, y, text, life: 1, vy: -1.1, big });
}

export function spawnAmbient() {
  if (state.ambient.length < 25 && Math.random() < 0.04) {
    state.ambient.push({
      x: Math.random() * 400,
      y: 610,
      r: 1 + Math.random() * 3,
      vy: -(0.15 + Math.random() * 0.4),
      vx: (Math.random() - 0.5) * 0.1,
      a: 0.1 + Math.random() * 0.3,
      hue: 240 + Math.random() * 100
    });
  }
}

export function spawnConfetti(canvasX, canvasY, count = 30, colors) {
  const wrap = document.getElementById('stageWrap');
  if (!wrap) return;
  const palette = colors || ['#fbbf24', '#f472b6', '#a78bfa', '#38bdf8', '#4ade80'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const c = palette[Math.floor(Math.random() * palette.length)];
    piece.style.background = c;
    piece.style.left = canvasX + 'px';
    piece.style.top = canvasY + 'px';
    const ang = Math.random() * Math.PI * 2;
    const sp = 80 + Math.random() * 200;
    const dx = Math.cos(ang) * sp;
    const dy = Math.sin(ang) * sp + 150;
    const rot = (Math.random() - 0.5) * 720;
    piece.style.transform = 'translate(0,0) rotate(0)';
    piece.style.opacity = '1';
    piece.style.transition = 'transform 1.4s cubic-bezier(.2,.8,.4,1), opacity 1.4s ease';
    wrap.appendChild(piece);
    requestAnimationFrame(() => {
      piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      piece.style.opacity = '0';
    });
    setTimeout(() => piece.remove(), 1500);
  }
}

export function triggerShake(ms = 200, big = false) {
  state.shakeUntil = performance.now() + ms;
  const wrap = document.getElementById('stageWrap');
  if (!wrap) return;
  if (state.settings && state.settings.reducedMotion) return;
  wrap.classList.remove('shake', 'bigshake');
  void wrap.offsetWidth;
  wrap.classList.add(big ? 'bigshake' : 'shake');
  setTimeout(() => wrap.classList.remove('shake', 'bigshake'), big ? 580 : 260);
}
