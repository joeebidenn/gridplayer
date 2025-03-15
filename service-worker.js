self.addEventListener("install", (event) => {
    console.log("Service Worker instalado");
    event.waitUntil(
        caches.open("media-drop-cache").then((cache) => {
            return cache.addAll([
                "./",
                "./index.html",
                "./manifest.json",
                "./icon-192.png",
                "./icon-512.png"
            ]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});