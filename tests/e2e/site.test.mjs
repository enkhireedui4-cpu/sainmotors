// Browser checks against the built site. Start the static server first:
//   npm run build && npm run preview      (serves out/ on :3300)
//   npm run test:e2e
// Uses an installed Chrome or Edge through playwright-core (no browser download).
// Override with CHROME_PATH=... and BASE_URL=...
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3300";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sainmotors.mn";
const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].find((p) => existsSync(p));

const DESKTOP = { viewport: { width: 1440, height: 900 } };
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const BRANDS = ["jetour", "soueast", "chery", "byd", "riddara", "aito", "212", "bestune", "rely", "maxus", "hongqi"];

let browser;

before(async () => {
  assert.ok(CHROME, "No Chrome/Edge found; set CHROME_PATH");
  const res = await fetch(`${BASE}/mn/`).catch(() => null);
  assert.ok(res?.ok, `Site not reachable at ${BASE}. Run \`npm run preview\` after a build.`);
  browser = await chromium.launch({ executablePath: CHROME });
});

after(async () => {
  await browser?.close();
});

async function open(path, options = DESKTOP) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${BASE}${path}`, { waitUntil: "load" });
  return { page, context, errors };
}

﻿describe("corporate homepage", () => {
  test("hero has static decorative artwork without a single-brand photograph", async () => {
    const { page, context, errors } = await open("/mn/");
    assert.equal(await page.locator(".corporate-hero__art img").count(), 1);
    assert.equal(await page.locator(".corporate-hero img[src*='/media/'], .corporate-hero video, .home-nav").count(), 0);
    assert.equal(await page.locator(".corporate-hero h1 span").count(), 2);
    assert.equal(await page.locator(".corporate-hero canvas").count(), 0);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test("MN and EN desktop titles occupy two lines and the CTA clears the sticky header", async () => {
    const { page, context } = await open("/mn/");
    for (const width of [1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const locale of ["mn", "en"]) {
        await page.goto(`${BASE}/${locale}/`);
        await page.evaluate(() => document.fonts.ready);
        const lines = await page.locator("h1").evaluate((e) => e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight));
        assert.ok(Math.abs(lines - 2) < 0.05, `${locale} at ${width}px: ${lines} title lines`);
        await page.click(".corporate-hero__cta");
        await page.waitForURL("**/#brands-heading");
        const visible = await page.evaluate(() => document.querySelector("#brands-heading").getBoundingClientRect().top >= document.querySelector(".site-header").getBoundingClientRect().bottom);
        assert.ok(visible, "brand heading clears the sticky header");
      }
    }
    await context.close();
  });

  test("photo collection advances after manual selection and links to the complete directory", async () => {
    const { page, context } = await open("/en/");
    assert.equal(await page.locator(".vehicle-portfolio .bc__slide[data-index]").count(), BRANDS.length);
    const destinations = await page.locator(".vehicle-portfolio .bc__slide[data-index] > a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    assert.deepEqual(destinations, BRANDS.map((slug) => `/en/brands/${slug}/`));
    assert.equal(await page.locator(".brand-directory").count(), 0);
    await page.locator(".bc").scrollIntoViewIfNeeded();
    assert.equal(await page.locator(".bc__position, .bc__count").count(), 0);
    assert.equal(await page.locator(".bc__buttons button").count(), 2);
    assert.equal(await page.locator(".vehicle-card a, .vehicle-card button").count(), 0);
    for (const card of await page.locator(".bc__slide[data-index] .vehicle-card").all()) {
      const text = await card.locator("p").innerText();
      assert.ok(text.length > 40 && text.length <= 200);
      assert.equal(await card.locator(".vehicle-card__media img:not(.brand-mark)").count(), 1);
      assert.equal(await card.locator(".vehicle-card__heading img.brand-mark").count(), 1);
      assert.equal(await card.locator(".vehicle-card__media--logo, .vehicle-card__name, .vehicle-card__model").count(), 0);
      assert.equal(await card.locator("h3").count(), 1);
    }
    const ids = await page.locator(".vehicle-card p[id]").evaluateAll((es) => es.map((e) => e.id));
    assert.equal(ids.length, new Set(ids).size);
    await page.getByRole("button", { name: "Next slide", exact: true }).click();
    await page.waitForFunction(() => document.querySelector(".bc")?.getAttribute("data-current") === "1");
    await page.getByRole("button", { name: "Previous slide", exact: true }).click();
    await page.waitForFunction(() => document.querySelector(".bc")?.getAttribute("data-current") === "0");
    await page.waitForFunction(() => document.querySelector(".bc")?.getAttribute("data-current") === "1", null, { timeout: 5500 });
    assert.equal(await page.locator(".home-portfolio .section-head__side").count(), 0);
    await page.locator(".site-header .site-nav a[href='/en/brands/']").click();
    await page.waitForURL(`${BASE}/en/brands/`);
    assert.equal(await page.locator(".directory__row").count(), BRANDS.length);
    await context.close();
  });

  test("reduced motion keeps the decorative artwork static", async () => {
    const { page, context } = await open("/en/", { ...DESKTOP, reducedMotion: "reduce" });
    assert.equal(await page.locator(".corporate-hero button").count(), 0);
    const moving = await page.locator(".corporate-hero").evaluate((e) => e.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length);
    assert.equal(moving, 0);
    await context.close();
  });

  test("a focused brand card stays visible while autoplay resumes after arrow controls", async () => {
    const { page, context } = await open("/en/");
    const carousel = page.locator(".vehicle-portfolio .bc");
    await carousel.scrollIntoViewIfNeeded();
    await page.locator(".bc__slide[data-index='0'] .vehicle-card").focus();
    await page.waitForTimeout(4800);
    assert.equal(await carousel.getAttribute("data-current"), "0");
    assert.equal(await page.evaluate(() => document.activeElement?.getBoundingClientRect().left >= 0), true);
    await page.getByRole("button", { name: "Next slide", exact: true }).click();
    await page.waitForFunction(() => document.querySelector(".bc")?.getAttribute("data-current") === "2", null, { timeout: 5500 });
    await context.close();
  });
});


describe("navigation", () => {
  test("mobile menu opens as a modal and closes with Escape", async () => {
    const { page, context } = await open("/mn/", PHONE);
    const button = page.locator(".menu-button");
    await button.click();
    assert.equal(await page.$eval("#mobile-menu", (d) => d.open), true);
    assert.equal(await button.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    assert.equal(await page.$eval("#mobile-menu", (d) => d.open), false);
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains("menu-button")), true);
    await context.close();
  });

  test("mobile menu links navigate and close the menu", async () => {
    const { page, context } = await open("/mn/", PHONE);
    await page.click(".menu-button");
    await page.click("#mobile-menu nav a[href='/mn/services/']");
    await page.waitForURL(`${BASE}/mn/services/`);
    assert.equal(await page.$eval("#mobile-menu", (d) => d.open), false);
    await context.close();
  });

  test("language switch keeps the same page, on every brand", async () => {
    const context = await browser.newContext(DESKTOP);
    const page = await context.newPage();
    for (const slug of BRANDS) {
      await page.goto(`${BASE}/mn/brands/${slug}/`);
      await page.click(".site-header .lang-switch a[hreflang='en']");
      await page.waitForURL(`${BASE}/en/brands/${slug}/`);
      assert.equal(await page.getAttribute("html", "lang"), "en", slug);
    }
    await context.close();
  });

  test("brand tiles lead to the brand overview", async () => {
    const { page, context } = await open("/en/");
    assert.equal(await page.locator(".vehicle-portfolio .bc__slide[data-index]").count(), BRANDS.length);
    await page.click(".vehicle-portfolio .bc__slide[data-index='0'] a");
    await page.waitForURL(`${BASE}/en/brands/jetour/`);
    assert.equal(await page.locator("h1 img[alt='JETOUR']").count(), 1);
    await context.close();
  });
});

describe("pages", () => {
  const pages = ["", "about", "brands", ...BRANDS.map((b) => `brands/${b}`), "services", "contact", "privacy"];

  test("the eight supplied brands have their local hero images, sales actions and model galleries", async () => {
    const supplied = {
      "212": ["brand-212", "72228855", 0],
      rely: ["brand-rely", "72228855", 0],
      bestune: ["brand-bestune", "72998855", 0],
      hongqi: ["brand-hongqi", "72008855", 0],
      maxus: ["brand-maxus", "72998855", 0],
      aito: ["brand-aito-m9", "72118855", 2],
      byd: ["brand-byd-atto3", "72508855", 6],
      riddara: ["brand-riddara-rd6", "72708855", 0],
    };
    const { page, context, errors } = await open("/mn/brands/byd/");
    for (const locale of ["mn", "en"]) for (const [slug, [key, phone, gallery]] of Object.entries(supplied)) {
      await page.goto(`${BASE}/${locale}/brands/${slug}/`);
      assert.ok((await page.locator(".brand-hero__image img").getAttribute("src")).includes(`/media/${key}-`), slug);
      await page.waitForFunction(() => { const i = document.querySelector(".brand-hero__image img"); return i?.complete && i.naturalWidth > 0; });
      assert.equal(await page.locator(`.brand-hero__actions a[href='tel:+976${phone}']`).count(), 1, slug);
      assert.equal(await page.locator(".brand-gallery__grid img").count(), gallery, slug);
      assert.equal(await page.locator(".brand-story__copy p").count(), 2, slug);
      await page.locator(".brand-hero__actions a[href^='#']").click();
      const targetVisible = await page.evaluate(() => {
        const target = document.querySelector(location.hash);
        return target && target.getBoundingClientRect().top >= document.querySelector(".site-header").getBoundingClientRect().bottom;
      });
      assert.equal(Boolean(targetVisible), true, `${locale}/${slug}: showroom clears the header`);
    }
    assert.deepEqual(errors, []);
    await context.close();
  });

  test("home service columns line up their copy and facts in every row", async () => {
    const { page, context } = await open("/mn/");
    for (const width of [800, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const locale of ["mn", "en"]) {
        await page.goto(`${BASE}/${locale}/`);
        await page.evaluate(() => document.fonts.ready);
        const rows = await page.$$eval(".services-row .service", (items) => {
          const byRow = new Map();
          for (const item of items) {
            const top = Math.round(item.getBoundingClientRect().top);
            const body = Math.round(item.querySelector("p").getBoundingClientRect().top);
            const facts = Math.round(item.querySelector(".service__facts").getBoundingClientRect().top);
            byRow.set(top, [...(byRow.get(top) ?? []), { body, facts }]);
          }
          return [...byRow.values()];
        });
        for (const row of rows) {
          assert.equal(new Set(row.map((r) => r.body)).size, 1, `${locale} at ${width}px: copy starts at one line`);
          assert.equal(new Set(row.map((r) => r.facts)).size, 1, `${locale} at ${width}px: facts start at one line`);
        }
      }
    }
    await context.close();
  });

  test("gallery captions are unique, naming the view where a model repeats", async () => {
    const { page, context } = await open("/mn/brands/byd/");
    for (const locale of ["mn", "en"]) {
      await page.goto(`${BASE}/${locale}/brands/byd/`);
      const captions = await page.$$eval(".brand-gallery__grid figcaption", (els) => els.map((e) => e.textContent.trim()));
      assert.equal(new Set(captions).size, captions.length, captions.join(" | "));
    }
    await context.close();
  });

  test("CHERY shows its showroom, opening hours and sales line", async () => {
    const { page, context, errors } = await open("/mn/brands/chery/");
    assert.equal(await page.locator(".brand-hero__actions a[href='tel:+97672558855']").count(), 1);
    const text = await page.locator("main").textContent();
    for (const expected of ["CHERY шоурум", "Parko Riveria", "09:00 – 21:00", "TIGGO 8"]) assert.ok(text.includes(expected), expected);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test("supplied brand pages fit both languages at all five requested widths", async () => {
    const { page, context } = await open("/mn/brands/byd/");
    for (const width of [360, 390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const locale of ["mn", "en"]) for (const slug of ["212", "rely", "bestune", "hongqi", "maxus", "aito", "byd", "riddara"]) {
        await page.goto(`${BASE}/${locale}/brands/${slug}/`);
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `${locale}/${slug} at ${width}`);
        assert.equal(await page.locator(".brand-hero__image").count(), 1);
      }
    }
    await context.close();
  });

  test("lang, self canonical, reciprocal hreflang and one h1 on every page", async () => {
    const context = await browser.newContext(DESKTOP);
    const page = await context.newPage();
    for (const locale of ["mn", "en"]) {
      for (const path of pages) {
        const url = `/${locale}/${path ? `${path}/` : ""}`;
        await page.goto(`${BASE}${url}`);
        assert.equal(await page.getAttribute("html", "lang"), locale, url);
        assert.equal(await page.getAttribute("link[rel='canonical']", "href"), `${SITE}${url}`, url);
        const alternates = await page.$$eval("link[rel='alternate'][hreflang]", (links) =>
          Object.fromEntries(links.map((l) => [l.hreflang, l.href])),
        );
        const tail = path ? `${path}/` : "";
        assert.equal(alternates.mn, `${SITE}/mn/${tail}`, url);
        assert.equal(alternates.en, `${SITE}/en/${tail}`, url);
        assert.equal(alternates["x-default"], `${SITE}/mn/${tail}`, url);
        assert.equal(await page.locator("h1").count(), 1, `${url} has one h1`);
      }
    }
    await context.close();
  });

  test("no horizontal overflow at 360, 390, 768, 1440 and 1920", async () => {
    for (const width of [360, 390, 768, 1440, 1920]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      for (const path of ["/mn/", "/en/", "/mn/brands/", "/mn/brands/byd/", "/mn/brands/hongqi/", "/mn/about/", "/mn/services/", "/mn/contact/"]) {
        await page.goto(`${BASE}${path}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.equal(overflow, 0, `${path} at ${width}px`);
      }
      await context.close();
    }
  });

  test("phone, email and directions links are well-formed", async () => {
    const { page, context } = await open("/mn/contact/");
    const hrefs = await page.$$eval("main a", (links) => links.map((a) => a.getAttribute("href")));
    assert.ok(hrefs.includes("tel:+97670108855"));
    assert.ok(hrefs.some((h) => h?.startsWith("mailto:") && h.includes("@")));
    assert.ok(hrefs.some((h) => h?.startsWith("https://www.google.com/maps/")));
    await context.close();
  });

  test("brand pages link out only to verified https destinations", async () => {
    const context = await browser.newContext(DESKTOP);
    const page = await context.newPage();
    for (const slug of BRANDS) {
      await page.goto(`${BASE}/en/brands/${slug}/`);
      const hrefs = await page.$$eval(".brand-facts a[href^='http']", (links) => links.map((a) => a.href));
      for (const href of hrefs) assert.match(href, /^https:\/\//, slug);
      assert.ok(!hrefs.some((h) => h.includes("chery.mn")), "chery.mn is not live yet");
    }
    await context.close();
  });

  test("no review labels, source badges or broken images in the public UI", async () => {
    const context = await browser.newContext(DESKTOP);
    const page = await context.newPage();
    for (const path of ["/mn/", "/en/brands/soueast/", "/en/brands/byd/", "/mn/about/", "/mn/contact/"]) {
      await page.goto(`${BASE}${path}`, { waitUntil: "load" });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
      });
      await page.waitForLoadState("networkidle");
      assert.equal(await page.locator(".hero__credit").count(), 0, path);
      const visibleBadges = await page.$$eval(".review-badge", (els) => els.filter((e) => getComputedStyle(e).display !== "none").length);
      assert.equal(visibleBadges, 0, `${path}: review badge visible`);
      const broken = await page.$$eval("main img", (imgs) =>
        imgs.filter((i) => i.getAttribute("src") && i.complete && i.naturalWidth === 0).map((i) => i.src),
      );
      assert.deepEqual(broken, [], path);
    }
    await context.close();
  });

  test("unknown URLs get the bilingual 404 page", async () => {
    const res = await fetch(`${BASE}/mn/no-such-page/`);
    assert.equal(res.status, 404);
    const html = await res.text();
    assert.match(html, /Хуудас олдсонгүй/);
    assert.match(html, /Page not found/);
  });
});
