// Persian CRM Service Worker
// Handles offline functionality and push notifications

const CACHE_NAME = 'persian-crm-v1.0';
const STATIC_CACHE = 'persian-crm-static-v1.0';
const DYNAMIC_CACHE = 'persian-crm-dynamic-v1.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/customers.html',
    '/sales.html',
    '/accounts.html',
    '/reminders.html',
    '/dashboard.html',
    '/main.js',
    '/resources/hero-bg.jpg',
    '/resources/user-avatar.jpg',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.0.12/typed.min.js',
    'https://cdn.jsdelivr.net/npm/echarts@5.4.0/dist/echarts.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.origin === location.origin) {
        // Same origin requests - cache first strategy
        event.respondWith(cacheFirst(request));
    } else if (url.hostname === 'cdn.tailwindcss.com' || 
               url.hostname === 'cdn.jsdelivr.net' ||
               url.hostname === 'cdnjs.cloudflare.com' ||
               url.hostname === 'fonts.googleapis.com' ||
               url.hostname === 'fonts.gstatic.com') {
        // External CDN resources - cache first with fallback
        event.respondWith(cacheFirst(request));
    } else {
        // External API requests - network first strategy
        event.respondWith(networkFirst(request));
    }
});

// Cache first strategy - good for static assets
async function cacheFirst(request) {
    try {
        // Try to get from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If not in cache, fetch from network and cache
        const networkResponse = await fetch(request);
        
        // Don't cache error responses
        if (!networkResponse.ok) {
            return networkResponse;
        }
        
        // Clone the response before caching
        const responseClone = networkResponse.clone();
        
        // Cache the response
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, responseClone);
        
        return networkResponse;
    } catch (error) {
        console.error('Cache First Strategy Error:', error);
        
        // Return offline fallback if available
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        // Return a generic offline response
        return new Response('Offline - محتوا در دسترس نیست', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain; charset=utf-8'
            })
        });
    }
}

// Network first strategy - good for dynamic content
async function networkFirst(request) {
    try {
        // Try to fetch from network
        const networkResponse = await fetch(request);
        
        // If successful, cache the response
        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, responseClone);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Network First Strategy Error:', error);
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response
        return new Response('Offline - اطلاعات در دسترس نیست', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain; charset=utf-8'
            })
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'sync-customers') {
        event.waitUntil(syncCustomers());
    } else if (event.tag === 'sync-sales') {
        event.waitUntil(syncSales());
    } else if (event.tag === 'sync-reminders') {
        event.waitUntil(syncReminders());
    }
});

// Sync customers data
async function syncCustomers() {
    try {
        console.log('Service Worker: Syncing customers data');
        
        // Get pending customer data from IndexedDB
        const db = await openDB();
        const pendingCustomers = await db.getAll('pending-customers');
        
        if (pendingCustomers.length === 0) {
            console.log('Service Worker: No pending customers to sync');
            return;
        }
        
        // Sync each customer
        for (const customer of pendingCustomers) {
            try {
                // In a real app, this would send data to the server
                console.log('Service Worker: Syncing customer', customer);
                
                // Remove from pending after successful sync
                await db.delete('pending-customers', customer.id);
                
                // Show notification for successful sync
                if ('Notification' in self && Notification.permission === 'granted') {
                    self.registration.showNotification('همگام‌سازی مشتریان', {
                        body: `مشتری ${customer.firstName} ${customer.lastName} با موفقیت همگام‌سازی شد`,
                        icon: '/resources/user-avatar.jpg',
                        badge: '/resources/user-avatar.jpg',
                        tag: 'customer-sync',
                        data: { customerId: customer.id }
                    });
                }
            } catch (error) {
                console.error('Service Worker: Error syncing customer', error);
            }
        }
    } catch (error) {
        console.error('Service Worker: Error in syncCustomers', error);
    }
}

// Sync sales data
async function syncSales() {
    try {
        console.log('Service Worker: Syncing sales data');
        
        const db = await openDB();
        const pendingSales = await db.getAll('pending-sales');
        
        if (pendingSales.length === 0) {
            console.log('Service Worker: No pending sales to sync');
            return;
        }
        
        for (const sale of pendingSales) {
            try {
                console.log('Service Worker: Syncing sale', sale);
                
                await db.delete('pending-sales', sale.id);
                
                if ('Notification' in self && Notification.permission === 'granted') {
                    self.registration.showNotification('همگام‌سازی فروش‌ها', {
                        body: `فروش ${sale.id} با مبلغ ${sale.total} تومان همگام‌سازی شد`,
                        icon: '/resources/user-avatar.jpg',
                        badge: '/resources/user-avatar.jpg',
                        tag: 'sale-sync',
                        data: { saleId: sale.id }
                    });
                }
            } catch (error) {
                console.error('Service Worker: Error syncing sale', error);
            }
        }
    } catch (error) {
        console.error('Service Worker: Error in syncSales', error);
    }
}

