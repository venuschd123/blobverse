# 💰 MONETIZATION_PLAN.md — Earning From Your Game

The game ships with **zero ads, zero in-app purchases**. That's intentional. You earn permission to monetize by first earning trust and retention.

---

## The Honest Math (Read This First)

A casual web/mobile blob game with ~1,000 daily players will likely earn:
- **Web (AdSense rewarded ads):** ~$5–30/day
- **Mobile (AdMob + IAP):** ~$30–150/day once IAP launches and players install

**Don't quit your day job.** But yes, it's real money, and yes, it scales with players.

To make $1,000/month: ~10,000 daily active users on mobile with light IAP.
To make $10,000/month: ~50,000+ daily active users with strong IAP and a battle pass.

These are real but they take **time and content updates**, not just luck.

---

## The 4-Phase Roadmap

### 🌱 Phase 1: Free, no ads, no IAP (Now)

**Goal:** Pure user acquisition and retention data.

- Track how many people play, how often they return, what stages they reach
- Use no analytics initially (privacy-first), then add **Plausible** (~$9/mo, GDPR-friendly) once you have traction
- Goal: hit **500 daily players** before considering Phase 2

**Why this matters:** Google and Apple both look at retention metrics for app store ranking. If your first 1,000 users have a bad ad-laden experience, your 30-day retention craters and your store ranking dies. Free + clean = better long-term ranking.

### 💸 Phase 2: Optional rewarded ads (~500+ daily players)

**Goal:** First revenue stream. Players opt-in.

Add **rewarded video ads only**:
- "Watch a 30-second ad → revive once per run" (in game over modal)
- "Watch a 30-second ad → 2× coins for this run" (offered once at run start)
- "Watch a 30-second ad → claim a free spin / mystery skin" (daily)

**NEVER add:**
- Forced interstitials between runs
- Banner ads in gameplay
- "You must watch an ad to continue"

These wreck retention. Rewarded ads players choose. Forced ads players hate.

**Tools:**
- Web: Google AdSense (need ~weeks of traffic before approval) or **EZoic** (lower threshold)
- Mobile: AdMob (Google's ad network — good fill rates, easy Capacitor plugin)

**Realistic earnings:** $1-5 per 1,000 ad views (CPM/eCPM). Players watch 1-3 ads/day if value is fair.

### 🛍️ Phase 3: Cosmetics-only IAP (~2,000+ daily players)

**Goal:** Sustainable revenue from players who love the game.

Add **In-App Purchases** — but ONLY cosmetic/convenience items, never pay-to-win:

| Product | Price | What It Does |
|---|---|---|
| **Starter Pack** | $0.99 | 500 coins + 3 of each power-up + 1 mythic skin (one-time, irresistible deal) |
| **Coin Pack S** | $1.99 | 1,500 coins |
| **Coin Pack M** | $4.99 | 5,000 coins (+ best value badge) |
| **Coin Pack L** | $9.99 | 12,000 coins |
| **Remove Ads** | $2.99 | Permanent ad-free, never see another rewarded ad option |
| **Mythic Skin Pack** | $4.99 | All 4 mythic skins unlocked |
| **Bloop's Wardrobe** | $2.99 | 8 mascot accessories |

**Critical rules:**
- Free players can earn EVERYTHING through gameplay (just slower). No content gates behind cash.
- Premium currency (stars) earnable in-game from achievements, daily streaks, perfect runs.
- 60-80% of revenue typically comes from <5% of players (whales). Don't punish the 95%.

**Tools:**
- Web: Stripe Checkout (~3% fee). One-time payments only on web due to Apple/Google policy on subscriptions.
- Mobile: native IAP via Capacitor (`@capacitor-community/in-app-purchases`). Apple takes 30% (15% if you're a "small business" earning <$1M/yr — which you are).

### 🎟️ Phase 4: Battle Pass + Subscription (sustained traction)

**Goal:** Predictable monthly recurring revenue.

**Free Battle Pass (already built into the game!):**
- 50 tiers per season (4 weeks)
- Free track always exists
- Players earn XP just by playing

**Premium Battle Pass — $2.99/season:**
- Adds a parallel track of premium rewards
- Players who buy mid-season get all unlocks they would've earned from tier 1
- Only ~5-15% of players buy, but it's reliable revenue

**Blobverse Plus subscription — $3.99/month:**
- Permanent ad-free
- 2× XP all the time
- Exclusive monthly rotating skin
- Premium battle pass auto-included
- Best value for whales

**Subscription rules:**
- Easy cancellation (Apple/Google legally require it)
- Don't auto-renew without warning
- Provide actual ongoing value, not gates

---

## What NOT To Do (Patterns That Kill Games)

### ❌ Energy systems
"You can only play 5 runs, wait 30 min or pay" — players quit, never return. Never add this.

### ❌ Pay-to-win
Selling power-ups that materially affect score in competitive contexts (leaderboards). Will earn short-term cash, kill long-term trust.

### ❌ Loot boxes / gacha for cash
Regulators are cracking down (Belgium, Netherlands, China have banned them). Easy way to lose your app store account.

### ❌ Forced interstitial ads
"Sorry, gotta watch this 30-second ad before your next run." Players hate it.

### ❌ Dark patterns
Buttons that look the same color as ads. Auto-subscribe trials. "Confirm" buttons that subscribe rather than dismiss. The Apple/Google review teams catch these and ban apps.

---

## What TO Do (Patterns That Work)

### ✅ Daily login rewards (already built — `js/daily.js`)
Streak-based rewards keep players coming back without spending a cent.

### ✅ Time-limited cosmetics
"Halloween skin pack — only this week!" creates urgency. Keep the mythic core skins permanent so people don't feel ripped off.

### ✅ Battle Pass
Already proven by Fortnite, Valorant, Brawl Stars. Sets a clear value prop, players opt in.

### ✅ Cosmetic flex
Players who pay want others to *see* they paid. Make purchased skins visible, distinctive, and pretty.

### ✅ Subscriptions for ad removal
Single biggest "feel good" purchase. People who play daily HATE ads. Charge $2.99/mo and they'll thank you.

### ✅ Charity moments
"This week, $1 of every Mythic Pack goes to ocean cleanup." Genuine goodwill = long-term loyalty + great PR.

---

## When To Hire Help

You'll know you've hit it when:
- Daily revenue > $200 for 30 straight days
- Daily players > 10,000

At that point, consider:
- A part-time community manager ($300-1000/mo)
- A LiveOps consultant for content drops (per-project)
- An accountant (you'll owe taxes — this is now a business)

Don't hire any of these until the numbers say so.

---

## Ad Network Quick Reference

| Network | Best For | Approval Difficulty |
|---|---|---|
| **AdMob** | Mobile (iOS/Android) | Easy |
| **AdSense** | Web | Hard — needs traffic + content |
| **EZoic** | Web alternative | Medium — lower traffic threshold |
| **Unity Ads** | Mobile games | Easy |
| **AppLovin** | Mobile, premium fill | Medium |
| **Meta Audience Network** | Mobile, social-style | Medium |

Start with AdMob (mobile) and EZoic (web).

---

## Final Word

Make a game people genuinely want to keep playing. Then ask politely if they'd like to support it. That's the entire playbook.
