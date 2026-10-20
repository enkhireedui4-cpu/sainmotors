# Design system (2026-10-17)

Dark, editorial automotive corporate site. Reference studied: AWR Automotive (awrgroup.com/automotive):
serif display over a grotesk body, warm charcoal surfaces, label-left/statement-right introductions,
logos on neutral plates, image with an overlapping text card, black footer. Not taken: mega-menus,
logo carousels, unverified stat blocks, large empty bands.

All values are design decisions, not official brand facts. Tokens live at the top of `src/app/globals.css`.

## Colour

| Token | Value | Use |
|---|---|---|
| ink | `#171614` | page background, header, hero |
| ink-alt | `#1D1B18` | alternating band (brands, other brands, about timeline) |
| charcoal | `#211F1C` | services band |
| raised / raised-2 | `#2A2723` / `#34302B` | cards, panels, "all brands" cell |
| footer | `#100F0D` | footer |
| cream / sand / stone | `#F2EFE8` / `#B9B4AA` / `#8F8A80` | primary, secondary, meta text (stone only on ink/ink-alt/charcoal) |
| plate | `#D9D4CA` (hover `#E7E3DB`) | the surface every brand logo sits on, so official colours never change |
| signal | `#E20A17` (press `#C20914`) | Sain Motors red, from the logotype: primary buttons, carousel progress, current-page marks, one statement rule |

No gold or metallic accent, no glass, no decorative gradients. The only gradients are the hero scrims.

## Type

- **Display (2026-10-20):** Zona Pro SemiBold/Bold, the typeface named in the Sain Motors brand guideline
  (`src/fonts/zona-pro-*.woff2`, 17 KB each). Page titles, section titles, hero, timeline years, brand headlines,
  mobile menu. It has no ₮; Inter supplies that glyph. Source Serif 4 is archived in `assets/_superseded/`.
- **Text/UI:** Inter, 400–600. Body 16 px (17 px from 1024 px), lead 17–21 px.
- Mongolian Ө ө Ү ү verified in Zona Pro and Inter, and in Chrome's rendered output (docs/fonts.md).
- No all-caps labels, no letter-spaced eyebrows.

## Layout

- Container 84 rem with fluid gutters; section padding 72–136 px.
- Patterns, each used for a different job: hero (full-bleed), split masthead (4/8), section head
  (title 7 / text 5), plate grid, image + overlapping card, four-column service row, location rows,
  directory rows, brand hero (plate 5 / copy 7) with a facts band.
- Photographs: square corners. Interactive surfaces (buttons, plates, panels): 6 px radius.

## Motion (2026-10-20)

Scroll-driven depth with Motion (`motion/react`), on native scrolling: no scroll-jacking, no loaders, no
second animation engine. What is "3D" here is CSS perspective applied to real photographs and film; there is
no vehicle model.

- **Hero:** "{count} брэндийн / албан ёсны дистрибьютер" in two tiers (the count follows brands.ts), with all
  brand marks along its foot. One CSS load sequence: the photograph settles, each tier rises out of its mask,
  the copy follows and the marks arrive 40 ms apart. On scroll the photograph lays back (scale + rotateX in a
  1400px perspective) and the headline rises faster.
- **Showroom walk:** six photographs stand one behind another; the scroll moves the camera through them.
- **MEGA TEST DRIVE:** the homepage's one expanding moment: a framed muted loop opens to full bleed; the
  full film loads only in its dialog.
- **Parallax windows** (services) and a pinned sideways strip (services page; a swipe strip on phones).
- **Reveals:** section heads lift in once, and only content still below the fold after hydration is hidden.

`prefers-reduced-motion`: every scene becomes a still layout (grids, open frames, poster instead of loop);
nothing is bound to the scroll.

Timing follows the Motion AI Kit best practices: entrances ≤0.6 s (hero lines 0.6 s, 90 ms stagger),
reveals as a critically damped spring (`bounce: 0, visualDuration: 0.5`, no overshoot for a corporate
brand), dialog 260 ms. Scroll scenes map progress with `useTransform(value, input, output)`; one root
`MotionConfig reducedMotion="user"`. MotionScore (local `npx motionscore <url> --no-upload`, 2026-10-20): home S (90/100),
services S (95/100), every animation S-tier, no layout thrashing.
