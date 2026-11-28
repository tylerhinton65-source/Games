// Tyler's Games offline cache. Bump VERSION whenever you upload new files.
const VERSION = 'tylers-games-v102';
const FILES = ['./', './index.html', './gatedash.html', './swamp.html', './chess.html', './checkers.html', './connect4.html', './uno.html', './swamp-music.js', './swamp-beach.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page itself: get the newest copy when there's signal (so updates show on the first open),
// fall back to the saved copy when offline or if the network takes longer than 4 seconds.
function pageFirst(req) {
  // each page is saved under its own name (gatedash.html and swamp.html run in a frame inside index.html)
  const pth = new URL(req.url).pathname;
  // game script files (swamp-*.js) are kept fresh like pages so they always match their page
  const key = pth.endsWith('.js') ? '.' + pth.slice(pth.lastIndexOf('/')) : pth.endsWith('/gatedash.html') ? './gatedash.html' : pth.endsWith('/swamp.html') ? './swamp.html' : pth.endsWith('/checkers.html') ? './checkers.html' : pth.endsWith('/connect4.html') ? './connect4.html' : pth.endsWith('/uno.html') ? './uno.html' : './index.html';
  return caches.open(VERSION).then(cache => {
    const saved = () => cache.match(req, { ignoreSearch: true }).then(hit => hit || cache.match(key));
    const net = fetch(req, { cache: 'no-cache' }).then(res => {
      if (res && res.ok) { cache.put(key, res.clone()); return res; }
      return saved().then(hit => hit || res);
    });
    const slow = new Promise(r => setTimeout(r, 4000)).then(saved);
    return Promise.race([net.catch(saved), slow.then(hit => hit || net)]);
  });
}

// Icons and other files: saved copy first, refreshed in the background.
self.addEventListener('fetch', e => {
  // '?fresh' requests (the app's update check) always go straight to the network
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin || new URL(e.request.url).searchParams.has('fresh')) return;
  const path = new URL(e.request.url).pathname;
  if (e.request.mode === 'navigate' || path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('/gatedash.html') || path.endsWith('/swamp.html') || path.endsWith('/checkers.html') || path.endsWith('/connect4.html') || path.endsWith('/uno.html') || path.endsWith('.js')) {
    e.respondWith(pageFirst(e.request));
    return;
  }
  e.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request)
          .then(res => { if (res && res.ok) cache.put(e.request, res.clone()); return res; })
          .catch(() => hit || cache.match('./index.html'));
        return hit || net;
      })
    )
  );
});
