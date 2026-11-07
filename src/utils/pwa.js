// ponytail: minimal service worker registration for standalone PWA installability; upgrade to Workbox only if full offline asset precaching is needed
export async function registerServiceWorker(
  nav = typeof navigator !== 'undefined' ? navigator : undefined
) {
  if (!nav || !nav.serviceWorker || typeof nav.serviceWorker.register !== 'function') {
    return;
  }
  try {
    await nav.serviceWorker.register('/sw.js');
  } catch {
    // Ignore registration errors in restricted or private browsing contexts
  }
}
