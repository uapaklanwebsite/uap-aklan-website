/**
 * Admin Panel UI & Auth Script for UAP Aklan Website
 * Handles:
 * - Mobile sidebar navigation drawer
 * - Modal dialogs (open, close, backdrop click, Escape key)
 * - Password visibility toggle
 * - File upload image previews
 * - Supabase Authentication integration (login, session protection, logout)
 */

import { login, logout, requireAuth, redirectIfAuthenticated } from './auth.js';
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  initAdminSidebar();
  initPasswordToggle();
  initModals();
  initImagePreviews();
  await initAdminAuth();
  await initDashboardStats();
});

/**
 * Dashboard Statistics — lightweight count queries
 */
async function initDashboardStats() {
  const statMembers = document.getElementById('statMembers');
  const statOfficers = document.getElementById('statOfficers');
  const statGallery = document.getElementById('statGallery');
  const statActivities = document.getElementById('statActivities');
  const statAwards = document.getElementById('statAwards');
  const statAccreditations = document.getElementById('statAccreditations');

  if (!statMembers && !statOfficers && !statGallery && !statActivities) return;

  const tables = [
    { table: 'members', el: statMembers },
    { table: 'officers', el: statOfficers },
    { table: 'gallery', el: statGallery },
    { table: 'activities', el: statActivities },
    { table: 'awards', el: statAwards },
    { table: 'accreditations', el: statAccreditations },
  ];

  tables.forEach(({ el }) => {
    if (el) el.textContent = '…';
  });

  await Promise.all(tables.map(async ({ table, el }) => {
    if (!el) return;
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`[Dashboard] Error counting ${table}:`, error);
        // Show a friendly fallback when counting fails
        el.textContent = '—';
        return;
      }

      el.textContent = typeof count === 'number' ? count : (count ?? '0');
    } catch (err) {
      console.error(`[Dashboard] Exception counting ${table}:`, err);
      el.textContent = '—';
    }
  }));
}

/**
 * Admin Authentication & Page Protection
 */
