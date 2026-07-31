const formSection = document.getElementById('form-section');
const resultSection = document.getElementById('result-section');
const paywallSection = document.getElementById('paywall-section');
const errorBanner = document.getElementById('error-banner');
const usageNote = document.getElementById('usage-note');
const form = document.getElementById('plan-form');
const generateBtn = document.getElementById('generate-btn');
const planOutput = document.getElementById('plan-output');
const backBtn = document.getElementById('back-btn');
const copyBtn = document.getElementById('copy-btn');
const upgradeBtn = document.getElementById('upgrade-btn');
const restoreLink = document.getElementById('restore-link');
const restoreStatus = document.getElementById('restore-status');
const settingsLink = document.getElementById('settings-link');

// Remembers the last submitted form so "restore purchase" can retry the
// generation the user was blocked on, instead of losing their input.
let lastFormData = null;

function showSection(section) {
  for (const el of [formSection, resultSection, paywallSection]) {
    el.hidden = el !== section;
  }
}

function showError(message) {
  errorBanner.textContent = message || '';
  errorBanner.hidden = !message;
}

async function refreshUsageNote() {
  const [used, paid] = await Promise.all([getFreeGenerationsUsed(), isPaidUser()]);
  usageNote.textContent = paid
    ? 'Pro plan — unlimited generations.'
    : `${Math.max(0, FREE_GENERATION_LIMIT - used)} of ${FREE_GENERATION_LIMIT} free generations remaining.`;
}

async function attemptGeneration(formData) {
  showError('');
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating…';
  try {
    const paid = await isPaidUser();
    const used = await getFreeGenerationsUsed();

    if (!paid && used >= FREE_GENERATION_LIMIT) {
      await bumpFunnelEvent('paywall_shown');
      showSection(paywallSection);
      return;
    }

    const apiKey = await getAnthropicApiKey();
    if (!apiKey) {
      showError('Add your Anthropic API key in Settings before generating a plan.');
      return;
    }

    const planText = await generateSubPlan(apiKey, formData);
    await bumpFunnelEvent('generations_used');
    if (!paid) {
      await incrementFreeGenerationsUsed();
    }

    planOutput.textContent = planText;
    showSection(resultSection);
    await refreshUsageNote();
  } catch (err) {
    console.error('[SubPlanGenerator] generation failed:', err);
    showError('Something went wrong generating the plan. Check your API key and try again.');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Plan';
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  lastFormData = {
    gradeLevel: document.getElementById('grade-level').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    classDuration: document.getElementById('class-duration').value.trim(),
    notes: document.getElementById('notes').value.trim(),
  };
  attemptGeneration(lastFormData);
});

backBtn.addEventListener('click', () => {
  showSection(formSection);
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(planOutput.textContent);
  const original = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  setTimeout(() => { copyBtn.textContent = original; }, 1500);
});

upgradeBtn.addEventListener('click', async () => {
  await bumpFunnelEvent('payment_page_opened');
  extpay.openPaymentPage();
});

restoreLink.addEventListener('click', async (e) => {
  e.preventDefault();
  restoreStatus.textContent = 'Checking…';
  const paid = await isPaidUser({ forceRefresh: true });
  if (paid) {
    restoreStatus.textContent = '';
    await refreshUsageNote();
    showSection(formSection);
    if (lastFormData) {
      await attemptGeneration(lastFormData);
    }
  } else {
    restoreStatus.textContent = 'No active subscription found for this browser profile. If you just paid, wait a few seconds and try again.';
  }
});

settingsLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

showSection(formSection);
refreshUsageNote();
