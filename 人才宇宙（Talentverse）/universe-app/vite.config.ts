import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Client-side SPA only. No SSR, no RSC — server-* rules don't apply.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
})
