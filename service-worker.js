// ==========================================
// AryanDevX Portfolio - Service Worker
// ==========================================

const CACHE_NAME = "aryandevx-v1";

// Core files that should be available offline
const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/dev.jpg",

  // PWA icons
  "/icon.png"
];

// ==========================================
// INSTALL
// ==========================================

self.addEventListener("install", (event) => {
  console.log("⚡ AryanDevX Service Worker: Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_FILES);
      })
      .then(() => {
        console.log("✅ AryanDevX: Files cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Cache installation failed:", error);
      })
  );
});

// ==========================================
// ACTIVATE
// ==========================================

self.addEventListener("activate", (event) => {
  console.log("🚀 AryanDevX Service Worker: Activated");

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log("🗑️ Removing old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ==========================================
// FETCH
// ==========================================

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {

        // Return cached file if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {

            // Don't cache invalid responses
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === "opaque"
            ) {
              return networkResponse;
            }

            // Save a copy in cache
            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });

            return networkResponse;
          })
          .catch(() => {
            // Offline fallback
            return caches.match("/index.html");
          });
      })
  );
});

// ==========================================
// MESSAGE
// ==========================================

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
