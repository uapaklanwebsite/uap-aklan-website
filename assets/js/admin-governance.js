import { getGovernanceResolution, saveGovernanceResolution } from './governance-db.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.js';
import { setButtonLoading, resetButton } from './ui-utils.js';

let currentResolution = null;

document.addEventListener('DOMContentLoaded', () => {
  initAdminGovernance();
});

async function initAdminGovernance() {
  const form = document.getElementById('governanceForm');
  const contentInput = document.getElementById('governanceContent');
  const imageInput = document.getElementById('governanceImage');
  const previewEl = document.getElementById('governanceImagePreview');
  const linkInput = document.getElementById('governanceLink');
  const submitBtn = document.getElementById('governanceSubmit');
  const errorMsg = document.getElementById('governanceError');
  const successMsg = document.getElementById('governanceSuccess');

  async function loadResolution() {
    try {
      currentResolution = await getGovernanceResolution();
      if (currentResolution) {
        if (contentInput) contentInput.value = currentResolution.content || '';
        if (linkInput) linkInput.value = currentResolution.link || '';
        if (previewEl) {
          if (currentResolution.image_path) {
            const url = getPublicUrl('governance', currentResolution.image_path);
            previewEl.innerHTML = `Current image: <img src="${url}" class="h-16 w-auto mt-1 rounded border border-[#D2B866]/30 bg-[#062E23] p-1" />`;
          } else {
            previewEl.innerHTML = '<span class="text-gray-500">No image uploaded</span>';
          }
        }
      }
    } catch (err) {
      console.error('[Admin Governance] Error loading resolution:', err);
      if (errorMsg) {
        errorMsg.innerText = 'Unable to load content. Please refresh the page.';
        errorMsg.classList.remove('hidden');
      }
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const content = contentInput.value.trim();
      const link = linkInput ? linkInput.value.trim() : '';
      const file = imageInput.files?.[0];

      if (link !== '') {
        try {
          new URL(link);
        } catch (_) {
          if (errorMsg) {
            errorMsg.innerText = 'Please enter a valid link.';
            errorMsg.classList.remove('hidden');
          }
          return;
        }
      }

      setButtonLoading(submitBtn, 'Saving...');

      let newlyUploadedPath = null;

      try {
        let imagePathToSave = undefined;

        if (file) {
          const uploadResult = await uploadImage('governance', file);
          if (!uploadResult?.path) {
            throw new Error('No storage path returned from image upload.');
          }
          newlyUploadedPath = uploadResult.path;
          imagePathToSave = uploadResult.path;
        }

        const payload = { content, link: link || null };
        if (imagePathToSave !== undefined) {
          payload.image_path = imagePathToSave;
        }

        await saveGovernanceResolution(payload);

        if (file && currentResolution?.image_path) {
          try {
            await deleteImage('governance', currentResolution.image_path);
          } catch (delErr) {
            console.warn('[Admin Governance] Cleanup old image error:', delErr);
          }
        }

        if (successMsg) {
          successMsg.innerText = 'Saved successfully.';
          successMsg.classList.remove('hidden');
        }

        imageInput.value = '';
        await loadResolution();
        resetButton(submitBtn, 'Save Changes');

        setTimeout(() => {
          if (successMsg) successMsg.classList.add('hidden');
        }, 2000);
      } catch (err) {
        console.error('[Admin Governance] Error saving resolution:', err);

        if (newlyUploadedPath) {
          try {
            await deleteImage('governance', newlyUploadedPath);
          } catch (cleanupErr) {
            console.error('[Admin Governance] Cleanup error:', cleanupErr);
          }
        }

        if (errorMsg) {
          errorMsg.innerText = 'Unable to save the resolution. Please try again.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, 'Save Changes');
      }
    });
  }

  loadResolution();
}
