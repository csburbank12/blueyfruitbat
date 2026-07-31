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
async function isPaidUser({ forceRefresh = false } = {}) {
  const cached = await getCachedPaymentStatus();
  const isFresh = cached && (Date.now() - cached.checkedAt < PAYMENT_STATUS_CACHE_MS);
  if (isFresh && !forceRefresh) {
    return cached.paid;
  }
  try {
    const user = await withTimeout(extpay.getUser(), PAYMENT_CHECK_TIMEOUT_MS);
    await setCachedPaymentStatus(!!user.paid);
    return !!user.paid;
  } catch (err) {
    console.warn('[SubPlanGenerator] ExtensionPay check failed, failing open:', err);
    return true;
  }
}
