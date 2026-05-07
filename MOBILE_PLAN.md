# 📱 MOBILE_PLAN.md — Shipping to App Store & Google Play

The game is already a **PWA** (Progressive Web App). On phones, players can "Add to Home Screen" and play it offline like a real app — no app store needed.

But to get on the App Store / Google Play (where most casual gamers find games), we need to wrap it as a native app. The best way: **Capacitor**.

---

## Why Capacitor?

- **Free and open-source** (used by Burger King, Sworkit, BBVA — real apps)
- Wraps your existing web code into native iOS + Android apps
- One codebase, two stores
- Adds support for native features (rewarded ads, in-app purchases, push notifications)

Alternative: Cordova (older, less maintained). Don't use Cordova for new projects.

---

## When To Do This

**Not yet.** Don't wrap for stores until:

- The web version has been live for 2-4 weeks
- You've fixed bugs reported by friends/family
- Daily players are >50 (any traffic at all)
- You've done one or two content updates and the game feels stable

Premature store launches lead to bad reviews that haunt the listing forever.

---

## Costs Reality Check

| Item | Cost | Required? |
|---|---|---|
| Apple Developer Program | $99/year | Yes for iOS |
| Google Play Console | $25 one-time | Yes for Android |
| Mac computer (any model, any age) | $0 if you borrow / $30/month MacInCloud | Yes for iOS — no exceptions |
| Capacitor + plugins | $0 | — |
| Icons & screenshots | $0 (you have icon.svg already) | Yes |
| Privacy policy hosting | $0 (already part of this repo) | Yes |

**Minimum to ship both stores: $124** ($99 Apple + $25 Google) + a Mac to use for ~1 week during iOS submission.

---

## The 4-Phase Plan

### Phase 1 — Prep (1-2 hours)

- [ ] Web version stable for 2+ weeks
- [ ] Privacy policy at `privacy.html` (already done)
- [ ] Terms at `terms.html` (already done)
- [ ] App icon at `assets/icon.svg` (already done; export 1024x1024 PNG version using any online SVG-to-PNG converter)
- [ ] Take 5-6 screenshots from your phone (different stages / shop / leaderboard)
- [ ] Write a 4000-character description for the store listings
- [ ] Decide on the app name — confirm "Blobverse" isn't taken: search [App Store](https://apps.apple.com) and [Google Play](https://play.google.com) for "Blobverse"

### Phase 2 — Wrap with Capacitor (2-3 hours)

You'll need a computer with **Node.js 18+** installed. Then in your blobverse folder:

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialize (it will ask for app name and ID)
npx cap init "Blobverse" "com.YOURNAME.blobverse" --web-dir="."

# Add iOS and Android platforms
npx cap add ios
npx cap add android

# Sync your web code into the native projects
npx cap sync

# Open in Xcode (Mac only)
npx cap open ios

# Open in Android Studio (any OS)
npx cap open android
```

That's it for the wrap. The `ios/` and `android/` folders that get created are real native projects.

### Phase 3 — Add monetization plugins (optional, 1 hour each)

When you're ready to add ads or in-app purchases (see `MONETIZATION_PLAN.md`):

```bash
# Rewarded ads via AdMob
npm install @capacitor-community/admob
npx cap sync

# In-app purchases
npm install @capacitor-community/in-app-purchases
npx cap sync
```

The plugins have docs that walk through ad unit IDs and product setup.

### Phase 4 — Submit to stores (most painful, 1-2 weeks of waiting)

#### Apple App Store
1. **Create Apple Developer account** at [developer.apple.com/programs](https://developer.apple.com/programs) ($99/year)
2. **In App Store Connect**, click "My Apps" → "+" → "New App"
3. Fill out app info: name, language, bundle ID (matches your Capacitor ID), SKU (any unique string)
4. **In Xcode**: Product → Archive → Distribute App → upload to App Store Connect
5. Back in App Store Connect: fill out screenshots, descriptions, ratings, privacy info
6. Click **"Submit for Review"**
7. **Wait 24-72 hours** for Apple to review. They might ask for clarification — respond promptly.
8. ✅ Approved!

#### Google Play
1. **Create Google Play Console account** at [play.google.com/console](https://play.google.com/console) ($25 one-time)
2. Click "Create app", fill out the form
3. **In Android Studio**: Build → Generate Signed Bundle / APK → AAB → follow wizard to create signing key (back this up!)
4. Upload the `.aab` file in Play Console → Production → Create release
5. Fill out store listing, content rating questionnaire, target audience, privacy policy URL
6. Click **"Send for review"**
7. **Wait 1-7 days** for Google to review
8. ✅ Approved!

---

## Common Mistakes To Avoid

- **Don't skip the privacy policy.** Both stores reject apps without one. Yours is at `privacy.html` already.
- **Don't claim COPPA compliance unless you mean it.** If targeting kids, you have extra rules. Easier path: rate the app 13+.
- **Don't use copyrighted music or fonts.** Audit before submitting.
- **Don't promise features the game doesn't have.** Reviewers test screenshots vs reality.
- **Save your Android signing key.** If you lose it, you can't update the app. Ever. Back it up to 3 places.
- **Use a Test Track first** on Google Play. Push to internal testers (you, family) for a week before going Production.

---

## Don't Have A Mac?

Three options:
1. **Borrow one for a week.** You only need it during initial submission. Updates can be done remotely with shortcuts.
2. **MacInCloud.com** — rent a Mac in the browser. ~$30/month. Cancel after launch.
3. **Codemagic / Bitrise / Ionic Appflow** — cloud build services that compile iOS apps for you. Free tiers available. Slightly more complex setup but no Mac needed.

---

## Realistic Timeline

| Phase | Time |
|---|---|
| Web stable | 2-4 weeks of polish |
| Capacitor wrap | 1 evening |
| iOS submission | 1-3 days build + 1-3 days review |
| Android submission | 1-3 days build + 1-7 days review |
| **Total from "decide to ship" → "live in stores"** | **~2-3 weeks part-time work** |

---

## Maintenance After Launch

- **Web updates auto-deploy** when you commit to GitHub. Free. Instant.
- **App store updates** require: edit code → `npx cap sync` → archive → upload → wait for review (~24h Apple, ~1 day Google)
- Aim for monthly content drops to keep store rankings healthy
- Respond to every review the first 6 months — even 1-star ones. Politely.
