/* HER FIT AI v1.9.9 — network-first, offline app shell, no user-data caching */
const CACHE='herfit-v199-shell-1';
const SHELL=['./index.html','./manifest.webmanifest'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
   for(const path of SHELL){const url=new URL(path,self.registration.scope);try{const r=await fetch(url,{cache:'no-store'});if(r.ok)await cache.put(url,r.clone());}catch(e){/* offline install is allowed */}}
 }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith('herfit-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET' || new URL(req.url).origin!==self.location.origin)return;
 if(new URL(req.url).pathname.endsWith('/cloud-config.js'))return; // public config, always network
 const isNavigate=req.mode==='navigate';
 event.respondWith((async()=>{
   try{
    const response=await fetch(req,{cache:'no-store'});
    if(response.ok && (((isNavigate && new URL(req.url).pathname.endsWith('/index.html'))) || (!isNavigate && SHELL.some(p=>new URL(p,self.registration.scope).pathname===new URL(req.url).pathname)))){
     const c=await caches.open(CACHE);
     await c.put(isNavigate?new URL('./index.html',self.registration.scope):req,response.clone());
    }
    return response;
   }catch(e){
    const saved=await caches.match(req);
    if(saved)return saved;
    if(isNavigate){const offline=await caches.match(new URL('./index.html',self.registration.scope));if(offline)return offline;}
    return Response.error();
   }
 })());
});
