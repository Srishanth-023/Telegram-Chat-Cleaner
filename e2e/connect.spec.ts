import { test, expect } from "@playwright/test";

test.describe("Connect Flow & Route Guards", () => {
  test("redirects unauthenticated users trying to access protected routes", async ({ page }) => {
    // Attempt to access dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/connect/);

    // Attempt to access review
    await page.goto("/review");
    await expect(page).toHaveURL(/.*\/connect/);

    // Attempt to access progress
    await page.goto("/progress");
    await expect(page).toHaveURL(/.*\/connect/);
  });

  test("validates credentials form fields with inline feedback", async ({ page }) => {
    await page.goto("/connect");

    // Stepper header
    await expect(page.locator("h1")).toContainText(/Connect Telegram Account/i);

    // Fill invalid api_id and api_hash
    const apiIdInput = page.getByLabel(/App API ID/i);
    const apiHashInput = page.getByPlaceholder(/32-character hexadecimal hash/i);

    await apiIdInput.fill("-123");
    await apiHashInput.fill("short");

    const nextBtn = page.getByRole("button", { name: /next: phone verification/i });
    await nextBtn.click();

    // Verify validation errors appear
    await expect(page.locator("text=API ID must be a positive integer")).toBeVisible();
    await expect(page.locator("text=API Hash must be a 32-character hexadecimal string")).toBeVisible();
  });

  test("toggles App Hash visibility", async ({ page }) => {
    await page.goto("/connect");

    const apiHashInput = page.getByPlaceholder(/32-character hexadecimal hash/i);
    await expect(apiHashInput).toHaveAttribute("type", "password");

    const toggleBtn = page.getByRole("button", { name: /show/i });
    await toggleBtn.click();
    await expect(apiHashInput).toHaveAttribute("type", "text");

    const hideBtn = page.getByRole("button", { name: /hide/i });
    await hideBtn.click();
    await expect(apiHashInput).toHaveAttribute("type", "password");
  });
});
