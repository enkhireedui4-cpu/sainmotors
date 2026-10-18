# Drive materials integration and design refinement — plan

Historical plan. The later source confirmation in `2026-10-18-local-brand-materials.md`
supersedes the image exclusions and old hero/carousel choices below.

> Executed inline in this session (user asked for implementation without a review stop). Steps use `- [ ]`.

**Goal:** Rebuild sainmotors.mn around the brand material the brand teams supplied on Google Drive
(2026-10-16), and fix the hero, brand grid, services and locations composition.

**Architecture:** Same Next.js 16 static export. Content stays typed in `src/content/` (status-gated);
images go through `scripts/build-images.mjs` from originals in `assets/`. No new dependencies.

**Spec:** the user's brief in the session (2026-10-17) + `docs/content-sources.md` (written in Task 1).

## Global constraints

- Publish only facts that trace to a source; Drive facts are `sourced` (received, not approved), web-team wording is `draft`.
- No AI-generated imagery on the site (RELY, BESTUNE, HONGQI, MAXUS, RIDDARA RD6, BYD TI 7 Drive images excluded).
- No showroom photo presented as service operations. No invented hours, emails, coordinates or years.
- Link only to destinations verified on 2026-10-17 (chery.mn does not resolve; faw.com has an expired certificate).
- MN and EN carry the same facts; review/status notes never render outside `?review`.
- Hero: four slides (company, brands, service, showroom); slide 1 high priority, later slides on demand.

## Review focus

1. Brands with no photo and/or no logo (SOUEAST, CHERY, five text-led brands) must still look intentional.
2. Long Mongolian strings at 360 px (hero titles, location names, brand facts) must wrap without overflow.
3. Locations without hours, email or exact coordinates must still give a working call/map action.
4. Slow network: no blank hero frame; no slide shown before its image loads.
5. Language switch on every brand page lands on the same brand.

---

### Task 1: Source inventory and assets
**Files:** create `docs/content-sources.md`; add originals under `assets/photos/brands/`, `assets/logos/`;
modify `scripts/build-images.mjs` (LOGOS, PHOTOS with per-image crops), regenerate `public/media`, `media.json`.
- [x] Copy selected originals (212, AITO M5/M7/M9, BYD Atto 3 ×2, Sealion 6, Shark 6 ×2; logos 212, RELY, BESTUNE, HONGQI, MAXUS, BYD, RIDDARA).
- [x] Logos: use supplied black variants as-is (trim only); BYD/RIDDARA take the first black variant of the sheet.
- [x] Photos: wide + portrait (≈4:5) crops per hero slide; 3:2 brand crops; model thumbnails.
- [x] `npm run images` succeeds; contact sheet of outputs reviewed.

### Task 2: Content model and copy
**Files:** `src/content/{types,brands,company,hero,pages,photos,ui,index}.ts`
- [x] Brand: `since?`, `headline?`, `models?`, `links[]` (`site`/`facebook`, verified date), `location`, `phone`, `photo?`, `gallery?`.
- [x] Locations: six (Dolgoon Nuur, Sansar, BYD 4S, JETOUR C1, Darkhan, service centre); hours/email/geo optional; brands derived from brand records.
- [x] Services: sales (all), warranty & after-sales (brands whose statement says so), repair & parts (JETOUR service centre, BYD 4S).
- [x] Company copy from the distributor statements; about-page milestones 2024–2026 from the sheets.
- [x] Hero: per-slide focal points and text side; service slide uses a vehicle photo with honest alt.

### Task 3: Hero recomposition
**Files:** `src/components/{Hero,HeroCarousel}.tsx`, `src/app/globals.css`
- [x] Remove slab and credit badge; directional gradient sized to the copy; stacked layout in portrait.
- [x] Leaning progress segments; controls unchanged in behaviour (pause, tabs, arrows, swipe, reduced motion).

### Task 4: Pages
**Files:** `src/app/[lang]/**/page.tsx`, `src/components/*`
- [x] Home: logo grid (11 + "all brands" cell), company intro, text-led services band, showroom list.
- [x] Brands directory, brand template (facts, photo, models, showroom, other brands), services, contact, about, footer.

### Task 5: Tests and verification
**Files:** `tests/unit/content.test.ts`, `tests/e2e/site.test.mjs`
- [x] Unit: locations/brands cross-references, links https + verified, release gate lists SOUEAST logo.
- [x] `npm run typecheck && npm run lint && npm test && npm run build`, preview + `npm run test:e2e`.
- [x] Screenshots 360/390/768/1280/1440 + 1280×600, MN/EN; fix what they show.
