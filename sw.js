const CACHE_NAME = 'life-rpg-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Installeren van de Service Worker
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Dwingt de nieuwe Service Worker om direct actief te worden
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activeren en OUDE cache opruimen!
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Oude cache verwijderd:', key);
            return caches.delete(key); // Verwijdert oude v1 cache
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Bestanden ophalen
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
