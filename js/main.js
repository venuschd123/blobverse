// =================================================================
// MAIN — bootstrap, game loop, merge logic
// =================================================================
import { CONFIG } from './config.js';
import { state, getStat } from './state.js';
import { saveAll, loadAll, loadSettings, saveSettings, vibrate } from './save.js';
import { initPhysics, getEngine, getWorld, makeBlob, removeBody, clearAllBodies, applyStagePhysics, applyMagnet, applyWind, applyWindForce, applyAntiGravity, pickRandomDropTier } from './physics.js';
import { initRender, drawFrame, fitCanvas, getCanvas, bumpZoom } from './render.js';
import { initInput } from './input.js';
import { spawnFlash, spawnParticles, addPopup, spawnAmbient, spawnConfetti, triggerShake } from './effects.js';
import { initMascot, mascotSay } from './mascot.js';
import { initTutorial, maybeStartTutorial, advanceTutorialOn, isTutorialActive } from './tutorial.js';
import { refreshHud, refreshChain, flashChainPip, refreshPowers, showCombo, updateComboMeter, rotateStatus, showAchievementToast, setWeatherLabel, setNotificationDot } from './ui.js';
import { showGameOverModal, showStageClearModal, showWinModal, showPauseModal, showSettingsPanel, applySettings } from './modals.js';
import { initLeaderboard, submitScore, fetchTop, detectCountry, renderLeaderboard, isUsingGlobal } from './leaderboard.js';
import { renderShop, applyTheme } from './shop.js';
import { initQuests, checkQuests, renderQuests } from './quests.js';
import { checkAchievements } from './achievements.js';
import { evaluateDailyOnLoad, renderDaily, getDailyChallenge } from './daily.js';
import { renderBlobdex } from './blobdex.js';
import { loadLanguage } from './i18n.js';
import { audio } from './audio.js';
import { initShare, openShareSheet } from './share.js';

let lastFrame = 0;
let gameStarted = false;

// =================================================================
// BOOT
// =================================================================
async function boot() {
  setupCrashHandler();
  loadSettings();
  applySettings();
  loadAll();

  // Load all JSON data files in parallel
  try {
    const [tiers, stages, achievements, skins, quests, lore] = await Promise.all([
      fetch('./data/tiers.json').then(r => r.json()),
      fetch('./data/stages.json').then(r => r.json()),
      fetch('./data/achievements.json').then(r => r.json()),
      fetch('./data/skins.json').then(r => r.json()),
      fetch('./data/quests.json').then(r => r.json()),
      fetch('./data/lore.json').then(r => r.json())
    ]);
    state.tiers = tiers;
    state.stages = stages;
    state.achievementsList = achievements;
    state.skinsData = skins;
    state.questsList = quests;
    state.loreData = lore;
  } catch (e) {
    showError('Failed to load game data. Check your internet connection and reload.');
    return;
  }

  await loadLanguage('en');
  await detectCountry();
  initLeaderboard();
  evaluateDailyOnLoad();

  applyTheme(state.equippedTheme);

  // Stage on highest unlocked
  state.stageId = Math.max(1, ...(state.unlockedStages || [1]));
  state.stageData = state.stages.find(s => s.id === state.stageId) || state.stages[0];

  // Boot screen → name entry
  setupBootScreen();

  // Wire other UI
  wireBottomNav();
  wireSidePanel();
  wireTopButtons();
  wirePowers();

  // Show country in boot
  document.getElementById('bootCountry').textContent = state.profile.country || '🌍';
  if (state.profile.name && state.profile.name !== 'Player') {
    document.getElementById('playerName').value = state.profile.name;
  }
}

