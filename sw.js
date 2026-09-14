const CACHE_NAME = "qdn-trip-v40";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./app.js",
  "./trip-data.js",
  "./trip-guide.js",
  "./src/events.js",
  "./src/state.js",
  "./src/selectors.js",
  "./src/format.js",
  "./src/weather.js",
  "./src/map.js",
  "./src/views/overview.js",
  "./src/views/route.js",
  "./src/views/guide.js",
  "./src/views/prep.js",
  "./src/views/expenses.js",
  "./src/views/tools.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.pathname.endsWith("/sw.js")) return;
  if (["document", "script", "style"].includes(request.destination)) {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    }).catch(() => caches.match(request)));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
