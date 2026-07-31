importScripts('lib/config.js', 'lib/ExtPay.js', 'lib/storage.js');

const extpay = ExtPay(EXTPAY_EXTENSION_ID);
extpay.startBackground(); // required so ExtPay works elsewhere in the extension

// The moment ExtensionPay confirms a payment (via the content script on
// extensionpay.com relaying the message here), update our own cached
// payment status immediately. Otherwise a teacher who just paid would have
// to wait out PAYMENT_STATUS_CACHE_MS or click "restore purchase".
extpay.onPaid.addListener((user) => {
  setCachedPaymentStatus(!!user.paid);
});
