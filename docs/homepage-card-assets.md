# Active brand material — 2026-10-18

The user confirmed Desktop `brands6` (five brands) and `3brand` (three brands) as the official
supplied material and explicitly requested that its images, marks and information be used.
The eight brands now share their supplied main images between homepage cards and brand pages.
Originals are untouched. Exact paths, dimensions and SHA-256 hashes are in
[brand-material-inventory.json](brand-material-inventory.json).

| Brand | Local main image | Additional images |
|---|---|---|
| 212 | `brands6/212/Photo` mountain scene | — |
| CHERY RELY | `brands6/CHERY RELY/Photos` pickup scene | — |
| FAW BESTUNE | `brands6/FAW BESTUNE/Photo` SUV scene | — |
| FAW HONGQI | `brands6/FAW HONGQI/Photos` city scene | — |
| MAXUS | `brands6/SAIC MAXUS/Photo` commercial trucks | — |
| AITO | `3brand/Aito/M9` Midnight Black | M5 Red, M7 Blue |
| BYD | `3brand/BYD/Atto 3` city image | TI 7, Sealion 6, Shark 6 front/top/side, Atto 3 coast |
| RIDDARA | `3brand/Riddara/RD6` forest scene | — |

All sixteen supplied images appear on the corresponding brand page. Generic team artwork is
captioned with its brand when no model name was supplied. Distributor years, model lists,
showrooms and phones trace to the eight XLSX sheets. AITO M5/M7/M9 and RIDDARA RD6 model lists
are now exposed in the brand facts. No prices, availability or technical specifications were added.

## Previously sourced manufacturer alternatives (archive)

Only SOUEAST below remains active, since it is in neither supplied folder. JETOUR retains its
existing jetour.mn T2 image. CHERY now uses the TIGGO 8 image from Sain Motors' own CHERY site
(Desktop `chery/public/assets/img/hero-t8.webp` → `assets/photos/brands/chery-tiggo8.webp`, SHA-256
`7a8c99b8…f4e726d`), because TIGGO 9 is not in the local line-up (TIGGO 2, 4, 7, 8). The other five
alternatives below have been replaced by the local team material at the user's request.

Sources were checked and downloaded on 2026-10-18. Masters are under `assets/photos/brands/`;
`npm run images` creates responsive WebP variants. No model-name overlays are added.

| Master | Model / source page | Exact image |
|---|---|---|
| `soueast-s09.webp` | [SOUEAST S09](https://www.soueast-motor.com/s09/) | https://www.soueast-motor.com/img-page/car/s09/cib_03.jpg |
| `chery-tiggo9.webp` | [CHERY TIGGO 9](https://www.cheryinternational.com/pc/models/tiggo/tiggo9/index.shtml) | https://www.cheryinternational.com/data/tms/website/html/images/tiggo9/kv.jpg |
| `riddara-rd6.webp` | [RIDDARA global](https://www.riddara.com/) | https://www.riddara.com/-/media/project/riddara/images/poster/home_s3_01-poster.jpg |
| `bestune-t99.webp` | [BESTUNE Saudi Arabia T99](https://bestune-sa.com/t99/) | https://bestune-sa.com/wp-content/uploads/2022/05/t99-2.jpg |
| `rely-r8.webp` | [Chery Commercial Vehicle RELY R8](https://www.cherycvglobal.com/R8) | https://www.cherycvglobal.com/images/R8/B1.jpg |
| `maxus-t90.webp` | [SAIC MAXUS T90](https://en.saicmaxus.com/car/t90.shtml) | https://en.saicmaxus.com/uploads/month_202409/images/893f44fa219fe1187c0d7d9fb3d23889.jpg |
| `hongqi-hs5.webp` | [HONGQI HS5](https://www.hongqi-auto.com/pages/cartype/cartype_hs5_new.html) | https://www.hongqi-auto.com/images/cartype/hs5-new/kv_pc.jpg |

## Marks on dark cards

Separate `logosOnDark` manifest entries preserve source colour, transparency and proportions.
The only processing is rasterisation, optical sizing and trimming empty margins/variant bands.
CHERY retains the supplied red wordmark. No CSS inversion is applied to coloured marks.

- 212, BESTUNE, RELY, MAXUS, HONGQI: supplied white PNGs from
  `C:/Users/user/OneDrive/Desktop/brands6/<brand>/Logo` (HONGQI uses `LOGO`).
  These are the same brand-team versions held in Drive. Their original source files remain intact.
- BYD, RIDDARA: black and white wordmark bands from the original SVG sheets in Desktop `3brand`.
  The black presentation panels and RIDDARA's small endorsement are excluded by luminance/band masks.
- JETOUR: official header's monochrome CSS mask from https://www.jetourglobal.com/,
  rendered in white as in the manufacturer's dark header; geometry unchanged.
- SOUEAST: https://www.soueast-motor.com/img-page/car/s09/header_logo_w.png.
- AITO: black and white wordmark band from `3brand/Aito/Logo/AITO_logo 1.svg`; extracted from
  the emblem sheet at vector resolution, without its black presentation background.

## User-provided local information

The eight XLSX files in Desktop `brands6` and `3brand` were read without modification. Their vehicle
categories, distributor statements, showroom details and contact numbers match the existing
brand-team content already recorded in `content-sources.md`. Homepage copy is a short web-team
summary in MN/EN and remains `draft`; supplied photographs/marks remain `sourced`.

The earlier hold on several Drive illustrations is superseded by the user's explicit source
confirmation. These images are used as supplied brand artwork, without claims about photographic
capture or inferred model names. The user's source files are not altered.
