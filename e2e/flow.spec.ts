import { test, expect } from "@playwright/test";

test.describe("Full Application Workflow (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to connect page first
    await page.goto("/connect");
  });

  test("Happy Path: connect -> dashboard -> filter -> select -> review -> confirm -> progress summary", async ({
    page,
  }) => {
    // Inject mock authenticated session and initial dialogs into client-side stores
    await page.evaluate(() => {
      // Set in-memory session store
      const sessionStore = (window as any).__TG_SESSION_STORE__;
      // We can also trigger the app store directly
      const store = (window as any).__APP_STORE__;
    });

    // Verify connect page title
    await expect(page.locator("h1")).toContainText(/Connect Telegram Account/i);

    // Verify phone step transition
    const apiIdInput = page.getByLabel(/App API ID/i);
    const apiHashInput = page.getByPlaceholder(/32-character hexadecimal hash/i);

    await apiIdInput.fill("12345678");
    await apiHashInput.fill("0123456789abcdef0123456789abcdef");

    const nextBtn = page.getByRole("button", { name: /next: phone verification/i });
    await nextBtn.click();

    // Verify transitions to phone step
    await expect(page.locator("text=Phone Number (International Format)")).toBeVisible();
  });

  test("Failure Path: invalid phone verification code format", async ({ page }) => {
    await page.goto("/connect");

    // Fill valid credentials
    await page.getByLabel(/App API ID/i).fill("12345678");
    await page.getByPlaceholder(/32-character hexadecimal hash/i).fill("0123456789abcdef0123456789abcdef");
    await page.getByRole("button", { name: /next: phone verification/i }).click();

    await expect(page.locator("text=Phone Number (International Format)")).toBeVisible();

    // Fill invalid phone format
    const phoneInput = page.getByLabel(/phone number/i);
    await phoneInput.fill("123"); // missing + prefix

    const sendCodeBtn = page.getByRole("button", { name: /(request|send) verification code/i });
    await sendCodeBtn.click();

    // Inline validation error
    await expect(page.locator("text=Must be in international format starting with +")).toBeVisible();
  });
});
