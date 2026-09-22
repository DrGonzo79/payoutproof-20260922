import { expect, test } from "@playwright/test";

test("validates, audits, excludes evidence, and copies a request", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.getByText("Your audit summary will appear here.")).toBeVisible();

  const offer = page.getByLabel("Insurer offer");
  await offer.fill("0");
  await page.getByRole("button", { name: "Audit this offer" }).click();
  await expect(page.getByText("Enter an insurer offer between $1,000 and $250,000.")).toBeVisible();

  await offer.fill("25400");
  await page.getByRole("button", { name: "Audit this offer" }).click();
  await expect(page.getByRole("heading", { name: /Offer may be/ })).toBeVisible();
  await expect(page.getByText("Strong evidence")).toBeVisible();

  await page.getByLabel("Include PP-104").uncheck();
  await expect(page.getByText("Your audit summary will appear here.")).toBeVisible();
  await page.getByRole("button", { name: "Audit this offer" }).click();
  await expect(page.getByText("Directional evidence")).toBeVisible();
  await page.getByRole("button", { name: "Copy request" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
});

test("mobile layout has no horizontal page overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  await page.goto("/");
  const sizes = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
  await page.getByRole("button", { name: "Audit this offer" }).click();
  await expect(page.getByRole("heading", { name: /Offer may be/ })).toBeVisible();
});
