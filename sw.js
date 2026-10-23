/* Planet Harvester service worker: precache + stale-while-revalidate for offline play. */
const CACHE='planet-harvester-v9';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./maskable-192.png','./maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const key=req.mode==='navigate'?'./index.html':req;
    const hit=await c.match(key,{ignoreSearch:req.mode==='navigate'});
    const net=fetch(req).then(r=>{if(r&&r.ok)c.put(key,r.clone());return r;}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit;}
    const r=await net;return r||(req.mode==='navigate'?c.match('./index.html'):Response.error());
  }));
});