function setupBootScreen() {
  const boot = document.getElementById('bootScreen');
  const app = document.getElementById('app');
  const start = document.getElementById('btnStart');
  const skip = document.getElementById('btnSkipName');
  const nameInput = document.getElementById('playerName');

  function go(asGuest) {
    let n = (nameInput.value || '').trim().slice(0, CONFIG.LEADERBOARD_MAX_NAME);
    if (asGuest || !n) n = 'Player' + Math.floor(100 + Math.random() * 900);
    state.profile.name = n;
    if (!state.profile.createdAt) state.profile.createdAt = Date.now();
    state.profile.lastPlayed = Date.now();
    saveAll();
    // Audio MUST be initialized inside a user gesture for iOS/Safari
    audio.init();
    audio.setMusicEnabled(state.settings.musicEnabled !== false);
    audio.setSfxEnabled(state.settings.sfxEnabled !== false);
    audio.click();
    setTimeout(() => audio.startMusic(), 600);
    boot.classList.add('fadeOut');
    setTimeout(() => {
      boot.classList.add('hidden');
      app.classList.remove('hidden');
      try {
        startGame();
        markInitComplete();
      } catch (e) {
        console.error('startGame failed:', e);
        showError('Failed to start the game: ' + (e.message || e));
      }
    }, 400);
  }
  start.addEventListener('click', () => go(false));
  skip.addEventListener('click', () => go(true));
  nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') go(false); });
}

// =================================================================
// GAME START
// =================================================================
function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  initRender();
  initPhysics();
  initMascot();
  initTutorial();
  initQuests();

  const canvas = getCanvas();
  initInput(canvas, {
    onDrop: () => {
      audio.drop();
      if (state.dropCount === 1) advanceTutorialOn('firstDrop');
      checkAfterAction();
    },
    onPower: (k) => {
      audio.power(k);
      if (k === 'upgrade') advanceTutorialOn('firstUpgrade');
      refreshPowers();
      checkAfterAction();
    }
  });

  applyStagePhysics(state.stageData);
  setWeatherForStage();
  startNewRun(true);

  refreshChain();
  refreshHud();
  refreshPowers();

  // Collision listener — merging
  Matter.Events.on(getEngine(), 'collisionStart', e => {
    const now = performance.now();
    for (const pair of e.pairs) {
      const A = pair.bodyA, B = pair.bodyB;
      if (!A || !B || A.label !== 'blob' || B.label !== 'blob') continue;
      if (A.merging || B.merging) continue;
      if (A.tier !== B.tier) continue;
      if (A.tier >= state.tiers.length - 1) continue;
      if (now < state.freezeUntil) continue;
      A.merging = B.merging = true;
      mergeBlobs(A, B);
    }
  });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !state.over) {
      state.paused = true;
      audio.stopMusic();
    } else if (!state.over && !document.querySelector('#modal.show')) {
      state.paused = false;
      audio.resume();
      audio.startMusic();
    }
  });

  initShare();

  // ---- v1.1.2 migration: starter gift + best-score backfill ----
  applyV112Migration();

  // Begin loop
  requestAnimationFrame(loop);

  // Tutorial
  setTimeout(() => maybeStartTutorial(), 600);
  setTimeout(() => mascotSay('idle'), 2200);
}

function applyV112Migration() {
  // One-time grant: 3 of each basic power-up so existing players can actually use the buttons
  if (!state.gotV11Gift) {
    state.starterPowers.bomb = (state.starterPowers.bomb || 0) + 3;
    state.starterPowers.freeze = (state.starterPowers.freeze || 0) + 3;
    state.starterPowers.magnet = (state.starterPowers.magnet || 0) + 3;
    // Also grant for current run (already started)
    state.powers.bomb = (state.powers.bomb || 0) + 3;
    state.powers.freeze = (state.powers.freeze || 0) + 3;
    state.powers.magnet = (state.powers.magnet || 0) + 3;
    state.gotV11Gift = true;
    saveAll();
    refreshPowers();
    setTimeout(() => {
      showAchievementToast({
        icon: '🎁',
        label: 'WELCOME GIFT',
        name: '+3 Bomb · +3 Freeze · +3 Magnet',
        desc: 'Thanks for testing v1.1!'
      });
    }, 1800);
  }

  // One-time backfill: submit existing best score to global leaderboard if connected
  if (isUsingGlobal() && state.best > 0 && !state.bestSubmittedToGlobal) {
    setTimeout(async () => {
      const r = await submitScore(state.best, state.bestStage || 1, { force: true });
      if (r && r.ok && r.global) {
        state.bestSubmittedToGlobal = true;
        saveAll();
        showAchievementToast({
          icon: '🏆',
          label: 'BACKFILLED',
          name: `Best score on the global board!`,
          desc: `${state.best.toLocaleString()} pts · stage ${state.bestStage || 1}`
        });
      }
    }, 3000);
  }
}

