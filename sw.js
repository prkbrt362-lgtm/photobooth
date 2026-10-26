// Cache de l'appli pour un fonctionnement 100 % hors ligne.
// Après une modification de la page, change le numéro de version pour forcer la mise à jour.
const VERSION = 'photobooth-v1';
const FICHIERS = ['./', 'index.html', 'manifest.webmanifest', 'icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Seule l'appli elle-même est mise en cache ; l'envoi des e-mails passe directement par le réseau.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(rep => rep || fetch(req).then(r => {
      const copie = r.clone();
      caches.open(VERSION).then(c => c.put(req, copie));
      return r;
    }))
  );
});
