import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5000,
    host: true,
    allowedHosts: [
      'localhost.com',
      'doc.localhost.com',
      'logs.localhost.com',
      'astraeus.localhost.com',
      'modelnex.ai',
      'docs.modelnex.ai',
      'logs.modelnex.ai',
      'api.modelnex.ai',
    ],
    open: false,
  },
})
