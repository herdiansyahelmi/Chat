// Service Worker untuk handle notifikasi
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
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
