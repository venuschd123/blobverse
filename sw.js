// Blobverse Service Worker — offline play
const VERSION = 'blobverse-v1.1.1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/base.css',
  './css/ui.css',
  './css/effects.css',
  './css/themes.css',
  './js/main.js',
  './js/config.js',
  './js/supabase-config.js',
  './js/state.js',
  './js/save.js',
  './js/physics.js',
  './js/render.js',
  './js/effects.js',
  './js/input.js',
  './js/ui.js',
  './js/modals.js',
  './js/leaderboard.js',
  './js/tutorial.js',
  './js/mascot.js',
  './js/shop.js',
  './js/quests.js',
  './js/achievements.js',
  './js/daily.js',
  './js/blobdex.js',
  './js/i18n.js',
  './js/audio.js',
  './js/share.js',
  './data/tiers.json',
  './data/stages.json',
  './data/achievements.json',
  './data/skins.json',
  './data/quests.json',
  './data/lore.json',
  './assets/icon.svg',
  './i18n/en.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Bypass non-GET and cross-origin (Supabase, CDN)
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached ||
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, clone)).catch(() => {});
        return res;
      }).catch(() => cached)
    )
  );
});
