# ⚖️ LEGAL_PLAN.md — Trademark, Copyright, Privacy

**I am not a lawyer. This is a general checklist, not legal advice.** For high-stakes decisions, consult an actual IP attorney (~$300/hr, but a 1-hour consult is often enough for indie game launches).

---

## What's Already Set Up For You

✅ **MIT License on the code** (`LICENSE` file) — you can do whatever you want with the code. You also let others fork. This is industry standard for indie web projects.

✅ **Privacy Policy** (`privacy.html`) — generic template. Update to add your real contact email before launch.

✅ **Terms of Service** (`terms.html`) — generic template. Update to add your real contact email and game name before launch.

✅ **Copyright notice** in the footer — `© [Year] [Your Name]. All rights reserved.` — covers your art, mascot design, and game balance.

---

## What You Need To Do

### Phase 1 — Before web launch (free, 30 minutes)

#### 1. Verify "Blobverse" is available

- **Domain:** Search [namecheap.com](https://namecheap.com) for `blobverse.com` and `.io` and `.app` — even if you don't buy, see if they're taken
- **Trademark search (free):** Go to [tmsearch.uspto.gov](https://tmsearch.uspto.gov) and search "blobverse" — if no results in **Class 9** (downloadable software) or **Class 41** (entertainment / online gaming services), you're likely clear in the US
- **App Store search:** Search "blobverse" on App Store and Google Play. Any existing apps?
- **Social handles:** Check Instagram, X (Twitter), TikTok, YouTube — secure your username on all of them now, even if you never post

If "Blobverse" is taken in any of these contexts, pick a different name. Not worth the legal fight.

#### 2. Update the placeholder pages

Open `privacy.html` and `terms.html` and replace:
- `[Your Name]` → your real or business name
- `[Your Email]` → an email you check (e.g., `you@gmail.com` is fine, or set up `support@yourdomain.com` later)
- `[Year]` → 2026

#### 3. Verify your art is original

- The mascot Bloop, all blob designs, all UI: confirm none of it was copied from existing IP (Pokémon-looking blobs, copyrighted character designs, etc.)
- Audit the emojis used — emoji are fine to use, they're a Unicode standard
- Audit any fonts — the game uses system-default fonts, which are always safe

If you ever add custom art commissioned from another artist, **get a written contract** stating the work is "work for hire" or "all rights assigned to you." Otherwise the artist legally retains rights.

### Phase 2 — Before app store launch (~$250-350, ~1 hour)

#### File a US trademark on "Blobverse"

You can do this yourself via [tess.uspto.gov](https://tess.uspto.gov) — saves ~$1,000-2,000 in lawyer fees:

1. Pick **Class 9** (downloadable game software) and/or **Class 41** (online gaming services) — Class 9 is most relevant for a game app
2. Filing fee: $250-350 per class via TEAS Standard
3. Process takes **6-12 months**, but you can use ™ symbol immediately
4. After registration, you can use ®
5. Registration lasts 10 years, renewable

If "Blobverse" is unique enough (the USPTO search showed no conflicts), this is straightforward. If similar marks exist, **hire a lawyer first** — a single consultation is ~$300 and can save you $1000s if there's a conflict you didn't see.

#### Other regions

- **EU trademark** via [euipo.europa.eu](https://euipo.europa.eu) — covers all 27 EU countries, ~€1,000 (consider only if you have significant EU traffic)
- **UK trademark** separate from EU since Brexit — [gov.uk/how-to-register-a-trade-mark](https://www.gov.uk/how-to-register-a-trade-mark), ~£170
- **China, India, Japan, etc.** — only worth it if you specifically launch there

For most indie games, **US trademark is enough** for the first year. International is a "nice problem to have later" item.

---

## Phase 3 — Privacy Compliance (depends on where players are)

### GDPR (Europe)

If anyone in the EU/UK plays your game (they will — it's a public website), you technically need to comply with GDPR. Practically:

1. ✅ The included `privacy.html` covers most of what you need
2. ✅ Don't collect personal data you don't need (the game only stores name + score, that's fine)
3. ✅ If you add analytics later (Google Analytics, Plausible, etc.), update the privacy policy to mention it
4. ⚠️ If you add cookies that track users across sites, you'll need a cookie banner — currently no such cookies, so no banner needed

Use [termly.io](https://termly.io) (free tier) to generate a fully GDPR-compliant policy when you add tracking.

### CCPA (California)

Similar to GDPR but California-specific. The included privacy policy covers it. If you have >50,000 California users you may need additional disclosures — that's a great problem to have.

### COPPA (kids under 13)

If you intentionally target users under 13, you have **strict** rules: no behavioral ads, parental consent, etc.

**Easiest path: rate the game 13+** in app stores. The game doesn't gather personal data anyway, so this is mostly a paperwork distinction.

### App Store / Google Play Privacy Labels

When submitting to the stores, both will ask you to fill out a "data collection" questionnaire. Honest answers:
- ✅ Do you collect data? **Yes** (player name + scores submitted to leaderboard)
- ✅ Is data linked to user? **No** (no email, no real ID — just self-chosen display name)
- ✅ Used for tracking? **No**
- ✅ Used for analytics? **Add yes when you turn on Plausible/AdSense**

This is the simplest privacy posture you can have. Embrace it.

---

## Common Legal Pitfalls

### ❌ Using copyrighted music

The game has no audio yet — keep it that way until you license music properly. Sources for free music:
- [Incompetech.com](https://incompetech.com) (CC-BY, just credit Kevin MacLeod)
- [Pixabay Music](https://pixabay.com/music) (free, no credit needed)
- **Never** use chart music — that's a one-way ticket to a takedown.

### ❌ Using copyrighted character names or designs

"Pokemon-style merge game" gets you a Nintendo cease-and-desist within days. Generic words like "blob" / "merge" / "evolution" are fine. **Specific named entities** (Mario, Pikachu, Disney characters, real celebrity names) are not.

### ❌ Letting users upload arbitrary content

Currently they can only enter a 14-character name. If you ever add user-uploaded art or text:
- Add a profanity filter
- Add a report-and-takedown system
- Get a lawyer's review before launch

### ❌ Promising things you don't deliver

If your store listing says "10,000 levels!" and there are 10, you'll get refunds and bad reviews. Be honest in marketing.

---

## A Cheap Insurance Policy

Once you start earning money:

1. **Form an LLC** ($50-300 in most US states via your Secretary of State website, or services like Stripe Atlas / ZenBusiness for $99-299)
2. **Open a separate business bank account** (free at most banks — Bluevine, Mercury are good for digital businesses)
3. **Get a $1M general liability + cyber insurance policy** ~$30-50/month via [Vouch](https://vouch.us), [Embroker](https://www.embroker.com), or [Hiscox](https://www.hiscox.com)

This means: if a kid gets addicted, parent sues, your personal house and savings are protected. The LLC is the "shield."

**Don't bother with this until you're earning ~$500/month.** Below that, it's overkill.

---

## Final Checklist Before Launch

**Web launch:**
- [ ] Trademark search done (clear)
- [ ] Privacy policy updated with real email
- [ ] Terms of service updated with real email
- [ ] All art is original or licensed
- [ ] No copyrighted music/audio
- [ ] No copyrighted character names

**App store launch:**
- [ ] All of the above
- [ ] US trademark filed ($250-350)
- [ ] App store privacy questionnaire filled honestly
- [ ] Age rating: 13+ (unless you specifically want to do COPPA)
- [ ] Backup of Android signing key in 3 places

**When you start earning $500+/month:**
- [ ] Form an LLC
- [ ] Open business bank account
- [ ] Talk to an accountant about taxes
- [ ] Consider liability insurance

---

You're set. Go make a great game.
