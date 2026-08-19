import { getCertifications, addCertification, deleteCertification } from './certifications-db.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.js';
import { openModal, closeModal } from './admin.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentCertifications = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminCertifications();
});

async function initAdminCertifications() {
  const container = document.getElementById('adminCertificationsGrid');
  const form = document.getElementById('certificationForm');
  const submitBtn = document.getElementById('certificationSubmit');
  const fileInput = document.getElementById('certificationImage');
  const orderInput = document.getElementById('certificationDisplayOrder');
  const errorMsg = document.getElementById('certificationError');
  const successMsg = document.getElementById('certificationSuccess');

  async function loadCertifications() {
    if (container) {
      container.innerHTML = `<div class="col-span-full">${loadingHtml('Loading certifications...')}</div>`;
    }

    try {
      currentCertifications = await getCertifications();
      renderCertifications(currentCertifications);
    } catch (err) {
      console.error('[Admin Certifications] Error loading certifications:', err);
      if (container) {
        container.innerHTML = `<div class="col-span-full text-center text-red-400 py-8">Unable to load the content. Please refresh the page.</div>`;
      }
    }
  }

  function renderCertifications(items) {
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="col-span-full text-center text-gray-400 py-8">No certification images available.</div>`;
      return;
    }

    container.innerHTML = items.map((item) => {
      const publicUrl = getPublicUrl('certifications', item.image_path);
      return `
        <div class="break-inside-avoid mb-6">
          <div class="rounded-xl border border-[#D2B866]/20 bg-[#0C2D22] overflow-hidden shadow-lg flex flex-col justify-between group">
            <div class="bg-[#143A2E] relative flex items-center justify-center overflow-hidden">
              <img src="${publicUrl}" alt="Certification" class="w-full h-auto object-contain" loading="lazy" />
              <span class="absolute top-3 left-3 bg-[#062E23]/90 text-[#D2B866] text-xs font-bold px-2.5 py-1 rounded border border-[#D2B866]/30">
                Order #${item.display_order}
              </span>
            </div>
            <div class="p-3 border-t border-[#D2B866]/20 bg-[#0A3428] flex items-center justify-between">
              <span class="text-xs text-gray-400">Order ${item.display_order}</span>
              <button type="button" data-delete-id="${item.certification_id}" class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 text-red-400 hover:bg-red-950/40 transition">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-delete-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        handleDeleteCertification(id, btn);
      });
    });
  }

  async function handleDeleteCertification(id, btn) {
    const item = currentCertifications.find((c) => c.certification_id === id);
    if (!item) return;

    if (!confirm('Are you sure you want to delete this certification image?')) return;

    const originalText = btn.innerText;
    setButtonLoading(btn, 'Deleting...');

    try {
      if (item.image_path) {
        await deleteImage('certifications', item.image_path);
      }
      await deleteCertification(id);
      await loadCertifications();
    } catch (err) {
      console.error('[Admin Certifications] Delete error:', err);
      alert('Unable to delete this item. Please try again.');
      resetButton(btn, originalText);
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const file = fileInput.files?.[0];
      const displayOrder = parseInt(orderInput?.value, 10) || (currentCertifications.length + 1);

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
        const uploadResult = await uploadImage('certifications', file);

        if (!uploadResult?.path) {
          throw new Error('No storage path returned from Storage upload.');
        }

        newlyUploadedPath = uploadResult.path;
        await addCertification({ image_path: uploadResult.path, display_order: displayOrder });

        if (successMsg) {
          successMsg.innerText = 'Uploaded successfully.';
          successMsg.classList.remove('hidden');
        }

        setTimeout(() => {
          form.reset();
          if (orderInput) orderInput.value = currentCertifications.length + 2;
          resetButton(submitBtn, 'Upload Image');
          closeModal('certificationModal');
          if (successMsg) successMsg.classList.add('hidden');
          loadCertifications();
        }, 800);
      } catch (err) {
        console.error('[Admin Certifications] Upload/Save error:', err);

        if (newlyUploadedPath) {
          try {
            await deleteImage('certifications', newlyUploadedPath);
          } catch (cleanupErr) {
            console.error('[Admin Certifications] Cleanup error:', cleanupErr);
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

  const addBtn = document.querySelector('[data-modal-open="certificationModal"]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      if (orderInput) orderInput.value = currentCertifications.length + 1;
      if (submitBtn) submitBtn.innerText = 'Upload Image';
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');
    });
  }

  loadCertifications();
}
