import { getMembers } from './members.js';
import { filterMembers, escapeHtml, displayMemberField, renderMemberEmail } from './member-utils.js';
import { loadingHtml } from './ui-utils.js';

let allMembers = [];
let isSearchActive = false;

document.addEventListener('DOMContentLoaded', () => {
  initDirectory();
});

async function initDirectory() {
  const tableBody = document.getElementById('membersList');
  const cardsContainer = document.getElementById('membersCards');
  const searchInput = document.getElementById('memberSearch');

  if (!tableBody && !cardsContainer) return;

  showLoading();

  try {
    allMembers = await getMembers();
    renderMembers(allMembers);
  } catch (err) {
    console.error('[Directory] Error loading members:', err);
    showError();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      isSearchActive = query.trim().length > 0;
      const filtered = filterMembers(allMembers, query);
      renderMembers(filtered);
    });
  }
}

function showLoading() {
  const loading = loadingHtml('Loading members...');
  const tableBody = document.getElementById('membersList');
  const cardsContainer = document.getElementById('membersCards');

  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="3" class="py-8">${loading}</td></tr>`;
  }
  if (cardsContainer) {
    cardsContainer.innerHTML = loading;
  }
}

function showError() {
  const tableBody = document.getElementById('membersList');
  const cardsContainer = document.getElementById('membersCards');

  if (tableBody) {
    tableBody.innerHTML = `
      <tr class="border-b border-white/10">
        <td colspan="3" class="py-8 text-center text-red-400 font-medium">Error loading members directory.</td>
      </tr>
    `;
  }
  if (cardsContainer) {
    cardsContainer.innerHTML = `<p class="py-8 text-center text-red-400 font-medium">Error loading members directory.</p>`;
  }
}

function renderMembers(members) {
  const tableBody = document.getElementById('membersList');
  const cardsContainer = document.getElementById('membersCards');

  if (!members || members.length === 0) {
    const emptyMessage = isSearchActive
      ? 'No members found.'
      : 'No members available.';

    if (tableBody) {
      tableBody.innerHTML = `
        <tr class="border-b border-white/10">
          <td colspan="3" class="py-8 text-center text-gray-400 font-medium">${emptyMessage}</td>
        </tr>
      `;
    }
    if (cardsContainer) {
      cardsContainer.innerHTML = `<p class="py-8 text-center text-gray-400 font-medium">${emptyMessage}</p>`;
    }
    return;
  }

  if (tableBody) {
    tableBody.innerHTML = members.map((m) => `
      <tr class="border-b border-white/10 hover:bg-white/5 transition">
        <td class="py-6 font-medium text-white break-words whitespace-normal">${escapeHtml(m.full_name || '')}</td>
        <td class="py-6 text-gray-300 break-words whitespace-normal">${escapeHtml(displayMemberField(m.address))}</td>
        <td class="py-6 text-center break-all whitespace-normal">${renderMemberEmail(m.email)}</td>
      </tr>
    `).join('');
  }

  if (cardsContainer) {
    cardsContainer.innerHTML = members.map((m) => `
      <div class="rounded-lg border border-[#D4AF37]/20 bg-[#0C2D22] p-5 space-y-3">
        <p class="font-medium text-white text-lg break-words whitespace-normal">${escapeHtml(m.full_name || '')}</p>
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-[#D2B866] mb-1">Address</p>
          <p class="text-gray-300 break-words whitespace-normal">${escapeHtml(displayMemberField(m.address))}</p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-[#D2B866] mb-1">Email</p>
          <div class="break-all whitespace-normal">${renderMemberEmail(m.email)}</div>
        </div>
      </div>
    `).join('');
  }
}
