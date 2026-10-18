# Brand Portfolio Implementation Record (final direction: equal three-card layout)

> **For agentic workers:** Execute inline with superpowers:executing-plans. Preserve the existing working tree.

**Goal:** Evolve the existing eleven-brand 3D showroom into a restrained coverflow gallery.

**Architecture:** Keep BrandShowroom's data adapter, BrandShowcase's information and logo index, and CircularCarousel's imperative navigation interface. Replace cylindrical tile geometry with continuous cyclic card offsets and one responsive photograph per brand. Use a single requestAnimationFrame scheduler for motion and autoplay.

**Tech Stack:** Existing Next.js 16, React 19, TypeScript, CSS, Playwright; no additional dependencies.

**Spec:** User's SAIN MOTORS WORLD-CLASS BRAND PORTFOLIO REDESIGN brief in this conversation.

## Global Constraints

- Preserve navbar, hero, section order, all approved MN/EN copy, eleven brands, original logos and existing destinations.
- Coverflow motion 800ms; information fade 140ms out and 280ms in; controls 200ms.
- Autoplay every 5.5 seconds, reset after manual navigation, held by hover/focus, hidden page, offscreen section and reduced motion.
- Original photography only; no new dependencies, artificial vehicle imagery or destructive edits.

## Review Focus

- Wrap from the final to first brand and rapid repeated navigation must remain a short continuous movement.
- Focus on every control holds autoplay; resume must start a fresh interval.
- Horizontal touch/wheel navigation must preserve vertical document scrolling.
- Active-logo scrolling must affect only the logo strip, never the document.
- Loading must not repeat full-resolution images or reveal empty active photography.

### Task 1: Gallery geometry and interaction

Files: `src/components/CircularCarousel.tsx`, `src/app/circular-carousel.css`, `tests/e2e/gallery.test.mjs`.

- [x] Add browser regression tests: central image dominates, one image per visible brand, cyclic keyboard and adjacent selection, all controls hold autoplay, mobile logo overflow stays inside strip.
- [x] Run against existing gallery and observe expected failures.
- [x] Implement a continuous unwrapped index, nearest cyclic offsets, 800ms non-bouncing easing, responsive photograph dimensions, pointer/wheel and keyboard navigation. Keep next/previous/goTo handle.
- [x] Keep five nearby image sources mounted initially, then retain visited images to prevent reload flashes. Responsive source sets and explicit dimensions.

### Task 2: Information, controls and brand navigation

Files: `src/components/BrandShowcase.tsx`, `src/components/BrandGrid.tsx`, `src/app/home.css`.

- [x] Coordinate fixed-height logo/copy/CTA fades without remounting focused links.
- [x] Keep original index links; normal activation selects a brand, modified activation opens its actual destination. Active image and CTA open the brand.
- [x] Use a single horizontally scrollable eleven-logo strip with a moving active underline. Scroll its container only.
- [x] Align desktop information on one grid; adapt tablet and mobile deliberately.

### Task 3: Verification and refinement

- [x] Visually inspect MN/EN at 320, 375, 390, 430, 768, 1024, 1440 and 1920px.
- [x] Verify hover/focus/visibility/offscreen/reduced-motion autoplay holds, swipe, wheel, rapid navigation and cyclic wrap.
- [x] Run lint, typecheck, unit tests, production build and existing plus new browser tests. Update obsolete cylinder-specific test selectors only.
- [x] Obtain a scoped independent review, resolve material findings, and report actual evidence.


## Final user direction: equal three-card corporate portfolio

The user explicitly superseded the coverflow architecture with the original three-card layout. The hero, header, all eleven brand data records and routes remain untouched. BrandShowroom now uses the existing BrandCarousel with equal photography/logo/copy/CTA cards; desktop three, tablet two, mobile one plus a small preview. Original photo colors are preserved. Only quiet horizontal sliding, border and arrow hover transitions remain.

Review findings resolved with failing-then-passing browser regressions: initial clone animation and resize positioning; visible loop cards were inert; keyboard arrows hid the focused link; native overflow scrolling doubled the track offset during focus. Autoplay is 5.5 seconds, resumes after manual navigation when hover/focus leave, and retains explicit pause/reduced-motion/offscreen/visibility holds.

Final validation: production export generated 41 routes; lint and typecheck passed; 31 unit tests and 27 browser tests passed. Chrome screenshots inspected in MN/EN at 320, 375, 390, 430, 768, 1024, 1440 and 1920px, with additional RIDDARA/AITO/212 and RELY/MAXUS/HONGQI group views. Sixteen responsive page views reported no overflow, broken requests or browser errors. Touch was tested using Chromium touch emulation. The earlier coverflow steps are a historical record; the final three-card direction above supersedes their visible architecture.
