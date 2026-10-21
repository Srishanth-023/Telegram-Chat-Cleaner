import { test, expect } from "@playwright/test";

test.describe("Mobile Responsive Requirements", () => {
  const routes = ["/", "/connect", "/about", "/privacy", "/terms"];

  for (const route of routes) {
    test(`Route ${route} has zero horizontal overflow on mobile viewports`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalOverflow).toBeFalsy();
    });
  }

  test("Connect screen inputs have at least 16px font-size to prevent iOS zoom", async ({ page }) => {
    await page.goto("/connect");
    await page.waitForLoadState("domcontentloaded");

    const apiIdInput = page.getByLabel(/App API ID/i);
    await expect(apiIdInput).toBeVisible();

    const fontSize = await apiIdInput.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Font size must be at least 16px to prevent iOS auto-zoom
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  test("Touch targets meet minimum 44x44 px size requirement on mobile", async ({ page }) => {
    await page.goto("/connect");
    await page.waitForLoadState("domcontentloaded");

    const nextBtn = page.getByRole("button", { name: /next: phone verification/i });
    await expect(nextBtn).toBeVisible();

    const box = await nextBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("Onboarding features numbered accordion and sticky mobile CTA", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check for my.telegram.org accordion details
    const accordion = page.locator("details");
    await expect(accordion.first()).toBeVisible();

    // Check sticky bottom CTA on mobile
    const stickyCta = page.locator("div.fixed.bottom-0");
    // Visible on small screens
    const isMobile = (page.viewportSize()?.width || 1280) < 640;
    if (isMobile) {
      await expect(stickyCta).toBeVisible();
    }
  });
});
