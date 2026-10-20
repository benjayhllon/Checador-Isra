// Guarda la app en el celular: abre al instante y el checador funciona aunque no haya internet
// (las checadas se guardan y se mandan solas cuando regresa la señal).
// Los datos siempre vienen de internet (de tu Google Sheet).
const VERSION = 'isra-v4';
const ARCHIVOS = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // lo de Google no se toca
  // Abre con lo guardado (al instante) y en segundo plano trae la versión nueva para la próxima vez.
  e.respondWith(
    caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true }).then(guardado => {
      const red = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => guardado || c.match('./index.html'));
      return guardado || red;
    }))
  );
});
