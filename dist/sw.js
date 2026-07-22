const CACHE_NAME = 'attendly-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-http/https requests (e.g. chrome-extension, face-api model url or database queries)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // If valid response, clone and store it in cache
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return cache.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // If the request is for a navigation page, fall back to index.html (SPA routing support)
            if (event.request.mode === 'navigate') {
              return cache.match('/index.html');
            }
          });
        });
    })
  );
});
