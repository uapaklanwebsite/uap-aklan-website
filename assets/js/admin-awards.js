import { getAwards, addAward, deleteAward } from './awards.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.js';
import { openModal, closeModal } from './admin.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentAwards = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminAwards();
});

async function initAdminAwards() {
  const container = document.getElementById('adminAwardsGrid');
  const form = document.getElementById('awardForm');
  const submitBtn = document.getElementById('awardSubmit');
  const fileInput = document.getElementById('awardImage');
  const orderInput = document.getElementById('awardDisplayOrder');
  const errorMsg = document.getElementById('awardError');
  const successMsg = document.getElementById('awardSuccess');

  async function loadAwards() {
    if (container) {
      container.innerHTML = loadingHtml('Loading awards...');
    }

    try {
      currentAwards = await getAwards();
      renderAwards(currentAwards);
    } catch (err) {
      console.error('[Admin Awards] Error loading awards:', err);
      if (container) {
        container.innerHTML = `<div class="text-center text-red-400 py-8">Error loading awards.</div>`;
      }
    }
  }

  function renderAwards(items) {
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="text-center text-gray-400 py-8">No awards available.</div>`;
      return;
    }

    container.innerHTML = items.map((item) => {
      const publicUrl = getPublicUrl('awards', item.image_path);
      return `
        <div class="break-inside-avoid mb-6">
          <div class="rounded-xl border border-[#D2B866]/20 bg-[#0C2D22] overflow-hidden shadow-lg flex flex-col justify-between group">
            <div class="bg-[#143A2E] relative flex items-center justify-center overflow-hidden">
              <img src="${publicUrl}" alt="Award" class="w-full h-auto object-contain" loading="lazy" />
              <span class="absolute top-3 left-3 bg-[#062E23]/90 text-[#D2B866] text-xs font-bold px-2.5 py-1 rounded border border-[#D2B866]/30">
                Order #${item.display_order}
              </span>
            </div>
            <div class="p-3 border-t border-[#D2B866]/20 bg-[#0A3428] flex items-center justify-between">
              <span class="text-xs text-gray-400">Order ${item.display_order}</span>
              <button type="button" data-delete-id="${item.award_id}" class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 text-red-400 hover:bg-red-950/40 transition">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-delete-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        handleDeleteAward(id, btn);
      });
    });
  }

  async function handleDeleteAward(id, btn) {
    const item = currentAwards.find((a) => a.award_id === id);
    if (!item) return;

    if (!confirm('Are you sure you want to delete this award image?')) return;

    const originalText = btn ? btn.innerText : 'Delete';
    if (btn) setButtonLoading(btn, 'Deleting...');

    try {
      if (item.image_path) {
        await deleteImage('awards', item.image_path);
      }
      await deleteAward(id);
      await loadAwards();
    } catch (err) {
      console.error('[Admin Awards] Delete error:', err);
      if (typeof errorMsg !== 'undefined' && errorMsg) {
        errorMsg.innerText = 'Unable to delete this item. Please try again.';
        errorMsg.classList.remove('hidden');
      } else {
        console.error('[UI] No inline error area available to show delete failure.');
      }
      if (btn) resetButton(btn, originalText);
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const file = fileInput.files?.[0];
      const displayOrder = parseInt(orderInput?.value, 10) || (currentAwards.length + 1);

      if (!file) {
        if (errorMsg) {
          errorMsg.innerText = 'Please select an image file to upload.';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      setButtonLoading(submitBtn, 'Uploading...');

      let newlyUploadedPath = null;

      try {
        const uploadResult = await uploadImage('awards', file);

        if (!uploadResult?.path) {
          throw new Error('No storage path returned from Storage upload.');
        }

        newlyUploadedPath = uploadResult.path;
        await addAward({ image_path: uploadResult.path, display_order: displayOrder });

        if (successMsg) {
          successMsg.innerText = 'Award image uploaded successfully!';
          successMsg.classList.remove('hidden');
        }

        setTimeout(() => {
          form.reset();
          if (orderInput) orderInput.value = currentAwards.length + 2;
          const preview = document.getElementById('awardPreview');
          if (preview) preview.innerHTML = '<span class="text-xs text-gray-500">Selected image preview will appear here</span>';
          resetButton(submitBtn, 'Upload Image');
          closeModal('awardModal');
          if (successMsg) successMsg.classList.add('hidden');
          loadAwards();
        }, 800);
      } catch (err) {
        console.error('[Admin Awards] Upload/Save error:', err);

        if (newlyUploadedPath) {
          try {
            await deleteImage('awards', newlyUploadedPath);
          } catch (cleanupErr) {
            console.error('[Admin Awards] Cleanup error:', cleanupErr);
          }
        }

        if (errorMsg) {
          errorMsg.innerText = 'The image could not be uploaded. Please try again.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, 'Upload Image');
      }
    });
  }

  const addBtn = document.querySelector('[data-modal-open="awardModal"]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      if (orderInput) orderInput.value = currentAwards.length + 1;
      if (submitBtn) submitBtn.innerText = 'Upload Image';
    });
  }

  loadAwards();
}