function startNewRun(initial) {
  state.score = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.maxCombo = 0;
  state.dropCount = 0;
  state.mergeCount = 0;
  state.tierCount = {};
  state.over = false;
  state.won = false;
  state.particles.length = 0;
  state.popups.length = 0;
  state.flashes.length = 0;
  state.startTime = performance.now();
  state.freezeUntil = 0;
  state.magnetUntil = 0;
  state.activePower = null;
  state.antiGravNext = 0;
  state.antiGravUntil = 0;
  state.windT = 0;
  state.windPhase = 0;
  state.unlocked = new Set([0, 1, 2]);
  state.highestTier = 0;
  state.stageScoreAtStart = 0;
  state.stagePassed = false;
  // Apply starter perks
  state.powers = {
    bomb: state.starterPowers.bomb || 0,
    freeze: state.starterPowers.freeze || 0,
    magnet: state.starterPowers.magnet || 0,
    swap: state.starterPowers.swap || 0,
    upgrade: state.starterPowers.upgrade || 0
  };
  clearAllBodies();
  state.holdTier = pickRandomDropTier();
  state.nextTier = pickRandomDropTier();
  state.canDrop = true;
  state.cooldownT = 0;
  state.dropX = CONFIG.W / 2;
  state.totalRuns++;
  if (initial) maybeStartTutorial();

  // Snapshot quest baselines
  for (const a of state.questActive) {
    const def = state.questsList.find(q => q.id === a.id);
    if (def) a.baseline = getStat(def.stat);
  }

  refreshHud();
  refreshPowers();
}

// =================================================================
// MERGE
// =================================================================
function mergeBlobs(A, B) {
  const newTier = A.tier + 1;
  const mx = (A.position.x + B.position.x) / 2;
  const my = (A.position.y + B.position.y) / 2;
  const wasNew = !state.unlocked.has(newTier);

  // Effects
  const colors = state.tiers[newTier]?.cs || ['#fff', '#888'];
  spawnFlash(mx, my, colors[0], 30 + newTier * 4);
  spawnParticles(mx, my, colors[0], 14 + newTier);
  spawnParticles(mx, my, colors[1], 8 + newTier);
  triggerShake(60 + newTier * 12, newTier >= 7);
  if (newTier >= 4) bumpZoom(0.03 + Math.min(0.05, newTier * 0.008), 280 + newTier * 20);
  vibrate(CONFIG.VIBRATE.merge);
  audio.merge(newTier);

  // Score
  const now = performance.now();
  if (now < state.comboTimer) {
    state.combo = Math.min(CONFIG.COMBO_MAX, state.combo + 1);
  } else {
    state.combo = 1;
  }
  state.comboTimer = now + CONFIG.COMBO_DECAY_MS;
  if (state.combo > state.maxCombo) state.maxCombo = state.combo;

  const base = CONFIG.SCORE_BASE(newTier);
  const mult = CONFIG.COMBO_MULT(state.combo);
  const earned = Math.round(base * mult);
  state.score += earned;
  state.mergeCount++;
  state.totalMerges++;

  // Coins & XP
  const coinPerk = state.ownedPerks.includes('coin_boost') ? 1.25 : 1;
  const xpPerk = state.ownedPerks.includes('double_xp') ? 1.5 : 1;
  const coinsEarned = Math.ceil(CONFIG.COINS_PER_MERGE(newTier) * coinPerk);
  const xpEarned = Math.ceil(CONFIG.XP_PER_MERGE(newTier) * xpPerk);
  state.coins += coinsEarned;
  addXp(xpEarned);

  addPopup(mx, my - 10, `+${earned}`, state.combo >= 3);
  if (state.combo >= 2) {
    showCombo();
    if (state.combo >= 3) {
      vibrate(CONFIG.VIBRATE.combo);
      mascotSay('combo');
      audio.combo(state.combo);
    }
  }

  // Best
  if (state.score > state.best) state.best = state.score;
  if (state.stageId > state.bestStage) state.bestStage = state.stageId;

  // Remove originals
  removeBody(A);
  removeBody(B);

  // Spawn new tier
  const nb = makeBlob(newTier, mx, my, -1.5);
  if (nb) {
    Matter.Body.setVelocity(nb, { x: 0, y: -2 });
    Matter.Body.setAngularVelocity(nb, (Math.random() - 0.5) * 0.06);
  }

  if (state.dropCount > 0 && state.mergeCount === 1) {
    advanceTutorialOn('firstMerge');
  }

  if (wasNew) {
    state.unlocked.add(newTier);
    flashChainPip(newTier);
    addPopup(mx, my - 32, `🎉 ${state.tiers[newTier].name.toUpperCase()}!`, true);
    spawnConfetti(mx * (getCanvas().width / CONFIG.W), my * (getCanvas().height / CONFIG.H), 24, [colors[0], colors[1]]);
    mascotSay('newTier');
    if (newTier === state.tiers.length - 1) {
      state.score += CONFIG.SUPERNOVA_SCORE;
      state.coins += CONFIG.SUPERNOVA_COINS;
      addPopup(mx, my - 60, `+${CONFIG.SUPERNOVA_SCORE} BONUS!`, true);
      handleWin();
    }
  }

  // Stage clear check
  if (state.stageData && !state.stagePassed && state.score >= state.stageData.target && state.stageId < 10) {
    state.stagePassed = true;
    setTimeout(() => handleStageClear(), 800);
  }

  refreshHud();
  checkAfterAction();
}

