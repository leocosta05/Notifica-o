self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const home = new URL('./', self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(list => {
    const client = list.find(item => item.url.startsWith(home));
    return client ? client.focus() : self.clients.openWindow(home);
  }));
});

 // Preparado para receber Web Push. Uma assinatura e um servidor remetente são necessários.
self.addEventListener('push', event => {
    let payload = {};
    try { payload = event.data ? event.data.json() : {}; } catch (_) {
        payload = {body: event.data ? event.data.text() : ''};
    }
    event.waitUntil(self.registration.showNotification(
        typeof payload.title === 'string' ? payload.title : 'Notificações',
        {
            body: typeof payload.body === 'string' ? payload.body : 'Você recebeu uma notificação.',
            icon: typeof payload.icon === 'string' ? payload.icon : undefined,
            badge: typeof payload.badge === 'string' ? payload.badge : undefined
        }
    ));
});
