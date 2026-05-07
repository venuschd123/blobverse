# 🛠 DEVGUIDE.md — Editing The Game (No Coding Required)

90% of changes you'll want to make can be done by editing the JSON files in `data/`. No code knowledge needed — just careful copy-paste.

---

## What's Where

| What you want to change | Edit this file |
|---|---|
| Blob colors / names / sizes | `data/tiers.json` |
| Stage difficulty / number of stages | `data/stages.json` |
| Achievements & rewards | `data/achievements.json` |
| Skins / themes / perks in shop | `data/skins.json` |
| Quests | `data/quests.json` |
| Blobdex lore text | `data/lore.json` |
| Game balance (cooldowns, XP rates, etc.) | `js/config.js` |
| English UI text | `i18n/en.json` |
| App name / colors | `manifest.json` |

---

## How To Edit a JSON File

1. Open the file in your GitHub repo
2. Click the pencil icon
3. Change the value (keep the quotes around text, no quotes around numbers)
4. Scroll down → Commit changes
5. Wait 1–2 minutes for GitHub Pages to redeploy
6. Hard refresh the game (Ctrl+Shift+R / Cmd+Shift+R)

---

## Common Edits

### Add a new achievement

Open `data/achievements.json`. Add a new object before the last `]`:

```json
{
  "id": "myAch",
  "icon": "🎯",
  "name": "Big Drop",
  "desc": "Drop 200 blobs in one run",
  "reward": 75,
  "stat": "dropCount",
  "target": 200
}
```

**Make sure to add a comma after the previous achievement.**

### Change blob colors

Open `data/tiers.json`. Find the blob you want, change the `cs` (colors) array — first value is the bright top color, second is the dark bottom.

```json
{ "id": 4, "name": "Cat", "r": 41, "cs": ["#YOUR_LIGHT_COLOR", "#YOUR_DARK_COLOR"], "emoji": "🐱" }
```

Use a color picker like [coolors.co](https://coolors.co) to get hex codes.

### Change stage difficulty

Open `data/stages.json`. Find the stage, edit:
- `target` — score needed to clear this stage
- `gravity` — 1.0 normal, lower = floaty, higher = heavy
- `friction` — 0 = ice, 0.5 = sticky
- `restitution` — 0 = no bounce, 1 = super bouncy

### Speed up the game

Open `js/config.js`. Change `COOLDOWN_MS: 380` to a lower number (e.g. `250` for faster, `500` for slower).

### Add a new theme

Open `data/skins.json`. Add to `themes` array:

```json
{ "id": "ocean", "name": "Ocean", "desc": "Deep blue", "preview": "🌊", "cost": 350, "currency": "coin" }
```

Then open `css/themes.css` and add CSS to style it:

```css
body.theme-ocean {
  background: radial-gradient(ellipse at center, #0c4a6e 0%, #0c0a1f 80%);
}
```

---

## What NOT to edit (unless you know what you're doing)

- Anything in `js/` other than `config.js` and `supabase-config.js` — these are game logic
- `sw.js` — service worker, breaks offline mode if you change it wrong
- `index.html` — the layout shell

If you do want to edit them, work on a copy first. GitHub keeps version history (Settings → click "Commits") so you can roll back if something breaks.

---

## Adding A New Language

1. Copy `i18n/en.json` to a new file like `i18n/es.json`
2. Translate the values (keep the keys in English)
3. Edit `js/main.js` and find `await loadLanguage('en');` — change to `'es'`

Currently the game only loads one language at boot. A language picker is on the v1.1 roadmap.

---

## Testing Changes Before Deploying

You can test locally:

1. Open the `blobverse` folder on your computer
2. Right-click `index.html` → Open With → your browser

**Note:** Some features (like the data JSON loaders) require a real web server because of browser CORS rules. If `index.html` opens but the game shows a "Failed to load" error, run a tiny local server:

- **Mac/Linux:** Open Terminal in the blobverse folder and run: `python3 -m http.server 8000`
- **Windows:** Install Python first, then run the same command in PowerShell

Then visit `http://localhost:8000` in your browser.
