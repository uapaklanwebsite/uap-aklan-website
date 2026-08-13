import { getSiteContent } from './site-content.js';
import { loadingHtml } from './ui-utils.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (match) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[match];
  });
}

function setLoadingState() {
  const welcomeTitle = document.getElementById('welcomeTitle');
  const welcomeContent = document.getElementById('welcomeContent');
  const missionTitle = document.getElementById('missionTitle');
  const missionContent = document.getElementById('missionContent');
  const visionTitle = document.getElementById('visionTitle');
  const visionContent = document.getElementById('visionContent');

  const loading = loadingHtml('Loading...');

  if (welcomeTitle) welcomeTitle.innerHTML = loading;
  if (welcomeContent) welcomeContent.innerHTML = '';
  if (missionTitle) missionTitle.innerHTML = loading;
  if (missionContent) missionContent.innerHTML = '';
  if (visionTitle) visionTitle.innerHTML = loading;
  if (visionContent) visionContent.innerHTML = '';
}

function renderSection(sectionKey, record) {
  const titleEl = document.getElementById(`${sectionKey}Title`);
  const contentEl = document.getElementById(`${sectionKey}Content`);

  if (!titleEl || !contentEl) return;

  if (!record) {
    titleEl.textContent = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
    contentEl.innerHTML = '<p class="text-gray-400">No content available.</p>';
    return;
  }

  titleEl.textContent = record.title || '';
  contentEl.innerHTML = `<p class="leading-8 text-gray-300 text-justify whitespace-pre-line break-words">${escapeHtml(record.content || '')}</p>`;
}

function showError() {
  const sections = ['welcome', 'mission', 'vision'];
  sections.forEach((key) => {
    const titleEl = document.getElementById(`${key}Title`);
    const contentEl = document.getElementById(`${key}Content`);
    if (titleEl) titleEl.textContent = '';
    if (contentEl) {
      contentEl.innerHTML = '<p class="text-red-400">Error loading content.</p>';
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('welcomeContent')) return;

  setLoadingState();

  try {
    const sections = await getSiteContent();
    const map = {};
    if (sections) {
      sections.forEach((s) => { map[s.section_key] = s; });
    }

    renderSection('welcome', map.welcome);
    renderSection('mission', map.mission);
    renderSection('vision', map.vision);
  } catch (err) {
    console.error('[Site Content Page] Error loading content:', err);
    showError();
  }
});