function checkAfterAction() {
  checkAchievements();
  checkQuests();
  saveAll();
}

function addXp(amt) {
  state.playerXp += amt;
  while (true) {
    const need = CONFIG.XP_PER_LEVEL_BASE + state.playerLevel * CONFIG.XP_PER_LEVEL_GROWTH;
    if (state.playerXp < need) break;
    state.playerXp -= need;
    if (state.playerLevel < CONFIG.MAX_PLAYER_LEVEL) {
      state.playerLevel++;
      state.coins += CONFIG.LEVEL_UP_COINS;
      showAchievementToast({
        icon: '🆙', label: 'LEVEL UP', name: `Level ${state.playerLevel}`,
        desc: `+${CONFIG.LEVEL_UP_COINS} 🪙`, reward: CONFIG.LEVEL_UP_COINS
      });
      mascotSay('newTier');
      audio.levelUp();
      refreshPowers();
    } else { state.playerXp = 0; break; }
  }
}

// =================================================================
// STAGE CLEAR / WIN
// =================================================================
function handleStageClear() {
  const cleared = state.stageId;
  const next = state.stages.find(s => s.id === cleared + 1);
  state.stars += CONFIG.STARS_PER_STAGE;
  if (!state.unlockedStages.includes(cleared + 1) && next) {
    state.unlockedStages.push(cleared + 1);
  }
  saveAll();
  showStageClearModal({
    stage: cleared,
    score: state.score,
    starsEarned: CONFIG.STARS_PER_STAGE,
    nextStage: next,
    onContinue: () => {
      if (next) {
        state.stageId = next.id;
        state.stageData = next;
        applyStagePhysics(state.stageData);
        setWeatherForStage();
        startNewRun(false);
      } else {
        // Beyond stage 10 = endless
        startNewRun(false);
      }
      refreshHud();
    }
  });
  vibrate(CONFIG.VIBRATE.win);
  mascotSay('stage');
}

function handleWin() {
  state.won = true;
  triggerShake(500, true);
  spawnConfetti(200 * (getCanvas().width / CONFIG.W), 300 * (getCanvas().height / CONFIG.H), 60);
  mascotSay('win');
  audio.win();
}

// =================================================================
// GAME OVER
// =================================================================
let dangerFrames = 0;
function checkGameOver(now) {
  if (state.over) return;
  if (now - state.startTime < CONFIG.GRACE_PERIOD_MS) return;
  let any = false;
  for (const b of state.bodies) {
    if (now - b.bornAt < 800) continue;
    const top = b.position.y - state.tiers[b.tier].r;
    if (top < CONFIG.KILL_Y && Math.abs(b.velocity.y) < 0.6) {
      any = true;
      break;
    }
  }
  const glow = document.getElementById('dangerGlow');
  if (any) {
    dangerFrames++;
    if (glow && dangerFrames > CONFIG.DANGER_FRAMES_WARN) glow.classList.add('warn');
    if (dangerFrames === CONFIG.DANGER_FRAMES_WARN + 5) mascotSay('danger');
    if (dangerFrames > CONFIG.DANGER_FRAMES_OVER) {
      gameOver();
    }
  } else {
    if (glow) glow.classList.remove('warn');
    dangerFrames = Math.max(0, dangerFrames - 2);
  }
}

