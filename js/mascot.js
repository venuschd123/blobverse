// =================================================================
// MASCOT — Bloop the friendly blob
// =================================================================
import { CONFIG } from './config.js';
import { state } from './state.js';

const MASCOT_SVG = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="mascotG" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </radialGradient>
  </defs>
  <ellipse cx="30" cy="56" rx="20" ry="3" fill="rgba(0,0,0,.3)"/>
  <circle cx="30" cy="32" r="22" fill="url(#mascotG)" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
  <ellipse cx="22" cy="42" rx="3" ry="1.5" fill="rgba(244,114,182,.5)"/>
  <ellipse cx="38" cy="42" rx="3" ry="1.5" fill="rgba(244,114,182,.5)"/>
  <ellipse cx="22" cy="28" rx="5" ry="6" fill="white"/>
  <ellipse cx="38" cy="28" rx="5" ry="6" fill="white"/>
  <circle cx="22" cy="29" r="2.5" fill="#0f172a"/>
  <circle cx="38" cy="29" r="2.5" fill="#0f172a"/>
  <circle cx="23" cy="28" r="1" fill="white"/>
  <circle cx="39" cy="28" r="1" fill="white"/>
  <path d="M 24 38 Q 30 43 36 38" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>
`;

const MASCOT_LINES = {
  idle: ['just vibing', 'drop something!', "i believe in you", 'ready when you are', "what's the plan?"],
  merge: ['nice!', 'yes!', 'ohhh!', 'keep going!', "stack 'em!", 'tasty!'],
  combo: ['combo!!', "you're cooking!", 'unstoppable!', 'FIRE!', 'wowee!'],
  ach: ['new badge!', 'you did it!', 'legendary!', 'take a bow!'],
  danger: ['watch out!', 'the line!!', 'careful!', 'oh no oh no', 'tight squeeze!'],
  newTier: ['evolution!', 'look at you go!', 'upgrade!', 'fresh form unlocked!'],
  win: ['YOU MADE A PLANET!', 'cosmic!', 'unbelievable!'],
  bomb: ['boom!', 'yeet!', 'bye bye!'],
  freeze: ['chill mode', 'time stops', 'take your time'],
  magnet: ['smooch time', 'attract!', 'magnetism!'],
  over: ['good run', 'gg', 'try again!', 'you got this next time'],
  stage: ['next stage!', 'level up the game!', 'onwards!'],
  daily: ['daily bonus!', 'see you tomorrow too?', 'keep the streak!']
};

let mascotEl = null;
let bubbleEl = null;
let bubbleTimer = 0;
let lastSayTime = 0;

export function initMascot() {
  mascotEl = document.getElementById('mascot');
  bubbleEl = document.getElementById('mascotBubble');
  if (mascotEl) mascotEl.innerHTML = MASCOT_SVG;
}

export function mascotSay(category, force = false) {
  const now = performance.now();
  if (!force && now - lastSayTime < 1500) return;
  lastSayTime = now;
  const lines = MASCOT_LINES[category] || MASCOT_LINES.idle;
  const text = lines[Math.floor(Math.random() * lines.length)];
  if (!bubbleEl) return;
  bubbleEl.textContent = text;
  bubbleEl.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubbleEl.classList.remove('show'), CONFIG.MASCOT_BUBBLE_MS);
}