// Sync reminders data
async function syncReminders() {
    try {
        console.log('Service Worker: Syncing reminders data');
        
        const db = await openDB();
        const pendingReminders = await db.getAll('pending-reminders');
        
        if (pendingReminders.length === 0) {
            console.log('Service Worker: No pending reminders to sync');
            return;
        }
        
        for (const reminder of pendingReminders) {
            try {
                console.log('Service Worker: Syncing reminder', reminder);
                
                await db.delete('pending-reminders', reminder.id);
                
                if ('Notification' in self && Notification.permission === 'granted') {
                    self.registration.showNotification('همگام‌سازی یادآوری‌ها', {
                        body: `یادآوری ${reminder.title} همگام‌سازی شد`,
                        icon: '/resources/user-avatar.jpg',
                        badge: '/resources/user-avatar.jpg',
                        tag: 'reminder-sync',
                        data: { reminderId: reminder.id }
                    });
                }
            } catch (error) {
                console.error('Service Worker: Error syncing reminder', error);
            }
        }
    } catch (error) {
        console.error('Service Worker: Error in syncReminders', error);
    }
}

// Push notification event
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received', event);
    
    const options = {
        body: 'یادآوری جدید برای شما ارسال شده است',
        icon: '/resources/user-avatar.jpg',
        badge: '/resources/user-avatar.jpg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'مشاهده جزئیات',
                icon: '/resources/user-avatar.jpg'
            },
            {
                action: 'close',
                title: 'بستن',
                icon: '/resources/user-avatar.jpg'
            }
        ]
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || 'CRM فارسی';
        options.data = { ...options.data, ...data };
    }
    
    event.waitUntil(
        self.registration.showNotification('CRM فارسی', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the reminders page
        event.waitUntil(
            clients.openWindow('/reminders.html')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message event - communication with main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    } else if (event.data && event.data.type === 'CACHE_REMINDER') {
        // Cache a reminder for offline notifications
        cacheReminder(event.data.reminder);
    } else if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS') {
        // Clear all notifications
        self.registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
        });
    }
});

// Cache reminder for offline notifications
async function cacheReminder(reminder) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const reminderData = new Response(JSON.stringify(reminder), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        await cache.put(`reminder-${reminder.id}`, reminderData);
        console.log('Service Worker: Reminder cached for offline notifications', reminder);
    } catch (error) {
        console.error('Service Worker: Error caching reminder', error);
    }
}

// Helper function to open IndexedDB
async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PersianCRM', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            // Create object stores for pending data
            if (!db.objectStoreNames.contains('pending-customers')) {
                db.createObjectStore('pending-customers', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('pending-sales')) {
                db.createObjectStore('pending-sales', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('pending-reminders')) {
                db.createObjectStore('pending-reminders', { keyPath: 'id' });
            }
        };
    });
}

// Schedule reminder notifications
async function scheduleReminderNotifications() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedReminders = await cache.keys();
        
        for (const request of cachedReminders) {
            if (request.url.includes('reminder-')) {
                const response = await cache.match(request);
                const reminder = await response.json();
                
                const reminderDate = new Date(reminder.when);
                const now = new Date();
                
                if (reminderDate > now && reminder.status === 'active') {
                    const timeUntilReminder = reminderDate.getTime() - now.getTime();
                    
                    setTimeout(() => {
                        if ('Notification' in self && Notification.permission === 'granted') {
                            self.registration.showNotification(`یادآوری: ${reminder.title}`, {
                                body: reminder.notes || 'زمان انجام این کار فرا رسیده است',
                                icon: '/resources/user-avatar.jpg',
                                badge: '/resources/user-avatar.jpg',
                                tag: `reminder-${reminder.id}`,
                                data: { reminderId: reminder.id },
                                requireInteraction: true,
                                actions: [
                                    {
                                        action: 'complete',
                                        title: 'تکمیل شد',
                                        icon: '/resources/user-avatar.jpg'
                                    },
                                    {
                                        action: 'snooze',
                                        title: 'به بعد موکول شود',
                                        icon: '/resources/user-avatar.jpg'
                                    }
                                ]
                            });
                        }
                    }, timeUntilReminder);
                }
            }
        }
    } catch (error) {
        console.error('Service Worker: Error scheduling reminder notifications', error);
    }
}

// Initialize reminder notifications when service worker starts
self.addEventListener('activate', () => {
    setTimeout(() => {
        scheduleReminderNotifications();
    }, 5000); // Wait 5 seconds for everything to initialize
});

// Periodic background sync for reminders
self.addEventListener('periodicsync', event => {
    if (event.tag === 'reminder-check') {
        event.waitUntil(checkReminders());
    }
});

// Check for due reminders
async function checkReminders() {
    try {
        console.log('Service Worker: Checking for due reminders');
        
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedReminders = await cache.keys();
        const now = new Date();
        
        for (const request of cachedReminders) {
            if (request.url.includes('reminder-')) {
                const response = await cache.match(request);
                const reminder = await response.json();
                
                const reminderDate = new Date(reminder.when);
                
                // Check if reminder is due (within 5 minutes)
                if (Math.abs(reminderDate.getTime() - now.getTime()) <= 5 * 60 * 1000) {
                    if ('Notification' in self && Notification.permission === 'granted') {
                        self.registration.showNotification(`یادآوری فوری: ${reminder.title}`, {
                            body: reminder.notes || 'این یادآری باید همین حالا انجام شود',
                            icon: '/resources/user-avatar.jpg',
                            badge: '/resources/user-avatar.jpg',
                            tag: `urgent-reminder-${reminder.id}`,
                            data: { reminderId: reminder.id, urgent: true },
                            requireInteraction: true,
                            silent: false,
                            vibrate: [200, 100, 200, 100, 200]
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Service Worker: Error checking reminders', error);
    }
}

console.log('Service Worker: Script loaded successfully');