// Service Worker
const CACHE_NAME = 'task-manager-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/css/components.css',
  '/assets/js/config.js',
  '/assets/js/api.js',
  '/assets/js/auth.js',
  '/assets/js/tasks.js',
  '/assets/js/utils.js',
  '/assets/js/app.js',
  '/assets/img/favicon.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
