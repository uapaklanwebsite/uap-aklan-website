import { getMembers } from './members.js';

/**
 * Public Members Directory Script
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('membersList');
  if (!container) return;

  try {
    const members = await getMembers();

    if (!members || members.length === 0) {
      container.innerHTML = `
        <tr class="border-b border-white/10">
          <td colspan="3" class="py-8 text-center text-gray-400 font-medium">No members found in directory.</td>
        </tr>
      `;
      return;
    }

    container.innerHTML = members.map(m => `
      <tr class="border-b border-white/10 hover:bg-white/5 transition">
        <td class="py-6 font-medium text-white">${escapeHtml(m.full_name || '')}</td>
        <td class="py-6 text-gray-300">${escapeHtml(m.address || '')}</td>
        <td class="py-6 text-center">
          ${m.email ? `
            <a href="mailto:${escapeHtml(m.email)}" class="text-sm text-[#D2B866] hover:underline transition">
              ${escapeHtml(m.email)}
            </a>
          ` : '<span class="text-gray-500">—</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('[Directory] Error loading members:', err);
    container.innerHTML = `
      <tr class="border-b border-white/10">
        <td colspan="3" class="py-8 text-center text-red-400 font-medium">Error loading members directory.</td>
      </tr>
    `;
  }
});

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[match];
  });
}
