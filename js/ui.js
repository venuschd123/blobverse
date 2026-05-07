// =================================================================
// UI — HUD updates, side panel routing, toasts, pause
// =================================================================
import { CONFIG } from './config.js';
import { state, getStat } from './state.js';

let comboHideTimer = 0;
let statusTimer = 0;
const STATUS_LINES = [
  'status: caffeinated',
  'status: aggressively chill',
  'blobs await your judgment',
  'drop responsibly',
  'physics intensifies',
  'they have feelings (probably)',
  'merge them. make it weird.',
  'smol blob loading…',
  'ascending vibes',
  'the egg is plotting'
];
const COMBO_LINES = ['NICE!', 'COMBO!', 'CHAIN!', 'SLICK!', 'OOOOH!', 'STACKED!', 'EVOLVING!', 'UNSTOPPABLE!'];

export function bumpEl(el) {
  if (!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

export function refreshHud() {
  const scoreEl = document.getElementById('scoreVal');
  const bestEl = document.getElementById('bestVal');
  const coinEl = document.getElementById('coinVal');
  const starEl = document.getElementById('starVal');
  const lvlEl = document.getElementById('lvlVal');
  const lvlFill = document.getElementById('lvlFill');
  const stageNum = document.getElementById('stageNum');

  if (scoreEl) scoreEl.textContent = state.score;
  if (bestEl) bestEl.textContent = state.best;
  if (coinEl) coinEl.textContent = state.coins;
  if (starEl) starEl.textContent = state.stars;
  if (lvlEl) lvlEl.textContent = state.playerLevel;
  if (stageNum) stageNum.textContent = state.stageId;
  if (lvlFill) {
    const need = CONFIG.XP_PER_LEVEL_BASE + state.playerLevel * CONFIG.XP_PER_LEVEL_GROWTH;
    lvlFill.style.width = Math.min(100, (state.playerXp / need) * 100) + '%';
  }
}

export function showCombo() {
  if (state.combo < 2) return;
  const word = COMBO_LINES[Math.min(state.combo - 2, COMBO_LINES.length - 1)];
  const badge = document.getElementById('comboBadge');
  if (!badge) return;
  badge.textContent = word + '  ×' + state.combo;
  badge.classList.remove('show', 'big');
  void badge.offsetWidth;
  badge.classList.add('show');
  if (state.combo >= 4) badge.classList.add('big');
  clearTimeout(comboHideTimer);
  comboHideTimer = setTimeout(() => badge.classList.remove('show', 'big'), 1200);
}

export function updateComboMeter(now) {
  const fill = document.getElementById('comboFill');
  if (!fill) return;
  if (state.combo === 0 || now > state.comboTimer) {
    fill.style.height = '0%';
    return;
  }
  const remain = Math.max(0, state.comboTimer - now) / CONFIG.COMBO_DECAY_MS;
  const heightPct = Math.min(100, (state.combo / CONFIG.COMBO_MAX) * 100 * remain + remain * 30);
  fill.style.height = heightPct + '%';
}

export function rotateStatus(now) {
  if (now < state.statusT) return;
  state.statusT = now + CONFIG.STATUS_ROTATE_MS + Math.random() * 2000;
  state.statusIdx = (state.statusIdx + 1 + Math.floor(Math.random() * 3)) % STATUS_LINES.length;
  const el = document.getElementById('statusStrip');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = STATUS_LINES[state.statusIdx];
    el.style.opacity = '0.8';
  }, 350);
}

export function refreshChain() {
  const chain = document.getElementById('chain');
  if (!chain) return;
  chain.innerHTML = '';
  state.tiers.forEach((t, i) => {
    const pip = document.createElement('div');
    pip.className = 'pip' + (state.unlocked.has(i) ? ' unlocked' : '');
    pip.style.background = `radial-gradient(circle at 30% 30%, ${t.cs[0]}, ${t.cs[1]})`;
    pip.style.color = t.cs[0];
    pip.title = t.name;
    pip.dataset.tier = i;
    chain.appendChild(pip);
    if (i < state.tiers.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '›';
      chain.appendChild(arrow);
    }
  });
}

export function flashChainPip(tier) {
  const pip = document.querySelector(`.chain .pip[data-tier="${tier}"]`);
  if (!pip) return;
  pip.classList.add('unlocked', 'fresh');
  setTimeout(() => pip.classList.remove('fresh'), 600);
}

export function refreshPowers() {
  const map = { bomb: 'pwBomb', freeze: 'pwFreeze', magnet: 'pwMagnet', swap: 'pwSwap', upgrade: 'pwUpgrade' };
  const lockMap = { swap: 5, upgrade: 10 }; // unlock at player level
  for (const k of Object.keys(map)) {
    const btn = document.getElementById(map[k]);
    if (!btn) continue;
    const stockId = 'stock' + k.charAt(0).toUpperCase() + k.slice(1);
    const stockEl = document.getElementById(stockId);
    if (stockEl) stockEl.textContent = state.powers[k] || 0;
    const locked = lockMap[k] && state.playerLevel < lockMap[k];
    btn.classList.toggle('locked', !!locked);
    btn.classList.toggle('disabled', !locked && (state.powers[k] || 0) <= 0);
    btn.classList.toggle('active', state.activePower === k);
  }
}

export function showAchievementToast({ icon, name, desc, reward, label }) {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <div class="badge">${icon || '🏆'}</div>
    <div class="info">
      <div class="label">${label || 'ACHIEVEMENT'}</div>
      <div class="name">${name || ''}</div>
      <div class="desc">${desc || ''}</div>
    </div>
    ${reward ? `<div class="reward">+${reward} 🪙</div>` : ''}
  `;
  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 350);
  }, CONFIG.TOAST_DURATION);
}

export function setWeatherLabel(label) {
  const el = document.getElementById('weatherStrip');
  if (!el) return;
  if (!label) {
    el.classList.remove('show');
    el.textContent = '';
  } else {
    el.classList.add('show');
    el.textContent = label;
  }
}

export function setNotificationDot(panelId, on) {
  const btn = document.querySelector(`.nav-btn[data-panel="${panelId}"]`);
  if (!btn) return;
  btn.classList.toggle('has-notif', !!on);
}
