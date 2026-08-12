/**
 * Main App Entry Module for UAP Aklan Website
 */

import { initNavbar } from './navbar.js';
import { initFooter } from './footer.js';
import { getOfficersPreview } from './officers.js';
import { getMembersPreview } from './members.js';
import { getActivityByYearMonth } from './activities.js';
import { getPublicUrl } from './storage.js';
import { escapeHtml, displayMemberField, renderMemberEmail } from './member-utils.js';
import { loadingHtml } from './ui-utils.js';

function initApp() {
  initNavbar();
  initFooter();
  initHomePage();
}

async function initHomePage() {
  await Promise.all([
    loadHomeOfficers(),
    loadHomeMembers(),
    loadHomeCalendar(),
  ]);
}

async function loadHomeOfficers() {
  const container = document.getElementById('homeOfficersGrid');
  if (!container) return;

  container.innerHTML = `<div class="col-span-full">${loadingHtml('Loading officers...')}</div>`;

  try {
    const officers = await getOfficersPreview(6);

    if (!officers || officers.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-gray-400">
          No officers available.
        </div>
      `;
      return;
    }

    container.innerHTML = officers.map((o) => {
      const publicUrl = getPublicUrl('officers', o.image_path);
      return `
        <div class="group overflow-hidden rounded-lg border border-[#D4AF37]/20 bg-[#0C2D22] transition hover:-translate-y-1 hover:border-[#D4AF37]">
          <div class="bg-[#1C4C3B] flex items-center justify-center overflow-hidden">
            <img src="${publicUrl}" alt="Officer" class="w-full h-auto" loading="lazy" />
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[Home] Error loading officers:', err);
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-red-400">
        Error loading officers.
      </div>
    `;
  }
}

async function loadHomeMembers() {
  const container = document.getElementById('homeMembersList');
  if (!container) return;

  container.innerHTML = `
    <tr class="border-b border-white/10">
      <td colspan="3">${loadingHtml('Loading members...')}</td>
    </tr>
  `;

  try {
    const members = await getMembersPreview(6);

    if (!members || members.length === 0) {
      container.innerHTML = `
        <tr class="border-b border-white/10">
          <td colspan="3" class="py-8 text-center text-gray-400 font-medium">No members available.</td>
        </tr>
      `;
      return;
    }

    container.innerHTML = members.map((m) => `
      <tr class="border-b border-white/10 hover:bg-white/5 transition">
        <td class="py-6 font-medium text-white break-words whitespace-normal">${escapeHtml(m.full_name || '')}</td>
        <td class="py-6 text-gray-300 break-words whitespace-normal">${escapeHtml(displayMemberField(m.address))}</td>
        <td class="py-6 text-center break-all whitespace-normal">${renderMemberEmail(m.email)}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('[Home] Error loading members:', err);
    container.innerHTML = `
      <tr class="border-b border-white/10">
        <td colspan="3" class="py-8 text-center text-red-400 font-medium">Error loading members.</td>
      </tr>
    `;
  }
}

async function loadHomeCalendar() {
  const container = document.getElementById('homeCalendarSection');
  if (!container) return;

  container.innerHTML = loadingHtml('Loading calendar...');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.toLocaleString('en-US', { month: 'long' });

  try {
    const activity = await getActivityByYearMonth(currentYear, currentMonth);

    if (!activity || !activity.image_path) {
      container.innerHTML = `
        <p class="py-8 text-center text-gray-400 text-lg border border-[#D4AF37]/20 bg-[#0C2D22] rounded-lg px-6">
          No activity scheduled for this month.
        </p>
      `;
      return;
    }

    const publicUrl = getPublicUrl('activities', activity.image_path);

    container.innerHTML = `
      <div class="border border-[#D4AF37]/20 bg-[#0C2D22] rounded-lg overflow-hidden">
        <div class="py-6 px-6 text-center border-b border-[#D4AF37]/20">
          <p class="text-3xl font-bold uppercase tracking-wide text-[#D2B866]">${escapeHtml(currentMonth)}</p>
          <p class="text-lg text-gray-400 mt-1">${currentYear}</p>
        </div>
        <div class="p-4 flex justify-center">
          <img
            id="homeCalendarImg"
            src="${publicUrl}"
            alt="${escapeHtml(currentMonth)} ${currentYear} Calendar"
            class="w-full h-auto max-w-full object-contain rounded-lg"
            loading="lazy"
          />
        </div>
        <p id="homeCalendarError" class="hidden py-8 text-center text-red-400 text-sm">Unable to load calendar image.</p>
      </div>
    `;

    const img = container.querySelector('#homeCalendarImg');
    const errorEl = container.querySelector('#homeCalendarError');
    if (img) {
      img.onerror = () => {
        img.classList.add('hidden');
        if (errorEl) errorEl.classList.remove('hidden');
      };
    }
  } catch (err) {
    console.error('[Home] Error loading current calendar:', err);
    container.innerHTML = `
      <p class="py-8 text-center text-red-400 text-lg border border-[#D4AF37]/20 bg-[#0C2D22] rounded-lg px-6">
        Error loading calendar.
      </p>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
