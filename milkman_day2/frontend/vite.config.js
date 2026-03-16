import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      }
    }
  },
  server: {
    proxy: {
      '/staff': 'http://127.0.0.1:8000',
      '/customer': 'http://127.0.0.1:8000',
      '/category': 'http://127.0.0.1:8000',
      '/product': 'http://127.0.0.1:8000',
      '/subscription': 'http://127.0.0.1:8000',
      '/milk-admin': 'http://127.0.0.1:8000',
      '/order': 'http://127.0.0.1:8000',
    }
  }
})
