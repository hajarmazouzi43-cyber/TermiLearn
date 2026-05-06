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
})