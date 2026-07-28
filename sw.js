const CACHE_NAME = 'life-rpg-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Installeren van de Service Worker en bestanden opslaan
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Bestanden ophalen uit cache als er geen internet is
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
