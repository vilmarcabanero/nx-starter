/// <reference types="vitest" />
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      tsDecorators: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
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
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/target/**',
      '**/server/**',
      '**/tests/e2e/**',
      '**/tests/integration/**',
      '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.integration.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    coverage: {
      exclude: [
        // Config and setup files
        '**/*config*.{js,ts}',
        'src/vite-env.d.ts',
        'src/test/setup.ts',
        'src/test/test-utils.tsx',
        'get-coverage-json.js',
        // Test files
        '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '**/*.integration.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        // External directories (inherits from test.exclude)
        '**/node_modules/**',
        '**/dist/**',
        '**/tests/e2e/**',
        '**/tests/integration/**',
        '**/server/**',
      ],
    },
  },
})
