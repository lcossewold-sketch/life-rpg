// Verander 'v1' naar 'v2', 'v3', etc. wanneer je een update op GitHub zet!
const CACHE_NAME = 'life-rpg-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Installatie
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Luister naar het 'skipWaiting' signaal van de app
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Activatie: Verwijder OUDE caches automatisch
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

// Netwerk-eerst strategie (haalt altijd nieuwste versie op als er internet is)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
