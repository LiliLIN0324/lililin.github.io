import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const BUILD_LIB = process.env.BUILD_LIB === 'true' || process.env.BUILD_LIB === '1' || process.env.BUILD_LIB === 'true';

export default defineConfig({
  base: './', 
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600, // Plotly is large
    ...(BUILD_LIB
      ? {
          lib: {
            entry: resolve(__dirname, 'src/embed.tsx'),
            name: 'ClusterVisualizer',
            fileName: 'cluster-visualizer',
            formats: ['es', 'umd'],
          },
          rollupOptions: {
            // Externals (peer deps) can be listed here if desired
            external: ['react', 'react-dom'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
              },
            },
          },
        }
      : {}),
  },
});