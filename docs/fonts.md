# Фонтын сонголт ба Монгол кирилл шалгалт

## 2026-10-17: corporate нүүрийн эцсийн browser шалгалт

Source Serif 4-ийн 450 жинг MN/EN hero-д ашиглав. Chrome CDP `CSS.getPlatformFontsForNode`-оор
`Өө Үү` probe болон бодит гарчгийг шалгахад `Source Serif 4 60pt`, `isCustomFont: true` гэж гарсан;
системийн fallback фонт ашиглаагүй. MN/EN гарчиг 1440/1920px дээр хоёр мөртэй, MN нь эцсийн
32px minimum хэмжээтэйгээр 360px дээр мөн хоёр мөрөөр багтсан. Inter-ийн одоогийн local preload-ийг хадгалсан.

## 2026-10-17: харанхуй editorial дизайн

| Үүрэг | Фонт | Жин | Файл | Хэмжээ |
|---|---|---|---|---|
| Гарчиг | Source Serif 4 (OFL), display optical size (opsz 60) | 400–600 (variable) | `src/fonts/source-serif-display.woff2` | 67.8 KB |
| Бичвэр | Inter (OFL), text optical size | 400–600 (variable) | `src/fonts/inter-text.woff2` | 58.3 KB |

Source Serif 4: Google Fonts API-аас `text=` subset (ASCII, Latin-1 цэг тэмдэг, А–я, Ёё Өө Үү, №, ₮, сум).
Харьцуулсан: Lora, Noto Serif Display, Cormorant Garamond, PT Serif, Literata — бүгд Ө ө Ү ү-г өөрөө зурдаг
(Chrome CSS.getPlatformFontsForNode: системийн фонт руу шилжээгүй). Cormorant «л»-ийг «Λ» хэлбэрээр зурдаг тул
хассан; Noto Serif Display-ийн нарийн зураас харанхуй дэвсгэр дээр анивчдаг. Geologica-г `assets/_superseded/`-д шилжүүлсэн.

## 2026-10-15: анхны сонголт (одоо Inter л хэрэглэгдэнэ)

| Үүрэг | Фонт | Жин | Файл | Хэмжээ |
|---|---|---|---|---|
| Гарчиг | Geologica (OFL) | 500–700 (variable) | `src/fonts/geologica-display.woff2` | 34.6 KB |
| Бичвэр | Inter (OFL), text optical size | 400–600 (variable) | `src/fonts/inter-text.woff2` | 58.3 KB |

Эх: Google Fonts-ын албан repo (`google/fonts/ofl/*`). Subset: Latin, Latin-1, Cyrillic
U+0400–04FF (Ө Ү орно), ₮ U+20AE, № U+2116, цэг тэмдэг, сум. Geologica-ийн CRSV/SHRP/slnt тэнхлэгийг 0-д,
Inter-ийн opsz-ийг 14-д тогтоосон.

## Шалгасан зүйл

1. **Файлын cmap** (fontkit): Ө ө Ү ү ₮ № Ё ё — хоёр subset файлд бүгд glyph-тэй.
2. **Жин бүрт хэлбэр** (эх TTF, wght 400/600/700): Ө ө Ү ү-ийн outline хоосон биш.
3. **Хөтөч дээр** (Chrome): `document.fonts` → хоёр face `loaded`; `document.fonts.check("600 40px geologica", "Өө Үү")` = true;
   hero-д «Өөрт тохирох…» гарчиг Geologica-аар зурагдсаныг screenshot-оор харсан.

## Хассан сонголтууд

- **Sofia Sans / Sofia Sans Condensed** — Google «cyrillic-ext» гэж ангилсан ч файлд Ө ө Ү ү ₮ БАЙХГҮЙ (notdef).
- **Unbounded, Wix Madefor, Hanken Grotesk, Alumni Sans, IBM Plex Sans Condensed** — Ө/Ү дутуу.
- **Onest, Golos Text, Exo 2, Roboto Condensed** — ₮ дутуу.
- **Science Gothic** — бүрэн хамрах ч «л»-ийг «Λ» хэлбэрээр зурдаг; албан сайтад монгол уншигчдад тохиромжгүй.
