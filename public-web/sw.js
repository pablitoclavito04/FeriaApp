const CACHE_NAME = 'feriaapp-v45';

// Base path of this deployment, derived from where the SW itself is served.
// On GitHub Pages that is "/FeriaApp/"; on our own domain it is "/". The same
// build then works on both without hardcoding the prefix.
const BASE_PATH = self.location.pathname.replace(/[^/]*$/, '');

// Precache the default map as a fallback. Per-fair maps live under
// <base>uploads/ with unique (timestamped) filenames and are cached on first
// fetch by the cache-first handler below; a new map gets a new URL, so there
// is never a stale-image problem.
const urlsToCache = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}app.js`,
  `${BASE_PATH}styles.css`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}plano_feria.png`,
  `${BASE_PATH}data/fairs.json`,
  `${BASE_PATH}data/casetas.json`,
  `${BASE_PATH}data/menus.json`,
  `${BASE_PATH}data/concerts.json`,
];

const DATA_FILES = [
  `${BASE_PATH}data/fairs.json`,
  `${BASE_PATH}data/casetas.json`,
  `${BASE_PATH}data/menus.json`,
  `${BASE_PATH}data/concerts.json`,
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
