/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/commands.ts',
        'src/lib/missions.ts',
      ],
      exclude: [
        'src/lib/filesystem.ts',
        'src/lib/supabase.ts',
        'src/components/**',
        'src/pages/**',
        'src/store/**',
        'src/types/**',
      ],
      reporter: ['text', 'html'],
    },
  },
  
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Regrouper les modules de node_modules
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react/jsx-runtime')) {
              return 'react-vendor'
            }
            if (id.includes('framer-motion') || id.includes('jspdf')) {
              return 'ui-vendor'
            }
            if (id.includes('recharts')) {
              return 'chart-vendor'
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }
            if (id.includes('react-icons')) {
              return 'icons-vendor'
            }
            // Tous les autres node_modules dans 'vendor'
            return 'vendor'
          }
        }
      }
    }
  }
})