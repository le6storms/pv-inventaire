/* PV d'inventaire · 6Storm — fonctionnement hors ligne.
   Changer CACHE à chaque mise en ligne d'une nouvelle version. */
const CACHE="pv-inventaire-v30";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  // Polices Google : gardées après le premier chargement en ligne
  if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(r);if(hit)return hit;
      const res=await fetch(r);if(res.ok||res.type==="opaque")c.put(r,res.clone());return res}));return}
  if(u.origin!==location.origin)return;
  // Appli : version en ligne en priorité (toujours à jour), sinon la copie gardée sur le téléphone
  e.respondWith(caches.open(CACHE).then(async c=>{
    const key=r.mode==="navigate"?"./index.html":r;
    try{
      const res=await Promise.race([fetch(r,{cache:"no-cache"}),new Promise((_,rej)=>setTimeout(()=>rej("lent"),6000))]);
      if(res.ok)c.put(key,res.clone());return res;
    }catch(x){
      const hit=await c.match(key,{ignoreSearch:true});
      return hit||new Response("Hors ligne : ouvrez l'appli une première fois avec du réseau.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}})}
  }));
});
