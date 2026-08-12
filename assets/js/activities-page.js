import { getActivities } from './activities.js';
import { getPublicUrl } from './storage.js';
import { loadingHtml } from './ui-utils.js';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Public Activities Page Script
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('activitiesCalendar');
  if (!container) return;

  container.innerHTML = loadingHtml('Loading activities...');

  try {
    const activities = await getActivities();

    if (!activities || activities.length === 0) {
      container.innerHTML = `
        <p class="py-12 text-center text-gray-400 text-lg">No activities available.</p>
      `;
      return;
    }

    const activityMap = {};
    const yearSet = new Set();

    activities.forEach((act) => {
      const year = String(act.year).trim();
      const month = act.month.trim();
      yearSet.add(year);
      activityMap[`${year}_${month}`.toLowerCase()] = act;
    });

    const years = Array.from(yearSet).sort((a, b) => Number(a) - Number(b));

    let html = '';
    years.forEach((year, index) => {
      if (index > 0) {
        html += `<div class="mt-16"></div>`;
      }

      html += `
        <h1 class="mb-12 text-5xl font-extrabold text-white lg:text-6xl">${escapeHtml(year)}</h1>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      `;

      MONTHS.forEach((month) => {
        const key = `${year}_${month}`.toLowerCase();
        const activity = activityMap[key];

        if (activity && activity.image_path) {
          html += `
            <button type="button" class="activity-btn activity-btn-active" data-month="${escapeHtml(month)}" data-year="${escapeHtml(year)}" data-image-path="${escapeHtml(activity.image_path)}">
              ${escapeHtml(month)}
            </button>
          `;
        } else {
          html += `
            <button type="button" class="activity-btn activity-btn-disabled" disabled aria-disabled="true">
              ${escapeHtml(month)}
            </button>
          `;
        }
      });

      html += `</div>`;
    });

    container.innerHTML = html;

    container.querySelectorAll('.activity-btn-active').forEach((btn) => {
      btn.addEventListener('click', () => {
        const month = btn.getAttribute('data-month');
        const year = btn.getAttribute('data-year');
        const imagePath = btn.getAttribute('data-image-path');
        if (!imagePath) return;

        const publicUrl = getPublicUrl('activities', imagePath);
        openActivityModal(month, year, publicUrl);
      });
    });

  } catch (err) {
    console.error('[Activities Page] Error loading activities:', err);
    container.innerHTML = `
      <p class="py-12 text-center text-red-400">Error loading activities. Please try again later.</p>
    `;
  }
});

function openActivityModal(month, year, imageUrl) {
  let modal = document.getElementById('activityImageModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'activityImageModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm hidden';
    modal.innerHTML = `
      <div class="relative max-w-4xl max-h-[90vh] bg-[#0C2D22] p-4 rounded-xl border border-[#D2B866]/40 shadow-2xl overflow-hidden flex flex-col items-center">
        <div class="w-full flex items-center justify-between border-b border-[#D2B866]/20 pb-3 mb-3">
          <h3 id="activityModalTitle" class="text-lg font-bold text-[#D2B866] uppercase tracking-wider"></h3>
          <button id="closeActivityModal" class="text-gray-400 hover:text-white p-1">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div id="activityModalError" class="hidden text-red-400 text-sm py-8">Unable to load calendar image.</div>
        <img id="activityModalImg" src="" alt="Activity Calendar" class="max-h-[75vh] w-auto object-contain rounded-lg" />
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('#closeActivityModal')) {
        modal.classList.add('hidden');
      }
    });
  }

  const titleEl = modal.querySelector('#activityModalTitle');
  const imgEl = modal.querySelector('#activityModalImg');
  const errorEl = modal.querySelector('#activityModalError');

  if (titleEl) titleEl.innerText = `${month} ${year} Calendar`;
  if (errorEl) errorEl.classList.add('hidden');
  if (imgEl) {
    imgEl.classList.remove('hidden');
    imgEl.onerror = () => {
      imgEl.classList.add('hidden');
      if (errorEl) errorEl.classList.remove('hidden');
    };
    imgEl.src = imageUrl;
  }

  modal.classList.remove('hidden');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (match) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[match];
  });
}
