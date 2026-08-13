import { getSiteContent, updateSiteContent } from './site-content.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

const SECTIONS = ['welcome', 'mission', 'vision'];

document.addEventListener('DOMContentLoaded', () => {
  initAdminSiteContent();
});

async function initAdminSiteContent() {
  const loadingEl = document.getElementById('siteContentLoading');

  if (loadingEl) {
    loadingEl.classList.remove('hidden');
    loadingEl.innerHTML = loadingHtml('Loading content...');
  }

  try {
    const records = await getSiteContent();
    const map = {};
    if (records) {
      records.forEach((r) => { map[r.section_key] = r; });
    }

    SECTIONS.forEach((key) => {
      const record = map[key];
      const titleInput = document.getElementById(`${key}Title`);
      const contentInput = document.getElementById(`${key}Content`);
      if (titleInput) titleInput.value = record?.title || '';
      if (contentInput) contentInput.value = record?.content || '';
    });
  } catch (err) {
    console.error('[Admin Site Content] Error loading:', err);
    if (loadingEl) {
      loadingEl.innerHTML = '<p class="text-red-400 text-sm py-4">Error loading content.</p>';
    }
  } finally {
    if (loadingEl) loadingEl.classList.add('hidden');
  }

  SECTIONS.forEach((key) => {
    const form = document.getElementById(`${key}Form`);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const titleInput = document.getElementById(`${key}Title`);
      const contentInput = document.getElementById(`${key}Content`);
      const submitBtn = document.getElementById(`${key}Submit`);
      const errorMsg = document.getElementById(`${key}Error`);
      const successMsg = document.getElementById(`${key}Success`);

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
        await updateSiteContent(key, data);

        if (successMsg) {
          successMsg.innerText = 'Saved successfully.';
          successMsg.classList.remove('hidden');
        }

        setTimeout(() => {
          if (successMsg) successMsg.classList.add('hidden');
          resetButton(submitBtn, 'Save');
        }, 2000);
      } catch (err) {
        console.error(`[Admin Site Content] Error saving ${key}:`, err);
        if (errorMsg) {
          errorMsg.innerText = 'Unable to save the changes. Please try again.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, 'Save');
      }
    });
  });
}
