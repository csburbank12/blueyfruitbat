// chrome.storage helpers shared by background.js, popup/popup.js, and
// options/options.js. Loaded after lib/config.js.
//
// Free-tier usage lives in chrome.storage.sync (per spec, so the lifetime
// count survives a reinstall on the same signed-in Chrome profile). Payment
// status cache, funnel counters, and the user's API key live in
// chrome.storage.local since they don't need to sync across devices.

async function getFreeGenerationsUsed() {
  const { freeGenerationsUsed } = await chrome.storage.sync.get('freeGenerationsUsed');
  return freeGenerationsUsed || 0;
}

async function incrementFreeGenerationsUsed() {
  const used = await getFreeGenerationsUsed();
  const next = used + 1;
  await chrome.storage.sync.set({ freeGenerationsUsed: next });
  return next;
}

async function getCachedPaymentStatus() {
  const { paymentStatusCache } = await chrome.storage.local.get('paymentStatusCache');
  return paymentStatusCache || null;
}

async function setCachedPaymentStatus(paid) {
  const paymentStatusCache = { paid, checkedAt: Date.now() };
  await chrome.storage.local.set({ paymentStatusCache });
  return paymentStatusCache;
}

// Lightweight funnel counters for later analysis. Keys are exactly
// 'generations_used', 'paywall_shown', 'payment_page_opened'.
async function bumpFunnelEvent(eventName) {
  const { funnelCounters } = await chrome.storage.local.get('funnelCounters');
  const counters = funnelCounters || {};
  counters[eventName] = (counters[eventName] || 0) + 1;
  await chrome.storage.local.set({ funnelCounters: counters });
}

async function getAnthropicApiKey() {
  const { anthropicApiKey } = await chrome.storage.local.get('anthropicApiKey');
  return anthropicApiKey || '';
}

async function setAnthropicApiKey(key) {
  await chrome.storage.local.set({ anthropicApiKey: key });
}
