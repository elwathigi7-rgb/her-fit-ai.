/* SHE FIT 2.0.1 — exercise photo visual update; keep installed PWA identity and remove previous app shell caches */
const CACHE='shefit-v201-exercise-art-1';
const SHELL=['./index.html','./manifest.webmanifest','./icons/herfit-192.png','./icons/herfit-512.png'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);for(const p of SHELL){try{let url=new URL(p,self.registration.scope);const r=await fetch(url,{cache:'reload'});if(r.ok)await cache.put(url,r.clone())}catch(e){/* offline first install can retry */}}
})())});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>(k.startsWith('herfit-')||k.startsWith('shefit-'))&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();
})())});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(url.pathname.endsWith('/cloud-config.js'))return; // credentials config always network, never cache
 const shell=new Set(SHELL.map(p=>new URL(p,self.registration.scope).pathname));
 const navigate=req.mode==='navigate',staticAsset=shell.has(url.pathname)&&!url.pathname.endsWith('index.html');
 if(!navigate&&!staticAsset)return;
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   if(staticAsset){const saved=await cache.match(url.pathname);if(saved)return saved;try{const r=await fetch(req);if(r.ok)await cache.put(url.pathname,r.clone());return r}catch(e){return Response.error()}}
   try{const r=await fetch(req,{cache:'no-store'});if(r.ok){const body=await r.clone().text();if(body.includes('<title>SHE FIT v'))await cache.put(new URL('./index.html',self.registration.scope),r.clone())}return r}catch(e){
     const saved=await cache.match(new URL('./index.html',self.registration.scope));return saved||Response.error();
   }
 })());
});
