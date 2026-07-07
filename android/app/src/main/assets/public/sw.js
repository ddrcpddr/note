const APP_CACHE = 'home-notes-app-shell-v1';
const CORE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/app-icon-192.png',
  '/icons/app-icon-512.png',
  '/icons/favicon-32.png',
  '/icons/favicon-16.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== APP_CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkThenCache(request, '/'));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function cacheAppShell() {
  const cache = await caches.open(APP_CACHE);
  await Promise.all(CORE_ASSETS.map((asset) => cache.add(asset).catch(() => null)));

  try {
    const response = await fetch('/', { cache: 'no-store' });
    if (!response.ok) return;
    const html = await response.clone().text();
    await cache.put('/', response);
    const assetPaths = Array.from(html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)).map((match) => new URL(match[1], self.location.origin).pathname);
    await Promise.all([...new Set(assetPaths)].map((asset) => cache.add(asset).catch(() => null)));
  } catch {
    // App shell cache is best effort.
  }
}

async function networkThenCache(request, fallbackPath) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match(fallbackPath)) || new Response('家事记暂时离线，请稍后再试。', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}
