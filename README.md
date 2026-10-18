# sainmotors.mn — Sain Motors-ын байгууллагын вэб (V1)

Монгол/англи хоёр хэлтэй танилцуулгын сайт: компани → брэндүүд → үйлчилгээ → холбоо барих.
Загварын каталог, үнэ, форм, CMS байхгүй; брэнд бүрийн дэлгэрэнгүй нь тухайн брэндийн сайтад
(jetour.mn; бусад брэндийн албан ёсны сайт, Facebook хуудас — шалгасан холбоос л харагдана).

## Стек

- Next.js 16.4 (App Router) static export → `out/` (HTML/CSS/JS). Node сервер шаардахгүй.
- React 19, TypeScript, Tailwind v4 (зөвхөн reset + token; загварууд `src/app/globals.css`).
- Дизайн: харанхуй editorial систем — `docs/design-system.md`. Агуулга засах заавар — `docs/editing-guide.md`.
- Фонт: Source Serif 4 (гарчиг) + Inter (бичвэр), өөрсдөө host хийсэн subset. Ө ө Ү ү ₮ шалгасан — `docs/fonts.md`.
- Зураг: `assets/`-аас sharp-аар responsive WebP үүсгэнэ (`scripts/build-images.mjs`).
- Өгөгдлийн сан, CMS, auth, analytics, cookie байхгүй.

Яагаад static export вэ: sainmotors.mn нь webhost.mn-ийн shared (Apache) hosting руу заадаг.
Static файлууд ямар ч хостинг дээр ажиллана; redirect, header-ийг `public/.htaccess` хариуцна.

## Командууд

```bash
npm install
npm run dev            # http://localhost:3200 (зураг байхгүй бол эхлээд үүсгэнэ)
npm run build          # preview build → out/
npm run preview        # out/-ыг Apache шиг үйлчилнэ: http://localhost:3300
npm run build:release  # нийтлэх build: батлагдаагүй агуулга байвал ЗОГСОНО
npm run typecheck && npm run lint
npm test               # unit (vitest)
npm run test:e2e       # browser тест (preview ажиллаж байх ёстой; суусан Chrome/Edge ашиглана)
npm run content:checklist  # docs/content-checklist.csv — Дашням ахлахад өгөх хүснэгт
```

Staging-д build хийхдээ `NEXT_PUBLIC_SITE_URL=https://staging-хаяг` тохируул: canonical,
sitemap тэр хаягаар гарч, robots/noindex нь хайлтаас хаана. Тохируулахгүй бол
`https://sainmotors.mn` гэж үзнэ.

## Агуулгын урсгал

Бүх бичвэр `src/content/`-д (typed). Хуудсууд зөвхөн `src/content/index.ts`-ээр уншина —
ирээдүйд CMS руу шилжвэл зөвхөн тэр файл солигдоно.

Блок бүр `status`-тэй:

| status | Утга |
|---|---|
| `approved` | Дашням ахлахын баг баталсан |
| `sourced` | Sain Motors-ын өөрийн эх сурвалж: брэндийн багуудын Drive хүснэгт (2026-10-16) эсвэл jetour.mn — хүлээн авсан, сайтад нийтлэх батлагдаагүй |
| `draft` | Веб багийн бичсэн буюу орчуулсан бичвэр — солих эсвэл батлах |

- Staging дээр аль ч хуудсыг `?review` гэж нээвэл ноорог хэсгүүд тасархай хүрээгээр тодорно.
- `npm run build:release` нь `approved`-аас бусад зүйл, эсвэл лого дутуу брэнд байвал жагсааж зогсоно.
  Ингэснээр ноорог, placeholder production руу санамсаргүй гарахгүй.
- Эх сурвалж бүрийн Drive ID, зургийн сонголт, хассан зураг, нээлттэй зөрүүг `docs/content-sources.md`-д бүртгэсэн.
- Брэнд нэмэх/нуух: `src/content/brands.ts` → `published`, `order`, `location`, `phone`, `links` (`live: false` бол харагдахгүй).
  Лого: `assets/logos/brand-<slug>.(svg|png)` нэмээд `scripts/build-images.mjs`-ийн `LOGOS`-д бүртгэнэ
  (`optical` — сүлжээн дэх нүдэнд харагдах хэмжээг тэнцүүлэх гар засвар).
- Hero зураг солих: `assets/photos/`-д эх файл, `scripts/build-images.mjs`-ийн `PHOTOS`-д 16:9 болон дөрвөлжин
  тайралт; фокусыг `src/content/hero.ts`-ийн `focus`-оор. Өргөн дэлгэцэнд бичвэр зүүн дээд буланд байрлана —
  гол объектыг доод/баруун хэсэгт үлдээ.

## Байршуулах (зөвшөөрөл авсны дараа)

1. `npm run build:release` амжилттай дуусна.
2. Одоогийн production файлуудыг zip хийж хадгална (буцаах хувилбар).
3. `out/` доторх бүх файлыг (`.htaccess` орно) хостингийн `public_html/` руу хуулна.
4. Шалгана: `https://sainmotors.mn/` → `/mn/`, хоёр хэл, 404, `sitemap.xml`, `robots.txt`.
5. Буцаах: 2-р алхмын zip-ийг сэргээнэ.

**Анхаар:** sainmotors.mn нь `*.webhost.mn` сертификат өгдөг (хугацаа нь 2026-04-07-нд дууссан, домэйнд ч
таарахгүй) — 2026-10-15 ба 2026-10-18-нд шалгасан. Зөв сертификат суулгах хүртэл HTTPS ажиллахгүй — launch
blocker. Суулгасны дараа `.htaccess` дахь HTTPS/www redirect-ийг идэвхжүүлнэ.

## Мэдэгдэж буй онцлог

- **Windows дээрх build:** Next 16-ийн static export Windows дээр prefetch файлуудыг буруу замаар бичдэг.
  `scripts/fix-export-segments.mjs` build-ийн дараа автоматаар засна (Linux дээр юу ч хийхгүй).
- `AGENTS.md`-ийг `next dev` өөрөө үүсгэдэг.
- Үйлчилгээний төвийн зураг ирээгүй: үйлчилгээний хэсэг зураггүй (шоурумын зургийг үйлчилгээ мэт харуулахгүй).
- 8 брэндийн (212, RELY, BESTUNE, HONGQI, MAXUS — Desktop `brands6`; AITO, BYD, RIDDARA — Desktop `3brand`) зураг,
  лого, мэдээллийг хэрэглэгчийн шийдвэрээр (2026-10-18) нийтэлж байна. Өмнө нь AI-аар үүсгэсэн гэж сэжиглээд
  хассан зургууд үүнд орно — `docs/content-sources.md`, `docs/superpowers/plans/2026-10-18-local-brand-materials.md`.
- CHERY-гийн шоурум, цаг, утас, загвар, баталгааг Сайн Моторс-ын CHERY сайтын төслөөс (Desktop `chery`) авсан;
  chery.mn одоогоор нээгдэхгүй тул холбоос нуугдсан.
- SOUEAST-ийн цайвар дэвсгэрийн лого, шоурум, утас ирээгүй (жагсаалтад нэрийг үсгээр харуулна);
  `npm run build:release` үүнийг жагсааж зогсоно.
