/**
 * Shared member display and search utilities
 */

export function filterMembers(members, query) {
  const q = query.toLowerCase().trim();
  if (!q) return members;
  return members.filter((m) =>
    (m.full_name && m.full_name.toLowerCase().includes(q)) ||
    (m.address && m.address.toLowerCase().includes(q)) ||
    (m.email && m.email.toLowerCase().includes(q))
  );
}

export function normalizeMemberField(value) {
  const trimmed = (value || '').trim();
  return trimmed || '-';
}

export function displayMemberField(value) {
  const trimmed = (value || '').trim();
  return trimmed && trimmed !== '-' ? trimmed : '-';
}

export function isMemberEmail(value) {
  const trimmed = (value || '').trim();
  return trimmed && trimmed !== '-';
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (match) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[match];
  });
}

export function renderMemberEmail(email) {
  if (isMemberEmail(email)) {
    const safe = escapeHtml(email);
    return `<a href="mailto:${safe}" class="text-sm text-[#D2B866] hover:underline transition break-all whitespace-normal">${safe}</a>`;
  }
  return '<span class="text-gray-500">-</span>';
}
