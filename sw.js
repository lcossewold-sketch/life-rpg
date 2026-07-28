const CACHE_NAME = 'life-rpg-v2'; // ⚠️ VERHOOG DIT NUMMER BIJ ELKE UPDATE (bijv. v3, v4, v5)!

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Installatie: Forceer de nieuwe worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activatie: Verwijder DIRECT alle oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Oude cache opgeruimd:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Network-First Strategie: Altijd eerst de nieuwste versie van internet halen
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // Offline fallback
  );
});

// 4. Luister naar het signaal om te verversen
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
