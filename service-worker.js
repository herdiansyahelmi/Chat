// Service Worker untuk PWA & Notifikasi
var CACHE_NAME = 'alfamind-chat-v1';
var urlsToCache = [
  '/Login.html',
  '/Password.html',
  '/Home.html',
  '/Chatgrup.html',
  '/ChatRoom.html',
  '/PusatBantuan.html',
  '/Chatbot.html',
  '/Alfamind.jpg',
  '/IconCS.jpg'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    event.waitUntil(self.clients.claim());
});

// Fetch strategy: Network first, fallback to cache
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // Clone response untuk cache
                var responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });
                return response;
            })
            .catch(function() {
                return caches.match(event.request);
            })
    );
});

// Handle message dari page
self.addEventListener('message', function(event) {
    if(event.data && event.data.type === 'show-notification'){
        var data = event.data;
        var options = {
            body: data.body,
            icon: '/Alfamind.jpg',
            badge: '/IconCS.jpg',
            vibrate: [200, 100, 200],
            tag: 'chat-' + data.groupId,
            renotify: true,
            data: {
                url: data.url,
                groupId: data.groupId
            }
        };
        
        self.registration.showNotification(data.title, options);
    }
});

// Handle notifikasi push
self.addEventListener('push', function(event) {
    if (!event.data) return;
    
    var data = event.data.json();
    var options = {
        body: data.body,
        icon: '/Alfamind.jpg',
        badge: '/IconCS.jpg',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/',
            groupId: data.groupId
        },
        actions: [
            {action: 'open', title: 'Buka Chat'},
            {action: 'close', title: 'Tutup'}
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle klik notifikasi
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'close') return;
    
    var url = event.notification.data.url;
    
    event.waitUntil(
        clients.matchAll({type: 'window', includeUncontrolled: true})
            .then(function(clientList) {
                // Cek apakah ada window yang sudah terbuka
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Buka window baru jika belum ada
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});
