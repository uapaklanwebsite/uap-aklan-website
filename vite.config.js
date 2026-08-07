import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        officers: resolve(import.meta.dirname, 'officers.html'),
        directory: resolve(import.meta.dirname, 'directory.html'),
        activities: resolve(import.meta.dirname, 'activities.html'),
        gallery: resolve(import.meta.dirname, 'gallery.html'),
        membership: resolve(import.meta.dirname, 'membership.html'),
        dues: resolve(import.meta.dirname, 'dues.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
        adminLogin: resolve(import.meta.dirname, 'admin/login.html'),
        adminDashboard: resolve(import.meta.dirname, 'admin/dashboard.html'),
      },
    },
  },
});

