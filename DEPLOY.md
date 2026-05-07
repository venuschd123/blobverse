# 🚀 DEPLOY.md — Get Your Game Online (For Total Beginners)

This guide assumes you've never used GitHub, never written code, and just want your game on the internet so people can play it. Everything here is **free**.

**Total time:** ~30 minutes the first time. ~2 minutes for every update afterwards.

---

## 📋 What You'll Have At The End

- A live URL like `https://yourname.github.io/blobverse` that anyone in the world can visit
- A working global leaderboard (people on different devices see each other's scores)
- An installable game (people can add it to their phone home screen like an app)
- Everything is **100% free** — no credit card required

---

# PART 1 — Put The Game On GitHub Pages (15 min)

## Step 1: Create a GitHub account

1. Go to **[github.com](https://github.com)**
2. Click the green **"Sign up"** button in the top-right
3. Type your email → Continue
4. Pick a password → Continue
5. Pick a **username** (this becomes part of your game's URL — e.g., if you pick `bloblord`, your game lives at `bloblord.github.io/blobverse`). Choose carefully.
6. Solve the puzzle, click **"Create account"**
7. Check your email, type the verification code into GitHub
8. On the welcome screen, click **"Skip personalization"** (or fill it in if you want)

## Step 2: Create a new repository (your project's folder)

1. After signing in, click the **"+"** icon in the top-right corner of the page
2. Click **"New repository"**
3. Repository name: type `blobverse` (lowercase, no spaces)
4. Description: `My blob merge game` (optional)
5. Make sure **Public** is selected (required for free GitHub Pages)
6. ✅ Check the box **"Add a README file"**
7. Click the green **"Create repository"** button at the bottom

## Step 3: Upload all the game files

1. On your new repo page, click the **"Add file"** dropdown (top-right of the file list)
2. Click **"Upload files"**
3. **Open the `blobverse` folder on your computer** in a separate window (Finder on Mac, Explorer on Windows)
4. **Select ALL files and folders** inside (Ctrl+A on Windows, Cmd+A on Mac)
5. **Drag them into the GitHub upload box**
   - You'll see the files appear in the list. Wait for them to all upload (you'll see green checkmarks).
   - **IMPORTANT:** Make sure you drag the *contents* of the `blobverse` folder, not the folder itself. The file `index.html` should be at the root of the repo.
6. Scroll to the bottom of the page
7. In the "Commit changes" box, leave the default message
8. Click the green **"Commit changes"** button

Wait ~30 seconds for files to finish uploading. You should now see `index.html`, `css/`, `js/`, etc. in your repo.

## Step 4: Turn on GitHub Pages

1. On your repo page, click the **"Settings"** tab (top of page, far right)
2. In the left sidebar, scroll down and click **"Pages"**
3. Under "Build and deployment" → "Source", make sure **"Deploy from a branch"** is selected
4. Under "Branch", click the dropdown (probably says "None") → select **`main`**
5. Leave folder as **`/ (root)`**
6. Click **"Save"**
7. **Wait 1–2 minutes**, then refresh the page. You'll see a green box at the top saying:

   > ✅ Your site is live at `https://YOUR-USERNAME.github.io/blobverse/`

8. **That's your game URL.** Click it. The game should load. 🎉

> 💡 **If it shows a 404 error**, wait another minute and refresh. GitHub Pages takes 1-3 minutes the first time.

> 💡 **If the page is blank**, your `index.html` may have ended up inside a subfolder. Go back to your repo, make sure `index.html` is in the top-level file list, not inside a `blobverse/` subfolder. If it's nested, delete that subfolder and re-upload the files individually.

**At this point, the game works fully — but the leaderboard is local-only (each device sees only its own scores).** Continue to Part 2 to make it global.

---

# PART 2 — Set Up Global Leaderboard with Supabase (10 min)

> **Note:** Supabase changed their dashboard UI in 2025. This guide reflects the CURRENT layout.

## Step 1: Create a Supabase account

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"** (top-right)
3. Click **"Sign in with GitHub"** — this is easiest since you already have a GitHub account
4. Authorize Supabase
5. You're in!

## Step 2: Create a new project

1. Click the green **"New project"** button
2. **Organization:** leave default (your username)
3. **Name:** `blobverse`
4. **Database Password:** click the **"Generate a password"** link, then copy it somewhere safe
5. **Region:** pick the one closest to you (e.g., `East US`, `West EU`, `Southeast Asia`)
6. **Pricing Plan:** Free is selected by default. Leave it.
7. Click **"Create new project"**
8. Wait ~1-2 minutes for it to set up.

## Step 3: Create the leaderboard table (the SQL step)

1. Once your project is ready, click the **SQL editor** icon in the left sidebar (looks like `</>`)
2. Click **"New query"** at the top
3. **Copy this entire block of text** and paste it into the SQL editor:

```sql
create table if not exists scores (
  id           bigint generated by default as identity primary key,
  name         text not null,
  score        integer not null,
  stage        integer not null default 1,
  country      text,
  created_at   timestamp with time zone default now()
);

alter table scores enable row level security;

drop policy if exists "anyone can read" on scores;
create policy "anyone can read" on scores
  for select using (true);

drop policy if exists "anyone can insert" on scores;
create policy "anyone can insert" on scores
  for insert with check (
    char_length(name) between 1 and 14
    and score >= 0
    and score <= 10000000
    and stage between 1 and 99
  );

create index if not exists scores_score_idx on scores (score desc);
```

4. Click the green **"Run"** button (bottom-right of the editor)
5. You should see "Success. No rows returned" at the bottom. Done.

> **Verify the table exists:** click the table-icon in the left sidebar → you should see "scores" in the list. If yes, the SQL worked.

## Step 4: Get your Supabase keys (the new UI)

The Supabase UI changed in 2025. Both old and new keys work; here's how to get them either way.

### Get your Project URL (1 minute)

1. In the left sidebar, scroll to the bottom and click the **gear/settings icon**
2. Click **"API"** under "Configuration"
3. You'll see "Project URL" near the top — it looks like `https://abcdefghijk.supabase.co`
4. Copy that URL.

### Get your anon (public) key — RECOMMENDED (1 minute)

1. Still in Settings, click **"API Keys"** in the left sub-menu
2. You'll see two tabs: **"Publishable and secret API keys"** (the NEW format) and **"Legacy anon, service_role API keys"**
3. **Click the "Legacy anon, service_role API keys" tab.** ← This is what we want.
4. You'll see a row labeled **"anon public"** with a long key starting with `eyJhbGciOi...`
5. Click the **Copy** button next to it.

> **Why use the legacy key instead of the new "publishable" one?** The legacy `anon` key is a standard JWT that's been around for years and is what this game's code is tested with. The new `sb_publishable_*` keys also work but are newer and less battle-tested. Once you're up and running, you can switch to the new key if you want.

> **NEVER copy your secret/service_role key into the game.** That key bypasses security. It belongs on a server, never in browser code that anyone can view.

## Step 5: Paste keys into your game

1. Go back to your GitHub repo (the `blobverse` repo)
2. Click into the `js` folder
3. Click on the file `supabase-config.js`
4. Click the **pencil icon** (top-right of the file viewer) to edit
5. You'll see two empty quotes:

   ```js
   export const SUPABASE_URL = "";
   export const SUPABASE_ANON_KEY = "";
   ```

6. **Paste your Project URL** between the first set of quotes:

   ```js
   export const SUPABASE_URL = "https://abcdefghijk.supabase.co";
   ```

7. **Paste your anon public key** between the second set of quotes:

   ```js
   export const SUPABASE_ANON_KEY = "eyJ...your-very-long-key...";
   ```

8. Scroll to the bottom, leave the commit message default, click the green **"Commit changes"** button
9. Confirm by clicking **"Commit changes"** in the popup

## Step 6: Wait for the update to deploy

1. GitHub Pages re-deploys automatically when you change files. **Wait 1-2 minutes.**
2. Reload your game URL (`https://YOUR-USERNAME.github.io/blobverse/`)
3. **Hard refresh:** Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac) — clears the cache so you get the latest version
4. Open the **🏆 Ranks** panel in the game
5. You should see "🌍 Global leaderboard" at the bottom (instead of "📁 Local leaderboard")
6. Play a run, end it, and your score will be submitted to the global database. 🎉

---

# PART 3 — Optional Polish

## Get a custom URL like `myblob.com` (free `.github.io` is also fine)

The default URL `yourname.github.io/blobverse` is totally fine. If you want a real domain:

1. Buy one — recommended: **Namecheap** ($8-12/year for `.com`) or **Porkbun**
2. In your domain registrar's settings, find **"DNS Management"**
3. Add these 4 records:

   ```
   Type: A   Name: @   Value: 185.199.108.153
   Type: A   Name: @   Value: 185.199.109.153
   Type: A   Name: @   Value: 185.199.110.153
   Type: A   Name: @   Value: 185.199.111.153
   ```

4. In your GitHub repo → Settings → Pages → "Custom domain", enter your domain (e.g. `blobverse.com`) → Save
5. Wait up to 24 hours for DNS to propagate
6. ✅ Check the **"Enforce HTTPS"** box once available

## Update the game later

Anytime you want to change something:

1. Go to the file in your GitHub repo
2. Click the pencil icon
3. Make your edit
4. Commit changes
5. Wait 1–2 minutes — your site updates automatically

To upload many new files at once: **Add file → Upload files** (same as Step 3 in Part 1).

---

# PART 4 — First 10 Minutes After Launch (Test Checklist)

After your game is live, run through this list to make sure everything works:

- [ ] **Open the URL on your computer.** Game loads. Boot screen appears.
- [ ] **Type a name, click START PLAYING.** Game starts.
- [ ] **Drop a few blobs.** They merge.
- [ ] **Tap 🏆 Ranks.** Leaderboard panel opens.
   - If using Supabase: shows "🌍 Global leaderboard" at bottom
   - If using local: shows "📁 Local leaderboard"
- [ ] **Tap 📜 Quests.** Six quests visible.
- [ ] **Tap 🛍️ Shop.** Three tabs (Skins / Themes / Perks) work.
- [ ] **Tap 📖 Blobdex.** Grid of blobs visible. Tapping one shows lore.
- [ ] **Tap 🎁 Daily.** Calendar shows. Click "Claim" — coins go up.
- [ ] **Tap ☰ menu icon.** Settings panel opens.
- [ ] **Open the URL on your phone.** Game loads & is playable.
- [ ] **Add to Home Screen** (Safari: share → Add to Home Screen). Icon appears. Launches like an app.
- [ ] **Turn off WiFi, refresh.** Game still loads (offline mode works).
- [ ] **Lose a run.** Game over modal appears. Score submits to leaderboard.
- [ ] **Open game on a second device.** Your score from device 1 appears on the leaderboard. ✅

If anything fails, send me the exact step that broke and I'll help debug.

---

# 🆘 Common Issues

**"My game shows 404 / Not Found"**
- Your `index.html` is probably nested in a subfolder. In GitHub, the file should appear at the top of the repo's file list. If it's in a `blobverse/` subfolder, delete and re-upload.

**"Leaderboard says local even though I added Supabase keys"**
- Hard refresh the page: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac).
- Double-check no quotes were accidentally deleted in `js/supabase-config.js`. The format must be: `export const SUPABASE_URL = "https://...";` with both quotes intact.
- Open browser console (F12 → Console tab) — look for red errors mentioning Supabase.

**"Submitting a score gives an error in the console"**
- Re-run the SQL block from Part 2 Step 3 in your Supabase SQL editor. It might have failed.

**"Site looks broken / unstyled"**
- Check that the `css/` folder uploaded correctly. The repo should have `css/reset.css`, `css/base.css`, etc.

**"I want to start over"**
- In your repo: Settings → scroll to bottom → "Delete this repository" → confirm.
- Repeat from Part 1 Step 2.

---

You're live. Go merge some blobs.
