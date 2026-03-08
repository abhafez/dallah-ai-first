import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies and localStorage before each test
    await context.clearCookies();
  });

  test("should redirect unauthenticated users from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("should display the login page with form fields", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("h1")).toContainText(/sign in|login/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator('button[type="submit"]').click();
    // Zod validation messages should appear
    await expect(page.locator("p[data-slot='form-message']").first()).toBeVisible();
  });

  test("should show an error message on invalid credentials", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[name="email"]').fill("wrong@example.com");
    await page.locator('input[name="password"]').fill("wrongpassword");
    await page.locator('button[type="submit"]').click();
    // Error toast or message should appear (API returns 401)
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test("should redirect authenticated users away from /login to /dashboard", async ({
    page,
    context,
  }) => {
    // Simulate having a valid auth token
    await context.addCookies([
      {
        name: "auth_token",
        value: "mock-valid-token",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });
});
