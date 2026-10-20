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
  test("hero shows the company's own building rather than a single-brand photograph", async () => {
    const { page, context, errors } = await open("/mn/");
    assert.equal(await page.locator(".corporate-hero__media img").count(), 1);
    assert.match(await page.locator(".corporate-hero__media img").getAttribute("src"), /\/media\/sain-hq-aerial-\d+\.webp$/);
    // Every brand the headline counts is along the foot of the hero, each a way into its page.
    assert.deepEqual(
      await page.locator(".corporate-hero__brands a").evaluateAll((links) => links.map((a) => a.getAttribute("href"))),
      BRANDS.map((slug) => `/mn/brands/${slug}/`),
    );
    assert.equal(await page.locator(".corporate-hero video, .corporate-hero canvas, .home-nav").count(), 0);
    assert.equal(await page.locator(".corporate-hero h1 > span").count(), 2);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test("scrolling lays the hero back in depth and moves the camera through the showroom", async () => {
    const { page, context, errors } = await open("/en/");
    assert.equal(await page.locator(".corporate-hero__frame").evaluate((e) => getComputedStyle(e).transform), "none");
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".corporate-hero__frame")).transform.startsWith("matrix3d"));
    const depth = page.locator(".depth");
    assert.equal(await depth.locator(".depth__figure").count(), 6);
    const firstZ = () => page.locator(".depth__card").first().evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m43);
    await depth.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY));
    await page.waitForTimeout(300);
    const before = await firstZ();
    await depth.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + e.offsetHeight / 3));
    await page.waitForFunction((z) => new DOMMatrix(getComputedStyle(document.querySelector(".depth__card")).transform).m43 > z + 200, before);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test("the hero's showroom link drops to the showroom walk, whose own action leads to contact", async () => {
    const { page, context, errors } = await open("/mn/");
    await page.click(".corporate-hero__secondary");
    await page.waitForURL("**/mn/#showroom");
    const gap = await page.evaluate(() => document.querySelector("#showroom").getBoundingClientRect().top - document.querySelector(".site-header").getBoundingClientRect().bottom);
    assert.ok(gap >= 0 && gap < 60, `the showroom starts just below the sticky header (${gap}px)`);
    assert.match(await page.locator(".depth__action").getAttribute("href"), /\/mn\/contact\/$/);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test("MN and EN desktop titles set each tier on one line and the CTA clears the sticky header", async () => {
    const { page, context } = await open("/mn/");
    for (const width of [1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const locale of ["mn", "en"]) {
        await page.goto(`${BASE}/${locale}/`);
        await page.evaluate(() => document.fonts.ready);
        const tiers = await page.locator("h1 > span > span").evaluateAll((spans) => spans.map((e) => e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)));
        assert.equal(tiers.length, 2);
        for (const lines of tiers) assert.ok(Math.abs(lines - 1) < 0.05, `${locale} at ${width}px: a tier wraps (${lines} lines)`);
        assert.match(await page.locator("h1").innerText(), /\b11\b/, "the headline states the brand count");
        await page.click(".corporate-hero__cta");
        await page.waitForURL("**/#brands-heading");
        const visible = await page.evaluate(() => document.querySelector("#brands-heading").getBoundingClientRect().top >= document.querySelector(".site-header").getBoundingClientRect().bottom);
        assert.ok(visible, "brand heading clears the sticky header");
      }
    }
    await context.close();
  });

  test("all eleven photographic cards have their original mark, copy and existing destination", async () => {
    const {page,context,errors}=await open('/en/');
    await page.waitForSelector('.home-portfolio .bc[data-ready]');
    const cards=page.locator('.home-portfolio .bc__slide[data-index] .portfolio-card');
    assert.equal(await cards.count(),11);
    assert.deepEqual(await cards.evaluateAll(cards=>cards.map(a=>a.getAttribute('href'))),BRANDS.map(s=>'/en/brands/'+s+'/'));
    assert.equal(await cards.locator('.portfolio-card__media img').count(),11);
    assert.equal(await cards.locator('.portfolio-card__mark img').count(),11);
    assert.equal(await page.locator('.circular-carousel, .brand-showcase__index').count(),0);
    await page.locator('.bc').scrollIntoViewIfNeeded();
    await page.getByRole('button',{name:'Next slide',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.bc').dataset.current==='1');
    await page.getByRole('button',{name:'Previous slide',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.bc').dataset.current==='0');
    await page.locator('.site-logo').focus({preventScroll:true});await page.mouse.move(0,0);
    await page.waitForFunction(()=>document.querySelector('.bc').dataset.current==='1',null,{timeout:6500});
    assert.deepEqual(errors,[]);await context.close();
  });

  test("MEGA TEST DRIVE film loads only when seen or asked for, in an accessible dialog", async () => {
    const context = await browser.newContext(DESKTOP);
    const page = await context.newPage();
    const errors = [];
    const videos = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => /\/video\/|mtd7-/.test(r.url()) && videos.push(new URL(r.url()).pathname));
    await page.goto(`${BASE}/mn/`, { waitUntil: "load" });
    await page.waitForTimeout(500);
    assert.deepEqual(videos, [], "neither the film nor its poster is fetched for the first screen");

    // Every listed edition is over, so none offers registration.
    assert.equal(await page.locator(".drive-event").count(), 3);
    assert.equal(await page.locator('.drive-event[data-state="completed"]').count(), 3);
    assert.equal(await page.locator(".drive-event a").count(), 0);

    await page.locator(".viewfinder").evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY));
    await page.waitForFunction(() => !document.querySelector(".teaser-video").paused);
    assert.ok(!videos.some((path) => path.includes("full")), "the full cut waits for the visitor");

    // WCAG 2.2.2: the loop can be paused, and a visitor's pause survives leaving and returning.
    const toggle = page.locator(".teaser-toggle");
    assert.equal((await toggle.innerText()).trim(), "Видеог зогсоох");
    await toggle.click();
    assert.equal(await page.locator(".teaser-video").evaluate((v) => v.paused), true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.locator(".viewfinder").evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY));
    await page.waitForTimeout(600);
    assert.equal(await page.locator(".teaser-video").evaluate((v) => v.paused), true, "a paused teaser stays paused");
    assert.equal((await toggle.innerText()).trim(), "Видеог тоглуулах");

    await page.locator(".test-drive__watch").focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector(".video-dialog").open);
    assert.ok(await page.evaluate(() => document.activeElement.classList.contains("video-dialog__close")));
    await page.waitForFunction(() => document.querySelector(".video-dialog video")?.currentTime > 0);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector(".video-dialog").open);
    // The close event unmounts the player on React's next render.
    await page.waitForFunction(() => !document.querySelector(".video-dialog video"), null, { timeout: 2000 });
    assert.ok(await page.evaluate(() => document.activeElement.classList.contains("test-drive__watch")), "focus returns to the opener");
    assert.deepEqual(errors, []);
    await context.close();
  });

  test("reduced motion keeps the hero and the scroll scenes still", async () => {
    const { page, context } = await open("/en/", { ...DESKTOP, reducedMotion: "reduce" });
    assert.equal(await page.locator(".corporate-hero button").count(), 0);
    const moving = await page.locator(".corporate-hero").evaluate((e) => e.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length);
    assert.equal(moving, 0);
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(300);
    assert.equal(await page.locator(".corporate-hero__frame").evaluate((e) => getComputedStyle(e).transform), "none");
    const still = await page.evaluate(() => ({
      depth: getComputedStyle(document.querySelector(".depth__viewport")).position,
      cards: [...document.querySelectorAll(".depth__card")].every((e) => getComputedStyle(e).transform === "none" && getComputedStyle(e).opacity === "1"),
      frame: getComputedStyle(document.querySelector(".viewfinder__frame")).clipPath,
    }));
    assert.deepEqual(still, { depth: "static", cards: true, frame: "none" });
    await page.locator(".viewfinder").evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY));
    await page.waitForTimeout(800);
    assert.equal(await page.locator(".teaser-video").evaluate((v) => v.paused), true, "the teaser stays on its poster");
    assert.equal(await page.locator(".teaser-poster").count(), 1);
    // Reduced motion prevents automatic card advancement.
    await page.locator(".home-portfolio .bc").scrollIntoViewIfNeeded();
    await page.waitForSelector(".bc[data-ready]");
    assert.equal(await page.getByRole("button", { name: "Pause slideshow", exact: true }).count(), 0);
    await page.waitForTimeout(6000);
    assert.equal(await page.locator(".home-portfolio .bc").getAttribute("data-current"), "0");
    await context.close();
  });

  test("focused cards hold autoplay and leaving starts a fresh interval", async () => {
    const {page,context}=await open('/en/');await page.locator('.bc').scrollIntoViewIfNeeded();await page.waitForSelector('.bc[data-ready]');
    await page.locator('.bc__slide[data-index="7"] .portfolio-card').focus();
    await page.waitForFunction(()=>document.querySelector('.bc').dataset.current==='7');
    await page.waitForTimeout(6000);assert.equal(await page.locator('.bc').getAttribute('data-current'),'7');
    assert.equal(await page.getByRole('button',{name:/^(Pause|Play) slideshow$/}).count(),0);
    await page.locator('.site-logo').focus({preventScroll:true});await page.mouse.move(0,0);
    const resumed=Date.now();
    await page.waitForFunction(()=>document.querySelector('.bc').dataset.current==='8',null,{timeout:6500});
    assert.ok(Date.now()-resumed>=5300,'focus exit starts a fresh 5.5-second interval');
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

  test("brand cards open their existing dedicated brand pages", async () => {
    const {page,context}=await open('/en/');await page.waitForSelector('.bc[data-ready]');
    const card=page.locator('.bc__slide[data-index="3"] .portfolio-card');await card.focus();await page.waitForTimeout(760);await card.click();
    await page.waitForURL(BASE+'/en/brands/byd/');assert.equal(await page.locator("h1 img[alt='BYD']").count(),1);await context.close();
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

  test("homepage facts stay compact in two balanced rows in both languages", async () => {
    const { page, context } = await open("/mn/");
    for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const locale of ["mn", "en"]) {
        await page.goto(`${BASE}/${locale}/`);
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator(".company-facts__item").count(), 4);
        assert.equal(await page.locator(".home-service").count(), 0);
        const rows = await page.$$eval(".company-facts__item", (items) => {
          const byRow = new Map();
          for (const item of items) {
            const top = Math.round(item.getBoundingClientRect().top);
            const valueTop = Math.round(item.querySelector("dd").getBoundingClientRect().top);
            byRow.set(top, [...(byRow.get(top) ?? []), valueTop]);
          }
          return [...byRow.values()];
        });
        assert.equal(rows.length, 2, `${locale} at ${width}px`);
        for (const row of rows) assert.ok(Math.max(...row) - Math.min(...row) <= 1, `${locale} at ${width}px: numbers align`);
        const bounds = await page.locator(".company-facts-section").boundingBox();
        assert.ok(bounds.height <= 400, `${locale} at ${width}px: compact facts band`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      }
    }
    await context.close();
  });

  test("homepage facts remain while location details live on the contact page", async () => {
    const { page, context } = await open("/mn/");
    for (const locale of ["mn", "en"]) {
      await page.goto(`${BASE}/${locale}/`);
      assert.deepEqual(await page.locator(".company-facts__value").allTextContents(), ["11", "6", "2", "4"]);
      assert.equal(await page.locator(".bc__slide[data-index]").count(), 11);
      assert.equal(await page.locator(".location-list .location").count(), 0);
      assert.equal(await page.locator("#locations-heading, .band-figure").count(), 0);
      assert.equal(await page.locator(".depth__action[href$='/contact/']").count(), 1);
      await page.locator(`.site-nav__link[href='/${locale}/services/']`).click();
      await page.waitForURL(`${BASE}/${locale}/services/`);
      assert.equal(await page.locator(".services-page .service").count(), 4);
      assert.equal((await page.locator("#service-financing .service__facts dd").first().innerText()).trim(), "JETOUR, CHERY");
      assert.equal((await page.locator("#service-repair .service__facts dd").first().innerText()).trim(), "JETOUR, BYD");
      await page.goto(`${BASE}/${locale}/contact/`);
      assert.equal(await page.locator(".location-list .location").count(), 7);
    }
    await context.close();
  });

  test("services page shows the service centre and a pinned team strip that swipes on phones", async () => {
    for (const locale of ["mn", "en"]) {
      const { page, context, errors } = await open(`/${locale}/services/`);
      assert.match(await page.locator(".services-header img").getAttribute("src"), /\/media\/service-team-/);
      assert.equal(await page.locator(".hscroll__figure img").count(), 6);
      const strip = page.locator(".hscroll");
      await strip.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + (e.offsetHeight - innerHeight) / 2));
      await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector(".hscroll__track")).transform).m41 < -100);
      assert.deepEqual(errors, []);
      await context.close();

      const phone = await open(`/${locale}/services/`, PHONE);
      // The strip takes focus once hydrated code has matched the phone layout.
      await phone.page.waitForFunction(() => document.querySelector(".hscroll__viewport").tabIndex === 0);
      const native = await phone.page.evaluate(() => {
        const viewport = document.querySelector(".hscroll__viewport");
        return { overflow: getComputedStyle(viewport).overflowX, scrollable: viewport.scrollWidth > viewport.clientWidth, page: document.documentElement.scrollWidth <= innerWidth, focusable: viewport.tabIndex === 0 && viewport.getAttribute("role") === "region" };
      });
      assert.deepEqual(native, { overflow: "auto", scrollable: true, page: true, focusable: true });
      await phone.context.close();
    }
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

  test("brands index stages the pointed or focused brand and shows cards on phones", async () => {
    const { page, context, errors } = await open("/en/brands/");
    const rows = page.locator(".brand-index__row");
    assert.equal(await rows.count(), BRANDS.length);
    const staged = () => page.evaluate(() => [...document.querySelectorAll(".brand-index__panel")].filter((p) => getComputedStyle(p).visibility === "visible").map((p) => p.querySelector("h2").id));
    await page.waitForTimeout(600);
    assert.deepEqual(await staged(), ["brand-panel-jetour"]);
    await rows.nth(BRANDS.indexOf("byd")).hover();
    await page.waitForFunction(() => document.querySelectorAll(".brand-index__panel[data-active]")[0]?.querySelector("#brand-panel-byd"));
    await page.waitForTimeout(600);
    assert.deepEqual(await staged(), ["brand-panel-byd"]);
    assert.match(await page.locator(".brand-index__panel[data-active] .brand-panel__channel").getAttribute("href"), /^https:\/\/www\.facebook\.com\//);
    // Keyboard: focusing a row stages it; only the staged panel's links can take focus.
    await page.locator(".brand-index__row a").nth(BRANDS.indexOf("aito")).focus();
    await page.waitForTimeout(600);
    assert.deepEqual(await staged(), ["brand-panel-aito"]);
    assert.equal(await page.locator(".brand-index__row[data-active] .brand-index__rule").count(), 1);
    assert.deepEqual(errors, []);
    await context.close();

    const phone = await open("/mn/brands/", PHONE);
    const layout = await phone.page.evaluate(() => ({
      list: getComputedStyle(document.querySelector(".brand-index__list")).display,
      cards: [...document.querySelectorAll(".brand-index__panel")].filter((p) => getComputedStyle(p).visibility === "visible").length,
      fit: document.documentElement.scrollWidth <= innerWidth,
    }));
    assert.deepEqual(layout, { list: "none", cards: BRANDS.length, fit: true });
    await phone.context.close();
  });

  test("brand pages link out only to verified https destinations", async () => {
    const context = await browser.newContext(DESKTOP);
    const page = await context.newPage();
    for (const slug of BRANDS) {
      await page.goto(`${BASE}/en/brands/${slug}/`);
      const hrefs = await page.$$eval(".brand-hero a[href^='http'], .brand-facts a[href^='http']", (links) => links.map((a) => a.href));
      for (const href of hrefs) assert.match(href, /^https:\/\//, slug);
      assert.ok(!hrefs.some((h) => h.includes("chery.mn")), "chery.mn is not live yet");
      // The brand's own channel is the page's one primary action: jetour.mn for JETOUR, otherwise its Mongolian Facebook page.
      const primary = await page.locator(".brand-hero__actions .button--primary").evaluateAll((links) => links.map((a) => a.href));
      if (slug === "jetour") assert.deepEqual(primary, ["https://jetour.mn/"]);
      else if (["chery", "byd", "212", "bestune", "rely", "maxus", "hongqi"].includes(slug)) assert.match(primary[0] ?? "", /^https:\/\/www\.facebook\.com\//, slug);
      assert.ok(primary.length <= 1, `${slug}: one primary action`);
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
