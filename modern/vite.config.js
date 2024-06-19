import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

/* eslint-disable no-template-curly-in-string */
export default defineConfig(() => ({
  server: {
    // port: 3000,
    proxy: {
      '/api/socket': 'ws://ec2-18-143-114-161.ap-southeast-1.compute.amazonaws.com:8082', //localhost , ec2-18-143-114-161.ap-southeast-1.compute.amazonaws.com
      '/api': 'http://ec2-18-143-114-161.ap-southeast-1.compute.amazonaws.com:8082',
    },
  },
  build: {
    outDir: '../modern/dist',
  },
  plugins: [
    svgr(),
    react(),
    VitePWA({
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
      },
      manifest: {
        short_name: '${title}',
        name: '${description}',
        theme_color: '${colorPrimary}',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
}));
