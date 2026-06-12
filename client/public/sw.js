const CACHE_NAME = 'spendly-cache-v3';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install Event - cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline shell and assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - network first, falling back to cache
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Exclude API requests and chrome extension assets
  const url = event.request.url;
  if (url.includes('/api/') || url.startsWith('chrome-extension:') || url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If we get a valid response, clone it and put it in cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and request is navigation, return offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});
