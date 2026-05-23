/* eslint-disable no-restricted-globals */

// =============================================
// MAONI 100.04 - SERVICE WORKER PRÉSIDENTIEL
// Support hors ligne | Synchronisation | Notifications
// République Démocratique du Congo
// =============================================

const CACHE_NAME = 'maoni-v100.04';
const RUNTIME_CACHE = 'maoni-runtime-v100.04';
const STATIC_CACHE = 'maoni-static-v100.04';

// Ressources à pré-cacher
const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/images/logo-drc-map.png',
  '/images/default-avatar.png',
  '/images/gallery/president-tshisekedi-rdc-fr.jpg',
  '/images/gallery/forest-bassin-congo-fr.jpg',
  '/images/gallery/okapi-espece-protegee-fr.jpg',
  '/images/gallery/gorille-montagne-virunga-fr.jpg',
  '/images/gallery/volcan-nyiragongo-goma-fr.jpg',
  '/images/gallery/fleuve-congo-kinshasa-fr.jpg'
];

// Routes API à ne pas intercepter
const EXCLUDED_PATTERNS = [
  /supabase\.co/,
  /api\.africastalking\.com/,
  /rpc\.ankr\.com/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/
];

const shouldExclude = (url) => EXCLUDED_PATTERNS.some(pattern => pattern.test(url));

// =============================================
// INSTALLATION
// =============================================
self.addEventListener('install', (event) => {
  console.log('[SW] MAONI - Installation du Service Worker v100.04');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRE_CACHE_URLS);
      console.log('[SW] Pré-cache terminé');
      return self.skipWaiting();
    })()
  );
});

// =============================================
// ACTIVATION
// =============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] MAONI - Activation du Service Worker');
  
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const validCaches = [CACHE_NAME, RUNTIME_CACHE, STATIC_CACHE];
      const deletePromises = cacheNames
        .filter(name => !validCaches.includes(name))
        .map(name => caches.delete(name));
      
      await Promise.all(deletePromises);
      await self.clients.claim();
      console.log('[SW] Service Worker activé');
      
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: '100.04',
          timestamp: new Date().toISOString()
        });
      });
    })()
  );
});

// =============================================
// STRATÉGIE DE RÉCUPÉRATION
// =============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (request.method !== 'GET') return;
  if (shouldExclude(request.url)) return;
  
  // Images de la galerie - Cache First
  if (request.url.includes('/images/gallery/')) {
    event.respondWith(handleGalleryImage(request));
    return;
  }
  
  // Pages HTML - Network First
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handleNavigation(request));
    return;
  }
  
  // Autres ressources - Network First
  event.respondWith(handleNetworkFirst(request));
});

async function handleGalleryImage(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) return cachedResponse;
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return caches.match('/images/default-avatar.png');
  }
}

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not OK');
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    return caches.match('/offline.html');
  }
}

async function handleNetworkFirst(request) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not OK');
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    if (request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
      return caches.match('/images/default-avatar.png');
    }
    
    return new Response(null, { status: 404 });
  }
}

// =============================================
// SYNCHRONISATION EN ARRIÈRE-PLAN
// =============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Synchronisation:', event.tag);
  
  switch (event.tag) {
    case 'sync-votes':
      event.waitUntil(synchroniserVotes());
      break;
    case 'sync-propositions':
      event.waitUntil(synchroniserPropositions());
      break;
    case 'sync-profile':
      event.waitUntil(synchroniserProfile());
      break;
  }
});

async function synchroniserVotes() {
  console.log('[SW] Synchronisation des votes...');
  
  try {
    const db = await ouvrirIndexedDB();
    const votesEnAttente = await db.getAll('votes-en-attente');
    
    if (votesEnAttente.length === 0) return;
    
    console.log(`[SW] ${votesEnAttente.length} votes à synchroniser`);
    
    for (const vote of votesEnAttente) {
      try {
        const response = await fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vote)
        });
        
        if (response.ok) {
          await db.delete('votes-en-attente', vote.id);
          console.log(`[SW] Vote synchronisé: ${vote.id}`);
          
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({ type: 'VOTE_SYNCED', voteId: vote.id });
          });
        }
      } catch (error) {
        console.error(`[SW] Erreur sync vote:`, error);
      }
    }
  } catch (error) {
    console.error('[SW] Erreur synchronisation des votes:', error);
  }
}

async function synchroniserPropositions() {
  console.log('[SW] Synchronisation des propositions...');
  
  try {
    const db = await ouvrirIndexedDB();
    const propositionsEnAttente = await db.getAll('propositions-en-attente');
    
    if (propositionsEnAttente.length === 0) return;
    
    console.log(`[SW] ${propositionsEnAttente.length} propositions à synchroniser`);
    
    for (const proposition of propositionsEnAttente) {
      try {
        const response = await fetch('/api/propositions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proposition)
        });
        
        if (response.ok) {
          await db.delete('propositions-en-attente', proposition.id);
          console.log(`[SW] Proposition synchronisée: ${proposition.id}`);
        }
      } catch (error) {
        console.error(`[SW] Erreur sync proposition:`, error);
      }
    }
  } catch (error) {
    console.error('[SW] Erreur synchronisation des propositions:', error);
  }
}

