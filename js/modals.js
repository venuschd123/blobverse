// =================================================================
// MODALS — game over, stage clear, win, pause, settings
// =================================================================
import { state } from './state.js';
import { saveAll, saveSettings, resetAll } from './save.js';

const GAME_OVER_QUIPS = [
  "the blobs have spoken.",
  "physics noticed your hubris.",
  "well, that escalated.",
  "RIP. they were so young.",
  "every blob ascends eventually.",
  "the jar overfloweth.",
  "blobification incomplete.",
  "skill issue (affectionate).",
  "the cosmos is patient. you are not."
];
const STAGE_CLEAR_QUIPS = [
  "stage cleared. blob legend.",
  "the blobs salute you.",
  "you may proceed, oh wise one.",
  "physics has been respected.",
  "next stage approaches…"
];
const WIN_QUIPS = [
  "YOU MADE A WHOLE PLANET.",
  "the blobverse expands by your hand.",
  "scientists hate this one trick.",
  "the cosmos applauds you."
];

let onClose = null;

export function showModal(html, options = {}) {
  const veil = document.getElementById('modal');
  const card = document.getElementById('modalCard');
  if (!veil || !card) return;
  card.innerHTML = html;
  veil.classList.add('show');
  state.paused = !!options.pauses;
  onClose = options.onClose || null;
}

export function hideModal() {
  const veil = document.getElementById('modal');
  if (veil) veil.classList.remove('show');
  state.paused = false;
  if (onClose) { onClose(); onClose = null; }
}

export function showGameOverModal({ score, best, isNewBest, stage, onPlayAgain, onExit }) {
  const quip = GAME_OVER_QUIPS[Math.floor(Math.random() * GAME_OVER_QUIPS.length)];
  const html = `
    <h2>GAME OVER</h2>
    <div class="quip">${quip}</div>
    <div class="stats-row">
      <div class="box"><div class="label">Score</div><div class="value">${score}</div></div>
      <div class="box"><div class="label">Best</div><div class="value">${best}${isNewBest ? ' 🏆' : ''}</div></div>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,.6);margin:6px 0 12px;">
      Stage <b style="color:#fde68a">${stage}</b> · ${state.dropCount} drops · ${state.mergeCount} merges
    </div>
    <button class="btn btn-primary" id="btnPlayAgain">Play Again</button>
    <button class="btn btn-gold" id="btnShare" style="margin-top:6px;">📸 Share Score</button>
    <button class="btn btn-ghost" id="btnExitToMenu">View Stats</button>
  `;
  showModal(html);
  document.getElementById('btnPlayAgain').addEventListener('click', () => { hideModal(); onPlayAgain && onPlayAgain(); });
  document.getElementById('btnExitToMenu').addEventListener('click', () => { hideModal(); onExit && onExit(); });
}

export function showStageClearModal({ stage, score, starsEarned, nextStage, onContinue }) {
  const quip = STAGE_CLEAR_QUIPS[Math.floor(Math.random() * STAGE_CLEAR_QUIPS.length)];
  const html = `
    <h2 class="win">STAGE ${stage} CLEAR</h2>
    <div class="quip">${quip}</div>
    <div class="stats-row">
      <div class="box"><div class="label">Score</div><div class="value">${score}</div></div>
      <div class="box"><div class="label">Stars</div><div class="value">+${starsEarned} ⭐</div></div>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,.6);margin:6px 0 12px;">
      ${nextStage ? `Up next: <b style="color:#fde68a">${nextStage.icon} ${nextStage.name}</b>` : 'You completed all stages!'}
    </div>
    <button class="btn btn-gold" id="btnContinue">${nextStage ? 'Continue' : 'Endless Mode'}</button>
  `;
  showModal(html);
  document.getElementById('btnContinue').addEventListener('click', () => { hideModal(); onContinue && onContinue(); });
}

export function showWinModal({ score, onContinue }) {
  const quip = WIN_QUIPS[Math.floor(Math.random() * WIN_QUIPS.length)];
  const html = `
    <h2 class="win">🪐 PLANET! 🪐</h2>
    <div class="quip">${quip}</div>
    <div class="stats-row">
      <div class="box"><div class="label">Score</div><div class="value">${score}</div></div>
      <div class="box"><div class="label">Bonus</div><div class="value">+1000</div></div>
    </div>
    <button class="btn btn-gold" id="btnWinContinue">Keep Playing</button>
  `;
  showModal(html);
  document.getElementById('btnWinContinue').addEventListener('click', () => { hideModal(); onContinue && onContinue(); });
}

