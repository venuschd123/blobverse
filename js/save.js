// =================================================================
// SAVE — persistent storage (localStorage; gracefully fails)
// =================================================================
import { CONFIG } from './config.js';
import { state } from './state.js';

export function saveAll() {
  try {
    const payload = {
      profile: state.profile,
      best: state.best,
      bestStage: state.bestStage,
      coins: state.coins,
      stars: state.stars,
      playerLevel: state.playerLevel,
      playerXp: state.playerXp,
      totalMerges: state.totalMerges,
      totalRuns: state.totalRuns,
      unlockedStages: state.unlockedStages,
      achievements: Array.from(state.achievements),
      ownedSkins: state.ownedSkins,
      equippedSkin: state.equippedSkin,
      ownedThemes: state.ownedThemes,
      equippedTheme: state.equippedTheme,
      ownedPerks: state.ownedPerks,
      starterPowers: state.starterPowers,
      powerUsage: state.powerUsage,
      dailyClaimed: state.dailyClaimed,
      dailyStreak: state.dailyStreak,
      lastDailyDate: state.lastDailyDate,
      questActive: state.questActive,
      questCompleted: state.questCompleted,
      hasSeenTutorial: state.hasSeenTutorial,
      bestSubmittedToGlobal: state.bestSubmittedToGlobal,
      gotV11Gift: state.gotV11Gift,
      v: 1
    };
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function loadAll() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (d.profile) Object.assign(state.profile, d.profile);
    if (typeof d.best === 'number') state.best = d.best;
    if (typeof d.bestStage === 'number') state.bestStage = d.bestStage;
    if (typeof d.coins === 'number') state.coins = d.coins;
    if (typeof d.stars === 'number') state.stars = d.stars;
    if (typeof d.playerLevel === 'number') state.playerLevel = d.playerLevel;
    if (typeof d.playerXp === 'number') state.playerXp = d.playerXp;
    if (typeof d.totalMerges === 'number') state.totalMerges = d.totalMerges;
    if (typeof d.totalRuns === 'number') state.totalRuns = d.totalRuns;
    if (Array.isArray(d.unlockedStages)) state.unlockedStages = d.unlockedStages;
    if (Array.isArray(d.achievements)) state.achievements = new Set(d.achievements);
    if (Array.isArray(d.ownedSkins)) state.ownedSkins = d.ownedSkins;
    if (typeof d.equippedSkin === 'string') state.equippedSkin = d.equippedSkin;
    if (Array.isArray(d.ownedThemes)) state.ownedThemes = d.ownedThemes;
    if (typeof d.equippedTheme === 'string') state.equippedTheme = d.equippedTheme;
    if (Array.isArray(d.ownedPerks)) state.ownedPerks = d.ownedPerks;
    if (d.starterPowers) Object.assign(state.starterPowers, d.starterPowers);
    if (d.powerUsage) Object.assign(state.powerUsage, d.powerUsage);
    if (d.dailyClaimed) state.dailyClaimed = d.dailyClaimed;
    if (typeof d.dailyStreak === 'number') state.dailyStreak = d.dailyStreak;
    if (typeof d.lastDailyDate === 'string') state.lastDailyDate = d.lastDailyDate;
    if (Array.isArray(d.questActive)) state.questActive = d.questActive;
    if (Array.isArray(d.questCompleted)) state.questCompleted = d.questCompleted;
    if (typeof d.hasSeenTutorial === 'boolean') state.hasSeenTutorial = d.hasSeenTutorial;
    if (typeof d.bestSubmittedToGlobal === 'boolean') state.bestSubmittedToGlobal = d.bestSubmittedToGlobal;
    if (typeof d.gotV11Gift === 'boolean') state.gotV11Gift = d.gotV11Gift;
    return true;
  } catch (e) {
    console.warn('Load failed:', e);
    return false;
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(CONFIG.SETTINGS_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    Object.assign(state.settings, d);
  } catch (e) {}
}
export function saveSettings() {
  try {
    localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(state.settings));
  } catch (e) {}
}

export function resetAll() {
  try {
    localStorage.removeItem(CONFIG.SAVE_KEY);
    localStorage.removeItem(CONFIG.SETTINGS_KEY);
    localStorage.removeItem(CONFIG.PROFILE_KEY);
  } catch (e) {}
}

export function vibrate(pattern) {
  if (!state.settings.vibration) return;
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}
