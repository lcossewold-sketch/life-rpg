const CACHE_NAME = 'life-rpg-v7'; // ⚠️ BUMP THIS NUMBER ON EVERY UPDATE (v7)

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Installation: Force immediate installation of the new service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activation: Clean up old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Old cache removed:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Network-First strategy: Always fetch the latest version from the network
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

// 4. Listen for push messages (for background notifications)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🎮 Life RPG';
  const options = {
    body: data.body || 'You have tasks that need attention!',
    icon: 'https://cdn-icons-png.flaticon.com/512/3408/3408506.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3408/3408506.png',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. Switch immediately on signal
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
