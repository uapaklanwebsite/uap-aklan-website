import { getOfficers, addOfficer, updateOfficer, deleteOfficer } from './officers.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.js';
import { openModal, closeModal } from './admin.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentOfficers = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminOfficers();
});

async function initAdminOfficers() {
  const container = document.getElementById('adminOfficersGrid');
  const form = document.getElementById('officerForm');
  const submitBtn = document.getElementById('officerSubmit');
  const officerIdInput = document.getElementById('officerId');
  const oldPathInput = document.getElementById('officerOldPath');
  const fileInput = document.getElementById('officerImage');
  const orderInput = document.getElementById('displayOrder');
  const errorMsg = document.getElementById('officerError');
  const successMsg = document.getElementById('officerSuccess');

  async function loadOfficers() {
    if (container) {
      container.innerHTML = `<div class="col-span-full">${loadingHtml('Loading officers...')}</div>`;
    }

    try {
      currentOfficers = await getOfficers();
      renderOfficers(currentOfficers);
    } catch (err) {
      console.error('[Admin Officers] Error loading officers:', err);
      if (container) {
        container.innerHTML = `<div class="col-span-full text-center text-red-400 py-8">Error loading officers.</div>`;
      }
    }
  }

  function renderOfficers(officers) {
    if (!container) return;
    if (!officers || officers.length === 0) {
      container.innerHTML = `<div class="col-span-full text-center text-gray-400 py-8">No officers available.</div>`;
      return;
    }

    container.innerHTML = officers.map(o => {
      const publicUrl = getPublicUrl('officers', o.image_path);
      return `
        <div class="rounded-xl border border-[#D2B866]/20 bg-[#0C2D22] overflow-hidden shadow-lg flex flex-col justify-between">
          <div class="bg-[#1C4C3B] relative flex items-center justify-center overflow-hidden">
            <img src="${publicUrl}" alt="Officer Card" class="w-full h-auto object-contain" loading="lazy" />
            <span class="absolute top-3 left-3 bg-[#062E23]/90 text-[#D2B866] text-xs font-bold px-2.5 py-1 rounded border border-[#D2B866]/30">
              Order #${o.display_order}
            </span>
          </div>
          <div class="p-4 border-t border-[#D2B866]/20 bg-[#0A3428] space-y-3">
            <div class="flex items-center justify-between text-xs text-gray-300">
              <span>Display Order: <strong class="text-white">${o.display_order}</strong></span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" data-replace-id="${o.officer_id}" class="px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-[#D2B866]/30 text-[#D2B866] hover:bg-[#0E3A2D] transition text-center">Replace</button>
              <button type="button" data-delete-id="${o.officer_id}" class="px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 text-red-400 hover:bg-red-950/40 transition text-center">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-replace-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-replace-id');
        const officer = currentOfficers.find(item => item.officer_id === id);
        if (officer) prepareReplaceOfficer(officer);
      });
    });

    container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        handleDeleteOfficer(id, btn);
      });
    });
  }

  function prepareReplaceOfficer(officer) {
    if (officerIdInput) officerIdInput.value = officer.officer_id;
    if (oldPathInput) oldPathInput.value = officer.image_path;
    if (orderInput) orderInput.value = officer.display_order;
    if (fileInput) fileInput.required = false;

    if (submitBtn) submitBtn.innerText = 'Update Officer';
    openModal('officerModal');
  }

  async function handleDeleteOfficer(id, btn) {
    const officer = currentOfficers.find(o => o.officer_id === id);
    if (!officer) return;

    if (!confirm('Are you sure you want to delete this officer card?')) return;

    const originalText = btn ? btn.innerText : 'Delete';
    if (btn) setButtonLoading(btn, 'Deleting...');

    try {
      if (officer.image_path) {
        await deleteImage('officers', officer.image_path);
      }
      await deleteOfficer(id);
      await loadOfficers();
    } catch (err) {
      console.error('[Admin Officers] Delete error:', err);
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

      const id = officerIdInput ? officerIdInput.value : '';
      const oldPath = oldPathInput ? oldPathInput.value : '';
      const file = fileInput.files?.[0];
      const displayOrder = parseInt(orderInput.value, 10) || 1;

      if (!id && !file) {
        if (errorMsg) {
          errorMsg.innerText = 'Please select an image file to upload.';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      setButtonLoading(submitBtn, 'Uploading...');

      let newlyUploadedPath = null;

      try {
        let newImagePath = oldPath;

        if (file) {
          const uploadResult = await uploadImage('officers', file);

          if (!uploadResult?.path) {
            throw new Error('No storage path returned from Storage upload.');
          }

          newlyUploadedPath = uploadResult.path;
          newImagePath = uploadResult.path;
        }

        if (id) {
          await updateOfficer(id, { image_path: newImagePath, display_order: displayOrder });

          if (file && oldPath && oldPath !== newImagePath) {
            try {
              await deleteImage('officers', oldPath);
            } catch (delErr) {
              console.warn('[Admin Officers] Non-critical error deleting old image:', delErr);
            }
          }
        } else {
          await addOfficer({ image_path: newImagePath, display_order: displayOrder });
        }

        if (successMsg) {
          successMsg.innerText = 'Officer saved successfully!';
          successMsg.classList.remove('hidden');
        }

        setTimeout(() => {
          form.reset();
          if (officerIdInput) officerIdInput.value = '';
          if (oldPathInput) oldPathInput.value = '';
          if (fileInput) fileInput.required = true;
          resetButton(submitBtn, 'Upload Officer');
          closeModal('officerModal');
          if (successMsg) successMsg.classList.add('hidden');
          loadOfficers();
        }, 800);

      } catch (err) {
        console.error('[Admin Officers] Upload/Save error:', err);

        if (newlyUploadedPath) {
          try {
            await deleteImage('officers', newlyUploadedPath);
          } catch (cleanupErr) {
            console.error('[Admin Officers] Cleanup error:', cleanupErr);
          }
        }

        if (errorMsg) {
            errorMsg.innerText = 'Unable to save the changes. Please try again.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, id ? 'Update Officer' : 'Upload Officer');
      }
    });
  }

  const addBtn = document.querySelector('[data-modal-open="officerModal"]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      if (officerIdInput) officerIdInput.value = '';
      if (oldPathInput) oldPathInput.value = '';
      if (fileInput) fileInput.required = true;
      if (orderInput) orderInput.value = (currentOfficers.length + 1);
      if (submitBtn) submitBtn.innerText = 'Upload Officer';
    });
  }

  loadOfficers();
}
