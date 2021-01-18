"use strict";

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll([
                '/index.html',
                '/style.css',
                '/main.js',
                '/clock.js',
                '/timer.js',
                '/icon-192.png',
                '/icon-512.png',
            ]);
        })
    );
});

self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );

    // e.respondWith(
    //     caches.open('v1').then(async function(cache) {
    //         const cache_response = await cache.match(e.request);
    //         if (cache_response) {
    //             return cache_response;
    //         }
    //         else {
    //             const response = fetch(e.request);
    //             await cache.put(e.request, (await response).clone());
    //             return response;
    //         }
    //     })
    // );

    // e.respondWith(
    //     caches.open('v1').then(function(cache) {
    //         return cache.match(e.request);
    //     })
    // );
    // e.waitUntil(
    //     caches.open('v1').then(async function(cache) {
    //         const response = await fetch(e.request);
    //         await cache.put(e.request, response.clone());
    //         const clients = await self.clients.matchAll();
    //         const message = JSON.stringify({
    //             type: 'refresh',
    //             url: response.url,
    //             eTag: response.headers.get('ETag'),
    //         });
    //         clients.forEach(function(client) {
    //             client.postMessage(message);
    //         });
    //         return response;
    //     })
    // )
});