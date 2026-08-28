// Service worker mínimo: solo habilita la instalación como PWA y las
// notificaciones push. No cachea nada (sin estrategia de offline) — se
// mantiene simple a propósito para no arriesgar contenido desactualizado.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'FamilyFinance', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'FamilyFinance';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existente = clientsArr.find((c) => 'focus' in c);
      if (existente) return existente.focus();
      return self.clients.openWindow(url);
    }),
  );
});