function gameOver() {
  if (state.over) return;
  state.over = true;
  const isNewBest = state.score >= state.best;
  if (isNewBest) state.best = state.score;
  saveAll();
  vibrate([60, 30, 60, 30, 120]);
  mascotSay('over');
  audio.gameOver();
  audio.stopMusic();
  // Submit to leaderboard
  if (state.score > 0) {
    submitScore(state.score, state.stageId).then(r => {
      if (r && r.ok && r.global) {
        showAchievementToast({
          icon: '🌍',
          label: 'SUBMITTED',
          name: 'Score on global leaderboard!',
          desc: `${state.score.toLocaleString()} pts`
        });
      }
    }).catch(() => {});
  }
  setTimeout(() => {
    showGameOverModal({
      score: state.score,
      best: state.best,
      isNewBest,
      stage: state.stageId,
      onPlayAgain: () => {
        startNewRun(false);
        audio.startMusic();
      },
      onExit: () => {
        // Show leaderboard panel
        openSidePanel('leaderboard');
        startNewRun(false);
      }
    });
  }, 600);
}

// =================================================================
// MAIN LOOP
// =================================================================
function loop(now) {
  try {
    const dt = Math.min(48, now - lastFrame);
    lastFrame = now;
    if (!state.paused && !state.over && !isTutorialActive()) {
      // Cooldown
      if (!state.canDrop && now >= state.cooldownT) state.canDrop = true;
      // Combo decay
      if (state.combo > 0 && now > state.comboTimer) state.combo = 0;
      // Power durations
      if (state.activePower === 'magnet' && now > state.magnetUntil) state.activePower = null;
      // Stage weather
      if (state.stageData && state.stageData.weather === 'storm') {
        applyWind(now);
        applyWindForce();
      }
      if (state.stageData && state.stageData.weather === 'flip') {
        applyAntiGravity(now);
      }
      if (state.activePower === 'magnet' && now < state.magnetUntil) applyMagnet();
      // Step physics (slower if frozen)
      const frozen = now < state.freezeUntil;
      if (frozen) {
        Matter.Engine.update(getEngine(), dt * 0.15);
      } else {
        Matter.Engine.update(getEngine(), dt);
      }
      checkGameOver(now);
      spawnAmbient();
    }
    drawFrame(now);
    rotateStatus(now);
    updateComboMeter(now);
    // Music intensity climbs with score and current combo
    const scoreI = Math.min(1, state.score / 5000);
    const comboI = Math.min(1, state.combo / 6);
    audio.setIntensity(Math.max(scoreI, comboI));
  } catch (e) {
    console.error(e);
    showError('A render error occurred. Reload to continue.');
    return;
  }
  requestAnimationFrame(loop);
}

// =================================================================
// WIRING — buttons, panels
// =================================================================
function wireBottomNav() {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.addEventListener('click', () => openSidePanel(b.dataset.panel));
  });
}

function wireSidePanel() {
  document.getElementById('btnSideClose').addEventListener('click', closeSidePanel);
}

function openSidePanel(which) {
  const panel = document.getElementById('sidePanel');
  const title = document.getElementById('sideTitle');
  const body = document.getElementById('sideBody');
  panel.classList.add('show');
  state.paused = true;
  if (which === 'leaderboard') { title.textContent = 'Leaderboard'; renderLeaderboard(body); }
  else if (which === 'quests') { title.textContent = 'Quests'; renderQuests(body); }
  else if (which === 'shop') { title.textContent = 'Shop'; renderShop(body); }
  else if (which === 'dex') { title.textContent = 'Blobdex'; renderBlobdex(body); }
  else if (which === 'daily') { title.textContent = 'Daily'; renderDaily(body); }
  else if (which === 'settings') { title.textContent = 'Settings'; showSettingsPanel(body); }
}

function closeSidePanel() {
  document.getElementById('sidePanel').classList.remove('show');
  state.paused = false;
}

