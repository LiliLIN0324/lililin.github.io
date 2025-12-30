import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html', // 输出分析报告
      open: true,                   // 打包完成后自动打开
      gzipSize: true,               // 显示 gzip 体积
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 把大库单独拆 chunk
            if (id.includes('three')) return 'threejs';
            if (id.includes('maplibre')) return 'maplibre';
            if (id.includes('lucide-react')) return 'icons';
            return 'vendor';
          }

          // 把 src 下的特定大模块拆成单独 chunk
          if (id.includes('/src/components/URplatform')) return 'URplatform';
          if (id.includes('/src/components/App')) return 'App';
        }
      }
    }
  }
});

