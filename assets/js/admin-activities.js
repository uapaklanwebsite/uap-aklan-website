import { getActivities, addActivity, updateActivity, deleteActivity } from './activities.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.js';
import { openModal, closeModal } from './admin.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentActivities = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminActivities();
});

async function initAdminActivities() {
  const tableBody = document.getElementById('adminActivitiesList');
  const form = document.getElementById('activityForm');
  const submitBtn = document.getElementById('activitySubmit');
  const activityIdInput = document.getElementById('activityId');
  const oldPathInput = document.getElementById('activityOldPath');
  const yearInput = document.getElementById('activityYear');
  const monthInput = document.getElementById('activityMonth');
  const fileInput = document.getElementById('activityImage');
  const errorMsg = document.getElementById('activityError');
  const successMsg = document.getElementById('activitySuccess');

  async function loadActivitiesList() {
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="4">${loadingHtml('Loading activities...')}</td></tr>`;
    }

    try {
      currentActivities = await getActivities();
      renderActivities(currentActivities);
    } catch (err) {
      console.error('[Admin Activities] Error loading activities:', err);
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-red-400">Error loading activities.</td></tr>`;
      }
    }
  }

  function renderActivities(list) {
    if (!tableBody) return;
    if (!list || list.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-gray-400">No activities available.</td></tr>`;
      return;
    }

    tableBody.innerHTML = list.map(item => {
      const publicUrl = getPublicUrl('activities', item.image_path);
      return `
        <tr class="hover:bg-white/5 transition">
          <td class="py-4 px-6 font-bold text-white">${item.year}</td>
          <td class="py-4 px-6 text-gray-200 font-medium">${escapeHtml(item.month)}</td>
          <td class="py-4 px-6">
            <div class="flex items-center gap-3">
              <img src="${publicUrl}" alt="Activity Calendar" class="h-16 w-auto max-w-[120px] object-contain rounded bg-[#062E23] p-1 border border-[#D2B866]/20" />
              <span class="text-xs text-gray-400 truncate max-w-[150px]">${item.image_path}</span>
            </div>
          </td>
          <td class="py-4 px-6 text-right">
            <div class="flex items-center justify-end gap-2">
              <button type="button" data-edit-id="${item.activity_id}" class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border border-[#D2B866]/30 text-[#D2B866] hover:bg-[#0E3A2D] transition">EDIT</button>
              <button type="button" data-delete-id="${item.activity_id}" class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 text-red-400 hover:bg-red-950/40 transition">DELETE</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-id');
        const activity = currentActivities.find(a => a.activity_id === id);
        if (activity) prepareEditActivity(activity);
      });
    });

    tableBody.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        handleDeleteActivity(id, btn);
      });
    });
  }

  function prepareEditActivity(activity) {
    if (activityIdInput) activityIdInput.value = activity.activity_id;
    if (oldPathInput) oldPathInput.value = activity.image_path;
    if (yearInput) yearInput.value = activity.year;
    if (monthInput) monthInput.value = activity.month;
    if (fileInput) fileInput.required = false;

    if (submitBtn) submitBtn.innerText = 'Update Activity';
    openModal('activityModal');
  }

  async function handleDeleteActivity(id, btn) {
    const activity = currentActivities.find(a => a.activity_id === id);
    if (!activity) return;

    if (!confirm('Are you sure you want to delete this activity calendar?')) return;

      const originalText = btn ? btn.innerText : 'Delete';
      if (btn) setButtonLoading(btn, 'Deleting...');

    try {
      if (activity.image_path) {
        await deleteImage('activities', activity.image_path);
      }
      await deleteActivity(id);
      await loadActivitiesList();
    } catch (err) {
      console.error('[Admin Activities] Delete error:', err);
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

      const id = activityIdInput ? activityIdInput.value : '';
      const oldPath = oldPathInput ? oldPathInput.value : '';
      const year = parseInt(yearInput.value, 10) || new Date().getFullYear();
      const month = monthInput.value;
      const file = fileInput.files?.[0];

      if (!id && !file) {
        if (errorMsg) {
          errorMsg.innerText = 'Please select a calendar image file.';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      setButtonLoading(submitBtn, 'Saving...');

      let newlyUploadedPath = null;

      try {
        let newImagePath = oldPath;

        if (file) {
          const uploadResult = await uploadImage('activities', file);

          if (!uploadResult?.path) {
            throw new Error('No storage path returned from Storage upload.');
          }

          newlyUploadedPath = uploadResult.path;
          newImagePath = uploadResult.path;
        }

        if (id) {
          await updateActivity(id, { year, month, image_path: newImagePath });

          if (file && oldPath && oldPath !== newImagePath) {
            try {
              await deleteImage('activities', oldPath);
            } catch (delErr) {
              console.warn('[Admin Activities] Non-critical error deleting old image:', delErr);
            }
          }
        } else {
          await addActivity({ year, month, image_path: newImagePath });
        }

        if (successMsg) {
          successMsg.innerText = 'Activity calendar saved successfully!';
          successMsg.classList.remove('hidden');
        }

        setTimeout(() => {
          form.reset();
          if (activityIdInput) activityIdInput.value = '';
          if (oldPathInput) oldPathInput.value = '';
          if (fileInput) fileInput.required = true;
          resetButton(submitBtn, 'Save Activity');
          closeModal('activityModal');
          if (successMsg) successMsg.classList.add('hidden');
          loadActivitiesList();
        }, 800);

      } catch (err) {
        console.error('[Admin Activities] Submit/Save error:', err);

        if (newlyUploadedPath) {
          try {
            await deleteImage('activities', newlyUploadedPath);
          } catch (cleanupErr) {
            console.error('[Admin Activities] Cleanup error:', cleanupErr);
          }
        }

        if (errorMsg) {
            errorMsg.innerText = 'Unable to save the changes. Please try again.';
          errorMsg.classList.remove('hidden');
        }
        resetButton(submitBtn, id ? 'Update Activity' : 'Save Activity');
      }
    });
  }

  const addBtn = document.querySelector('[data-modal-open="activityModal"]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      if (activityIdInput) activityIdInput.value = '';
      if (oldPathInput) oldPathInput.value = '';
      if (fileInput) fileInput.required = true;
      if (submitBtn) submitBtn.innerText = 'Save Activity';
    });
  }

  loadActivitiesList();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[match];
  });
}
