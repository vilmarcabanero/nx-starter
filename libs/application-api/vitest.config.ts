import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../node_modules/.vite/application-api',
  resolve: {
    alias: {
      '@nx-starter/domain-core': path.resolve(__dirname, '../domain-core/src/index.ts'),
      '@nx-starter/utils-core': path.resolve(__dirname, '../utils-core/src/index.ts'),
      '@nx-starter/application-shared': path.resolve(__dirname, '../application-shared/src/index.ts'),
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/application-api',
      provider: 'v8' as const,
    },
    setupFiles: ['reflect-metadata'],
  },
}));