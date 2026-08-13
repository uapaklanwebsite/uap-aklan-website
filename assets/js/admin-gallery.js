import { getGallery, addGalleryItem, deleteGalleryItem } from './gallery.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.js';
import { openModal, closeModal } from './admin.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentGallery = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminGallery();
});

async function initAdminGallery() {
  const container = document.getElementById('adminGalleryGrid');
  const form = document.getElementById('galleryForm');
  const submitBtn = document.getElementById('gallerySubmit');
  const fileInput = document.getElementById('galleryImage');
  const errorMsg = document.getElementById('galleryError');
  const successMsg = document.getElementById('gallerySuccess');

  async function loadGallery() {
    if (container) {
      container.innerHTML = loadingHtml('Loading gallery...');
    }

    try {
      currentGallery = await getGallery();
      renderGallery(currentGallery);
    } catch (err) {
      console.error('[Admin Gallery] Error loading gallery:', err);
      if (container) {
        container.innerHTML = `<div class="text-center text-red-400 py-8">Error loading gallery images.</div>`;
      }
    }
  }

  function renderGallery(items) {
    if (!container) return;
    if (!items || items.length === 0) {
      container.innerHTML = `<div class="text-center text-gray-400 py-8">No gallery images available.</div>`;
      return;
    }

    container.innerHTML = items.map(item => {
      const publicUrl = getPublicUrl('gallery', item.image_path);
      const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : '';
      return `
        <div class="break-inside-avoid mb-6">
          <div class="rounded-xl border border-[#D2B866]/20 bg-[#0C2D22] overflow-hidden shadow-lg flex flex-col justify-between group">
            <div class="bg-[#143A2E] relative flex items-center justify-center overflow-hidden">
              <img src="${publicUrl}" alt="Gallery Image" class="w-full h-auto object-contain" loading="lazy" />
            </div>
            <div class="p-3 border-t border-[#D2B866]/20 bg-[#0A3428] flex items-center justify-between">
              <span class="text-xs text-gray-400">${dateStr}</span>
              <button type="button" data-delete-id="${item.gallery_id}" class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 text-red-400 hover:bg-red-950/40 transition">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        handleDeleteGalleryItem(id, btn);
      });
    });
  }

  async function handleDeleteGalleryItem(id, btn) {
    const item = currentGallery.find(g => g.gallery_id === id);
    if (!item) return;

    if (!confirm('Are you sure you want to delete this gallery image?')) return;

    const originalText = btn ? btn.innerText : 'Delete';
    if (btn) setButtonLoading(btn, 'Deleting...');

    try {
      if (item.image_path) {
        await deleteImage('gallery', item.image_path);
      }
      await deleteGalleryItem(id);
      await loadGallery();
    } catch (err) {
      console.error('[Admin Gallery] Delete error:', err);
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
        const uploadResult = await uploadImage('gallery', file);

        if (!uploadResult?.path) {
          throw new Error('No storage path returned from Storage upload.');
        }

        newlyUploadedPath = uploadResult.path;
        await addGalleryItem({ image_path: uploadResult.path });

        if (successMsg) {
          successMsg.innerText = 'Gallery image uploaded successfully!';
          successMsg.classList.remove('hidden');
        }

        setTimeout(() => {
          form.reset();
          const preview = document.getElementById('galleryPreview');
          if (preview) preview.innerHTML = `<span class="text-xs text-gray-500">Selected image preview will appear here</span>`;
          resetButton(submitBtn, 'Upload Image');
          closeModal('galleryModal');
          if (successMsg) successMsg.classList.add('hidden');
          loadGallery();
        }, 800);

      } catch (err) {
        console.error('[Admin Gallery] Upload/Save error:', err);

        if (newlyUploadedPath) {
          try {
            await deleteImage('gallery', newlyUploadedPath);
          } catch (cleanupErr) {
            console.error('[Admin Gallery] Cleanup error:', cleanupErr);
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

  loadGallery();
}
