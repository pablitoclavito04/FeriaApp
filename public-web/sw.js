const CACHE_NAME = 'feriaapp-v41';
const urlsToCache = [
  '/FeriaApp/',
  '/FeriaApp/index.html',
  '/FeriaApp/app.js',
  '/FeriaApp/styles.css',
  '/FeriaApp/manifest.json',
  '/FeriaApp/plano_feria.png',
  '/FeriaApp/data/fairs.json',
  '/FeriaApp/data/casetas.json',
  '/FeriaApp/data/menus.json',
  '/FeriaApp/data/concerts.json',
];

const DATA_FILES = [
  '/FeriaApp/data/fairs.json',
  '/FeriaApp/data/casetas.json',
  '/FeriaApp/data/menus.json',
  '/FeriaApp/data/concerts.json',
];

// Install service worker and cache files
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate and clean old caches
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

// Network first for data files, cache first for everything else
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isDataFile = DATA_FILES.some(path => url.pathname === path);

  if (isDataFile) {
    // Network first with cache busting: try to get fresh data, fall back to cache
    // We bypass HTTP cache and CDN cache by appending a timestamp and using no-store
    const bustUrl = url.pathname + '?t=' + Date.now();
    const bustRequest = new Request(bustUrl, { cache: 'no-store' });

    event.respondWith(
      fetch(bustRequest)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Cache under the original (clean) URL so future cache lookups match
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
    );
  }
});
