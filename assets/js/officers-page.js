import { getOfficers } from './officers.js';
import { getPublicUrl } from './storage.js';
import { loadingHtml } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('officersGrid');
  if (!container) return;

  container.innerHTML = `<div class="col-span-full">${loadingHtml('Loading officers...')}</div>`;

  try {
    const officers = await getOfficers();

    if (!officers || officers.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-gray-400">
          No officers available.
        </div>
      `;
      return;
    }

    container.innerHTML = officers.map(o => {
      const publicUrl = getPublicUrl('officers', o.image_path);
      return `
        <div class="group overflow-hidden border border-[#D4AF37]/20 bg-[#0C2D22] transition hover:-translate-y-1 hover:border-[#D4AF37] rounded-lg">
          <div class="bg-[#1C4C3B] flex items-center justify-center overflow-hidden">
            <img src="${publicUrl}" alt="Officer" class="w-full h-auto" loading="lazy" />
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[Officers Page] Error loading officers:', err);
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-red-400">
        Error loading officers.
      </div>
    `;
  }
});
