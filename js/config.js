// =================================================================
// BLOBVERSE CONFIG — every tunable in one file
// Edit this to balance the game. No game logic lives here.
// =================================================================

export const CONFIG = {
  // World dimensions (logical pixels — canvas scales)
  W: 400,
  H: 600,
  WALL_T: 18,
  KILL_Y: 88,
  DROP_Y: 56,

  // Drop / cooldown
  COOLDOWN_MS: 380,

  // Combo system
  COMBO_DECAY_MS: 1500,
  COMBO_MAX: 8,

  // Game over detection
  DANGER_FRAMES_WARN: 30,
  DANGER_FRAMES_OVER: 90,
  GRACE_PERIOD_MS: 1200,

  // Power-up timings (ms)
  FREEZE_DURATION: 4500,
  MAGNET_DURATION: 4000,

  // Power durations & physics tweaks
  ANTI_GRAVITY_INTERVAL: 15000,
  ANTI_GRAVITY_DURATION: 2000,

  // XP & levels
  XP_PER_LEVEL_BASE: 20,
  XP_PER_LEVEL_GROWTH: 10,
  MAX_PLAYER_LEVEL: 50,

  // Scoring
  SCORE_BASE: (tier) => (tier + 1) * (tier + 2),
  COMBO_MULT: (combo) => 1 + (combo - 1) * 0.5,
  SUPERNOVA_SCORE: 1000,
  SUPERNOVA_COINS: 50,

  // Coin economy
  COINS_PER_MERGE: (newTier) => newTier + 1,
  XP_PER_MERGE: (newTier) => 2 + newTier * 2,
  STARS_PER_STAGE: 3,

  // Random drop weights (cumulative)
  DROP_WEIGHTS: [
    { tier: 0, prob: 0.42 },
    { tier: 1, prob: 0.78 },
    { tier: 2, prob: 0.95 },
    { tier: 3, prob: 1.00 }
  ],

  // Level-up rewards
  LEVEL_UP_COINS: 20,

  // UI
  TOAST_DURATION: 3200,
  MASCOT_BUBBLE_MS: 2200,
  STATUS_ROTATE_MS: 4500,

  // Vibration patterns (ms) - on supported devices
  VIBRATE: {
    drop: 8,
    merge: 12,
    combo: [10, 30, 10],
    win: [40, 20, 80, 20, 40]
  },

  // Save key
  SAVE_KEY: 'blobverse-save-v1',
  PROFILE_KEY: 'blobverse-profile-v1',
  SETTINGS_KEY: 'blobverse-settings-v1',

  // Leaderboard limits
  LEADERBOARD_MAX_NAME: 14,
  LEADERBOARD_MIN_SUBMIT_MS: 30000,
  LEADERBOARD_TOP_N: 50
};

export default CONFIG;
