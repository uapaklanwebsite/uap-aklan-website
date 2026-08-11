import { getGallery } from './gallery.js';
import { getPublicUrl } from './storage.js';

/**
 * Public Gallery Section Script
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  try {
    const items = await getGallery();

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-gray-400">
          No gallery images available yet.
        </div>
      `;
      return;
    }

    container.innerHTML = items.map((item) => {
      const url = getPublicUrl('gallery', item.image_path);
      return `
        <div class="break-inside-avoid mb-6">
          <button type="button" class="group block w-full overflow-hidden rounded-lg border border-[#D4AF37]/20 bg-[#0C2D22] text-left gallery-item-btn" data-url="${url}">
            <img src="${url}" alt="Gallery Image" class="w-full h-auto group-hover:opacity-90 transition duration-300" loading="lazy" />
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.gallery-item-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        if (url) openGalleryModal(url);
      });
    });

  } catch (err) {
    console.error('[Gallery Page] Error loading gallery:', err);
    container.innerHTML = `
      <div class="py-12 text-center text-red-400">Error loading gallery.</div>
    `;
  }
});

function openGalleryModal(url) {
  let modal = document.getElementById('publicGalleryModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'publicGalleryModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm hidden';
    modal.innerHTML = `
      <div class="relative max-w-4xl max-h-[90vh] bg-[#0C2D22] p-2 rounded-xl border border-[#D2B866]/40 shadow-2xl overflow-hidden">
        <button id="closePublicGalleryModal" class="absolute top-4 right-4 text-white bg-black/60 hover:bg-black p-2 rounded-full z-10 focus:outline-none">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div id="publicGalleryModalError" class="hidden text-red-400 text-sm p-8 text-center">Unable to load image.</div>
        <img id="publicGalleryModalImg" src="" alt="Enlarged Gallery Image" class="max-h-[80vh] w-auto mx-auto object-contain rounded-lg" />
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('#closePublicGalleryModal')) {
        modal.classList.add('hidden');
      }
    });
  }

  const img = modal.querySelector('#publicGalleryModalImg');
  const errorEl = modal.querySelector('#publicGalleryModalError');

  if (errorEl) errorEl.classList.add('hidden');
  if (img) {
    img.classList.remove('hidden');
    img.onerror = () => {
      img.classList.add('hidden');
      if (errorEl) errorEl.classList.remove('hidden');
    };
    img.src = url;
  }
  modal.classList.remove('hidden');
}
