import { getMembershipSections } from './membership-db.js';
import { getPublicUrl } from './storage.js';
import { loadingHtml } from './ui-utils.js';
import { escapeHtml } from './member-utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initPublicMembership();
});

async function initPublicMembership() {
  const pageContainer = document.getElementById('membershipPageContainer');
  if (!pageContainer) return;

  pageContainer.innerHTML = loadingHtml('Loading membership sections...');

  try {
    const sections = await getMembershipSections();

    if (!sections || sections.length === 0) {
      pageContainer.innerHTML = `
        <div class="mx-auto max-w-7xl px-6 lg:px-8 py-20 text-center">
          <p class="text-xl text-gray-400">No membership sections available at this time.</p>
        </div>
      `;
      return;
    }

    // Render nav buttons hero and detailed sections
    let html = `
      <section id="membership-hero" class="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#030C09] via-[#0D3628] to-[#030C09] py-20 lg:py-14 relative">
        <div class="absolute inset-0 pointer-events-none opacity-10">
          <div class="h-full w-full cube-grid"></div>
        </div>

        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mb-12 flex items-center gap-4">
            <span class="text-xs font-semibold tracking-[0.25em] text-[#D2B866]">04</span>
            <div class="h-px w-14 bg-[#D2B866]"></div>
            <h1 class="text-4xl font-bold uppercase tracking-[0.01em] text-[#D2B866]">Membership</h1>
          </div>

          <div class="mx-auto flex max-w-xl flex-col gap-6 py-10">
            ${sections.map((sec) => {
              const anchor = sec.section_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return `
                <a href="#${anchor}" class="group rounded border border-[#D4AF37]/20 bg-[#0E3A2D] py-6 text-center font-bold uppercase tracking-widest text-white transition duration-300 hover:border-[#D4AF37] hover:bg-[#124132]">
                  ${escapeHtml(sec.section_name)}
                </a>
              `;
            }).join('')}
          </div>
        </div>
      </section>
    `;

    // Render individual detailed sections
    sections.forEach((sec, idx) => {
      const anchor = sec.section_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const publicUrl = sec.image_path ? getPublicUrl('membership', sec.image_path) : null;
      const subNumber = `4.${idx + 1}`;

      html += `
        <section id="${anchor}" class="bg-gradient-to-b from-[#030C09] via-[#0D3628] to-[#030C09] py-20 lg:py-28 border-y border-[#D2B866]">
          <div class="mx-auto max-w-7xl px-6 lg:px-8 space-y-8">
            
            <div class="flex items-center gap-4">
              <span class="text-xs font-semibold tracking-[0.25em] text-[#D2B866]">${subNumber}</span>
              <div class="h-px w-14 bg-[#D2B866]"></div>
              <h2 class="text-2xl sm:text-3xl font-semibold uppercase tracking-[0.15em] text-[#D2B866]">
                ${escapeHtml(sec.section_name)}
              </h2>
            </div>

            ${sec.content ? `
              <div class="max-w-3xl text-gray-200 text-base leading-relaxed whitespace-pre-wrap mx-auto text-justify">
                ${escapeHtml(sec.content)}
              </div>
            ` : ''}

            ${publicUrl ? `
              <div class="flex justify-center pt-4">
                <div class="group overflow-hidden rounded-lg border border-[#D4AF37]/20 bg-[#0C2D22] p-3 shadow-lg hover:border-[#D4AF37]">
                  <img
                    src="${publicUrl}"
                    alt="${escapeHtml(sec.section_name)}"
                    class="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-contain rounded"
                    loading="lazy"
                  />
                </div>
              </div>
            ` : ''}

            ${sec.link ? `
              <div class="pt-4 flex justify-center">
                <a href="${sec.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded border border-[#D4AF37] bg-[#0E3A2D] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[#D2B866] hover:bg-[#124132] hover:text-white transition shadow-lg">
                  <span>Open ${escapeHtml(sec.section_name)} Link</span>
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ` : ''}

          </div>
        </section>
      `;
    });

    pageContainer.innerHTML = html;
  } catch (err) {
    console.error('[Public Membership] Error loading page:', err);
    pageContainer.innerHTML = `
      <div class="mx-auto max-w-7xl px-6 lg:px-8 py-20 text-center text-red-400">
        <p>Error loading membership information.</p>
      </div>
    `;
  }
}