async function initAdminAuth() {
  const isLoginPage = window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/login');

  if (isLoginPage) {
    // If user is already logged in, redirect to dashboard.html
    await redirectIfAuthenticated();

    // Attach login form submission handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('loginButton');
        const loginError = document.getElementById('loginError');

        if (loginError) loginError.classList.add('hidden');

        const email = emailInput?.value?.trim();
        const password = passwordInput?.value;

        if (!email || !password) {
          if (loginError) {
            const errSpan = loginError.querySelector('span');
            if (errSpan) errSpan.innerText = 'Please enter both email and password.';
            loginError.classList.remove('hidden');
          }
          return;
        }

        const originalText = loginButton ? loginButton.innerText : 'LOGIN';
        if (loginButton) {
          loginButton.disabled = true;
          loginButton.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            SIGNING IN...
          `;
        }

        try {
          const { user, error } = await login(email, password);

          if (error || !user) {
            if (loginError) {
              const errSpan = loginError.querySelector('span');
              if (errSpan) {
                errSpan.innerText = error?.message || 'Invalid email or password credentials.';
              }
              loginError.classList.remove('hidden');
            }
            if (loginButton) {
              loginButton.disabled = false;
              loginButton.innerText = originalText;
            }
            return;
          }

          // Successful login -> Redirect to dashboard.html
          window.location.href = '/uap-aklan-admin/dashboard.html';

        } catch (err) {
          console.error('[Auth] Login exception:', err);
          if (loginError) {
            const errSpan = loginError.querySelector('span');
            if (errSpan) errSpan.innerText = 'An unexpected authentication error occurred.';
            loginError.classList.remove('hidden');
          }
          if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerText = originalText;
          }
        }
      });
    }
  } else {
    // Protected admin page -> Verify active session
    await requireAuth();

    // Bind Logout buttons
    const logoutLinks = document.querySelectorAll('a[href*="login.html"], #logoutBtn, [data-logout]');
    logoutLinks.forEach((link) => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
      });
    });
  }
}

/**
 * Mobile Sidebar Drawer Navigation
 */
function initAdminSidebar() {
  const toggleBtn = document.getElementById('admin-sidebar-toggle');
  const closeBtn = document.getElementById('admin-sidebar-close');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-sidebar-overlay');

  if (!toggleBtn || !sidebar) return;

  function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    if (overlay) overlay.classList.remove('hidden');
  }

  function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
  }

  toggleBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
}

/**
 * Password Visibility Toggle for Login Page
 */
function initPasswordToggle() {
  const toggleBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    const eyeIcon = toggleBtn.querySelector('.eye-icon');
    const eyeOffIcon = toggleBtn.querySelector('.eye-off-icon');

    if (eyeIcon && eyeOffIcon) {
      eyeIcon.classList.toggle('hidden', isPassword);
      eyeOffIcon.classList.toggle('hidden', !isPassword);
    }
  });
}

/**
 * Generic Modal Controls
 */
function initModals() {
  const openButtons = document.querySelectorAll('[data-modal-open]');
  openButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal-open');
      openModal(modalId);
    });
  });

  const closeButtons = document.querySelectorAll('[data-modal-close]');
  closeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Prefer explicit target id on the attribute, fallback to closest modal container
      const targetId = btn.getAttribute('data-modal-close');
      if (targetId) {
        closeModal(targetId);
        return;
      }
      const modal = btn.closest('.admin-modal') || btn.closest('[id]');
      if (modal) closeModal(modal.id);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('[id]:not(.hidden)');
      if (activeModal) closeModal(activeModal.id);
    }
  });
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');

  const errorArea = modal.querySelector('[id$="Error"]');
  const successArea = modal.querySelector('[id$="Success"]');
  if (errorArea) errorArea.classList.add('hidden');
  if (successArea) successArea.classList.add('hidden');
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  // Hide modal
  modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');

  // Reset form fields inside modal (if any)
  const forms = modal.querySelectorAll('form');
  forms.forEach((form) => {
    try {
      form.reset();
    } catch (err) {
      // ignore
    }
  });

  // Clear file inputs and preview containers
  const fileInputs = modal.querySelectorAll('input[type="file"]');
  fileInputs.forEach((fi) => {
    try { fi.value = ''; } catch (e) { /* ignore */ }
  });

  // Clear preview containers. Matches existing id suffix, common helper class, or data-preview attributes
  const previews = modal.querySelectorAll('[id$="Preview"], .image-preview, [data-preview]');
  previews.forEach((p) => {
    try {
      // If the preview is an <img> element, clear its src; otherwise clear innerHTML
      if (p.tagName && p.tagName.toLowerCase() === 'img') {
        p.src = '';
      } else {
        p.innerHTML = '';
      }
      // Remove background-image if present
      try { p.style && (p.style.backgroundImage = 'none'); } catch (e) { /* ignore */ }
    } catch (e) { /* ignore */ }
  });

  // Clear error/success UI
  const errorAreas = modal.querySelectorAll('[id$="Error"]');
  const successAreas = modal.querySelectorAll('[id$="Success"]');
  errorAreas.forEach((ea) => ea.classList.add('hidden'));
  successAreas.forEach((sa) => sa.classList.add('hidden'));
}

/**
 * Image Upload Live Preview using FileReader
 */
function initImagePreviews() {
  const fileInputs = [
    { inputId: 'officerImage', previewId: 'officerPreview' },
    { inputId: 'galleryImage', previewId: 'galleryPreview' },
    { inputId: 'activityImage', previewId: 'activityPreview' },
    { inputId: 'awardImage', previewId: 'awardPreview' },
  ];

  fileInputs.forEach(({ inputId, previewId }) => {
    const input = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewId);

    if (!input || !previewContainer) return;

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewContainer.innerHTML = `
            <div class="relative group rounded-lg overflow-hidden border border-[#D2B866]/30 bg-[#0C2D22]">
              <img src="${e.target.result}" alt="Preview" class="w-full h-48 object-contain py-2 bg-[#062E23]" />
              <p class="text-xs text-center py-1 bg-[#0A3428] text-gray-300 font-medium truncate px-2">${file.name}</p>
            </div>
          `;
        };
        reader.readAsDataURL(file);
      }
    });
  });
}
