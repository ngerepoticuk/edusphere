/* sw.js — service worker sederhana: cache-first utk aset lokal.
   Aktif hanya bila app di-host (http/https, mis. Netlify). Di file:// otomatis tidak jalan. */
var CACHE = "app-v5";
var CORE = ["./", "./index.html", "./config.js", "./styles/app.css", "./manifest.json"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return; /* CDN/font/API: biarkan network */
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok) { var cl = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cl); }); }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
