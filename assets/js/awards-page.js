import { getAwards } from './awards.js';
import { getPublicUrl } from './storage.js';
import { loadingHtml } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('awardsGrid');
  if (!container) return;

  container.innerHTML = loadingHtml('Loading awards...');

  try {
    const items = await getAwards();

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-gray-400">
          No awards available.
        </div>
      `;
      return;
    }

    container.innerHTML = items.map((item) => {
      const url = getPublicUrl('awards', item.image_path);
      return `
        <div class="break-inside-avoid mb-6">
          <div class="overflow-hidden rounded-lg border border-[#D4AF37]/20 bg-[#0C2D22]">
            <img src="${url}" alt="Award" class="w-full h-auto" loading="lazy" />
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[Awards Page] Error loading awards:', err);
    container.innerHTML = `
      <div class="py-12 text-center text-red-400">Error loading awards.</div>
    `;
  }
});
