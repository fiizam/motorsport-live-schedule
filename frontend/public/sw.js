const CACHE_NAME = 'motorsport-pwa-cache-v5';
const urlsToCache = [
  '/',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png',
  '/favicon.png',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Bypass service worker for APK downloads so native Android download manager can handle it
  if (event.request.url.endsWith('.apk')) {
    return; // Don't call event.respondWith, let the browser handle it natively
  }

  event.respondWith(
    // Network First Strategy
    fetch(event.request)
      .then((networkResponse) => {
        // If fetch is successful, cache a copy of the latest response
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails (offline), fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If the request is for a navigation (HTML page) and not in cache, show offline.html
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          // Otherwise let it fail
          return new Response('', { status: 408, statusText: 'Offline' });
        });
      })
  );
});
