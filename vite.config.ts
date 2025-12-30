import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的库打包到独立的 vendor 文件中
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'threejs';
            if (id.includes('maplibre')) return 'maplibre';
            return 'vendor';
        }
       }
      }
    }
  }
});