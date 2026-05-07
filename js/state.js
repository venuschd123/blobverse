// =================================================================
// STATE — single source of truth
// =================================================================
import { CONFIG } from './config.js';

export const state = {
  // Run state
  score: 0,
  combo: 0,
  comboTimer: 0,
  maxCombo: 0,
  nextTier: 0,
  holdTier: 0,
  dropX: CONFIG.W / 2,
  canDrop: true,
  cooldownT: 0,
  bodies: new Set(),
  unlocked: new Set([0, 1, 2]),
  highestTier: 0,
  dropCount: 0,
  mergeCount: 0,
  tierCount: {},
  shakeUntil: 0,
  startTime: 0,

  // Effects
  particles: [],
  popups: [],
  flashes: [],
  ambient: [],

  // Run modifiers
  freezeUntil: 0,
  magnetUntil: 0,
  activePower: null,
  antiGravNext: 0,
  antiGravUntil: 0,
  windT: 0,
  windPhase: 0,

  // Stage state
  stageId: 1,
  stageData: null,
  stageScoreAtStart: 0,
  stagePassed: false,

  // Run-end flags
  over: false,
  won: false,
  paused: false,

  // Input
  pointerX: CONFIG.W / 2,
  pointerY: 0,

  // Visuals
  bgHue: 0,
  statusIdx: 0,
  statusT: 0,

  // Persistent (saved to disk)
  profile: {
    name: 'Player',
    country: '🌍',
    createdAt: 0,
    lastPlayed: 0
  },
  best: 0,
  bestStage: 1,
  coins: 0,
  stars: 0,
  playerLevel: 1,
  playerXp: 0,
  totalMerges: 0,
  totalRuns: 0,
  unlockedStages: [1],
  achievements: new Set(),
  ownedSkins: ['default'],
  equippedSkin: 'default',
  ownedThemes: ['default'],
  equippedTheme: 'default',
  ownedPerks: [],
  starterPowers: { bomb: 0, freeze: 0, magnet: 0, swap: 0, upgrade: 0 },
  powerUsage: { bomb: 0, freeze: 0, magnet: 0, swap: 0, upgrade: 0 },
  dailyClaimed: {},
  dailyStreak: 0,
  lastDailyDate: '',
  questActive: [],
  questCompleted: [],
  hasSeenTutorial: false,

  // Settings
  settings: {
    vibration: true,
    reducedMotion: false,
    highContrast: false,
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.35,
    sfxVolume: 0.55
  },

  // Run-time loaded
  tiers: [],
  stages: [],
  achievementsList: [],
  skinsData: null,
  questsList: [],
  loreData: {},

  // Rate limiting for leaderboard
  lastLeaderboardSubmit: 0,

  // Power state for current run
  powers: { bomb: 0, freeze: 0, magnet: 0, swap: 0, upgrade: 0 }
};

// Stat accessor for quest/achievement targeting
export function getStat(key) {
  if (key === 'score') return state.score;
  if (key === 'maxCombo') return state.maxCombo;
  if (key === 'dropCount') return state.dropCount;
  if (key === 'mergeCount') return state.mergeCount;
  if (key === 'totalMerges') return state.totalMerges;
  if (key === 'stage') return state.stageId;
  if (key === 'playerLevel') return state.playerLevel;
  if (key.startsWith('tier:')) {
    const t = parseInt(key.split(':')[1], 10);
    return state.tierCount[t] || 0;
  }
  if (key.startsWith('power:')) {
    const p = key.split(':')[1];
    return state.powerUsage[p] || 0;
  }
  return 0;
}

export default state;
