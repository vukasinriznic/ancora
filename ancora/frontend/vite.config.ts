import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Framer Motion — najteža zavisnost, zasebni chunk
            if (id.includes('framer-motion')) return 'motion'
            // React jezgro — rijetko se mijenja → dugotrajni cache
            if (id.includes('react')) return 'react-vendor'
          }
        },
      },
    },
  },
})
