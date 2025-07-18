import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../node_modules/.vite/shared-application',
  resolve: {
    alias: {
      '@nx-starter/shared-domain': path.resolve(__dirname, '../domain-core/src/index.ts'),
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
      reportsDirectory: '../coverage/shared-application',
      provider: 'v8' as const,
    },
    setupFiles: ['reflect-metadata'],
  },
}));
