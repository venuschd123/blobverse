// =================================================================
// QUESTS — active quest management & UI
// =================================================================
import { state, getStat } from './state.js';
import { saveAll } from './save.js';
import { showAchievementToast, refreshHud, setNotificationDot } from './ui.js';

const ACTIVE_SLOTS = 6;
let baselines = {}; // snapshot of stats when quest was issued, for delta calculations

export function initQuests() {
  // Ensure we have the right number of active quests
  while (state.questActive.length < ACTIVE_SLOTS) {
    const q = randomQuest();
    if (q) state.questActive.push({ id: q.id, baseline: getStat(q.stat) });
    else break;
  }
  saveAll();
  recomputeNotif();
}

function randomQuest() {
  if (!state.questsList.length) return null;
  const taken = new Set(state.questActive.map(a => a.id));
  const taken2 = new Set(state.questCompleted);
  const pool = state.questsList.filter(q => !taken.has(q.id) && !taken2.has(q.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function checkQuests() {
  let claimableNow = 0;
  for (let i = 0; i < state.questActive.length; i++) {
    const a = state.questActive[i];
    const def = state.questsList.find(q => q.id === a.id);
    if (!def) continue;
    const cur = getStat(def.stat) - (a.baseline || 0);
    if (cur >= def.target && !a.claimable) {
      a.claimable = true;
    }
    if (a.claimable) claimableNow++;
  }
  setNotificationDot('quests', claimableNow > 0);
  return claimableNow;
}

export function renderQuests(sideBody) {
  if (!state.questsList || !state.questsList.length) {
    sideBody.innerHTML = '<div class="empty-state">Loading quests…</div>';
    return;
  }
  let html = '<div class="section-h">Active Quests</div>';
  for (const a of state.questActive) {
    const def = state.questsList.find(q => q.id === a.id);
    if (!def) continue;
    const cur = Math.min(def.target, getStat(def.stat) - (a.baseline || 0));
    const pct = Math.min(100, (cur / def.target) * 100);
    const done = cur >= def.target;
    html += `
      <div class="quest-row ${done ? 'complete' : ''}" data-id="${def.id}">
        <div class="quest-icon">${def.icon}</div>
        <div class="quest-info">
          <div class="text">${def.text}</div>
          <div class="reward">+${def.reward} 🪙</div>
          <div class="quest-bar"><div class="fill" style="width:${pct}%"></div></div>
        </div>
        ${done
          ? `<button class="quest-claim">Claim</button>`
          : `<div class="quest-progress">${cur}/${def.target}</div>`}
      </div>
    `;
  }
  html += `
    <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:14px;text-align:center;">
      Quests refresh as you complete them.<br>Claimed: <b style="color:#fde68a;">${state.questCompleted.length}</b>
    </div>
  `;
  sideBody.innerHTML = html;
  sideBody.querySelectorAll('.quest-claim').forEach(btn => {
    btn.addEventListener('click', e => {
      const row = btn.closest('.quest-row');
      const id = row && row.dataset.id;
      if (id) claimQuest(id, sideBody);
    });
  });
}

function claimQuest(id, sideBody) {
  const idx = state.questActive.findIndex(a => a.id === id);
  if (idx < 0) return;
  const def = state.questsList.find(q => q.id === id);
  if (!def) return;
  state.coins += def.reward;
  state.questCompleted.push(id);
  state.questActive.splice(idx, 1);
  // Try to fill slot with new quest
  const fresh = randomQuest();
  if (fresh) state.questActive.push({ id: fresh.id, baseline: getStat(fresh.stat) });
  saveAll();
  refreshHud();
  showAchievementToast({ icon: def.icon, label: 'QUEST DONE', name: def.text.replace(/<\/?b>/g, ''), reward: def.reward });
  recomputeNotif();
  renderQuests(sideBody);
}

function recomputeNotif() {
  let n = 0;
  for (const a of state.questActive) {
    const def = state.questsList.find(q => q.id === a.id);
    if (!def) continue;
    const cur = getStat(def.stat) - (a.baseline || 0);
    if (cur >= def.target) n++;
  }
  setNotificationDot('quests', n > 0);
}
