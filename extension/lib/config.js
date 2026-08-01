// Shared constants for background.js, popup/popup.js, and options/options.js.
// Loaded as a plain (non-module) script before the files that use it, so these
// declarations live in the shared top-level scope of each context.

// The extension's ID from its dashboard at https://extensionpay.com. Must be
// registered there before payments will work — see extension/README.md.
const EXTPAY_EXTENSION_ID = 'sub-plan-generator';

// Lifetime (not monthly) free generations before the paywall shows.
const FREE_GENERATION_LIMIT = 3;

// How long a cached paid/unpaid check stays valid, so we aren't hitting
// ExtensionPay's servers on every popup open or keystroke.
const PAYMENT_STATUS_CACHE_MS = 30 * 60 * 1000; // 30 minutes

// How long a *failed* check stays cached. Failures fail open (see payment.js),
// so this is deliberately short: long enough that one ExtensionPay outage costs
// a single timeout instead of one per check, short enough that it doesn't hand
// a genuinely unpaid user a long free ride.
const PAYMENT_FAILURE_CACHE_MS = 60 * 1000; // 1 minute

// How long to wait on an ExtensionPay check before failing open.
const PAYMENT_CHECK_TIMEOUT_MS = 5000;

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-5';
