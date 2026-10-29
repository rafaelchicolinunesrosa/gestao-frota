/**
 * sw.js - Service Worker para Controle de Frota
 * 
 * Implementa cache estratégico de ativos locais e recursos de CDNs externos,
 * garantindo carregamento instantâneo e resiliência offline para agentes de rua.
 */

const CACHE_NAME = 'frota-demutran-v1.1.2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './firebase.js?v=1.1.2',
  './manifest.json',
  './icon.png',
  './icon_192.png',
  // CDNs e Fontes Externas
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf',
  'https://fonts.gstatic.com/s/outfit/v11/FanaR0F8up73mL251gTqclQ.ttf',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/lucide@latest'
];

// Instalação: Armazena os arquivos principais no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pré-cacheando recursos essenciais...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de Requisições: Estratégia Network-First com Cache-Fallback
// Para chamadas do Firestore ou Upload de Fotos, ignorar o cache e ir direto para rede.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignorar requisições ao Firebase Auth/Firestore/Storage para não quebrar a sincronização
  if (
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebasestorage.app')
  ) {
    return; // Deixa o navegador/SDK gerenciar direto pela rede
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, guardar uma cópia no cache (caso seja um dos arquivos estáticos)
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Apenas cacheia arquivos locais ou CDNs permitidos
            if (url.origin === self.location.origin || ASSETS_TO_CACHE.includes(event.request.url)) {
              cache.put(event.request, responseToCache);
            }
          });
        }
        return response;
      })
      .catch(() => {
        // Falhou a rede: busca no cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Caso não esteja no cache e falte rede (offline absoluto)
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
