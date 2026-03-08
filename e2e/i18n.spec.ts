import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Internationalization (i18n)", () => {
  test("should redirect root to default locale (/en)", async ({ page }) => {
    // Navigate to root without locale
    await page.goto(`${BASE_URL}/`);
    // Should be redirected to /en by default
    await expect(page).toHaveURL(`${BASE_URL}/en`);
  });

  test("should render English UI and LTR down the DOM", async ({ page }) => {
    await page.goto(`${BASE_URL}/en/login`);

    // The html tag should have lang="en" and dir="ltr"
    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveAttribute("lang", "en");
    await expect(htmlElement).toHaveAttribute("dir", "ltr");

    // English title
    await expect(page.locator("h1")).toContainText("Sign In");
  });

  test("should render Arabic UI and RTL down the DOM", async ({ page }) => {
    await page.goto(`${BASE_URL}/ar/login`);

    // The html tag should have lang="ar" and dir="rtl"
    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveAttribute("lang", "ar");
    await expect(htmlElement).toHaveAttribute("dir", "rtl");

    // Arabic title
    await expect(page.locator("h1")).toContainText("تسجيل الدخول");
  });

  test("should switch language when the LanguageSwitcher is clicked", async ({
    page,
  }) => {
    // Start on English login page
    await page.goto(`${BASE_URL}/en/login`);
    await expect(page.locator("h1")).toContainText("Sign In");

    // Click to switch to Arabic
    await page.locator('button:has-text("العربية")').click();

    // URL should update to /ar/login
    await expect(page).toHaveURL(`${BASE_URL}/ar/login`);

    // Text should now be Arabic
    await expect(page.locator("h1")).toContainText("تسجيل الدخول");
  });
});
