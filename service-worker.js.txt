self.addEventListener('install', function(e) {
  console.log('Service Worker installed');
  e.waitUntil(
    caches.open('statme-cache').then(function(cache) {
      return cache.addAll([
        'index.html',
        'session.html',
        'profile.html',
        'leaderboard.html',
        'css/style.css',
        'js/app.js',
        'js/gps.js',
        'js/storage.js',
        'js/profile.js',
        'js/leaderboard.js',
        'manifest.json',
        'icons/icon-192.png',
        'icons/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
