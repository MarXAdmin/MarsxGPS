if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let c={};const t=e=>i(e,o),d={module:{uri:o},exports:c,require:t};s[o]=Promise.all(n.map((e=>d[e]||t(e)))).then((e=>(r(...e),c)))}}define(["./workbox-7cfec069"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-gnZEwy_V.css",revision:null},{url:"assets/workbox-window.prod.es5-B_6ZJHoI.js",revision:null},{url:"index.html",revision:"64efdb9d26bd40fede51ed9734d7cc57"},{url:"styles.css",revision:"22808aa9ddac6c0183191614b7953e5f"},{url:"pwa-64x64.png",revision:"bb08d4ffe204a919b06960e1a96caea7"},{url:"pwa-192x192.png",revision:"3b1e4bbecc729dd5ba5c67eb273f91ee"},{url:"pwa-512x512.png",revision:"9e98c5c9167e3577609ac44b27c5be45"},{url:"manifest.webmanifest",revision:"1123cccfccba50daabe98ea77d27eb56"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"),{denylist:[/^\/api/]}))}));