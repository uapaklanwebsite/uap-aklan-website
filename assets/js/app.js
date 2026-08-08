/**
 * Main App Entry Module for UAP Aklan Website
 * Loads shared header (navbar) and footer components into placeholder containers,
 * then initializes their respective interactive JavaScript behaviors.
 */

import { initNavbar } from './navbar.js';
import { initFooter } from './footer.js';

function initApp() {
  initNavbar();
  initFooter();
}

// Execute app initialization when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