export function showPauseModal({ onResume, onRestart, onSettings, onExit }) {
  const html = `
    <h2>Paused</h2>
    <div class="quip">take all the time you need.</div>
    <button class="btn btn-primary" id="btnResume">Resume</button>
    <button class="btn btn-ghost" id="btnRestart">Restart Run</button>
    <button class="btn btn-ghost" id="btnPauseSettings">Settings</button>
  `;
  showModal(html, { pauses: true });
  document.getElementById('btnResume').addEventListener('click', () => { hideModal(); onResume && onResume(); });
  document.getElementById('btnRestart').addEventListener('click', () => { hideModal(); onRestart && onRestart(); });
  document.getElementById('btnPauseSettings').addEventListener('click', () => { hideModal(); onSettings && onSettings(); });
}

export function showSettingsPanel(sideBody) {
  const s = state.settings;
  sideBody.innerHTML = `
    <div class="setting-row">
      <div>
        <div style="font-weight:800;">Music</div>
        <div style="font-size:10px;color:rgba(255,255,255,.5);">Cosmic ambient drone</div>
      </div>
      <div class="toggle ${s.musicEnabled !== false ? 'on' : ''}" id="tgMusic"></div>
    </div>
    <div class="setting-row">
      <div>
        <div style="font-weight:800;">Sound Effects</div>
        <div style="font-size:10px;color:rgba(255,255,255,.5);">Drop, merge, combo</div>
      </div>
      <div class="toggle ${s.sfxEnabled !== false ? 'on' : ''}" id="tgSfx"></div>
    </div>
    <div class="setting-row">
      <div>
        <div style="font-weight:800;">Vibration</div>
        <div style="font-size:10px;color:rgba(255,255,255,.5);">Haptic feedback</div>
      </div>
      <div class="toggle ${s.vibration ? 'on' : ''}" id="tgVib"></div>
    </div>
    <div class="setting-row">
      <div>
        <div style="font-weight:800;">Reduced Motion</div>
        <div style="font-size:10px;color:rgba(255,255,255,.5);">Calmer animations</div>
      </div>
      <div class="toggle ${s.reducedMotion ? 'on' : ''}" id="tgRM"></div>
    </div>
    <div class="setting-row">
      <div>
        <div style="font-weight:800;">High Contrast</div>
        <div style="font-size:10px;color:rgba(255,255,255,.5);">Bolder edges</div>
      </div>
      <div class="toggle ${s.highContrast ? 'on' : ''}" id="tgHC"></div>
    </div>
    <div class="section-h">Profile</div>
    <div class="setting-row" style="flex-direction:column;align-items:stretch;gap:8px;">
      <div style="display:flex;justify-content:space-between;">
        <div>
          <div style="font-weight:800;">Name</div>
          <div style="font-size:10px;color:rgba(255,255,255,.5);">Shown on leaderboard</div>
        </div>
        <div style="font-weight:800;color:#fde68a;">${state.profile.name} ${state.profile.country || ''}</div>
      </div>
      <input id="newName" maxlength="14" value="${state.profile.name}" style="width:100%;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:12px;text-align:center;" />
      <button class="btn btn-ghost" id="saveName" style="margin-top:0;padding:6px;font-size:11px;">Save Name</button>
    </div>
    <div class="section-h">Reset</div>
    <button class="btn btn-ghost" id="resetAll" style="background:rgba(244,63,94,.1);border-color:rgba(244,63,94,.4);color:#fda4af;">Reset All Progress</button>
    <p style="font-size:10px;color:rgba(255,255,255,.45);margin-top:6px;text-align:center;">This wipes your save permanently. Your global leaderboard scores remain.</p>
  `;
  function bindToggle(id, key, audioCallback) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      state.settings[key] = !state.settings[key];
      el.classList.toggle('on', state.settings[key]);
      saveSettings();
      applySettings();
      if (audioCallback) audioCallback(state.settings[key]);
    });
  }
  // Lazy import to avoid cycle
  import('./audio.js').then(m => {
    bindToggle('tgMusic', 'musicEnabled', v => {
      m.audio.setMusicEnabled(v);
      if (v) m.audio.startMusic(); else m.audio.stopMusic();
    });
    bindToggle('tgSfx', 'sfxEnabled', v => m.audio.setSfxEnabled(v));
  });
  bindToggle('tgVib', 'vibration');
  bindToggle('tgRM', 'reducedMotion');
  bindToggle('tgHC', 'highContrast');
  const sn = document.getElementById('saveName');
  if (sn) sn.addEventListener('click', () => {
    const v = (document.getElementById('newName').value || '').trim().slice(0, 14) || 'Player';
    state.profile.name = v;
    saveAll();
    showSettingsPanel(sideBody);
  });
  const rs = document.getElementById('resetAll');
  if (rs) rs.addEventListener('click', () => {
    if (confirm('Reset everything? This cannot be undone.')) {
      resetAll();
      location.reload();
    }
  });
}

export function applySettings() {
  document.body.classList.toggle('no-motion', state.settings.reducedMotion);
  document.body.classList.toggle('high-contrast', state.settings.highContrast);
}
