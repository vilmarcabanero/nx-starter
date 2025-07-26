import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:3000';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Global setup for test environment */
  globalSetup: require.resolve('./src/utils/global-setup.ts'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Test timeout and retry settings for API backend */
  timeout: 60000, // 60 seconds for API operations
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  retries: 1, // Retry once on failure
  /* Workers should run serially to avoid conflicts with shared backend */
  workers: 1,
  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npx nx run api:serve',
      url: 'http://localhost:4000',
      reuseExistingServer: true,
      cwd: workspaceRoot,
      env: {
        NODE_ENV: 'development',
        DB_TYPE: 'memory',
      },
    },
    {
      command: 'npx nx run web:serve',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      cwd: workspaceRoot,
      env: {
        VITE_USE_API_BACKEND: 'true',
        VITE_API_BASE_URL: 'http://localhost:4000',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment for other browsers
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    }, */

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
