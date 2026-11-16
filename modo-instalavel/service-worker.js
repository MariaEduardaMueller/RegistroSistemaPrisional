'use strict';
// Guarda os arquivos do sistema no aparelho para abrir sem internet (só vale quando servido por http/https, ex.: localhost).
const CACHE = 'ficha-penal-v1';
const ARQUIVOS = ["index.html", "manifest.webmanifest", "css/estilo.css", "img/icon-192.png", "img/icon-512.png", "js/imagens.js", "js/util.js", "js/schema.js", "js/db.js", "js/relatorio.js", "js/backup.js", "js/ficha.js", "js/app.js"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request))); });
