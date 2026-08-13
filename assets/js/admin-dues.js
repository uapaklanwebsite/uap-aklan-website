import { getDuesSections, updateDuesSection, getHelpLinks, addHelpLink, updateHelpLink, deleteHelpLink } from './dues-db.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.js';
import { openModal, closeModal } from './admin.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentDues = [];
let currentHelpLinks = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminDues();
});

async function initAdminDues() {
  await loadDuesSections();
  await loadHelpLinks();
  setupDuesForms();
  setupHelpForm();
}

async function loadDuesSections() {
  try {
    currentDues = await getDuesSections();
    
    ['chapter', 'iapoa', 'generate_soa'].forEach((key) => {
      const formKey = key === 'generate_soa' ? 'soa' : key;
      const data = currentDues.find((d) => d.section_key === key);
      const contentEl = document.getElementById(`${formKey}DuesContent`);
      const linkEl = document.getElementById(`${formKey}DuesLink`);
      const previewEl = document.getElementById(`${formKey}DuesPreview`);

      if (data) {
        if (contentEl) contentEl.value = data.content || '';
        if (linkEl) linkEl.value = data.link || '';
        if (previewEl) {
          if (data.image_path) {
            const url = getPublicUrl('dues', data.image_path);
            previewEl.innerHTML = `Current image: <img src="${url}" class="h-12 w-auto mt-1 rounded border border-[#D2B866]/30 bg-[#062E23] p-1" />`;
          } else {
            previewEl.innerHTML = '<span class="text-gray-500">No image uploaded</span>';
          }
        }
      }
    });
  } catch (err) {
    console.error('[Admin Dues] Error loading dues sections:', err);
  }
}

function setupDuesForms() {
  const duesKeys = [
    { key: 'chapter', formId: 'chapterDuesForm', btnId: 'chapterDuesSubmit', errId: 'chapterDuesError', succId: 'chapterDuesSuccess', contentId: 'chapterDuesContent', linkId: 'chapterDuesLink', imageId: 'chapterDuesImage' },
    { key: 'iapoa', formId: 'iapoaDuesForm', btnId: 'iapoaDuesSubmit', errId: 'iapoaDuesError', succId: 'iapoaDuesSuccess', contentId: 'iapoaDuesContent', linkId: 'iapoaDuesLink', imageId: 'iapoaDuesImage' },
    { key: 'generate_soa', formId: 'soaDuesForm', btnId: 'soaDuesSubmit', errId: 'soaDuesError', succId: 'soaDuesSuccess', contentId: 'soaDuesContent', linkId: 'soaDuesLink', imageId: 'soaDuesImage' }
  ];

  duesKeys.forEach(({ key, formId, btnId, errId, succId, contentId, linkId, imageId }) => {
    const form = document.getElementById(formId);
    const submitBtn = document.getElementById(btnId);
    const errorMsg = document.getElementById(errId);
    const successMsg = document.getElementById(succId);
    const contentInput = document.getElementById(contentId);
    const linkInput = document.getElementById(linkId);
    const imageInput = document.getElementById(imageId);

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const content = contentInput.value.trim();
      const link = linkInput.value.trim();
      const file = imageInput.files?.[0];

      setButtonLoading(submitBtn, 'Saving...');

      let newlyUploadedPath = null;

      try {
        const existing = currentDues.find((d) => d.section_key === key);
        let imagePathToSave = undefined;

        if (file) {
          const uploadResult = await uploadImage('dues', file);
          if (!uploadResult?.path) {
            throw new Error('No storage path returned from image upload.');
          }
          newlyUploadedPath = uploadResult.path;
          imagePathToSave = uploadResult.path;
        }

        const payload = { content, link };
        if (imagePathToSave !== undefined) {
          payload.image_path = imagePathToSave;
        }

        await updateDuesSection(key, payload);

        if (file && existing?.image_path) {
          try {
            await deleteImage('dues', existing.image_path);
          } catch (delErr) {
            console.warn('[Admin Dues] Failed to delete old image:', delErr);
          }
        }

        if (successMsg) {
          successMsg.innerText = 'Saved successfully!';
          successMsg.classList.remove('hidden');
        }

        imageInput.value = '';
        await loadDuesSections();
        resetButton(submitBtn, 'Save Section');

        setTimeout(() => {
          if (successMsg) successMsg.classList.add('hidden');
        }, 2000);
      } catch (err) {
        console.error(`[Admin Dues] Error updating ${key}:`, err);

        if (newlyUploadedPath) {
          try {
            await deleteImage('dues', newlyUploadedPath);
          } catch (cleanupErr) {
            console.error('[Admin Dues] Cleanup error:', cleanupErr);
          }
        }

        if (errorMsg) {
          errorMsg.innerText = 'Unable to save the changes. Please try again.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, 'Save Section');
      }
    });
  });
}

async function loadHelpLinks() {
  const container = document.getElementById('adminHelpContainer');
  if (container) {
    container.innerHTML = loadingHtml('Loading help links...');
  }

  try {
    currentHelpLinks = await getHelpLinks();
    renderHelpLinks(currentHelpLinks);
  } catch (err) {
    console.error('[Admin Dues] Error loading help links:', err);
    if (container) {
      container.innerHTML = `<div class="text-center text-red-400 py-4">Error loading help links.</div>`;
    }
  }
}

