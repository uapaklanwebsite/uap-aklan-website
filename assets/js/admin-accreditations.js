import { getAccreditations, addAccreditation, deleteAccreditation } from './accreditations-db.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.js';
import { openModal, closeModal } from './admin.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentAccreditations = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminAccreditations();
});

async function initAdminAccreditations() {
  const container = document.getElementById('adminAccreditationsGrid');
  const form = document.getElementById('accreditationForm');
  const submitBtn = document.getElementById('accreditationSubmit');
  const fileInput = document.getElementById('accreditationImage');
  const orderInput = document.getElementById('accreditationDisplayOrder');
  const errorMsg = document.getElementById('accreditationError');
  const successMsg = document.getElementById('accreditationSuccess');

  async function loadAccreditations() {
    if (container) {
      container.innerHTML = `<div class="col-span-full">${loadingHtml('Loading accreditations...')}</div>`;
    }

    try {
      currentAccreditations = await getAccreditations();
      renderAccreditations(currentAccreditations);
    } catch (err) {
      console.error('[Admin Accreditations] Error loading accreditations:', err);
      if (container) {
        container.innerHTML = `<div class="col-span-full text-center text-red-400 py-8">Unable to load the content. Please refresh the page.</div>`;
      }
    }
  }

  function renderAccreditations(items) {
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="col-span-full text-center text-gray-400 py-8">No accreditation images available.</div>`;
      return;
    }

    container.innerHTML = items.map((item) => {
      const publicUrl = getPublicUrl('accreditations', item.image_path);
      return `
        <div class="break-inside-avoid mb-6">
          <div class="rounded-xl border border-[#D2B866]/20 bg-[#0C2D22] overflow-hidden shadow-lg flex flex-col justify-between group">
            <div class="bg-[#143A2E] relative flex items-center justify-center overflow-hidden">
              <img src="${publicUrl}" alt="Accreditation" class="w-full h-auto object-contain" loading="lazy" />
              <span class="absolute top-3 left-3 bg-[#062E23]/90 text-[#D2B866] text-xs font-bold px-2.5 py-1 rounded border border-[#D2B866]/30">
                Order #${item.display_order}
              </span>
            </div>
            <div class="p-3 border-t border-[#D2B866]/20 bg-[#0A3428] flex items-center justify-between">
              <span class="text-xs text-gray-400">Order ${item.display_order}</span>
              <button type="button" data-delete-id="${item.accreditation_id}" class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 text-red-400 hover:bg-red-950/40 transition">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-delete-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        handleDeleteAccreditation(id, btn);
      });
    });
  }

  async function handleDeleteAccreditation(id, btn) {
    const item = currentAccreditations.find((a) => a.accreditation_id === id);
    if (!item) return;

    if (!confirm('Are you sure you want to delete this accreditation image?')) return;

    const originalText = btn.innerText;
    setButtonLoading(btn, 'Deleting...');

    try {
      if (item.image_path) {
        await deleteImage('accreditations', item.image_path);
      }
      await deleteAccreditation(id);
      await loadAccreditations();
    } catch (err) {
      console.error('[Admin Accreditations] Delete error:', err);
      if (typeof errorMsg !== 'undefined' && errorMsg) {
        errorMsg.innerText = 'Unable to delete the image. Please try again.';
        errorMsg.classList.remove('hidden');
      } else {
        console.error('[UI] No inline error area available to show delete failure.');
      }
      resetButton(btn, originalText);
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const file = fileInput.files?.[0];
      const displayOrder = parseInt(orderInput?.value, 10) || (currentAccreditations.length + 1);

      if (!file) {
        if (errorMsg) {
          errorMsg.innerText = 'Please select an image.';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      setButtonLoading(submitBtn, 'Uploading...');

      let newlyUploadedPath = null;

      try {
        const uploadResult = await uploadImage('accreditations', file);

        if (!uploadResult?.path) {
          throw new Error('No storage path returned from Storage upload.');
        }

        newlyUploadedPath = uploadResult.path;
        await addAccreditation({ image_path: uploadResult.path, display_order: displayOrder });

        if (successMsg) {
          successMsg.innerText = 'Uploaded successfully.';
          successMsg.classList.remove('hidden');
        }

        setTimeout(() => {
          form.reset();
          if (orderInput) orderInput.value = currentAccreditations.length + 2;
          resetButton(submitBtn, 'Upload Image');
          closeModal('accreditationModal');
          if (successMsg) successMsg.classList.add('hidden');
          loadAccreditations();
        }, 800);
      } catch (err) {
        console.error('[Admin Accreditations] Upload/Save error:', err);

        if (newlyUploadedPath) {
          try {
            await deleteImage('accreditations', newlyUploadedPath);
          } catch (cleanupErr) {
            console.error('[Admin Accreditations] Cleanup error:', cleanupErr);
          }
        }

        if (errorMsg) {
          errorMsg.innerText = 'Unable to upload the image. Please try again.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, 'Upload Image');
      }
    });
  }

  const addBtn = document.querySelector('[data-modal-open="accreditationModal"]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      if (orderInput) orderInput.value = currentAccreditations.length + 1;
      if (submitBtn) submitBtn.innerText = 'Upload Image';
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');
    });
  }

  loadAccreditations();
}
