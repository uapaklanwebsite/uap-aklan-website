/**
 * Footer module for UAP Aklan Website
 * Controls:
 * - Dynamic copyright year update
 */

export function initFooter() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
}
