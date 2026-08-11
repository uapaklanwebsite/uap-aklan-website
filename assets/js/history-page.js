import { getHistory } from './history.js';

/**
 * Public Chapter History Section Script
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('historyContent');
  const titleEl = document.getElementById('historyTitle');
  if (!container) return;

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
      }
    }
  } catch (err) {
    console.error('[History Page] Error loading history:', err);
  }
});

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[match];
  });
}