function wireTopButtons() {
  document.getElementById('btnPause').addEventListener('click', () => {
    showPauseModal({
      onResume: () => {},
      onRestart: () => startNewRun(false),
      onSettings: () => openSidePanel('settings'),
      onExit: () => {}
    });
  });
  document.getElementById('btnMenu').addEventListener('click', () => openSidePanel('settings'));
}

function wirePowers() {
  const map = ['bomb', 'freeze', 'magnet', 'swap', 'upgrade'];
  for (const k of map) {
    const id = 'pw' + k.charAt(0).toUpperCase() + k.slice(1);
    const btn = document.getElementById(id);
    if (!btn) continue;
    btn.addEventListener('click', () => activatePower(k));
  }
}

function activatePower(k) {
  const lockMap = { swap: 5, upgrade: 10 };
  if (lockMap[k] && state.playerLevel < lockMap[k]) {
    showAchievementToast({ icon: '🔒', label: 'LOCKED', name: `Reach Level ${lockMap[k]}`, desc: 'Keep playing to unlock!' });
    audio.click();
    return;
  }
  if ((state.powers[k] || 0) <= 0) {
    showAchievementToast({
      icon: '🪙',
      label: 'OUT OF STOCK',
      name: `${k.charAt(0).toUpperCase() + k.slice(1)} is empty`,
      desc: 'Earn from 🎁 Daily rewards or buy in 🛍️ Shop'
    });
    audio.click();
    return;
  }
  if (k === 'freeze') {
    state.freezeUntil = performance.now() + CONFIG.FREEZE_DURATION;
    state.powers.freeze--;
    state.powerUsage.freeze = (state.powerUsage.freeze || 0) + 1;
    spawnFlash(CONFIG.W / 2, CONFIG.H / 2, '#bae6fd', 200);
    mascotSay('freeze');
  } else if (k === 'magnet') {
    state.magnetUntil = performance.now() + CONFIG.MAGNET_DURATION;
    state.activePower = 'magnet';
    state.powers.magnet--;
    state.powerUsage.magnet = (state.powerUsage.magnet || 0) + 1;
    mascotSay('magnet');
  } else {
    state.activePower = state.activePower === k ? null : k;
    if (k === 'bomb' && state.activePower === 'bomb') mascotSay('bomb');
  }
  refreshPowers();
  checkAfterAction();
}

function setWeatherForStage() {
  if (!state.stageData) return;
  const labels = {
    slip: '💧 SLIPPERY', heavy: '🪨 HEAVY', tight: '🌀 TIGHT',
    bouncy: '🎈 BOUNCY', flip: '🌌 ANTI-GRAV', deep: '🕳️ DEEP',
    ice: '🧊 ICE', storm: '🌪️ STORM', cosmic: '🌠 COSMIC'
  };
  setWeatherLabel(state.stageData.weather ? labels[state.stageData.weather] : '');
}

// =================================================================
// CRASH HANDLER — only fatal init errors trigger the overlay
// =================================================================
let gameDidInit = false;
const BENIGN_PATTERNS = [
  /ResizeObserver loop/i,
  /^Script error\.?$/,
  /Non-Error promise rejection/i,
  /ChunkLoadError/i,
  /load.*chunk/i
];

function setupCrashHandler() {
  window.addEventListener('error', e => {
    const msg = (e && e.message) || '';
    if (BENIGN_PATTERNS.some(re => re.test(msg))) {
      // Benign — ignore. These do not warrant a user-facing error.
      console.warn('[Blobverse] Ignored benign error:', msg);
      return;
    }
    console.error('[Blobverse] error:', msg, e.error || '');
    // Only show overlay if game never finished initializing.
    // After init, individual subsystems handle their own errors.
    if (!gameDidInit) {
      showError(`Init error: ${msg || 'unknown'}\n\nTry reloading. If it persists, clear site data in your browser settings.`);
    }
  });
  window.addEventListener('unhandledrejection', e => {
    console.warn('[Blobverse] Promise rejection:', e.reason);
    // Promise rejections are non-fatal by default. Don't show overlay.
  });
}

function showError(msg) {
  const ov = document.getElementById('errOverlay');
  const m = document.getElementById('errMsg');
  if (m) m.textContent = msg || 'Something broke.';
  if (ov) ov.classList.add('show');
}

function markInitComplete() { gameDidInit = true; }

// Boot it
boot();
