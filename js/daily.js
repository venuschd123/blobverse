// =================================================================
// DAILY — login calendar, streak, daily challenge
// =================================================================
import { state } from './state.js';
import { saveAll } from './save.js';
import { showAchievementToast, refreshHud, setNotificationDot } from './ui.js';

const REWARDS_30 = [
  { type: 'coin',  amt: 25,  icon: '🪙' },
  { type: 'coin',  amt: 50,  icon: '🪙' },
  { type: 'bomb',  amt: 1,   icon: '💣' },
  { type: 'coin',  amt: 75,  icon: '🪙' },
  { type: 'freeze',amt: 1,   icon: '❄️' },
  { type: 'coin',  amt: 100, icon: '🪙' },
  { type: 'star',  amt: 1,   icon: '⭐' },
  { type: 'coin',  amt: 60,  icon: '🪙' },
  { type: 'magnet',amt: 1,   icon: '🧲' },
  { type: 'coin',  amt: 100, icon: '🪙' },
  { type: 'bomb',  amt: 2,   icon: '💣' },
  { type: 'coin',  amt: 120, icon: '🪙' },
  { type: 'freeze',amt: 2,   icon: '❄️' },
  { type: 'star',  amt: 2,   icon: '⭐' },
  { type: 'coin',  amt: 150, icon: '🪙' },
  { type: 'magnet',amt: 2,   icon: '🧲' },
  { type: 'coin',  amt: 175, icon: '🪙' },
  { type: 'star',  amt: 2,   icon: '⭐' },
  { type: 'coin',  amt: 200, icon: '🪙' },
  { type: 'bomb',  amt: 3,   icon: '💣' },
  { type: 'star',  amt: 3,   icon: '⭐' },
  { type: 'coin',  amt: 250, icon: '🪙' },
  { type: 'freeze',amt: 3,   icon: '❄️' },
  { type: 'star',  amt: 3,   icon: '⭐' },
  { type: 'coin',  amt: 300, icon: '🪙' },
  { type: 'magnet',amt: 3,   icon: '🧲' },
  { type: 'star',  amt: 5,   icon: '⭐' },
  { type: 'coin',  amt: 400, icon: '🪙' },
  { type: 'bomb',  amt: 5,   icon: '💣' },
  { type: 'mythic',amt: 1,   icon: '👑' }
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

export function evaluateDailyOnLoad() {
  const today = todayStr();
  if (state.lastDailyDate) {
    const diff = daysBetween(state.lastDailyDate, today);
    if (diff > 1) {
      state.dailyStreak = 0; // streak broken
    }
  }
  // Notification dot if today not claimed
  setNotificationDot('daily', !state.dailyClaimed[today]);
}

export function renderDaily(sideBody) {
  const today = todayStr();
  const todayClaimed = !!state.dailyClaimed[today];
  let dayInStreak = state.dailyStreak;
  if (!todayClaimed) dayInStreak = state.dailyStreak; // current pos to claim

  let html = `
    <div class="daily-streak">
      <span class="flame">🔥</span>
      <div>Streak: <b>${state.dailyStreak}</b> days</div>
    </div>
    <div class="section-h">30-Day Reward Calendar</div>
    <div class="daily-cal">
  `;
  for (let i = 0; i < REWARDS_30.length; i++) {
    const claimed = i < state.dailyStreak;
    const isToday = (i === state.dailyStreak && !todayClaimed);
    const locked = i > state.dailyStreak;
    const r = REWARDS_30[i];
    let cls = 'daily-day';
    if (claimed) cls += ' claimed';
    else if (isToday) cls += ' today';
    else if (locked) cls += ' locked';
    html += `<div class="${cls}" data-day="${i}">
      <div class="num">D${i + 1}</div>
      <div class="reward">${r.icon}</div>
      <div class="num" style="font-size:8px;">${r.amt}</div>
    </div>`;
  }
  html += `</div>`;

  if (todayClaimed) {
    html += `<div class="empty-state">✅ Today's reward already claimed.<br>Come back tomorrow to keep your streak!</div>`;
  } else {
    const r = REWARDS_30[Math.min(state.dailyStreak, REWARDS_30.length - 1)];
    html += `<button class="btn btn-gold" id="claimDaily">Claim ${r.icon} +${r.amt}</button>`;
  }

  // Daily challenge
  html += `<div class="section-h">Daily Challenge</div>`;
  const ch = getDailyChallenge();
  html += `
    <div class="quest-row">
      <div class="quest-icon">${ch.icon}</div>
      <div class="quest-info">
        <div class="text">${ch.text}</div>
        <div class="reward">+${ch.reward} 🪙 + 1 ⭐</div>
      </div>
      <div class="quest-progress">today</div>
    </div>
    <div style="font-size:10px;color:rgba(255,255,255,.4);text-align:center;margin-top:8px;">
      Complete during any run today. Resets at midnight.
    </div>
  `;

  sideBody.innerHTML = html;
  const btn = document.getElementById('claimDaily');
  if (btn) btn.addEventListener('click', () => claimToday(sideBody));
}

function claimToday(sideBody) {
  const today = todayStr();
  if (state.dailyClaimed[today]) return;
  const idx = Math.min(state.dailyStreak, REWARDS_30.length - 1);
  const r = REWARDS_30[idx];
  applyReward(r);
  state.dailyClaimed[today] = true;
  state.dailyStreak++;
  state.lastDailyDate = today;
  saveAll();
  refreshHud();
  showAchievementToast({ icon: r.icon, label: 'DAILY REWARD', name: `Day ${idx + 1} Reward`, desc: `+${r.amt} ${r.type}`, reward: r.type === 'coin' ? r.amt : 0 });
  setNotificationDot('daily', false);
  renderDaily(sideBody);
}

function applyReward(r) {
  if (r.type === 'coin') state.coins += r.amt;
  else if (r.type === 'star') state.stars += r.amt;
  else if (r.type === 'bomb') state.starterPowers.bomb += r.amt;
  else if (r.type === 'freeze') state.starterPowers.freeze += r.amt;
  else if (r.type === 'magnet') state.starterPowers.magnet += r.amt;
  else if (r.type === 'mythic') {
    if (!state.ownedSkins.includes('mythic')) state.ownedSkins.push('mythic');
  }
}

// Daily challenge: deterministic by date so all players see the same one
export function getDailyChallenge() {
  const today = todayStr();
  const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const challenges = [
    { id: 'd_score', icon: '⭐', text: 'Score <b>2,000+</b> in one run', reward: 100 },
    { id: 'd_dog',   icon: '🐶', text: 'Make <b>3 Dogs</b> in one run',   reward: 100 },
    { id: 'd_combo', icon: '🔥', text: 'Get a <b>4-combo</b>',            reward: 100 },
    { id: 'd_merge', icon: '✨', text: 'Merge <b>30 blobs</b> in one run',reward: 100 },
    { id: 'd_capy',  icon: '🦫', text: 'Make a <b>Capybara</b>',          reward: 100 },
    { id: 'd_stage', icon: '🏔️', text: 'Reach <b>Stage 4</b> today',       reward: 100 },
    { id: 'd_drops', icon: '💧', text: 'Drop <b>40 blobs</b> in one run', reward: 100 }
  ];
  return challenges[seed % challenges.length];
}
