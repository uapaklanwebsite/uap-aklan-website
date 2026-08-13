import { getMembershipSections, addMembershipSection, updateMembershipSection, deleteMembershipSection } from './membership-db.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.js';
import { openModal, closeModal } from './admin.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentSections = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminMembership();
});

async function initAdminMembership() {
  const container = document.getElementById('adminMembershipContainer');
  const form = document.getElementById('membershipSectionForm');
  const modalTitle = document.getElementById('membershipModalTitle');
  const submitBtn = document.getElementById('membershipSubmitBtn');
  const sectionIdInput = document.getElementById('membershipSectionId');
  const nameInput = document.getElementById('membershipSectionName');
  const contentInput = document.getElementById('membershipContent');
  const linkInput = document.getElementById('membershipLink');
  const orderInput = document.getElementById('membershipDisplayOrder');
  const imageInput = document.getElementById('membershipImage');
  const imagePreview = document.getElementById('membershipImagePreview');
  const errorMsg = document.getElementById('membershipModalError');
  const successMsg = document.getElementById('membershipModalSuccess');

  async function loadSections() {
    if (container) {
      container.innerHTML = loadingHtml('Loading membership sections...');
    }

    try {
      currentSections = await getMembershipSections();
      renderSections(currentSections);
    } catch (err) {
      console.error('[Admin Membership] Error loading sections:', err);
      if (container) {
        container.innerHTML = `<div class="text-center text-red-400 py-8">Error loading membership sections.</div>`;
      }
    }
  }

  function renderSections(items) {
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="text-center text-gray-400 py-8">No membership sections available.</div>`;
      return;
    }

    container.innerHTML = items.map((item) => {
      const publicUrl = item.image_path ? getPublicUrl('membership', item.image_path) : null;
      return `
        <div class="rounded-xl border border-[#D2B866]/20 bg-[#0C2D22] p-6 shadow-lg flex flex-col md:flex-row gap-6 items-start justify-between">
          <div class="space-y-3 flex-1 w-full">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-xs font-bold px-2.5 py-1 rounded border border-[#D2B866]/30 bg-[#062E23] text-[#D2B866]">
                Order #${item.display_order}
              </span>
              <h2 class="text-xl font-bold text-white uppercase tracking-wider">${item.section_name}</h2>
            </div>
            
            <p class="text-sm text-gray-300 whitespace-pre-wrap">${item.content || '<span class="text-gray-500 italic">No description provided</span>'}</p>
            
            ${item.link ? `
              <div class="text-xs text-gray-400 flex items-center gap-1.5 break-all">
                <span class="font-semibold text-[#D2B866]">Link:</span>
                <a href="${item.link}" target="_blank" class="underline hover:text-white">${item.link}</a>
              </div>
            ` : ''}

            ${publicUrl ? `
              <div class="mt-3">
                <p class="text-xs font-semibold text-gray-400 mb-1">Image Preview:</p>
                <img src="${publicUrl}" alt="${item.section_name}" class="h-32 w-auto object-contain rounded border border-[#D2B866]/20 bg-[#062E23] p-1" />
              </div>
            ` : '<p class="text-xs text-gray-500 italic">No image uploaded</p>'}
          </div>

          <div class="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-[#D2B866]/20 pt-4 md:pt-0">
            <button type="button" data-edit-id="${item.section_id}" class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border border-[#D2B866]/40 text-[#D2B866] hover:bg-[#0A3428] hover:text-white transition">Edit</button>
            <button type="button" data-delete-id="${item.section_id}" class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 text-red-400 hover:bg-red-950/40 transition">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-edit-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-id');
        openEditModal(id);
      });
    });

    container.querySelectorAll('[data-delete-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        handleDeleteSection(id, btn);
      });
    });
  }

  function openEditModal(id) {
    const item = currentSections.find((s) => s.section_id === id);
    if (!item) return;

    if (errorMsg) errorMsg.classList.add('hidden');
    if (successMsg) successMsg.classList.add('hidden');

    if (modalTitle) modalTitle.innerText = 'Edit Membership Section';
    if (sectionIdInput) sectionIdInput.value = item.section_id;
    if (nameInput) nameInput.value = item.section_name;
    if (contentInput) contentInput.value = item.content || '';
    if (linkInput) linkInput.value = item.link || '';
    if (orderInput) orderInput.value = item.display_order;
    if (imageInput) imageInput.value = '';

    if (imagePreview) {
      if (item.image_path) {
        const url = getPublicUrl('membership', item.image_path);
        imagePreview.innerHTML = `Current image: <img src="${url}" class="h-10 w-auto rounded border border-[#D2B866]/30" />`;
      } else {
        imagePreview.innerHTML = '<span class="text-gray-500">No image currently set</span>';
      }
    }

    if (submitBtn) submitBtn.innerText = 'Save Changes';
    openModal('membershipSectionModal');
  }

  async function handleDeleteSection(id, btn) {
    const item = currentSections.find((s) => s.section_id === id);
    if (!item) return;

    if (!confirm(`Are you sure you want to delete the "${item.section_name}" section?`)) return;

    const originalText = btn.innerText;
    setButtonLoading(btn, 'Deleting...');

    try {
      if (item.image_path) {
        await deleteImage('membership', item.image_path);
      }
      await deleteMembershipSection(id);
      await loadSections();
    } catch (err) {
      console.error('[Admin Membership] Delete error:', err);
      if (typeof errorMsg !== 'undefined' && errorMsg) {
        errorMsg.innerText = 'Unable to delete this item. Please try again.';
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

      const id = sectionIdInput.value;
      const sectionName = nameInput.value.trim();
      const content = contentInput.value.trim();
      const link = linkInput.value.trim();
      const displayOrder = parseInt(orderInput.value, 10) || (currentSections.length + 1);
      const file = imageInput.files?.[0];

      setButtonLoading(submitBtn, 'Saving...');

      // Frontend validation
      if (!sectionName) {
        if (errorMsg) {
          errorMsg.innerText = 'Please enter the required information.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, id ? 'Save Changes' : 'Save Section');
        return;
      }

      let newlyUploadedPath = null;

      try {
        let imagePathToSave = undefined;

        if (file) {
          const uploadResult = await uploadImage('membership', file);
          if (!uploadResult?.path) {
            throw new Error('No storage path returned from image upload.');
          }
          newlyUploadedPath = uploadResult.path;
          imagePathToSave = uploadResult.path;
        }

        if (id) {
          const existing = currentSections.find((s) => s.section_id === id);
          const payload = {
            section_name: sectionName,
            content,
            link,
            display_order: displayOrder
          };

          if (imagePathToSave !== undefined) {
            payload.image_path = imagePathToSave;
          }

          await updateMembershipSection(id, payload);

          if (file && existing?.image_path) {
            try {
              await deleteImage('membership', existing.image_path);
            } catch (delErr) {
              console.warn('[Admin Membership] Failed to delete old image:', delErr);
            }
          }
        } else {
          await addMembershipSection({
            section_name: sectionName,
            content,
            link,
            display_order: displayOrder,
            image_path: imagePathToSave || ''
          });
        }

        if (successMsg) {
          successMsg.innerText = id ? 'Section updated successfully!' : 'Section added successfully!';
          successMsg.classList.remove('hidden');
        }

        setTimeout(() => {
          form.reset();
          if (sectionIdInput) sectionIdInput.value = '';
          resetButton(submitBtn, 'Save Section');
          closeModal('membershipSectionModal');
          if (successMsg) successMsg.classList.add('hidden');
          loadSections();
        }, 800);
      } catch (err) {
        console.error('[Admin Membership] Save error:', err);

        if (newlyUploadedPath) {
          try {
            await deleteImage('membership', newlyUploadedPath);
          } catch (cleanupErr) {
            console.error('[Admin Membership] Cleanup error:', cleanupErr);
          }
        }

        if (errorMsg) {
          errorMsg.innerText = 'Unable to save the changes. Please try again.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, id ? 'Save Changes' : 'Save Section');
      }
    });
  }

  const addBtn = document.querySelector('[data-modal-open="membershipSectionModal"]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      if (sectionIdInput) sectionIdInput.value = '';
      if (modalTitle) modalTitle.innerText = 'Add Membership Section';
      if (orderInput) orderInput.value = currentSections.length + 1;
      if (imagePreview) imagePreview.innerHTML = '';
      if (submitBtn) submitBtn.innerText = 'Save Section';
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');
    });
  }

  loadSections();
}
