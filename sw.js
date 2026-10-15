// Service worker de Grow Panel: permite instalarlo y abrirlo sin conexión (datos siempre frescos si hay red)
const CACHE = "growpanel-v1.07";
const BASE = ["./", "./index.html", "./grow-panel.js", "./manifest.json", "./logo.svg", "./logo-oscuro.svg",
  "./icono.svg", "./icono-192.png", "./icono-512.png", "./icono-32.png", "./icono-180.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  // Solo los archivos de Grow Panel sin parámetros (las fichas y apps.json van siempre a la red)
  if (e.request.method !== "GET" || u.origin !== location.origin || !u.pathname.startsWith("/Grow-Panel/") || u.search) return;
  e.respondWith(fetch(e.request).then(r => {
    const copia = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copia));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))));
});
