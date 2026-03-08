import { test, expect } from "@playwright/test";

test.describe("Users Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Login first - next-intl as-needed prefix means /login instead of /en/login
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "12345678");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");
  });

  test("should successfully add a new user", async ({ page }) => {
    await page.goto("/dashboard/users/add");

    await page.fill('input[name="name"]', "E2E Test User");
    await page.fill('input[name="mobile"]', "0500000000");
    await page.fill('input[name="nationalId"]', "1010101010");

    // Select Language - Use more generic selector for the trigger
    await page.click('button:has-text("Select language")');
    await page.click('role=option[name="English"]');

    // Select Level
    await page.click('button:has-text("Select level")');
    await page.click('role=option[name="Beginner"]');

    // Select Vehicle
    await page.click('button:has-text("Select vehicle")');
    await page.click('role=option[name="Sedan"]');

    await page.click('button[type="submit"]');

    // Check for success message (key from en.json: successMessage: "User created and enrolled successfully")
    await expect(page.locator("text=User created and enrolled successfully")).toBeVisible();
  });

  test("should show validation errors for invalid input", async ({ page }) => {
    await page.goto("/dashboard/users/add");

    await page.fill('input[name="mobile"]', "123"); // Invalid
    await page.click('button[type="submit"]');

    // Messages from en.json: mobileInvalid: "Invalid Saudi mobile number", nameRequired: "Full Name is required"
    await expect(page.locator("text=Invalid Saudi mobile number")).toBeVisible();
    await expect(page.locator("text=Full Name is required")).toBeVisible();
  });

  test("should search and manage enrollments", async ({ page }) => {
    await page.goto("/dashboard/enrollments");

    // Search for a mock user
    await page.fill('input[placeholder="Search by name, mobile, or national ID..."]', "Ahmed");
    await page.click('button:has-text("Search")');

    // Select the user
    await page.click('button:has-text("Select")');

    // Check if enrollments are displayed (key: userEnrollments: "Enrollments for {name}")
    await expect(page.locator("text=Enrollments for Ahmed Al-Rashid")).toBeVisible();

    // Open Create Enrollment Dialog
    await page.click('button:has-text("Create Enrollment")');
    await expect(page.locator("text=Create New Enrollment")).toBeVisible();

    // Fill the dialog form
    await page.click('button:has-text("Select Language")');
    await page.click('role=option[name="Arabic"]');

    await page.click('button:has-text("Select Level")');
    await page.click('role=option[name="Intermediate"]');

    await page.click('button:has-text("Select Vehicle")');
    await page.click('role=option[name="SUV"]');

    // Click submit inside dialog
    await page.locator('button[type="submit"]:has-text("Create Enrollment")').click();

    // Check for success message (key: createSuccess: "Enrollment created successfully")
    await expect(page.locator("text=Enrollment created successfully")).toBeVisible();
  });
});
