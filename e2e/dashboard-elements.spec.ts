import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Dashboard Elements", () => {
  test.beforeEach(async ({ context }) => {
    // Mock the authenticated state by setting the auth_token cookie
    await context.addCookies([
      {
        name: "auth_token",
        value: "mock-valid-token",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("should render the dashboard page layout correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/en/dashboard`);
    
    // Verify the page title
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText("Dashboard");
    
    // Verify the Sign Out button is present
    await expect(page.locator('button:has-text("Sign Out")')).toBeVisible();
  });
  
  test("should click the Sign Out button and redirect to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/en/dashboard`);
    
    // Click Sign Out
    await page.locator('button:has-text("Sign Out")').click();
    
    // The useLogout mutation clears the session and redirects to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
