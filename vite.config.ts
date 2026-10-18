import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { runWorkspaceAutoSync } from './scripts/auto-sync-workspaces.js';

function hendyWorkspaceAutoSyncPlugin(): Plugin {
  return {
    name: 'hendy-workspace-auto-sync',
    buildStart() {
      try {
        runWorkspaceAutoSync();
      } catch (err) {
        console.warn('[Auto-Sync] Cảnh báo đồng bộ:', err);
      }
    },
    handleHotUpdate({ file }) {
      if (
        file.includes('/hendy-Admini/') ||
        file.includes('/studio-web/') ||
        file.includes('/admin-web/')
      ) {
        try {
          runWorkspaceAutoSync();
        } catch (err) {
          console.warn('[Auto-Sync] Cảnh báo cập nhật nóng:', err);
        }
      }
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '@hendy-admini': path.resolve(__dirname, 'hendy-Admini'),
      '@studio-web': path.resolve(__dirname, 'studio-web'),
      '@admin-web': path.resolve(__dirname, 'admin-web'),
    },
  },
  plugins: [
    hendyWorkspaceAutoSyncPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        id: '/',
        name: 'Hendy Vietsub Pro - Cinema Video Studio',
        short_name: 'HendyStudio',
        description: 'AutoSub SaaS & Vietsub Studio Pro - AI subtitle generator, cinema translation, and multi-track video editor.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        categories: ['multimedia', 'video', 'utilities', 'productivity'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api/, /^\/health/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-libraries-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        ...(process.env.HENDY_BUILD_TARGET === 'public-pages' ? {} : {
          admin: path.resolve(__dirname, 'apps/admin-web/index.html'),
        }),
        studio: path.resolve(__dirname, 'apps/studio-web/index.html'),
      },
    },
  },
});
