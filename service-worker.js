const CACHE_NAME = 'rd-client-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/downloads.html',
    '/torrents.html',
    '/styles.css',
    '/downloads.js',
    '/torrents.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://cdn.tailwindcss.com'
];

// Install event - cache the necessary assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

// Fetch event - respond with cached assets or fetch from network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found, otherwise fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 