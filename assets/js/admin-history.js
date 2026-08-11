import { getHistory, addHistory, updateHistory } from './history.js';

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

  async function loadHistoryRecord() {
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
        alert('Title and content are required.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'SAVING...';
      }

      try {
        if (currentHistoryId) {
          await updateHistory(currentHistoryId, data);
        } else {
          const created = await addHistory(data);
          currentHistoryId = created.history_id;
        }

        if (successMsg) successMsg.classList.remove('hidden');

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerText = 'Save Changes';
            submitBtn.disabled = false;
          }
          if (successMsg) successMsg.classList.add('hidden');
        }, 2000);

      } catch (err) {
        console.error('[Admin History] Save error:', err);
        if (errorMsg) {
          errorMsg.innerText = 'Error saving history: ' + (err.message || err);
          errorMsg.classList.remove('hidden');
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Save Changes';
        }
      }
    });
  }

  loadHistoryRecord();
}
