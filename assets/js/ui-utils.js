/**
 * Lightweight UI helpers for loading states
 */

export function loadingHtml(message) {
  return `
    <div class="py-8 text-center text-gray-400">
      <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-[#D2B866]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
}

export function setButtonLoading(button, loadingText, disabled = true) {
  if (!button) return;
  if (!button.dataset.originalText) {
    button.dataset.originalText = button.innerText;
  }
  button.disabled = disabled;
  button.innerText = loadingText;
}

export function resetButton(button, fallbackText) {
  if (!button) return;
  button.disabled = false;
  button.innerText = button.dataset.originalText || fallbackText || 'Submit';
}
