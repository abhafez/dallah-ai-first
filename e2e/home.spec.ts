import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("should display the heading text", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /to get started, edit the page\.tsx file/i,
      })
    ).toBeVisible();
  });

  test("should have a deploy link", async ({ page }) => {
    await page.goto("/");
    const deployLink = page.getByRole("link", { name: /deploy now/i });
    await expect(deployLink).toBeVisible();
    await expect(deployLink).toHaveAttribute("href", /vercel\.com/);
  });

  test("should have a documentation link", async ({ page }) => {
    await page.goto("/");
    const docsLink = page.getByRole("link", { name: /documentation/i });
    await expect(docsLink).toBeVisible();
    await expect(docsLink).toHaveAttribute("href", /nextjs\.org\/docs/);
  });
});
