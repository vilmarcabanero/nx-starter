/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
    })
  ],
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/e2e/**',
      '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/target/**',
    ],
    coverage: {
      exclude: [
        '**/*config*.{js,ts}',
        'src/vite-env.d.ts',
        '**/tests/e2e/**',
        'src/test/**',
        '**/dist/**',
      ],
    },
  },
})
