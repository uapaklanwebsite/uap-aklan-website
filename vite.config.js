import { resolve } from 'path';
import { defineConfig } from 'vite';

import injectHTML from 'vite-plugin-html-inject';

export default defineConfig({
  root: '.',
  plugins: [injectHTML()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        officers: resolve(import.meta.dirname, 'officers.html'),
        directory: resolve(import.meta.dirname, 'directory.html'),
        activities: resolve(import.meta.dirname, 'activities.html'),
        governance: resolve(import.meta.dirname, 'governance.html'),
        membership: resolve(import.meta.dirname, 'membership.html'),
        dues: resolve(import.meta.dirname, 'dues.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
        adminLogin: resolve(import.meta.dirname, 'uap-aklan-admin/login.html'),
        adminDashboard: resolve(import.meta.dirname, 'uap-aklan-admin/dashboard.html'),
        adminMembers: resolve(import.meta.dirname, 'uap-aklan-admin/members.html'),
        adminOfficers: resolve(import.meta.dirname, 'uap-aklan-admin/officers.html'),
        adminGallery: resolve(import.meta.dirname, 'uap-aklan-admin/gallery.html'),
        adminActivities: resolve(import.meta.dirname, 'uap-aklan-admin/activities.html'),
        adminHistory: resolve(import.meta.dirname, 'uap-aklan-admin/history.html'),
        adminSiteContent: resolve(import.meta.dirname, 'uap-aklan-admin/site-content.html'),
        adminAwards: resolve(import.meta.dirname, 'uap-aklan-admin/awards.html'),
        adminMembership: resolve(import.meta.dirname, 'uap-aklan-admin/membership.html'),
        adminDues: resolve(import.meta.dirname, 'uap-aklan-admin/dues.html'),
        adminGovernance: resolve(import.meta.dirname, 'uap-aklan-admin/governance.html'),
        adminAccreditations: resolve(import.meta.dirname, 'uap-aklan-admin/accreditations.html'),
      },
    },
  },
});

