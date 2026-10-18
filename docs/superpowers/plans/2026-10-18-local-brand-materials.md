# Local brand material and presentation refinement

The user confirmed Desktop `brands6` (five brands) and `3brand` (three brands) as the
official supplied material and explicitly requested that these images, marks and facts be used.
This supersedes the earlier decision to substitute external images for those eight brands.

- [x] Import the supplied photographs and source logo sheets; keep originals untouched and record hashes.
- [x] Use supplied main images for all eight brands; retain the existing JETOUR, SOUEAST and CHERY material.
- [x] Extract the supplied white logo variants without their black presentation-sheet backgrounds.
- [x] Refine the uniform homepage cards: restrained border, consistent logo slot, two-line copy, full-width link row.
- [x] Recompose brand details with a photo-led introduction, concise lead, source-based facts and model gallery.
- [x] Preserve the corporate hero, static ribbon, eleven-brand coverage, MN/EN routing, contact actions and 4500ms carousel.
- [x] Check five viewport widths in both languages, all eight supplied brands, build, lint, unit and browser tests.

Design calls: retain Source Serif 4 and Inter, warm charcoal `#1b1a18`, panel `#22211e`, warm
white `#f3f0e9`, muted text `#c2beb5`, Sain red for limited interaction. Pictures stay naturally
coloured. Shared photo ratio and optical mark sizing provide consistency across different source scenes.
No new framework or dependency is needed. Source summaries remain sourced/draft as appropriate.

Validation: production build (41 routes) and lint pass; 28 unit tests and 17 browser tests pass.
Browser coverage includes every supplied brand in MN/EN at 360, 390, 768, 1440 and 1920px;
homepage copy is two lines with aligned links at all ten locale/width combinations. Native
screenshots reviewed for the homepage cards, 1920px home, 1440px BYD/MAXUS, 768px AITO and
360px BYD. The working dev URL on port 3200 returns the updated pages without browser errors.
