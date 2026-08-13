import { getHistory, addHistory, updateHistory } from './history.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentHistoryId = null;

document.addEventListener('DOMContentLoaded', () => {
  initAdminHistory();
});

async function initAdminHistory() {
  const form = document.getElementById('historyForm');
  const titleInput = document.getElementById('historyTitle');
  const contentInput = document.getElementById('historyContent');
  const submitBtn = document.getElementById('historySubmit');
  const errorMsg = document.getElementById('historyError');
  const successMsg = document.getElementById('historySuccess');
  const loadingEl = document.getElementById('historyLoading');

  async function loadHistoryRecord() {
    if (loadingEl) {
      loadingEl.classList.remove('hidden');
      loadingEl.innerHTML = loadingHtml('Loading chapter history...');
    }

    try {
      const historyList = await getHistory();
      if (historyList && historyList.length > 0) {
        const record = historyList[0];
        currentHistoryId = record.history_id;
        if (titleInput) titleInput.value = record.title || '';
        if (contentInput) contentInput.value = record.content || '';
      }
    } catch (err) {
      console.error('[Admin History] Error loading history:', err);
      if (loadingEl) {
        loadingEl.innerHTML = `<p class="text-red-400 text-sm py-4">Error loading chapter history.</p>`;
      }
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const data = {
        title: titleInput ? titleInput.value.trim() : '',
        content: contentInput ? contentInput.value.trim() : ''
      };

      if (!data.title || !data.content) {
        if (errorMsg) {
          errorMsg.innerText = 'Title and content are required.';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      setButtonLoading(submitBtn, 'Saving...');

      try {
        if (currentHistoryId) {
          await updateHistory(currentHistoryId, data);
        } else {
          const created = await addHistory(data);
          currentHistoryId = created.history_id;
        }

        if (successMsg) successMsg.classList.remove('hidden');

        setTimeout(() => {
          resetButton(submitBtn, 'Save Changes');
          if (successMsg) successMsg.classList.add('hidden');
        }, 2000);

      } catch (err) {
        console.error('[Admin History] Save error:', err);
        if (errorMsg) {
          errorMsg.innerText = 'Unable to save the changes. Please try again.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, 'Save Changes');
      }
    });
  }

  loadHistoryRecord();
}
