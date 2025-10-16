/* sw.js — PWA Service Worker for GitHub Pages (Project Site)
 * Scope: /Summoning-of-Summer-Ghosts.github.io/
 * Place this file at the repo root (same level as index.html)
 */

'use strict';

// 每次修改 SW 逻辑时更新版本号（或加上时间戳）
const VERSION = 'v2025-10-16-01';

// ---- GitHub Pages 项目路径（按你的仓库名）----
const BASE_PATH = '/Summoning-of-Summer-Ghosts.github.io/';

// 计算作用域基准 URL（如：https://.../Summoning-of-Summer-Ghosts.github.io/）
const SCOPE_URL = new URL(BASE_PATH, self.location.origin);
const OFFLINE_URL = new URL('offline.html', SCOPE_URL).toString();

const CACHES = {
  STATIC: `static-${VERSION}`,   // 预缓存：壳文件（HTML、离线页、manifest）
  RUNTIME: `runtime-${VERSION}`, // HTML 导航的网络首选副本
  ASSETS: `assets-${VERSION}`,   // JS/CSS/worker：SWR
  IMAGES: `images-${VERSION}`,   // 图片：Cache First
  MEDIA:  `media-${VERSION}`,    // 音/视频：Cache First（谨慎大小）
  FONTS:  `fonts-${VERSION}`,    // 字体：Cache First
  DATA:   `data-${VERSION}`,     // JSON/API：Network First
};

// 这里放“确定存在且体积小”的核心文件（预缓存）
const PRECACHE_URLS = [
  new URL('', SCOPE_URL).toString(),               // /<repo>/ 目录（等价 index.html）
  new URL('index.html', SCOPE_URL).toString(),
  new URL('manifest.webmanifest', SCOPE_URL).toString(),
  OFFLINE_URL,
];

// ---------- 小工具 ----------
const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('NETWORK_TIMEOUT')), ms));

async function putInCache(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  } catch (_) { /* 可能配额超限，忽略 */ }
}

async function matchFromCaches(request, cacheNames) {
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const hit = await cache.match(request, { ignoreVary: false, ignoreSearch: false });
    if (hit) return hit;
  }
  return undefined;
}

async function cleanOldCaches() {
  const keep = new Set(Object.values(CACHES));
  const names = await caches.keys();
  await Promise.all(names.map(n => keep.has(n) ? null : caches.delete(n)));
}

async function limitCacheEntries(cacheName, maxEntries = 150) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const over = keys.length - maxEntries;
    if (over > 0) await Promise.all(keys.slice(0, over).map(k => cache.delete(k)));
  } catch (_) {}
}

const isHTMLRequest = (req) =>
  req.mode === 'navigate' || req.destination === 'document' ||
  (req.headers.get('accept') || '').includes('text/html');

const isSameOrigin = (url) => {
  try { return new URL(url, self.location.href).origin === self.location.origin; }
  catch { return false; }
};

const isUnderBasePath = (url) => {
  try { return new URL(url, self.location.href).pathname.startsWith(BASE_PATH); }
  catch { return false; }
};

// ---------- 安装 ----------
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    // 开启导航预加载（可加速首屏）
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }
    const cache = await caches.open(CACHES.STATIC);
    await cache.addAll(PRECACHE_URLS);
  })());
  // 安装后立即进入 waiting（等客户端触发 skipWaiting）
});

// ---------- 激活 ----------
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await cleanOldCaches();
    await self.clients.claim(); // 立刻接管页面
  })());
});

// ---------- 与页面通信 ----------
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  if (type === 'SKIP_WAITING') self.skipWaiting();
});

