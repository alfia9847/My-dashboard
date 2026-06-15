// ════════════════════════════════════════
// SERVICE WORKER
// This file runs in the background.
// Its job is to save your app's files
// so it works even without internet.
// ════════════════════════════════════════

// Give your cache a name and version
// If you update your app, change v1 to v2
// so the old cache gets replaced
const CACHE_NAME = 'dashboard-v1';

// These are all the files your app needs to work
// The service worker will download and save all of these
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.png'
];


// ── INSTALL ──
// This runs once when the service worker
// is first installed in the browser.
// It downloads and saves all your files.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('App files saved for offline use');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});


// ── ACTIVATE ──
// This runs when a new version of the
// service worker takes over.
// It deletes any old saved caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          // If this cache is NOT the current one, delete it
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});


// ── FETCH ──
// This runs every time your app tries
// to load something (a file, a font, etc.)
// It checks the saved cache first.
// If found — serve from cache (works offline!)
// If not found — try the internet normally
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version if available
      if (response) return response;
      // Otherwise fetch from the internet
      return fetch(event.request);
    })
  );
});