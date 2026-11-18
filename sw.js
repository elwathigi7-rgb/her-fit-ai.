// HER FIT AI v1.9.1: cache only app-shell resources from our own origin; never cache external videos.
const CACHE='herfit-v191-shell-1';
const SHELL=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('herfit-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
if(new URL(r.url).pathname.endsWith('/cloud-config.js'))return; // Always fetch current public configuration.
event.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{})}return res}).catch(async()=>{let cached=await caches.match(r);return cached||(r.mode==='navigate'?await caches.match('./index.html'):Response.error())}))
});
