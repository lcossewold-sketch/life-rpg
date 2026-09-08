const CACHE_NAME = 'life-rpg-v8.8';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .catch((err) => {
        console.error('SW install: cache.addAll failed', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: safe cache put (only for successful GET responses)
async function safeCachePut(request, response) {
  try {
    if (!response || response.status !== 200) return;
    // normalize request to a Request object if needed
    if (typeof request === 'string') request = new Request(request);
    if (request.method && request.method !== 'GET') return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch (err) {
    // Some responses (opaque, CORS) may throw on put — ignore
    console.warn('safeCachePut failed for', request && request.url, err);
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Handle navigation requests (SPA fallback)
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Update the cached index.html with a successful network response
          safeCachePut('/index.html', res.clone());
          return res;
        })
        .catch(() => {
          // If network fails, return cached index.html as a fallback
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For other requests: try network, then cache fallback
  event.respondWith(
    fetch(req)
      .then((response) => {
        // Cache only successful GET responses
        safeCachePut(req, response);
        return response;
      })
      .catch(() => caches.match(req))
  );
});

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

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
