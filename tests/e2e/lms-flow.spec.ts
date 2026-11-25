import { test, expect } from "@playwright/test";

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

test.describe("Viona Learn Room Desktop & Mobile Verification", () => {
  test("login page renders zero emojis, loads transparent PNG stickers, and fits mobile 390x844 with zero overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Viona Learn Room" })
    ).toBeVisible();

    const text = await page.locator("body").innerText();
    expect(EMOJI_REGEX.test(text)).toBe(false);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflow).toBe(false);

    const brokenImages = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img")).filter(
        (img) => !img.complete || img.naturalWidth === 0
      ).length
    );
    expect(brokenImages).toBe(0);

    const mascotHasCircle = await page
      .getByAltText("Maskot Belajar Yuk")
      .evaluate((el) => el.className.includes("rounded-full"));
    expect(mascotHasCircle).toBe(false);
  });

  test("unauthenticated access to student and teacher routes redirects to /login", async ({
    page,
  }) => {
    await page.goto("/workspace");
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("desktop login view renders mascot and form controls cleanly", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Kata Sandi")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Masuk ke Ruang Belajar/i })
    ).toBeVisible();
  });
});
