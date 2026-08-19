import { getGovernanceResolution } from './governance-db.js';
import { getAccreditations } from './accreditations-db.js';
import { getCertifications } from './certifications-db.js';
import { getPublicUrl } from './storage.js';
import { loadingHtml } from './ui-utils.js';
import { escapeHtml } from './member-utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initPublicGovernancePage();
});

async function initPublicGovernancePage() {
  await Promise.all([
    loadPublicResolution(),
    loadPublicAccreditations(),
    loadPublicCertifications()
  ]);
}

async function loadPublicResolution() {
  const container = document.getElementById('resolutionsContent');
  if (!container) return;

  container.innerHTML = loadingHtml('Loading resolutions...');

  try {
    const resolution = await getGovernanceResolution();

    if (!resolution || (!resolution.content && !resolution.image_path)) {
      container.innerHTML = `
        <div class="py-8 text-center text-gray-400 font-medium">
          No resolution information available.
        </div>
      `;
      return;
    }

    const publicUrl = resolution.image_path ? getPublicUrl('governance', resolution.image_path) : null;

    container.innerHTML = `
      <div class="space-y-6">
        ${resolution.content ? `
          <div class="max-w-3xl text-gray-200 text-base leading-relaxed whitespace-pre-wrap mx-auto">
            ${escapeHtml(resolution.content)}
          </div>
        ` : ''}

        ${publicUrl ? `
          <div class="flex justify-center pt-4">
            <div class="group overflow-hidden rounded-lg border border-[#D4AF37]/20 bg-[#0C2D22] p-3 shadow-lg hover:border-[#D4AF37]">
              <img
                src="${publicUrl}"
                alt="Governance Resolutions"
                class="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-contain rounded"
                loading="lazy"
              />
            </div>
          </div>
        ` : ''}

        ${resolution.link ? `
          <div class="pt-4 flex justify-center">
            <a href="${resolution.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded border border-[#D4AF37] bg-[#0E3A2D] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[#D2B866] hover:bg-[#124132] hover:text-white transition shadow-lg">
              <span>View Resolution Link</span>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        ` : ''}
      </div>
    `;
  } catch (err) {
    console.error('[Public Governance] Error loading resolutions:', err);
    container.innerHTML = `
      <div class="py-8 text-center text-red-400 font-medium">
        Unable to load the content. Please refresh the page.
      </div>
    `;
  }
}

async function loadPublicAccreditations() {
  const container = document.getElementById('accreditationsGallery');
  if (!container) return;

  container.innerHTML = loadingHtml('Loading accreditations...');

  try {
    const accreditations = await getAccreditations();

    if (!accreditations || accreditations.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center text-gray-400 font-medium">
          No accreditation images available.
        </div>
      `;
      return;
    }

    container.className = 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6';

    container.innerHTML = accreditations.map((item) => {
      const publicUrl = getPublicUrl('accreditations', item.image_path);
      return `
        <div class="break-inside-avoid mb-6">
          <div class="group overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-[#0C2D22] p-3 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]">
            <img
              src="${publicUrl}"
              alt="Accreditation"
              class="w-full h-auto object-contain rounded"
              loading="lazy"
            />
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[Public Governance] Error loading accreditations:', err);
    container.innerHTML = `
      <div class="py-8 text-center text-red-400 font-medium">
        Unable to load the content. Please refresh the page.
      </div>
    `;
  }
}

async function loadPublicCertifications() {
  const container = document.getElementById('certificationsGallery');
  if (!container) return;

  container.innerHTML = loadingHtml('Loading certifications...');

  try {
    const certifications = await getCertifications();

    if (!certifications || certifications.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center text-gray-400 font-medium col-span-full w-full">
          No certification images available.
        </div>
      `;
      return;
    }

    container.className = 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6';

    container.innerHTML = certifications.map((item) => {
      const publicUrl = getPublicUrl('certifications', item.image_path);
      return `
        <div class="break-inside-avoid mb-6">
          <div class="group overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-[#0C2D22] p-3 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]">
            <img
              src="${publicUrl}"
              alt="Certification"
              class="w-full h-auto object-contain rounded"
              loading="lazy"
            />
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[Public Governance] Error loading certifications:', err);
    container.innerHTML = `
      <div class="py-8 text-center text-red-400 font-medium">
        Unable to load the content. Please refresh the page.
      </div>
    `;
  }
}

