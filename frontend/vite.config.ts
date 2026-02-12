import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET ?? 'https://localhost:5001';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }

            if (id.includes('@tanstack')) {
              return 'tanstack';
            }

            if (id.includes('@radix-ui')) {
              return 'radix';
            }

            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }

            if (id.includes('zod')) {
              return 'validation';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/vitest.setup.ts',
      globals: true,
      include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
