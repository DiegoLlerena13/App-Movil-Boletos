const CACHE_NAME = 'boletos-travel-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/registro.html',
  '/menu.html',
  '/pasajeros.html',
  '/cajeros.html',
  '/destinos.html',
  '/boletos.html',
  '/css/style.css',
  '/js/db.js',
  '/js/auth.js',
  '/js/mantenimiento.js',
  '/js/boletos.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos en caché');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercepción de peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, retornar del caché
        if (response) {
          return response;
        }
        // Si no, hacer la petición a la red
        return fetch(event.request).then(response => {
          // No cachear si no es una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar la respuesta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
  );
});