import { defineConfig } from 'vite';

export default defineConfig({
  base: '/goblin-warren/',
  build: {
    outDir: 'dist',
  },
  test: {
    // vitest owns test/core only -- test/e2e is Playwright's (it imports
    // @playwright/test, which vitest cannot run as a test file).
    include: ['test/core/**/*.test.js'],
  },
});
