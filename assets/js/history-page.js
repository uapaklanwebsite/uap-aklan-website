import { getHistory } from './history.js';
import { loadingHtml } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('historyContent');
  const titleEl = document.getElementById('historyTitle');
  if (!container) return;

  container.innerHTML = loadingHtml('Loading chapter history...');

  try {
    const historyList = await getHistory();
    if (historyList && historyList.length > 0) {
      const latest = historyList[0];
      if (titleEl && latest.title) {
        titleEl.innerText = latest.title;
      }
      if (latest.content) {
        const paragraphs = latest.content.split('\n\n').filter(p => p.trim());
        container.innerHTML = paragraphs.map(p => `<p class="mb-4">${escapeHtml(p.trim())}</p>`).join('');
      } else {
        container.innerHTML = `<p class="text-gray-400">No chapter history content available.</p>`;
      }
    } else {
      container.innerHTML = `<p class="text-gray-400">No chapter history available.</p>`;
    }
  } catch (err) {
    console.error('[History Page] Error loading history:', err);
    container.innerHTML = `<p class="text-red-400">Error loading chapter history.</p>`;
  }
});

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[match];
  });
}
