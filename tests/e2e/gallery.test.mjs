import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const BASE = process.env.BASE_URL ?? 'http://localhost:3300';
const executablePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

test('homepage presents three equal photographic brand cards on desktop', async () => {
  const browser = await chromium.launch({ executablePath });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${BASE}/en/`);
    assert.equal(await page.locator('.home-portfolio .bc__slide[data-index] .portfolio-card').count(), 11);
    await page.locator('.home-portfolio .bc').scrollIntoViewIfNeeded();
    await page.waitForSelector('.home-portfolio .bc[data-ready]');
    const cards = await page.locator('.home-portfolio .bc__slide[data-index] .portfolio-card').evaluateAll(cards => cards.slice(0,3).map(card=>{const r=card.getBoundingClientRect();return {left:r.left,width:r.width,height:r.height,top:r.top,bottom:card.querySelector('.portfolio-card__cta').getBoundingClientRect().top}}));
    const viewport = await page.locator('.bc__viewport').boundingBox();
    assert.ok(Math.abs(cards[0].left-viewport.x)<2, 'initial card aligns without animating through loop copies');
    assert.ok(cards[0].width > 350 && cards[0].width < 450);
    assert.equal(new Set(cards.map(c=>Math.round(c.width))).size,1);
    assert.equal(new Set(cards.map(c=>Math.round(c.height))).size,1);
    assert.equal(new Set(cards.map(c=>Math.round(c.top))).size,1);
    assert.equal(new Set(cards.map(c=>Math.round(c.bottom))).size,1);
    assert.equal(await page.locator('.circular-carousel, .brand-showcase__index').count(),0);
  } finally { await browser.close(); }
});

test('all eleven card transitions and cyclic wrap preserve routes in MN and EN', async () => {
  const browser=await chromium.launch({executablePath});
  const slugs=['jetour','soueast','chery','byd','riddara','aito','212','bestune','rely','maxus','hongqi'];
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    for(const locale of ['mn','en']) {
      await page.goto(BASE+'/'+locale+'/');await page.locator('.home-portfolio .bc').scrollIntoViewIfNeeded();await page.waitForSelector('.bc[data-ready]');
      const links=await page.locator('.bc__slide[data-index] .portfolio-card').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
      assert.deepEqual(links,slugs.map(s=>'/'+locale+'/brands/'+s+'/'));
      for(let step=1;step<=11;step++) {
        await page.locator('.bc__buttons button').last().click();
        const index=step%11;await page.waitForFunction(i=>document.querySelector('.bc').dataset.current===String(i),index);
        await page.waitForTimeout(760);
        const card=page.locator('.bc__slide[data-index="'+index+'"] .portfolio-card');
        const image=card.locator('.portfolio-card__media img');
        assert.equal(await image.evaluate(e=>e.complete&&e.naturalWidth>0),true,slugs[index]);
        const a=await card.boundingBox();const viewport=await page.locator('.bc__viewport').boundingBox();
        assert.ok(Math.abs(a.x-viewport.x)<2,locale+'/'+slugs[index]+' starts at the same edge');
      }
    }
  } finally {await browser.close()}
});

test('equal-card portfolio fits eight viewport sizes and both languages', async () => {
  const browser=await chromium.launch({executablePath});
  try {
    const page=await browser.newPage();
    for(const width of [320,375,390,430,768,1024,1440,1920]) for(const locale of ['mn','en']) {
      await page.setViewportSize({width,height:1000});await page.goto(BASE+'/'+locale+'/');await page.waitForSelector('.bc[data-ready]');
      const metrics=await page.locator('.bc').evaluate(e=>({perView:parseFloat(getComputedStyle(e).getPropertyValue('--per-view')),overflow:document.documentElement.scrollWidth-innerWidth,photos:e.querySelectorAll('[data-index] .portfolio-card__media img').length,logos:e.querySelectorAll('[data-index] .portfolio-card__mark img').length}));
      assert.equal(metrics.overflow,0,locale+' at '+width);assert.equal(metrics.photos,11);assert.equal(metrics.logos,11);
      assert.equal(metrics.perView,width>=1024?3:width>=640?2:1.06);
    }
  } finally {await browser.close()}
});

test('mobile horizontal swipe moves a card and vertical scrolling stays available', async () => {
  const browser=await chromium.launch({executablePath});
  try {
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    await page.goto(BASE+'/en/');await page.waitForSelector('.bc[data-ready]');await page.locator('.bc__viewport').scrollIntoViewIfNeeded();
    const bounds=await page.locator('.bc__viewport').boundingBox();const y=bounds.y+120;
    const session=await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y}]});
    for(const x of [260,220,180,140,100])await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForFunction(()=>document.querySelector('.bc').dataset.current==='1');await page.waitForTimeout(760);
    assert.equal(page.url(),BASE+'/en/');const before=await page.evaluate(()=>scrollY);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y}]});
    for(const dy of [20,50,80,120])await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:y-dy}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
    assert.ok(await page.evaluate(()=>scrollY)>before+20);assert.equal(await page.locator('.bc').getAttribute('data-current'),'1');
  } finally {await browser.close()}
});

test('visible wrap cards keep their working destinations', async () => {
  const browser=await chromium.launch({executablePath});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    await page.goto(BASE+'/en/');await page.waitForSelector('.bc[data-ready]');
    await page.locator('.bc__slide[data-index="10"] .portfolio-card').focus();await page.waitForTimeout(760);
    // Select by route rather than by private loop geometry.
    const copies=page.locator('.bc__slide:not([data-index]) a[href="/en/brands/jetour/"]');
    assert.equal(await copies.count(),1);
    await copies.click({timeout:2000});await page.waitForURL(BASE+'/en/brands/jetour/');
  } finally {await browser.close()}
});

test('arrow keys move card focus to a visible neighboring brand', async () => {
  const browser=await chromium.launch({executablePath});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    await page.goto(BASE+'/en/');await page.waitForSelector('.bc[data-ready]');
    await page.locator('.bc__slide[data-index="0"] .portfolio-card').focus();
    await page.keyboard.press('ArrowRight');await page.waitForTimeout(760);
    assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'/en/brands/soueast/');
    const active=await page.locator(':focus').boundingBox();const viewport=await page.locator('.bc__viewport').boundingBox();
    assert.ok(active.x>=viewport.x-1&&active.x+active.width<=viewport.x+viewport.width+1);
  } finally {await browser.close()}
});

test('focusing an offscreen brand does not combine native scrolling with track translation', async () => {
  const browser=await chromium.launch({executablePath});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    await page.goto(BASE+'/en/');await page.waitForSelector('.bc[data-ready]');
    const card=page.locator('.bc__slide[data-index="4"] .portfolio-card');
    await card.focus({preventScroll:true});await page.waitForTimeout(760);
    assert.equal(await page.locator('.bc__viewport').evaluate(e=>e.scrollLeft),0);
    const rect=await card.boundingBox();const viewport=await page.locator('.bc__viewport').boundingBox();
    assert.ok(Math.abs(rect.x-viewport.x)<2);
  } finally {await browser.close()}
});
