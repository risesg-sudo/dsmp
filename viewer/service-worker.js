/**
 * Service Worker for DSMP 2.0 Revision Notes
 * Provides offline functionality and caching for PWA
 *
 * Phase 3 Feature: Progressive Web App support
 */

const CACHE_NAME = 'dsmp-v3.0.0';
const STATIC_CACHE = 'dsmp-static-v3';
const DYNAMIC_CACHE = 'dsmp-dynamic-v3';

// Files to cache immediately
const STATIC_FILES = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './scroll-tracker.js',
    './storage-manager.js',
    './analytics.js',
    './notes-manager.js',
    './bookmarks-manager.js',
    './goals-manager.js',
    './flashcards-manager.js',
    './code-runner.js',
    './quiz-manager.js',
    './manifest.json'
];

// CDN resources (cache with network-first strategy)
const CDN_RESOURCES = [
    'https://cdn.jsdelivr.net/npm/marked@11.1.0/marked.min.js',
    'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/highlight.min.js',
    'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker...', event);

    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[Service Worker] Precaching static files');
            return cache.addAll(STATIC_FILES.concat(CDN_RESOURCES));
        }).catch((error) => {
            console.error('[Service Worker] Precaching failed:', error);
        })
    );

    // Force activation
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker...', event);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[Service Worker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    // Take control of all pages immediately
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extensions and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Handle markdown files (documentation content)
    if (url.pathname.endsWith('.md')) {
        event.respondWith(
            networkFirstStrategy(request, DYNAMIC_CACHE)
        );
        return;
    }

    // Handle CDN resources
    if (url.hostname.includes('cdn.jsdelivr.net')) {
        event.respondWith(
            cacheFirstStrategy(request, STATIC_CACHE)
        );
        return;
    }

    // Handle static files
    if (STATIC_FILES.some(file => url.pathname.endsWith(file))) {
        event.respondWith(
            cacheFirstStrategy(request, STATIC_CACHE)
        );
        return;
    }

    // Default: network first, fallback to cache
    event.respondWith(
        networkFirstStrategy(request, DYNAMIC_CACHE)
    );
});

// Cache-first strategy (for static resources)
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cacheResponse = await caches.match(request);
        if (cacheResponse) {
            return cacheResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Cache-first strategy failed:', error);
        return offlineFallback(request);
    }
}

// Network-first strategy (for dynamic content)
async function networkFirstStrategy(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        const cacheResponse = await caches.match(request);
        if (cacheResponse) {
            return cacheResponse;
        }
        return offlineFallback(request);
    }
}

// Offline fallback
function offlineFallback(request) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        return new Response(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - DSMP 2.0</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                        color: #fff;
                    }
                    .offline-container {
                        text-align: center;
                        padding: 2rem;
                    }
                    .offline-icon {
                        font-size: 5rem;
                        margin-bottom: 1rem;
                    }
                    h1 {
                        font-size: 2rem;
                        margin-bottom: 1rem;
                    }
                    p {
                        font-size: 1.1rem;
                        opacity: 0.8;
                        margin-bottom: 2rem;
                    }
                    button {
                        background: #6c5ce7;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        font-size: 1rem;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background 0.3s;
                    }
                    button:hover {
                        background: #5a4cd6;
                    }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="offline-icon">📡</div>
                    <h1>You're Offline</h1>
                    <p>It looks like you've lost your internet connection.<br>
                    Some content may not be available, but your saved data is still accessible.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
            `,
            {
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }

    // Return error for other requests
    return new Response('Network error', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' }
    });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Implement background sync logic here
    // For example, sync user progress, notes, etc.
    console.log('[Service Worker] Syncing data...');
}

// Push notifications (for future features)
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received:', event);

    const options = {
        body: event.data ? event.data.text() : 'New content available!',
        icon: './icon-192.png',
        badge: './badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
                icon: './checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: './xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('DSMP 2.0 Notes', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event);

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// Message handler (communication with main app)
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log('[Service Worker] Service Worker loaded');
