import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop-1280",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "iphone-se",
      use: {
        ...devices["iPhone SE"],
        defaultBrowserType: "chromium",
      },
    },
    {
      name: "iphone-14",
      use: {
        ...devices["iPhone 14"],
        defaultBrowserType: "chromium",
      },
    },
    {
      name: "pixel-7",
      use: {
        ...devices["Pixel 7"],
        defaultBrowserType: "chromium",
      },
    },
    {
      name: "narrow-320",
      use: {
        browserName: "chromium",
        viewport: { width: 320, height: 568 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "ipad-portrait",
      use: {
        ...devices["iPad Mini"],
        defaultBrowserType: "chromium",
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
