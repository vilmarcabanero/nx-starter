import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../node_modules/.vite/shared-domain',
  resolve: {
    alias: {
      '@nx-starter/shared-utils': path.resolve(__dirname, '../utils-core/src/index.ts'),
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/shared-domain',
      provider: 'v8' as const,
    },
  },
}));
