# Sub Plan Generator

A Chrome extension (Manifest V3) that generates substitute teacher plans via
the Anthropic API, gated by a free/paid tier through
[ExtensionPay](https://extensionpay.com).

## Architecture

- `manifest.json` — MV3 manifest. `action` opens `popup/popup.html`.
  `background.js` is the service worker. `options_ui` points at
  `options/options.html`. `host_permissions` cover `api.anthropic.com` (for
  generation) and `extensionpay.com` (for payment checks). A content script
  injects `lib/ExtPay.js` on `extensionpay.com/*` so ExtensionPay can notify
  the extension the moment a payment completes.
- `background.js` — starts ExtPay (`extpay.startBackground()`) and, on a
  confirmed payment, writes the cached payment status immediately so the
  popup doesn't wait out the cache TTL.
- `popup/` — the whole UI: the plan-generation form, the generated plan
  view, and the paywall. All three are sections in `popup.html`, toggled by
  `popup.js`.
- `options/` — a single settings page for the user's own Anthropic API key
  (there's no backend, so each install calls Anthropic directly with a
  key the teacher provides).
- `lib/`
  - `ExtPay.js` — vendored, unmodified ExtensionPay SDK (`extpay` npm
    package, v3.1.2).
  - `config.js` — shared constants (extension ID, free-tier limit, cache
    TTLs, Anthropic model/endpoint).
  - `storage.js` — chrome.storage helpers (free-tier count, payment cache,
    funnel counters, API key).
  - `payment.js` — `isPaidUser()`: cached, fail-open ExtensionPay check.
  - `anthropic.js` — builds the prompt and calls the Anthropic Messages API.

## Monetization flow

- Free tier: 3 generations **total**, tracked in `chrome.storage.sync` as
  `freeGenerationsUsed` (survives reinstall on the same Chrome profile,
  since it's account-synced storage rather than local).
- The gate only fires on the Generate click (`attemptGeneration` in
  `popup.js`), never on load — free users can fill out the whole form and
  see exactly what they're about to lose.
- Payment status is checked via `extpay.getUser()`, cached in
  `chrome.storage.local` for 30 minutes (`PAYMENT_STATUS_CACHE_MS` in
  `config.js`) so it isn't re-checked on every keystroke or popup open.
- **Fail open**: if the ExtensionPay check errors or takes longer than 5s
  (`PAYMENT_CHECK_TIMEOUT_MS`), `isPaidUser()` returns `true`. A paying
  teacher blocked by a flaky network check on a Monday morning is worse
  than an occasional freebie. A fail-open result is cached as
  `{paid: true, failed: true}` on the much shorter
  `PAYMENT_FAILURE_CACHE_MS` (1 min), so an outage costs one timeout for
  the whole popup session rather than one per check — while keeping the
  free-ride window short if the user is genuinely unpaid. "Restore
  purchase" passes `forceRefresh` and ignores the cache entirely.
- Funnel counters (`chrome.storage.local.funnelCounters`): `generations_used`,
  `paywall_shown`, `payment_page_opened`.

## Setup before shipping

1. Register the extension at [extensionpay.com](https://extensionpay.com)
   and note the extension ID it assigns you.
2. Set that ID as `EXTPAY_EXTENSION_ID` in `lib/config.js`.
3. On your ExtensionPay dashboard, configure a monthly plan at $5 and an
   annual plan at $29 (the paywall's "Upgrade to Pro" button opens
   ExtensionPay's hosted checkout, which lists whatever plans you configure
   there — the $5/mo and $29/yr shown in the popup are just the informational
   price cards and should match your dashboard config).
4. Load the extension unpacked (`chrome://extensions` → Developer mode →
   Load unpacked → select this `extension/` folder) and test the full
   flow: fill the form, generate 3 times, confirm the paywall appears on
   the 4th, complete a test payment, confirm "Restore purchase" (or the
   automatic `onPaid` listener) unlocks unlimited generations.
5. Each user needs their own Anthropic API key, entered on the extension's
   Settings page (gear icon in the popup), from
   [console.anthropic.com](https://console.anthropic.com/settings/keys).
