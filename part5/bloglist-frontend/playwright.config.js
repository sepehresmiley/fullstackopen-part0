import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5176', browserName: 'chromium' },
  webServer: [
    { command: 'NODE_ENV=test node ../../part4/blog-backend/e2e-server.js', url: 'http://127.0.0.1:3006/api/blogs', reuseExistingServer: !process.env.CI, timeout: 120000 },
    { command: 'npm run dev -- --host 127.0.0.1 --port 5176', url: 'http://127.0.0.1:5176', reuseExistingServer: !process.env.CI, timeout: 30000 },
  ],
})
