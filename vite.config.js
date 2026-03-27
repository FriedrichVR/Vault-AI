import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-n8n': {
        target: 'https://n8n.srv1202174.hstgr.cloud',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-n8n/, '')
      }
    }
  }
})