function renderHelpLinks(items) {
  const container = document.getElementById('adminHelpContainer');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<div class="text-center text-gray-400 py-4">No help links available.</div>`;
    return;
  }

  container.innerHTML = items.map((item) => `
    <div class="rounded-xl border border-[#D2B866]/20 bg-[#0C2D22] p-4 shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold px-2 py-0.5 rounded border border-[#D2B866]/30 bg-[#062E23] text-[#D2B866]">
            Order #${item.display_order}
          </span>
          <h4 class="text-base font-bold text-white">${item.title}</h4>
        </div>
        <p class="text-xs text-gray-300 break-all"><span class="text-gray-500 font-semibold">Link:</span> ${item.link}</p>
      </div>

      <div class="flex items-center gap-2 self-end sm:self-center">
        <button type="button" data-edit-help-id="${item.help_id}" class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-[#D2B866]/40 text-[#D2B866] hover:bg-[#0A3428] hover:text-white transition">Edit</button>
        <button type="button" data-delete-help-id="${item.help_id}" class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 text-red-400 hover:bg-red-950/40 transition">Delete</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-edit-help-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit-help-id');
      openEditHelpModal(id);
    });
  });

  container.querySelectorAll('[data-delete-help-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-help-id');
      handleDeleteHelp(id, btn);
    });
  });
}

function openEditHelpModal(id) {
  const item = currentHelpLinks.find((h) => h.help_id === id);
  if (!item) return;

  const modalTitle = document.getElementById('helpModalTitle');
  const submitBtn = document.getElementById('helpSubmitBtn');
  const helpIdInput = document.getElementById('helpLinkId');
  const titleInput = document.getElementById('helpTitle');
  const linkInput = document.getElementById('helpLink');
  const orderInput = document.getElementById('helpDisplayOrder');
  const errorMsg = document.getElementById('helpModalError');
  const successMsg = document.getElementById('helpModalSuccess');

  if (errorMsg) errorMsg.classList.add('hidden');
  if (successMsg) successMsg.classList.add('hidden');

  if (modalTitle) modalTitle.innerText = 'Edit Help Link';
  if (helpIdInput) helpIdInput.value = item.help_id;
  if (titleInput) titleInput.value = item.title;
  if (linkInput) linkInput.value = item.link;
  if (orderInput) orderInput.value = item.display_order;

  if (submitBtn) submitBtn.innerText = 'Save Changes';
  openModal('helpLinkModal');
}

async function handleDeleteHelp(id, btn) {
  const item = currentHelpLinks.find((h) => h.help_id === id);
  if (!item) return;

  if (!confirm(`Are you sure you want to delete the "${item.title}" help link?`)) return;

  const originalText = btn.innerText;
  setButtonLoading(btn, 'Deleting...');

  try {
    await deleteHelpLink(id);
    await loadHelpLinks();
    } catch (err) {
    console.error('[Admin Dues] Delete help link error:', err);
    const helpErr = document.getElementById('helpModalError') || document.getElementById('duesError');
    if (helpErr) {
      helpErr.innerText = 'Unable to delete this item. Please try again.';
      helpErr.classList.remove('hidden');
    } else {
      console.error('[UI] No inline error area available to show delete failure.');
    }
    resetButton(btn, originalText);
  }
}

function setupHelpForm() {
  const form = document.getElementById('helpLinkForm');
  const modalTitle = document.getElementById('helpModalTitle');
  const submitBtn = document.getElementById('helpSubmitBtn');
  const helpIdInput = document.getElementById('helpLinkId');
  const titleInput = document.getElementById('helpTitle');
  const linkInput = document.getElementById('helpLink');
  const orderInput = document.getElementById('helpDisplayOrder');
  const errorMsg = document.getElementById('helpModalError');
  const successMsg = document.getElementById('helpModalSuccess');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const id = helpIdInput.value;
      const title = titleInput.value.trim();
      const link = linkInput.value.trim();
      const displayOrder = parseInt(orderInput.value, 10) || (currentHelpLinks.length + 1);

      setButtonLoading(submitBtn, 'Saving...');

      try {
        if (id) {
          await updateHelpLink(id, { title, link, display_order: displayOrder });
        } else {
          await addHelpLink({ title, link, display_order: displayOrder });
        }

        if (successMsg) {
          successMsg.innerText = id ? 'Help link updated successfully!' : 'Help link added successfully!';
          successMsg.classList.remove('hidden');
        }

        setTimeout(() => {
          form.reset();
          if (helpIdInput) helpIdInput.value = '';
          resetButton(submitBtn, 'Save Help Link');
          closeModal('helpLinkModal');
          if (successMsg) successMsg.classList.add('hidden');
          loadHelpLinks();
        }, 800);
      } catch (err) {
        console.error('[Admin Dues] Save help link error:', err);
        if (errorMsg) {
          errorMsg.innerText = 'Error saving help link: ' + (err.message || err);
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, id ? 'Save Changes' : 'Save Help Link');
      }
    });
  }

  const addBtn = document.querySelector('[data-modal-open="helpLinkModal"]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      if (helpIdInput) helpIdInput.value = '';
      if (modalTitle) modalTitle.innerText = 'Add Help Link';
      if (orderInput) orderInput.value = currentHelpLinks.length + 1;
      if (submitBtn) submitBtn.innerText = 'Save Help Link';
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');
    });
  }
}
