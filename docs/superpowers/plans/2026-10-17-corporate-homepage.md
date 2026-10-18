# Sain Motors corporate homepage implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver the user's text-led, multi-brand homepage brief as working MN/EN pages.
**Architecture:** Keep existing Next.js App Router, local fonts, shared header/footer, content records and responsive Picture assets. Render the existing ribbon geometry once as a static decorative SVG; no animation client runtime. Replace the four-item carousel with a static three-column collection and a compact directory of the remaining brands.
**Tech Stack:** Next.js 16.4.1, React 19.3.1, TypeScript, Tailwind/CSS, existing Playwright and Vitest.
**Spec:** User's detailed brief in this conversation, 2026-10-17.

## Global constraints
- No dependencies, scaffold, routing changes or invented facts/photos.
- MN hero: “Олон улсын брэндүүд,\nМонголд албан ёсоор”; Source Serif 4 and Inter support Ө ө Ү ү.
- Container 1440–1536px, header 80–88px, touch targets at least 44px.
- No hero vehicle, duplicated navigation, autoplay or new claims.

## Review focus
- Long MN/EN titles must fit without overflow at 360/390/768/1440/1920.
- Ribbon behind text must preserve readability and reduced-motion preferences.
- Every published brand remains reachable; image/model provenance stays intact.
- Sticky header must not obscure anchor targets or keyboard focus.
- Mobile modal must trap focus, close with Escape and return focus.

## Tasks
- [x] Hero: update typed copy, remove hero-specific photo, use static ribbon geometry, restrained CTA. Update outdated hero tests and verify exact two-line desktop rendering.
- [x] Brands: add short localized card copy to existing brand records; use photo cards with one logo heading each, consistent crop/body/CTA; present remaining seven brands in a compact directory. Remove homepage-only carousel/chooser usage and verify every brand destination.
- [x] Polish and verify: consistent warm charcoal tokens, 84px header, compact spacing, showroom/service/footer intact. Update existing browser checks for current behavior; build, lint, typecheck, unit and browser tests; visual QA at the five requested widths and both languages.

## Decisions and verification ledger

### User revisions, 2026-10-18
- Homepage carousel now includes all eleven published brands. Four use sourced vehicle photographs; seven use their supplied logo or existing name treatment.
- Every brand has concise bilingual card copy. No photo-based filtering excludes a brand from the homepage.
- User requested a 4.5-second interval, including after manual selection. Counter, play/pause control and separate compact directory remain removed.
- Hero remains static per the user's latest preference.
- User authorizes immediate implementation; no additional design approval needed.
- Existing workspace is the user's uncommitted project; work stays in place, with no commits or branch operations.
- Use static ribbon output from existing geometry to avoid adding heavy image assets or a new animation loop.
- Content tests first failed on the old single-brand title and missing concise card copy, then passed after the content changes.
- Verified MN/EN layouts at 360, 390, 768, 1440 and 1920px; final mobile type is 32px minimum to preserve two balanced lines at 360px.
- CDP verified Өө Үү and the actual hero heading use custom Source Serif 4 60pt, with no fallback glyphs.
- Text contrast: card descriptions 8.68:1; navigation 15.28:1; conservative hero backdrop calculation 8.63:1. Main/secondary hero targets are 50/44px tall.
- Production build, TypeScript, lint and 25 unit tests passed. The 14-test browser suite covers routes, both languages, all brand destinations, menu Escape/focus return, anchor clearance, responsive overflow and broken images.
- Final independent review found no concrete responsive, accessibility, cascade or build regressions.
- Asset limitation retained: four brands have sourced vehicle photography; the remaining seven use existing logos/names. No replacement photos or model facts were invented.
