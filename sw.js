/* ═══════════════════════════════════════════════════════
   SERVICE WORKER — Pastel da Camila v1.0
   Cache offline + Notificações Push (FCM)
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'pastel-camila-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js'
];

/* ── INSTALL: pré-cacheia os arquivos principais ── */
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS).catch(err => {
        console.warn('[SW] Alguns arquivos não cacheados:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: limpa caches antigos ── */
self.addEventListener('activate', event => {
  console.log('[SW] Ativado.');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Removendo cache antigo:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH: Cache First para assets, Network First para dados ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignora requests não-GET e extensões de browser
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Firestore / Firebase: sempre busca da rede (dados em tempo real)
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('firestore') ||
      url.hostname.includes('googleapis')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response('{}', {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // App shell + assets: Cache First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cacheia respostas válidas
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: retorna index.html para navegação
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});

/* ── PUSH: Notificações do Firebase Cloud Messaging ── */
self.addEventListener('push', event => {
  let data = { title: '🥟 Pastel da Camila', body: 'Nova notificação', icon: '/icons/icon-192.png' };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch(e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '📱 Abrir App' },
      { action: 'dismiss', title: 'Ignorar' }
    ],
    tag: data.tag || 'pastel-notif',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/* ── NOTIFICATION CLICK: abre o app ao clicar na notificação ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Se já tem uma janela aberta, foca nela
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'navigate', url: targetUrl });
          return;
        }
      }
      // Senão, abre nova janela
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

/* ── BACKGROUND SYNC: sincroniza dados quando voltar internet ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-vendas') {
    event.waitUntil(syncVendas());
  }
  if (event.tag === 'sync-checklist') {
    event.waitUntil(syncChecklist());
  }
});

async function syncVendas() {
  console.log('[SW] Sincronizando vendas offline...');
  // A lógica de sync está no sync.js — SW apenas dispara o evento
  const clients_ = await clients.matchAll();
  clients_.forEach(client => client.postMessage({ type: 'sync:vendas' }));
}

async function syncChecklist() {
  console.log('[SW] Sincronizando checklist offline...');
  const clients_ = await clients.matchAll();
  clients_.forEach(client => client.postMessage({ type: 'sync:checklist' }));
}

console.log('[SW] Service Worker Pastel da Camila carregado ✅');
