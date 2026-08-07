/**
 * Main App Entry Module for UAP Aklan Website
 * Loads shared header (navbar) and footer components into placeholder containers,
 * then initializes their respective interactive JavaScript behaviors.
 */

import { initNavbar } from './navbar.js';
import { initFooter } from './footer.js';

async function loadComponent(placeholderId, componentPath) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return false;

  try {
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`Failed to load component: ${componentPath} (Status ${response.status})`);
    }
    const html = await response.text();
    placeholder.innerHTML = html;
    return true;
  } catch (error) {
    console.error(`[App] Error loading ${componentPath}:`, error);
    return false;
  }
}

async function initApp() {
  // Load shared Navbar & Footer concurrently
  const [navbarLoaded, footerLoaded] = await Promise.all([
    loadComponent('navbar-placeholder', '/components/navbar.html'),
    loadComponent('footer-placeholder', '/components/footer.html'),
  ]);

  if (navbarLoaded) {
    initNavbar();
  }

  if (footerLoaded) {
    initFooter();
  }
}

// Execute app initialization when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
