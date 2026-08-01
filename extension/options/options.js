const apiKeyInput = document.getElementById('api-key');
const saveBtn = document.getElementById('save-btn');
const saveStatus = document.getElementById('save-status');

async function init() {
  apiKeyInput.value = await getAnthropicApiKey();
}

saveBtn.addEventListener('click', async () => {
  await setAnthropicApiKey(apiKeyInput.value.trim());
  saveStatus.textContent = 'Saved.';
  setTimeout(() => { saveStatus.textContent = ''; }, 2000);
});

init();
