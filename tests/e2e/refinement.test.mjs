import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const BASE = process.env.BASE_URL ?? 'http://localhost:3300';
const executablePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

test('English corporate headline uses natural copy and fits the existing hero', async () => {
  const browser = await chromium.launch({ executablePath });
  try {
    const page = await browser.newPage();
    for (const width of [320,390,768,1024,1440,1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${BASE}/en/`);
      await page.evaluate(() => document.fonts.ready);
      assert.equal((await page.locator('h1').innerText()).replace(/\s+/g,' ').trim(), '11 brands. One official distributor.');
      const bounds = await page.locator('h1').evaluate(e => ({ scroll: Math.max(...[...e.querySelectorAll(':scope > span')].map(s => s.scrollWidth)), width: e.clientWidth, page: document.documentElement.scrollWidth - innerWidth, tiers: [...e.querySelectorAll(':scope > span > span')].map(s => s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight)) }));
      assert.ok(bounds.scroll <= bounds.width + 1, `headline fits at ${width}`);
      assert.equal(bounds.page, 0);
      // The count tier never wraps; on wide screens the role tier stays on one line too.
      assert.ok(Math.abs(bounds.tiers[0] - 1) < 0.05, `count tier on one line at ${width}`);
      if (width >= 1024) assert.ok(Math.abs(bounds.tiers[1] - 1) < 0.05, `role tier on one line at ${width}`);
    }
  } finally { await browser.close(); }
});

test('carousel has only accessible arrows and hover/manual input restart autoplay safely', async () => {
  const browser = await chromium.launch({ executablePath });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${BASE}/en/`);
    await page.waitForSelector('.bc[data-ready]');
    const viewportId = await page.locator('.bc__viewport').getAttribute('id');
    assert.ok(viewportId);
    const controls = page.locator('.bc__buttons button');
    assert.equal(await controls.count(), 2);
    assert.equal(await page.getByRole('button', { name: /^(Pause|Play) slideshow$/ }).count(), 0);
    for (const control of await controls.all()) {
      assert.equal(await control.getAttribute('aria-controls'), viewportId);
      const rect = await control.boundingBox();
      assert.ok(rect.width >= 44 && rect.height >= 44);
    }
    const carousel=page.locator('.home-portfolio .bc');
    await carousel.scrollIntoViewIfNeeded();
    await carousel.hover();
    const initial=await carousel.getAttribute('data-current');
    await page.waitForTimeout(5900);
    assert.equal(await carousel.getAttribute('data-current'),initial,'hover holds autoplay');
    await page.getByRole('button',{name:'Next slide',exact:true}).click();
    const selected=String((Number(initial)+1)%11);
    await page.waitForFunction(i=>document.querySelector('.bc').dataset.current===i,selected);
    await page.mouse.move(0,0);
    await page.waitForTimeout(5900);
    assert.equal(await carousel.getAttribute('data-current'),selected,'focused arrow holds autoplay after manual input');
    await page.locator('.site-logo').focus({preventScroll:true});
    const restarted=Date.now();
    await page.waitForFunction(i=>document.querySelector('.bc').dataset.current!==i,selected,{timeout:6500});
    assert.ok(Date.now()-restarted>=5300,'manual navigation resumes on a fresh interval after focus leaves');
  } finally { await browser.close(); }
});
