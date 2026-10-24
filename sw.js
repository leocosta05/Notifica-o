self.addEventListener('install', () => self.skipWaiting());
// Sem cache de navegação: buscar a página atualizada sem reutilizar HTML do cache HTTP.
const APP_CACHE_PREFIX = 'notificacao-pwa-';
self.addEventListener('activate', event => event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(APP_CACHE_PREFIX)).map(key => caches.delete(key)));
    await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate' && new URL(event.request.url).origin === self.location.origin) {
        event.respondWith(fetch(event.request, {cache: 'no-store'}));
    }
});
self.addEventListener('message', event => {
    if (!event.data || event.data.type !== 'SHOW_NOTIFICATION') return;
    const {title, options = {}} = event.data;
    const roundedImageDataUrl = options.icon;
    event.waitUntil(self.registration.showNotification(title, {
        ...options,
        icon: roundedImageDataUrl,
        badge: roundedImageDataUrl,
        image: roundedImageDataUrl,
        renotify: true,
        tag: 'notificacao-pwa'
    }).then(() => event.ports[0]?.postMessage({ok: true}))
      .catch(error => event.ports[0]?.postMessage({ok: false, error: error.message})));
});
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
            badge: typeof payload.icon === 'string' ? payload.icon : undefined,
            image: typeof payload.icon === 'string' ? payload.icon : undefined,
            renotify: true,
            tag: 'notificacao-pwa'
        }
    ));
});
