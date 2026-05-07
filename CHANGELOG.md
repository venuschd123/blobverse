# Changelog

All notable changes to Blobverse.

## [1.1.0] — Crash fix + Audio + Juice

### Fixed
- **Critical: "Something blew up" crash on load.** The global error handler was firing on benign warnings (ResizeObserver loop notifications, cross-origin script messages). Now filters benign errors and only shows the overlay for genuine init failures. Real error messages now display in the overlay so users can report what actually broke.
- **Tutorial unreachable.** The tutorial overlay had `pointer-events: auto` over the entire jar, blocking users from tapping to drop blobs. Fixed: only the tutorial card itself blocks pointer events; the canvas underneath remains tappable.
- **Tutorial dead-end.** Step 3 required `firstUpgrade`, but Upgrade is locked until player level 10. Now removed — tutorial is 4 steps, all reachable.
- **Stale service worker cache.** Bumped SW version from `v1.0.0` to `v1.1.0` so returning visitors automatically get the fixed code instead of the broken cache.

### Added
- **Web Audio synthesizer** — every sound generated in real-time, no asset files, no copyright concerns. Drop, merge (pitch by tier), combo (rising arpeggio), bomb (filtered noise), freeze (shimmer), magnet, swap, level-up, win fanfare, game-over descent. Plus an ambient cosmic drone music layer with slow LFO modulation.
- **Music + SFX toggles** in Settings panel.
- **Camera punch zoom** on tier-4+ merges. Subtle but transformative.
- **Share button** in game over modal. Generates a 1080×1080 PNG score card via canvas, shares via Web Share API on mobile, copies to clipboard on desktop, falls back to download.
- **"Clear Cache & Reload" button** in error overlay — automatically unregisters the service worker and clears all caches. Single click recovery.

### Coming in 1.2
- See `ROADMAP.md` for the honest sequenced plan.

---

## [1.0.0] — Launch

### Added
- 11-tier blob evolution ladder (Pebble → PLANET)
- 10 stages with unique physics twists
- Player levels 1-50 with XP system
- 5 power-ups (Bomb, Freeze, Magnet, Swap, Upgrade)
- Global Supabase leaderboard with all-time and weekly views
- 30-day daily reward calendar with streak system
- Daily challenge (date-seeded — same for all players)
- 6 active rotating quests
- 25 achievements
- Shop with 7 skins, 7 themes, 6 perks
- Blobdex encyclopedia with lore for every blob
- Bloop the mascot with reactive emotion
- Service worker for offline play
- PWA manifest for installability
- Vibration support, reduced motion, high contrast
- Country flag detection from browser locale
