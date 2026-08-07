/**
 * Navbar module for UAP Aklan Website
 * Controls:
 * - Hamburger menu toggle
 * - Active page link highlighting based on window location
 * - Closing mobile menu on link click and Escape key
 */

export function initNavbar() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');

  if (!menuBtn || !mobileMenu) return;

  function openMenu() {
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.remove('hidden');
    if (iconOpen) iconOpen.classList.add('hidden');
    if (iconClose) iconClose.classList.remove('hidden');
  }

  function closeMenu() {
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.add('hidden');
    if (iconOpen) iconOpen.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
  }

  function toggleMenu() {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Toggle button click listener
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close mobile menu when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      menuBtn.getAttribute('aria-expanded') === 'true' &&
      !mobileMenu.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Attach auto-close listener to all mobile nav links
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Highlight active link across both desktop and mobile navigation
  highlightActiveLink();
}

/**
 * Highlight active page navigation link based on current location pathname
 */
export function highlightActiveLink() {
  let currentPath = window.location.pathname;

  // Normalize path (handle root '/' as '/index.html')
  if (currentPath === '/' || currentPath === '') {
    currentPath = '/index.html';
  }

  const navLinks = document.querySelectorAll('a[data-nav-link]');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Check exact match or normalized match
    const isMatch =
      currentPath === href ||
      currentPath.endsWith(href) ||
      (currentPath === '/index.html' && (href === '/' || href === '/index.html'));

    if (isMatch) {
      link.classList.add('bg-gray-100', 'text-uap-blue', 'font-bold');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('bg-gray-100', 'text-uap-blue', 'font-bold');
      link.removeAttribute('aria-current');
    }
  });
}
