const CACHE_NAME = 'feriaapp-v14';
const urlsToCache = [
  '/FeriaApp/',
  '/FeriaApp/index.html',
  '/FeriaApp/app.js',
  '/FeriaApp/styles.css',
  '/FeriaApp/manifest.json',
  '/FeriaApp/data/fairs.json',
  '/FeriaApp/data/casetas.json',
  '/FeriaApp/data/menus.json',
  '/FeriaApp/data/concerts.json',
];

// Install service worker and cache files
self.addEventListener('install', (event) => {
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
    })
  );
});

// Fetch from cache first, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});