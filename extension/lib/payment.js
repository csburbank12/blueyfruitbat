// Cached paid/unpaid check backed by ExtensionPay. Loaded after config.js,
// ExtPay.js, and storage.js (in popup.html).

const extpay = ExtPay(EXTPAY_EXTENSION_ID);

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('ExtensionPay check timed out')), ms)),
  ]);
}

// Returns true/false. Uses the cached value when it's fresh; otherwise asks
// ExtensionPay. If the check errors or times out, fails OPEN (returns true)
// so a flaky connection never blocks a paying teacher — see README.
//
// Fail-open results are cached too, on the shorter PAYMENT_FAILURE_CACHE_MS.
// Without that, an ExtensionPay outage makes every single check pay the full
// timeout again (popup open, Generate click, post-generate refresh), which
// stacked up to ~10s of dead time in testing.
async function isPaidUser({ forceRefresh = false } = {}) {
  const cached = await getCachedPaymentStatus();
  const ttl = cached && cached.failed ? PAYMENT_FAILURE_CACHE_MS : PAYMENT_STATUS_CACHE_MS;
  const isFresh = cached && (Date.now() - cached.checkedAt < ttl);
  if (isFresh && !forceRefresh) {
    return cached.paid;
  }
  try {
    const user = await withTimeout(extpay.getUser(), PAYMENT_CHECK_TIMEOUT_MS);
    await setCachedPaymentStatus(!!user.paid);
    return !!user.paid;
  } catch (err) {
    console.warn('[SubPlanGenerator] ExtensionPay check failed, failing open:', err);
    await setCachedPaymentStatus(true, true);
    return true;
  }
}
