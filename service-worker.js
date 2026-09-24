const CACHE = 'turno6-v8';
const ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './assets/boletin.png',
  './assets/detencion.png',
  './assets/heroina.jpg',
  './assets/cocaina.jpg',
  './assets/marihuana.jpg',
  './assets/hachis.jpg',
  './assets/mdma.jpg',
  './assets/mda.jpg',
  './assets/mdea.jpg',
  './assets/metanfetamina.jpg',
  './assets/lsd.jpg',
  './assets/ghb.jpg',
  './assets/mefedrona.jpg',
  './assets/tusi.jpg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Para páginas HTML/navegación: primero Internet, caché solo si no hay conexión.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Recursos estáticos: usa caché y actualiza en segundo plano.
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});