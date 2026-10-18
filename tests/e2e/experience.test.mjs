import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3300";
const CHROME = process.env.CHROME_PATH ?? [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
].find(existsSync);
let browser;
before(async () => { browser = await chromium.launch({ executablePath: CHROME }); });
after(async () => { await browser?.close(); });

test("editorial tabs switch sourced imagery and local destinations in MN and EN", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const locale of ["mn", "en"]) {
    await page.goto(`${BASE}/${locale}/`);
    const section = page.locator(".home-discover");
    assert.equal(await section.count(), 1, "new editorial section is present");
    const tabs = section.getByRole("tab");
    assert.equal(await tabs.count(), 3);
    await section.scrollIntoViewIfNeeded();
    const destinations = [`/${locale}/brands/byd/`, `/${locale}/brands/jetour/`, `/${locale}/contact/`];
    const photographs = ["brand-byd-atto3-coast", "jetour-t2-idm", "showroom-hall"];
    for (let index = 0; index < 3; index++) {
      await tabs.nth(index).click();
      await page.waitForFunction(index => document.querySelectorAll('.home-discover [role="tab"]')[index].getAttribute("aria-selected") === "true", index);
      const panel = section.getByRole("tabpanel");
      assert.equal(await panel.count(), 1, "only the active panel is exposed");
      assert.equal(await panel.locator("a").getAttribute("href"), destinations[index]);
      assert.match(await panel.locator("img").getAttribute("src"), new RegExp(photographs[index]));
      await panel.locator("img").evaluate(image => image.decode());
      assert.ok(await panel.locator("img").evaluate(image => image.naturalWidth > 0));
      assert.ok((await panel.locator("img").getAttribute("alt")).length > 10);
      assert.equal(await panel.getAttribute("aria-labelledby"), await tabs.nth(index).getAttribute("id"));
    }
    // Manual activation: arrow keys move focus, Enter/Space selects without scrolling the page.
    await tabs.nth(2).focus();
    await page.keyboard.press("Home");
    assert.ok(await tabs.nth(0).evaluate(element => element === document.activeElement));
    assert.equal(await tabs.nth(2).getAttribute("aria-selected"), "true");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector('.home-discover [role="tab"]').getAttribute("aria-selected") === "true");
    await page.keyboard.press("ArrowLeft");
    assert.ok(await tabs.nth(2).evaluate(element => element === document.activeElement));
    await page.keyboard.press("Space");
    await page.waitForFunction(() => document.querySelectorAll('.home-discover [role="tab"]')[2].getAttribute("aria-selected") === "true");
    await page.keyboard.press("Tab");
    assert.ok(await section.getByRole("tabpanel").locator("a").evaluate(element => element === document.activeElement), "hidden panel links cannot receive focus");
    assert.equal(await page.locator(".bc__slide[data-index] .portfolio-card").count(), 11);
    assert.equal(await page.locator(".showroom-experience").count(), 1);
    assert.equal(await page.locator(".company-facts__item").count(), 4);
  }
  assert.deepEqual(errors, []);
  await page.close();
});

test("editorial composition fits responsive widths and does not jump between topics", async () => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const locale of ["mn", "en"]) {
    await page.goto(`${BASE}/${locale}/`);
    assert.equal(await page.locator(".home-discover").count(), 1);
    for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator(".home-discover").scrollIntoViewIfNeeded();
      const heights = [];
      for (let index = 0; index < 3; index++) {
        await page.locator('.home-discover [role="tab"]').nth(index).click();
        await page.waitForFunction(index => document.querySelectorAll('.home-discover [role="tab"]')[index].getAttribute("aria-selected") === "true", index);
        const metrics = await page.locator(".home-discover").evaluate(section => {
          const panel = section.querySelector('[role="tabpanel"][aria-hidden="false"]');
          const image = panel.querySelector("img").getBoundingClientRect();
          const copy = panel.querySelector(".feature-tabs__copy").getBoundingClientRect();
          return {
            height: section.getBoundingClientRect().height,
            overflow: document.documentElement.scrollWidth > innerWidth,
            touchTargets: [...section.querySelectorAll('[role="tab"], a')].every(e => e.getBoundingClientRect().height >= 44),
            below: copy.top >= image.bottom - 1,
            animations: section.getAnimations({ subtree: true }).filter(a => a.playState === "running").length,
          };
        });
        assert.equal(metrics.overflow, false, `${locale} ${width}px: no page overflow`);
        assert.ok(metrics.touchTargets, `${locale} ${width}px: usable targets`);
        assert.equal(metrics.animations, 0, "reduced motion is respected");
        if (width < 1024) assert.ok(metrics.below, "narrow-screen copy does not obscure the car");
        heights.push(metrics.height);
      }
      assert.ok(Math.max(...heights) - Math.min(...heights) < 2, `${locale} ${width}px: stable panel height`);
    }
  }
  await page.close();
});

test("tab activation keeps keyboard focus coherent while an incoming image is delayed", async () => {
  const page = await browser.newPage();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route("**/media/jetour-t2-idm-*.webp", async route => { await gate; await route.continue(); });
  await page.goto(`${BASE}/en/`, { waitUntil: "domcontentloaded" });
  const tabs = page.locator('.home-discover [role="tab"]');
  await tabs.nth(1).focus();
  await page.keyboard.press("Enter");
  assert.equal(await tabs.nth(1).getAttribute("aria-selected"), "true");
  await page.keyboard.press("Tab");
  const link = page.locator('.home-discover [role="tabpanel"][aria-hidden="false"] a');
  assert.equal(await link.getAttribute("href"), "/en/brands/jetour/");
  assert.ok(await link.evaluate(element => element === document.activeElement));
  release();
  await page.locator('.home-discover [role="tabpanel"][aria-hidden="false"] img').evaluate(image => image.decode());
  assert.ok(await link.evaluate(element => element === document.activeElement));
  await page.close();
});
