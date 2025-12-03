const SHELL_CACHE = 'bb-shell-v1';
const TOOLKIT_CACHE = 'bb-toolkit-v1';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

const TOOLKIT_ASSETS = [
  '/toolkit/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
      caches.open(TOOLKIT_CACHE).then((cache) => cache.addAll(TOOLKIT_ASSETS))
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const allowedCaches = new Set([SHELL_CACHE, TOOLKIT_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !allowedCaches.has(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isShellAsset = SHELL_ASSETS.includes(request.url) || SHELL_ASSETS.includes(url.pathname);
  const isToolkitContent = url.pathname.startsWith('/toolkit/');

  if (isShellAsset) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  if (isToolkitContent) {
    event.respondWith(staleWhileRevalidate(request, TOOLKIT_CACHE));
    return;
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached || networkPromise;
}
