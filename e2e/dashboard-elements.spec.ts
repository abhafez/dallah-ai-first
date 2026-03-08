import { test, expect } from "@playwright/test";

test.describe("Dashboard Elements", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard page before each test
    await page.goto("http://localhost:3000/dashboard");
  });

  test("should render the dashboard page", async ({ page }) => {
    // Verify the page title or a main heading
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText("Dashboard");
  });

  test("should render and submit the basic form", async ({ page }) => {
    // Fill out the form fields
    await page.locator('input[name="username"]').fill("testuser");
    await page.locator('input[name="email"]').fill("test@example.com");

    // Submit the form
    await page.locator('button[type="submit"]').click();

    // Add assertions for successful submission (e.g., a toast or success message)
    // For now, just ensure the button is clickable and the form exists
    await expect(page.locator("form")).toBeVisible();
  });

  test("should render the paginated table", async ({ page }) => {
    // Check if the table is visible
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Check for some expected table headers
    await expect(table.locator("th").filter({ hasText: "Name" })).toBeVisible();
    await expect(
      table.locator("th").filter({ hasText: "Status" }),
    ).toBeVisible();

    // Check if table rows exist
    const rows = table.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    // Check for pagination controls
    const pagination = page.locator('nav[aria-label="pagination"]');
    await expect(pagination).toBeVisible();

    // Optional: test clicking next page if applicable in the mock data
    // const nextButton = pagination.locator('button:has-text("Next")');
    // await expect(nextButton).toBeVisible();
  });
});
