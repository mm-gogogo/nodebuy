import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

// 端口可配置：默认 3000，本地若被占用可用 PORT=3100 pnpm test:e2e 覆盖。
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const baseURL = process.env.BASE_URL || `http://localhost:${PORT}`

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    // 本地复用已在跑的本项目 dev；CI 总是全新启动，避免误用占用端口的其它服务。
    reuseExistingServer: !process.env.CI,
    url: baseURL,
    timeout: 120_000,
  },
})
