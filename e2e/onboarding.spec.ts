import { test, expect } from "@playwright/test";

test.describe("Onboarding Page (Landing)", () => {
  test("renders hero, trust badges, API credentials guide, and links to connect", async ({ page }) => {
    await page.goto("/");

    // Verify title and main headings
    await expect(page).toHaveTitle(/Telegram Chat Cleaner/i);
    await expect(page.locator("h1")).toContainText(/Bulk Remove Unwanted Telegram Conversations/i);

    // Verify 3-point trust panel
    await expect(page.locator("text=Runs in Your Browser")).toBeVisible();
    await expect(page.locator("text=Never Deletes for Others")).toBeVisible();
    await expect(page.locator("text=Open Source & Inspectable")).toBeVisible();

    // Verify step-by-step guide to get credentials
    await expect(page.locator("text=How to Get Your Telegram API Credentials")).toBeVisible();
    await expect(page.locator("text=my.telegram.org")).toBeVisible();

    // Verify "Get Started" CTA navigates to /connect
    const getStartedBtn = page.getByRole("link", { name: /get started/i });
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    await expect(page).toHaveURL(/.*\/connect/);
    await expect(page.locator("h1")).toContainText(/Connect Telegram Account/i);
  });
});
