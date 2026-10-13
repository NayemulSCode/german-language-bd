import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
        // lesson JSON chunks and (later) audio are cached so lessons work offline
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: { cacheName: 'audio', expiration: { maxEntries: 2000 } },
          },
        ],
      },
      manifest: {
        name: 'Deutsch für Bangla-Sprecher',
        short_name: 'Deutsch BD',
        description: 'জার্মান ভাষা শিখুন A1 থেকে B1 — বাংলা ও ইংরেজি সহায়তাসহ',
        lang: 'bn',
        start_url: '/',
        display: 'standalone',
        background_color: '#F3F5F9',
        theme_color: '#17203A',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
})
