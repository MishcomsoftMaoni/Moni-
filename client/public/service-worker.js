/* eslint-disable no-restricted-globals */

// MAONI - Service Worker pour le support hors ligne
const CACHE_NAME = 'maoni-v2';
const RUNTIME_CACHE = 'maoni-runtime-v2';

const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/images/logo-drc-map.png',
  '/images/default-avatar.png',
  '/images/gallery/president-tshisekedi-rdc-fr.jpg',
  '/manifest.json'
];

// Installation - Mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRE_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activation - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  const cachesAutorises = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then((noms) => noms.filter((nom) => !cachesAutorises.includes(nom)))
      .then((aSupprimer) => Promise.all(aSupprimer.map((nom) => caches.delete(nom))))
      .then(() => self.clients.claim())
  );
});

// Récupération - Réseau d'abord, cache en secours
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then((reponse) => {
        if (reponse.status === 200) {
          const clone = reponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, clone));
        }
        return reponse;
      })
      .catch(async () => {
        const enCache = await caches.match(event.request);
        if (enCache) return enCache;
        
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/offline.html');
        }
        
        return new Response(
          JSON.stringify({ 
            erreur: 'Vous êtes hors ligne', 
            message: 'Cette fonctionnalité nécessite une connexion internet.'
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
  );
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-votes') event.waitUntil(synchroniserVotes());
  else if (event.tag === 'sync-propositions') event.waitUntil(synchroniserPropositions());
});

async function synchroniserVotes() {
  const db = await ouvrirIndexedDB();
  const enAttente = await db.getAll('votes-en-attente');
  for (const vote of enAttente) {
    try {
      const reponse = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vote)
      });
      if (reponse.ok) await db.delete('votes-en-attente', vote.id);
    } catch (err) { /* Réessayera plus tard */ }
  }
}

async function synchroniserPropositions() {
  const db = await ouvrirIndexedDB();
  const enAttente = await db.getAll('propositions-en-attente');
  for (const proposition of enAttente) {
    try {
      const reponse = await fetch('/api/propositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposition)
      });
      if (reponse.ok) await db.delete('propositions-en-attente', proposition.id);
    } catch (err) { /* Réessayera plus tard */ }
  }
}

function ouvrirIndexedDB() {
  return new Promise((resolve, reject) => {
    const requete = indexedDB.open('maoni-hors-ligne', 1);
    requete.onerror = () => reject(requete.error);
    requete.onsuccess = () => resolve(requete.result);
    requete.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('votes-en-attente')) {
        db.createObjectStore('votes-en-attente', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('propositions-en-attente')) {
        db.createObjectStore('propositions-en-attente', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('propositions-cache')) {
        db.createObjectStore('propositions-cache', { keyPath: 'id' });
      }
    };
  });
}

// Notifications push
self.addEventListener('push', (event) => {
  const donnees = event.data?.json() || {};
  const options = {
    body: donnees.message || 'Nouvelle activité sur MAONI',
    icon: '/images/logo-drc-map.png',
    badge: '/images/logo-drc-map.png',
    vibrate: [200, 100, 200],
    data: { url: donnees.url || '/' },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(
      donnees.titre || 'MAONI - Consultation Citoyenne',
      options
    )
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((listeClients) => {
        for (const client of listeClients) {
          if (client.url.includes(url) && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});