// ---------- Fetch 处理 ----------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // 1) HTML 导航：网络优先（带超时）→ 缓存 → offline.html
  if (isHTMLRequest(request)) {
    event.respondWith((async () => {
      try {
        // 导航预加载优先
        const preload = await event.preloadResponse;
        if (preload) {
          putInCache(CACHES.RUNTIME, request, preload.clone());
          return preload;
        }

        // 网络优先（4s 超时），成功则更新 runtime 缓存
        const net = await Promise.race([
          fetch(request, { cache: 'no-store' }),
          timeout(4000),
        ]);
        if (net && net.ok) {
          putInCache(CACHES.RUNTIME, request, net.clone());
          return net;
        }

        // 若网络返回非 2xx，对单页应用在 BASE_PATH 下回退 index.html
        if (isSameOrigin(request.url) && isUnderBasePath(request.url)) {
          const spa = await matchFromCaches(new Request(new URL('index.html', SCOPE_URL)), [CACHES.STATIC, CACHES.RUNTIME]);
          if (spa) return spa;
        }
        throw new Error('HTML_NETWORK_FAIL');
      } catch (_) {
        // 已缓存副本
        const cached = await matchFromCaches(request, [CACHES.RUNTIME, CACHES.STATIC]);
        if (cached) return cached;

        // 同源且在 BASE_PATH，回退离线页
        if (isSameOrigin(request.url) && isUnderBasePath(request.url)) {
          const off = await matchFromCaches(new Request(OFFLINE_URL), [CACHES.STATIC]);
          if (off) return off;
        }

        return new Response('<h1>Offline</h1>', {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    })());
    return;
  }

  // 2) JS / CSS / Worker：Stale-While-Revalidate
  if (['script', 'style', 'worker'].includes(request.destination)) {
    event.respondWith((async () => {
      const cacheName = CACHES.ASSETS;
      const cached = await matchFromCaches(request, [cacheName, CACHES.STATIC]);
      const fetching = (async () => {
        try {
          const res = await fetch(request);
          if (res && res.ok) {
            await putInCache(cacheName, request, res.clone());
            limitCacheEntries(cacheName, 200);
          }
          return res;
        } catch (_) { return undefined; }
      })();
      return cached || await fetching || new Response('', { status: 504 });
    })());
    return;
  }

  // 3) 图片：Cache First（允许跨域 opaque）
  if (request.destination === 'image') {
    event.respondWith((async () => {
      const cacheName = CACHES.IMAGES;
      const cached = await matchFromCaches(request, [cacheName]);
      if (cached) return cached;
      try {
        const res = await fetch(request, { mode: 'no-cors' });
        if (res && (res.ok || res.type === 'opaque')) {
          await putInCache(cacheName, request, res.clone());
          limitCacheEntries(cacheName, 300);
          return res;
        }
      } catch (_) {}
      return new Response('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
    })());
    return;
  }

  // 4) 媒体（音/视频）：Cache First（注意配额）
  if (request.destination === 'audio' || request.destination === 'video') {
    event.respondWith((async () => {
      const cacheName = CACHES.MEDIA;
      const cached = await matchFromCaches(request, [cacheName]);
      if (cached) return cached;
      try {
        const res = await fetch(request, { mode: 'no-cors' });
        if (res && (res.ok || res.type === 'opaque')) {
          await putInCache(cacheName, request, res.clone());
          limitCacheEntries(cacheName, 50);
          return res;
        }
      } catch (_) {}
      return new Response('', { status: 504 });
    })());
    return;
  }

  // 5) 字体：Cache First
  if (request.destination === 'font') {
    event.respondWith((async () => {
      const cacheName = CACHES.FONTS;
      const cached = await matchFromCaches(request, [cacheName]);
      if (cached) return cached;
      try {
        const res = await fetch(request, { mode: 'no-cors' });
        if (res && (res.ok || res.type === 'opaque')) {
          await putInCache(cacheName, request, res.clone());
          limitCacheEntries(cacheName, 60);
          return res;
        }
      } catch (_) {}
      return new Response('', { status: 504 });
    })());
    return;
  }

  // 6) JSON / 数据：Network First（失败回缓存）
  const accept = request.headers.get('accept') || '';
  const isJSON = request.destination === 'fetch' || accept.includes('application/json') || /\.json(\?|$)/i.test(new URL(request.url).pathname);
  if (isJSON) {
    event.respondWith((async () => {
      const cacheName = CACHES.DATA;
      try {
        const res = await fetch(request, { cache: 'no-store' });
        if (res && res.ok) {
          putInCache(cacheName, request, res.clone());
          limitCacheEntries(cacheName, 120);
          return res;
        }
        throw new Error('DATA_STATUS');
      } catch (_) {
        const cached = await matchFromCaches(request, [cacheName]);
        if (cached) return cached;
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  // 7) 兜底：尝试 runtime → 网络
  event.respondWith((async () => {
    const cached = await matchFromCaches(request, [CACHES.RUNTIME, CACHES.STATIC]);
    if (cached) return cached;
    try {
      const res = await fetch(request);
      if (res && res.ok) {
        putInCache(CACHES.RUNTIME, request, res.clone());
        return res;
      }
    } catch (_) {}
    return new Response('', { status: 504 });
  })());
});
