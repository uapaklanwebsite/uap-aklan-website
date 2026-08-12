import { getMembers, addMember, updateMember, deleteMember } from './members.js';
import { openModal, closeModal } from './admin.js';
import { filterMembers, normalizeMemberField, escapeHtml, displayMemberField, isMemberEmail, renderMemberEmail } from './member-utils.js';
import { loadingHtml, setButtonLoading, resetButton } from './ui-utils.js';

let currentMembers = [];
let isSearchActive = false;

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
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="4">${loadingHtml('Loading members...')}</td></tr>`;
    }

    try {
      currentMembers = await getMembers();
      isSearchActive = false;
      if (searchInput) searchInput.value = '';
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
      const emptyMessage = isSearchActive
        ? 'No members found.'
        : 'No members available. Click "+ Add Member" to create one.';

      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="py-6 text-center text-gray-400">${emptyMessage}</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = members.map(m => `
      <tr class="hover:bg-white/5 transition">
        <td class="py-4 px-6 font-semibold text-white break-words">${escapeHtml(m.full_name || '')}</td>
        <td class="py-4 px-6 text-gray-300 break-words">${escapeHtml(displayMemberField(m.address))}</td>
        <td class="py-4 px-6 break-all">
          ${isMemberEmail(m.email) ? renderMemberEmail(m.email) : '<span class="text-gray-500 text-xs">-</span>'}
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
        handleDeleteMember(id, btn);
      });
    });
  }

  function editMember(member) {
    if (memberIdInput) memberIdInput.value = member.member_id;
    const fullNameInput = document.getElementById('fullName');
    const addressInput = document.getElementById('address');
    const emailInput = document.getElementById('email');

    if (fullNameInput) fullNameInput.value = member.full_name || '';
    if (addressInput) addressInput.value = member.address === '-' ? '' : (member.address || '');
    if (emailInput) emailInput.value = member.email === '-' ? '' : (member.email || '');

    if (modalTitle) modalTitle.innerText = 'Edit Member Details';
    if (submitBtn) submitBtn.innerText = 'Update Member';

    openModal('memberModal');
  }

  async function handleDeleteMember(id, btn) {
    if (!confirm('Are you sure you want to delete this member?')) return;

    const originalText = btn ? btn.innerText : 'DELETE';
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'DELETING...';
    }

    try {
      await deleteMember(id);
      await loadMembers();
    } catch (err) {
      console.error('[Admin Members] Error deleting member:', err);
      alert('Failed to delete member: ' + (err.message || err));
      if (btn) {
        btn.disabled = false;
        btn.innerText = originalText;
      }
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const id = memberIdInput ? memberIdInput.value : '';
      const emailValue = document.getElementById('email').value.trim();

      if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        if (errorMsg) {
          errorMsg.innerText = 'Please enter a valid email address or leave the field empty.';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      const data = {
        full_name: document.getElementById('fullName').value.trim(),
        address: normalizeMemberField(document.getElementById('address').value),
        email: normalizeMemberField(emailValue)
      };

      setButtonLoading(submitBtn, 'SAVING...');

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
          resetButton(submitBtn, 'Save Member');
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
        resetButton(submitBtn, id ? 'Update Member' : 'Save Member');
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
      isSearchActive = e.target.value.trim().length > 0;
      const filtered = filterMembers(currentMembers, e.target.value);
      renderMembers(filtered);
    });
  }

  loadMembers();
}
