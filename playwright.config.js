// playwright.config.js
//
// Chromium is preinstalled at /opt/pw-browsers/chromium (do not run
// `playwright install`). Every project below uses it via
// `launchOptions.executablePath`.
//
// Devices: `devices['iPhone 15']` is present in the installed Playwright
// version (1.56.1) and is what VISION_V2.md §8 and the P0 task brief ask
// for, so it is used as-is. `devices['iPhone SE (3rd gen)']` is added by
// P5 (VISION_V2.md §11 P5: "npm test green on iPhone 15 and iPhone SE
// (3rd gen)") -- the operator's smallest likely real device, so every
// e2e spec also runs against its shorter/narrower viewport. Both presets
// default to WebKit (`defaultBrowserType: 'webkit'`), but only Chromium
// is available here, so `browserName: 'chromium'` is set explicitly on
// each project while keeping the device's viewport/UA/touch/DPR emulation.

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
    {
      name: 'iPhone SE (3rd gen)',
      use: {
        ...devices['iPhone SE (3rd gen)'],
        browserName: 'chromium',
        launchOptions: {
          executablePath: CHROMIUM_PATH,
        },
      },
    },
  ],
  // Always build before serving, and never reuse a running server: e2e must
  // test the current source, not whatever dist/ happens to be on disk.
  webServer: {
    command: `npx vite build && npx vite preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
