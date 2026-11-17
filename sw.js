// Минимальный service worker: установка как приложение + оболочка без сети.
const V = 'swipe-v2';
const SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const P = p => new URL(p, self.location).pathname;
const SHELL_PATHS = SHELL.map(P);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  const nav = r.mode === 'navigate';
  if (!nav && !SHELL_PATHS.includes(u.pathname)) return;
  const key = nav ? P('./') : u.pathname;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(key, cp)); }
        return res;
      })
      .catch(() => caches.match(key).then(m => m || Response.error()))
  );
});
