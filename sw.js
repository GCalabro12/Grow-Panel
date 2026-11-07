// Service worker de Grow Panel: permite instalarlo y abrirlo sin conexión (datos siempre frescos si hay red)
const CACHE = "growpanel-v1.53";
const BASE = ["./", "./index.html", "./grow-panel.js", "./manifest.json", "./logo.svg", "./logo-oscuro.svg",
  "./icono.svg", "./icono-192.png", "./icono-512.png", "./icono-32.png", "./icono-180.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  // Solo los archivos de Grow Panel sin parámetros (las fichas y apps.json van siempre a la red)
  if (e.request.method !== "GET" || u.origin !== location.origin || !u.pathname.startsWith("/Grow-Panel/") || u.search) return;
  // «no-cache»: siempre pregunta a internet si hay versión nueva (sin esperar los 10 min de caché de GitHub Pages)
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => {
    const copia = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copia));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))));
});

// Aviso del resumen del día (Web Push sin contenido: el texto lo pone Grow Panel)
self.addEventListener("push", e => {
  e.waitUntil(self.registration.showNotification("Grow Panel", {
    body: "Tu resumen del día está listo. Toca para verlo.",
    icon: "icono-192.png", badge: "icono-192.png", tag: "resumen-dia", data: { url: "./#resumen" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const destino = new URL((e.notification.data && e.notification.data.url) || "./#resumen", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(ventanas => {
    const v = ventanas.find(w => w.url.startsWith(self.registration.scope));
    if (v) return v.focus().then(w => (w && "navigate" in w ? w.navigate(destino) : null)).catch(() => self.clients.openWindow(destino));
    return self.clients.openWindow(destino);
  }));
});
