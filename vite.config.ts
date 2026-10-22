import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'logo.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      workbox: {
        // lesson JSON chunks and (later) audio are cached so lessons work offline
        globPatterns: ['**/*.{js,css,html,svg,json,png}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: { cacheName: 'audio', expiration: { maxEntries: 2000 } },
          },
        ],
      },
      manifest: {
        name: 'GLBD',
        short_name: 'GLBD',
        description: 'Learn German A1 to B1 with Bangla and English support · জার্মান ভাষা শিখুন A1 থেকে B1',
        lang: 'bn',
        start_url: '/',
        display: 'standalone',
        background_color: '#F3F5F9',
        theme_color: '#17203A',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})
