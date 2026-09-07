/* Deep Sight service worker.
   The whole app is one HTML file with no external requests, so caching is simple.

   Strategy for navigations is network-FIRST with a short timeout and a cache
   fallback — not cache-first. Cache-first makes launches instant but serves a
   stale build for one whole session, which silently hides every update. With a
   2.5s race the app is still fast online and still launches fully offline. */
const VERSION = 'v2';
const CACHE = 'deep-sight-' + VERSION;
const SHELL = ['./', './index.html', './manifest.webmanifest',
               './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(new Request(u, {cache: 'reload'})))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

function netFirst(req, key, timeoutMs) {
  return new Promise(resolve => {
    let settled = false;
    const done = r => { if (!settled) { settled = true; resolve(r); } };
    const timer = setTimeout(() => {
      caches.match(key).then(hit => { if (hit) done(hit); });
    }, timeoutMs);

    fetch(req).then(res => {
      clearTimeout(timer);
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {});
      }
      done(res);
    }).catch(() => {
      clearTimeout(timer);
      caches.match(key).then(hit => done(hit || Response.error()));
    });
  });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(netFirst(e.request, './index.html', 2500));
    return;
  }
  // Icons and the manifest are immutable enough for cache-first.
  e.respondWith(
    caches.match(e.request).then(hit => hit || netFirst(e.request, e.request, 4000))
  );
});
