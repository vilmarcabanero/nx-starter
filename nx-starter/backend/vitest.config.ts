import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DB_TYPE: 'memory',
      DB_ORM: 'native',
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/prisma/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/e2e/**',
      '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    setupFiles: ['./src/test/setup.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../coverage/backend',
      exclude: [
        '**/*config*.{js,ts}',
        '**/dist/**',
        '**/tests/e2e/**',
        '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '**/prisma/**',
        '**/postman*',
        '**/*.d.ts',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@nx-starter/shared-domain': path.resolve(__dirname, '../libs/shared-domain/src/index.ts'),
      '@nx-starter/shared-application': path.resolve(__dirname, '../libs/shared-application/src/index.ts'),
      '@nx-starter/shared-utils': path.resolve(__dirname, '../libs/shared-utils/src/index.ts'),
    },
  },
});