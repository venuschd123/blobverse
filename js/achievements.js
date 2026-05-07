// =================================================================
// ACHIEVEMENTS — passive checks against state
// =================================================================
import { state, getStat } from './state.js';
import { saveAll } from './save.js';
import { showAchievementToast, refreshHud } from './ui.js';

export function checkAchievements() {
  if (!state.achievementsList) return;
  for (const ach of state.achievementsList) {
    if (state.achievements.has(ach.id)) continue;
    if (getStat(ach.stat) >= ach.target) {
      unlock(ach);
    }
  }
}

function unlock(ach) {
  state.achievements.add(ach.id);
  state.coins += ach.reward;
  saveAll();
  refreshHud();
  showAchievementToast({
    icon: ach.icon,
    label: 'ACHIEVEMENT',
    name: ach.name,
    desc: ach.desc,
    reward: ach.reward
  });
}

export function renderAchievements(container) {
  if (!state.achievementsList) return;
  let html = '<div class="section-h">Trophies</div><div class="ach-grid">';
  for (const a of state.achievementsList) {
    const u = state.achievements.has(a.id);
    html += `<div class="ach-cell ${u ? 'unlocked' : ''}" title="${a.name}: ${a.desc}">${a.icon}</div>`;
  }
  html += '</div>';
  html += `<div style="text-align:center;font-size:11px;color:rgba(255,255,255,.55);margin-top:6px;">
    ${state.achievements.size} / ${state.achievementsList.length} unlocked
  </div>`;
  container.innerHTML = html;
}
