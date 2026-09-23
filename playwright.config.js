// playwright.config.js
//
// Chromium is preinstalled at /opt/pw-browsers/chromium (do not run
// `playwright install`). Every project below uses it via
// `launchOptions.executablePath`.
//
// Device: `devices['iPhone 15']` is present in the installed Playwright
// version (1.56.1) and is what VISION_V2.md §8 and the P0 task brief ask
// for, so it is used as-is. Its preset defaults to WebKit
// (`defaultBrowserType: 'webkit'`), but only Chromium is available here,
// so `browserName: 'chromium'` is set explicitly while keeping the
// device's viewport/UA/touch/DPR emulation.

import { defineConfig, devices } from '@playwright/test';

const CHROMIUM_PATH = '/opt/pw-browsers/chromium';
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}/goblin-warren/`;

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'iPhone 15',
      use: {
        ...devices['iPhone 15'],
        browserName: 'chromium',
        launchOptions: {
          executablePath: CHROMIUM_PATH,
        },
      },
    },
  ],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
