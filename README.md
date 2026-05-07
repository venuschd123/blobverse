# 🌌 Blobverse

**Drop · Merge · Ascend**

A Suika-style blob evolution game with global leaderboards, 10 stages, daily rewards, quests, achievements, and a 60+ item shop. Built as a Progressive Web App — installable on phones, plays offline, ready to wrap as a native iOS/Android app later.

![Tagline](https://img.shields.io/badge/Status-Playable-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![PWA](https://img.shields.io/badge/PWA-Yes-purple)

---

## ⚡ Quick Start (Layman Edition)

You don't need to install anything. To play locally:

1. Download the project as a ZIP
2. Unzip it
3. Open `index.html` in your browser ✅

To deploy publicly so friends can play, see **`DEPLOY.md`** — the click-by-click GitHub Pages walkthrough.

---

## 📂 What's in This Folder

```
blobverse/
├── index.html              ← The game itself
├── manifest.json           ← Lets people "install" it as an app
├── sw.js                   ← Makes it work offline
├── css/                    ← Looks
├── js/                     ← Brains
├── data/                   ← Editable game balance (JSON)
├── assets/                 ← Icon
├── i18n/                   ← Translations (English only for now)
│
├── README.md               ← You are here
├── DEPLOY.md               ← How to put this online (free)
├── DEVGUIDE.md             ← How to edit anything, no coding required
├── MOBILE_PLAN.md          ← How to ship to App Store / Play Store later
├── MONETIZATION_PLAN.md    ← How to (eventually) earn money
├── LEGAL_PLAN.md           ← Trademark + privacy + copyright checklist
├── CHANGELOG.md            ← Version history
├── LICENSE                 ← MIT (do whatever you want with the code)
├── privacy.html            ← Required for App Store
├── terms.html              ← Required for App Store
└── credits.html            ← Credits page
```

---

## ✨ Features

- **11-tier blob ladder** — pebble all the way to PLANET
- **10 stages** with progressive twists (slippery, heavy, tight, anti-grav, ice, storm, cosmic…)
- **Player level 1-50** with XP and unlock-gated power-ups
- **5 power-ups** — Bomb, Freeze, Magnet, Swap, Upgrade
- **Global leaderboard** via Supabase (free), with all-time and weekly tabs
- **Daily reward calendar** (30 days), streak system, daily challenge
- **6 active quests** that auto-refresh as you complete them
- **25 achievements** with toast notifications
- **60+ shop items** — skins, themes, perks
- **Blobdex** — encyclopedia with lore for every blob
- **Bloop the mascot** — animated, reacts to events
- **Offline play** — service worker caches everything
- **Installable** — works as a real app on phones (Add to Home Screen)
- **Country flags** auto-detected from browser locale
- **Accessibility** — vibration toggle, reduced motion, high contrast

---

## 🔧 Configuration

The only file you need to edit before going live is:

- **`js/supabase-config.js`** — paste your Supabase URL and anon key here to enable the global leaderboard. Without these, the game runs perfectly on a local-only leaderboard.

See `DEPLOY.md` for the Supabase setup walkthrough.

---

## 🛠 Tech

- **Vanilla JS (ES modules)** — no build step, no npm install. Just files.
- **Matter.js** for physics (loaded from CDN)
- **Supabase JS** for the leaderboard (loaded from CDN)
- **Canvas 2D** for rendering — no WebGL, runs anywhere
- **PWA** — manifest + service worker for offline & installability

---

## 📜 License

MIT — see `LICENSE`. The code is yours to fork, modify, and distribute. The name "Blobverse," the mascot Bloop, and the visual identity are not licensed to you under MIT (you're free to fork and rename your version).

---

## 🙏 Credits

Built by you, with assistance from Claude.
Physics by [Matter.js](https://brm.io/matter-js/) (MIT).
Database & auth by [Supabase](https://supabase.com) (Apache 2.0).
