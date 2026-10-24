/* Planet Harvester service worker: precache + stale-while-revalidate for offline play. */
const CACHE='planet-harvester-v15';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./maskable-192.png','./maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    try{const net=await fetch(req);if(net&&net.ok)c.put(req,net.clone());return net;}
    catch(err){const hit=await c.match(req);if(hit)return hit;if(req.mode==='navigate'){const i=await c.match('./index.html');if(i)return i;}throw err;}
  }));
});
