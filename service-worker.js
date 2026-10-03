const C='embers-v2',F=['./','index.html','css/style.css','js/main.js','js/net.js','js/world.js','js/config.js','manifest.json','icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F))));
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).then(r=>{if(e.request.url.startsWith(self.location.origin)){const x=r.clone();caches.open(C).then(c=>c.put(e.request,x));}return r;}).catch(()=>caches.match(e.request))));
