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

- **Display:** Source Serif 4, display optical size, 400–600 (`src/fonts/source-serif-display.woff2`, 68 KB).
  Page titles, section titles, hero, timeline years, brand headlines, mobile menu.
- **Text/UI:** Inter, 400–600. Body 16 px (17 px from 1024 px), lead 17–21 px.
- Mongolian Ө ө Ү ү №, ₮ verified in both files and in Chrome's rendered output (docs/fonts.md).
- No all-caps labels, no letter-spaced eyebrows.

## Layout

- Container 84 rem with fluid gutters; section padding 72–136 px.
- Patterns, each used for a different job: hero (full-bleed), split masthead (4/8), section head
  (title 7 / text 5), plate grid, image + overlapping card, four-column service row, location rows,
  directory rows, brand hero (plate 5 / copy 7) with a facts band.
- Photographs: square corners. Interactive surfaces (buttons, plates, panels): 6 px radius.

## Motion

Hero cross-fade and progress, hover colour shifts, menu fade. No scroll-triggered reveals, no loaders.
`prefers-reduced-motion` stops rotation and transitions.
