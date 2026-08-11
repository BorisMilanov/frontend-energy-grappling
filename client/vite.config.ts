import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  // The frontend dev server runs on 3000 (the API is on 8000). strictPort so it fails
  // loudly instead of silently sliding to 3001, which the backend's CORS list would reject.
  server: {
    port: 3000,
    strictPort: true,
  },
})