async function synchroniserProfile() {
  console.log('[SW] Synchronisation du profil...');
  
  try {
    const db = await ouvrirIndexedDB();
    const profileEnAttente = await db.get('profile', 'user-data');
    
    if (profileEnAttente) {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileEnAttente.data)
      });
      
      if (response.ok) {
        await db.delete('profile', 'user-data');
        console.log('[SW] Profil synchronisé');
      }
    }
  } catch (error) {
    console.error('[SW] Erreur sync profil:', error);
  }
}

// =============================================
// INDEXEDDB
// =============================================
function ouvrirIndexedDB() {
  return new Promise((resolve, reject) => {
    const requete = indexedDB.open('maoni-offline-storage', 2);
    
    requete.onerror = () => reject(requete.error);
    requete.onsuccess = () => resolve(requete.result);
    
    requete.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('votes-en-attente')) {
        const store = db.createObjectStore('votes-en-attente', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('propositions-en-attente')) {
        const store = db.createObjectStore('propositions-en-attente', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('propositions-cache')) {
        const store = db.createObjectStore('propositions-cache', { 
          keyPath: 'id' 
        });
        store.createIndex('created_at', 'created_at');
      }
      
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile');
      }
      
      if (!db.objectStoreNames.contains('sync-queue')) {
        const store = db.createObjectStore('sync-queue', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('type', 'type');
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// =============================================
// NOTIFICATIONS PUSH
// =============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Notification push reçue');
  
  let notificationData = {
    titre: 'MAONI - Alerte Citoyenne',
    message: 'Nouvelle activité sur la plateforme',
    url: '/',
    niveau: 'info'
  };
  
  if (event.data) {
    try {
      const parsed = event.data.json();
      notificationData = { ...notificationData, ...parsed };
    } catch (e) {
      notificationData.message = event.data.text();
    }
  }
  
  let vibratePattern = [200, 100, 200];
  let requireInteraction = false;
  
  switch (notificationData.niveau) {
    case 'urgent':
      vibratePattern = [300, 100, 300, 100, 300];
      requireInteraction = true;
      break;
    case 'presidentiel':
      vibratePattern = [500, 200, 500, 200, 500, 200, 500];
      requireInteraction = true;
      break;
    default:
      vibratePattern = [200, 100, 200];
  }
  
  const options = {
    body: notificationData.message,
    icon: '/images/logo-drc-map.png',
    badge: '/images/logo-drc-map.png',
    vibrate: vibratePattern,
    data: { url: notificationData.url, niveau: notificationData.niveau },
    actions: [
      { action: 'open', title: '🇨🇩 Ouvrir MAONI' },
      { action: 'dismiss', title: 'Plus tard' }
    ],
    requireInteraction: requireInteraction,
    tag: `maoni-notif-${Date.now()}`,
    renotify: true
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.titre, options)
  );
});

// =============================================
// GESTION DES CLIQUES SUR NOTIFICATIONS
// =============================================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic sur notification:', event.action);
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      (async () => {
        const clientsList = await clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });
        
        for (const client of clientsList) {
          if (client.url.includes('maoni.cd') && 'focus' in client) {
            await client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: url
            });
            return;
          }
        }
        
        if (clients.openWindow) {
          await clients.openWindow(url);
        }
      })()
    );
  }
});

// =============================================
// MESSAGES CLIENTS
// =============================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message reçu:', event.data);
  
  switch (event.data?.type) {
    case 'GET_SW_STATUS':
      event.ports[0]?.postMessage({
        type: 'SW_STATUS',
        version: '100.04',
        online: navigator.onLine,
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'CLEAR_CACHES':
      event.waitUntil(
        (async () => {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          event.ports[0]?.postMessage({ type: 'CACHES_CLEARED', success: true });
        })()
      );
      break;
      
    case 'GET_PENDING_COUNT':
      event.waitUntil(
        (async () => {
          try {
            const db = await ouvrirIndexedDB();
            const votesCount = await db.count('votes-en-attente');
            const propsCount = await db.count('propositions-en-attente');
            event.ports[0]?.postMessage({
              type: 'PENDING_COUNT',
              votes: votesCount,
              propositions: propsCount
            });
          } catch (error) {
            event.ports[0]?.postMessage({
              type: 'PENDING_COUNT',
              error: error.message,
              votes: 0,
              propositions: 0
            });
          }
        })()
      );
      break;
      
    case 'FORCE_SYNC':
      event.waitUntil(
        (async () => {
          await synchroniserVotes();
          await synchroniserPropositions();
          await synchroniserProfile();
          event.ports[0]?.postMessage({ type: 'SYNC_COMPLETE', success: true });
        })()
      );
      break;
  }
});

console.log('[SW] 🏛️ MAONI 100.04 - Service Worker Présidentiel Chargé');
console.log('[SW] 🇨🇩 République Démocratique du Congo');
console.log('[SW] 🔒 Mode hors ligne | Synchronisation intelligente');