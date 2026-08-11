import { getMembers, addMember, updateMember, deleteMember } from './members.js';
import { openModal, closeModal } from './admin.js';

let currentMembers = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminMembers();
});

async function initAdminMembers() {
  const tableBody = document.getElementById('adminMembersList');
  const form = document.getElementById('memberForm');
  const submitBtn = document.getElementById('memberSubmit');
  const memberIdInput = document.getElementById('memberId');
  const modalTitle = document.getElementById('memberModalTitle');
  const searchInput = document.querySelector('input[placeholder*="Search members"]');
  const errorMsg = document.getElementById('memberError');
  const successMsg = document.getElementById('memberSuccess');

  async function loadMembers() {
    try {
      currentMembers = await getMembers();
      renderMembers(currentMembers);
    } catch (err) {
      console.error('[Admin Members] Error fetching members:', err);
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" class="py-6 text-center text-red-400">Error loading members list.</td>
          </tr>
        `;
      }
    }
  }

  function renderMembers(members) {
    if (!tableBody) return;
    if (!members || members.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="py-6 text-center text-gray-400">No members found. Click "+ Add Member" to create one.</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = members.map(m => `
      <tr class="hover:bg-white/5 transition">
        <td class="py-4 px-6 font-semibold text-white">${escapeHtml(m.full_name || '')}</td>
        <td class="py-4 px-6 text-gray-300">${escapeHtml(m.address || '')}</td>
        <td class="py-4 px-6">
          ${m.email ? `
            <a href="mailto:${escapeHtml(m.email)}" class="text-xs text-[#D2B866] hover:underline">
              ${escapeHtml(m.email)}
            </a>
          ` : '<span class="text-gray-500 text-xs">-</span>'}
        </td>
        <td class="py-4 px-6 text-right">
          <div class="flex items-center justify-end gap-2">
            <button type="button" data-edit-id="${m.member_id}" class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border border-[#D2B866]/30 text-[#D2B866] hover:bg-[#0E3A2D] transition">EDIT</button>
            <button type="button" data-delete-id="${m.member_id}" class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border border-red-500/30 text-red-400 hover:bg-red-950/40 transition">DELETE</button>
          </div>
        </td>
      </tr>
    `).join('');

    tableBody.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-id');
        const member = currentMembers.find(item => item.member_id === id);
        if (member) editMember(member);
      });
    });

    tableBody.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        handleDeleteMember(id);
      });
    });
  }

  function editMember(member) {
    if (memberIdInput) memberIdInput.value = member.member_id;
    const fullNameInput = document.getElementById('fullName');
    const addressInput = document.getElementById('address');
    const emailInput = document.getElementById('email');

    if (fullNameInput) fullNameInput.value = member.full_name || '';
    if (addressInput) addressInput.value = member.address || '';
    if (emailInput) emailInput.value = member.email || '';

    if (modalTitle) modalTitle.innerText = 'Edit Member Details';
    if (submitBtn) submitBtn.innerText = 'Update Member';

    openModal('memberModal');
  }

  async function handleDeleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await deleteMember(id);
      await loadMembers();
    } catch (err) {
      console.error('[Admin Members] Error deleting member:', err);
      alert('Failed to delete member: ' + (err.message || err));
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const id = memberIdInput ? memberIdInput.value : '';
      const data = {
        full_name: document.getElementById('fullName').value.trim(),
        address: document.getElementById('address').value.trim(),
        email: document.getElementById('email').value.trim()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'SAVING...';
      }

      try {
        if (id) {
          await updateMember(id, data);
        } else {
          await addMember(data);
        }

        if (successMsg) successMsg.classList.remove('hidden');

        setTimeout(() => {
          form.reset();
          if (memberIdInput) memberIdInput.value = '';
          if (modalTitle) modalTitle.innerText = 'Member Details';
          if (submitBtn) {
            submitBtn.innerText = 'Save Member';
            submitBtn.disabled = false;
          }
          closeModal('memberModal');
          if (successMsg) successMsg.classList.add('hidden');
          loadMembers();
        }, 800);

      } catch (err) {
        console.error('[Admin Members] Form submit error:', err);
        if (errorMsg) {
          errorMsg.innerText = 'Error saving member: ' + (err.message || 'Check inputs.');
          errorMsg.classList.remove('hidden');
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = id ? 'Update Member' : 'Save Member';
        }
      }
    });
  }

  const addBtn = document.querySelector('[data-modal-open="memberModal"]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      if (memberIdInput) memberIdInput.value = '';
      if (modalTitle) modalTitle.innerText = 'Add New Member';
      if (submitBtn) submitBtn.innerText = 'Save Member';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = currentMembers.filter(m => 
        (m.full_name && m.full_name.toLowerCase().includes(q)) ||
        (m.address && m.address.toLowerCase().includes(q))
      );
      renderMembers(filtered);
    });
  }

  loadMembers();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[match];
  });
}
