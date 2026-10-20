// Exports every piece of site content with its review status to
// docs/content-checklist.csv (UTF-8 with BOM so Excel shows Cyrillic), in the
// table format agreed with the content team:
//   section → MN → EN → image/logo → made by → approver → status
// Run: npm run content:checklist
//
// Reads the typed content files directly (Node strips the TypeScript types).
import fs from "node:fs";
import path from "node:path";
import { brands } from "../src/content/brands.ts";
import { company, contact, locations, services, socials } from "../src/content/company.ts";
import { driveEvents, testDrive } from "../src/content/events.ts";
import { hero } from "../src/content/hero.ts";
import { pages } from "../src/content/pages.ts";
import { sitePhotos } from "../src/content/photos.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const media = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/generated/media.json"), "utf8"));

const STATUS = { approved: "Батлагдсан", sourced: "Эх сурвалжаас — баталгаажуулах", draft: "Ноорог — солих/батлах" };
const rows = [];
const add = (section, key, mn, en, asset, status, source = "", madeBy = "Энх-Ирээдүй (веб)") =>
  rows.push({ section, key, mn, en, asset, status: STATUS[status] ?? status, source, madeBy });
const text = (v) => (typeof v === "string" ? v : Object.values(v).join(" / "));

// Company and contact
add("Компани", "Албан нэр", company.legalName.value.mn, company.legalName.value.en, "", company.legalName.status, company.legalName.source);
add("Компани", "Нүүрийн танилцуулга (80–120 үг)", company.introduction.value.mn, company.introduction.value.en, "showroom-5", company.introduction.status);
add("Холбоо барих", "Утас, и-мэйл", `${contact.phone.display}, ${contact.email}`, `${contact.phone.display}, ${contact.email}`, "", contact.status, contact.source);
for (const s of socials) add("Холбоо барих", `Сошиал: ${s.label}`, s.url, s.url, "", "sourced", contact.source);
for (const l of locations) {
  const hours = (lang) => (l.hours ?? []).map((h) => `${h.days[lang]} ${h.time[lang]}`).join("; ") || "ЦАГ ДУТУУ";
  const here = brands.filter((b) => b.published && (b.location === l.id || l.serviceBrands?.includes(b.slug))).map((b) => b.name).join(", ");
  add("Байршил", `${l.name.mn} — хаяг`, `${l.address.mn} (${l.landmark?.mn ?? ""})`, `${l.address.en} (${l.landmark?.en ?? ""})`, l.photo?.key ?? "Зураг хэрэгтэй", l.status, l.source);
  add("Байршил", `${l.name.mn} — цаг`, hours("mn"), hours("en"), "", l.hours ? l.status : "draft", l.source);
  add("Байршил", `${l.name.mn} — брэнд, газрын зураг`, here, `${here} — ${l.map.precision === "pin" ? "координат" : "газрын зургийн хайлт (координат хэрэгтэй)"}`, "", l.status, l.source);
}

// Hero: one corporate statement over the decorative ribbon artwork, no photograph
add("Hero", "Гарчиг", hero.title.value.mn, hero.title.value.en, "", hero.title.status, hero.title.source);
add("Hero", "Тайлбар", hero.text.value.mn, hero.text.value.en, "", hero.text.status, hero.text.source);
add("Hero", "Товчлуурууд", `${hero.cta.label.mn} / ${hero.secondaryCta.label.mn}`, `${hero.cta.label.en} / ${hero.secondaryCta.label.en}`, `→ ${hero.cta.href}, ${hero.secondaryCta.href}`, hero.text.status);

// Brands
for (const b of brands.filter((x) => x.published).sort((a, c) => a.order - c.order)) {
  const logo = media.logos[b.slug] ? `лого: ${media.logos[b.slug].src}` : "ЛОГО ДУТУУ (SVG/PNG)";
  add("Брэнд", `${b.name} — товч танилцуулга`, b.summary.value.mn, b.summary.value.en, logo, b.summary.status, b.summary.source);
  if (b.headline) add("Брэнд", `${b.name} — гарчиг`, b.headline.value.mn, b.headline.value.en, "", b.headline.status, b.headline.source);
  if (b.statement) add("Брэнд", `${b.name} — эрхийн хэллэг`, b.statement.value.mn, b.statement.value.en, "", b.statement.status, b.statement.source);
  else add("Брэнд", `${b.name} — эрхийн хэллэг`, "", "", "", "draft", "Батлагдсан хэллэг ирээгүй — сайтад гарахгүй");
  const links = b.links.map((l) => `${l.url} (${l.live ? "ажиллаж байна" : "ажиллахгүй — нуусан"}, ${l.checked})`).join("; ") || "Холбоос байхгүй";
  const showroom = locations.find((l) => l.id === b.location);
  const facts = [b.since ? `${b.since} оноос` : "", b.phone?.display ?? "ерөнхий утас", showroom?.name.mn ?? "шоурум тодорхойгүй", b.models?.join(" / ") ?? ""].filter(Boolean).join(", ");
  const photo = b.photo ?? b.cardPhoto;
  add("Брэнд", `${b.name} — холбоос, утас, шоурум`, `${facts}; ${links}`, `${facts}; ${links}`, photo?.key ?? "Брэндийн зураг байхгүй", "sourced", showroom?.source ?? "Drive brand sheet");
}

// Section photos
for (const [key, value] of Object.entries(sitePhotos)) {
  for (const photo of [value].flat()) {
    add("Зураг", key, photo.alt.mn, photo.alt.en, `${photo.key}${photo.note ? ` (${photo.note})` : ""}`, photo.status);
  }
}

// MEGA TEST DRIVE: the homepage film section and the editions it lists
add("Тест драйв", "Нүүрийн бичвэр", text(testDrive.value.mn), text(testDrive.value.en), "", testDrive.status, testDrive.source);
for (const e of driveEvents) {
  const when = `${e.days[0]}…${e.days[1]}${e.hours ? `, ${e.hours}` : ""}`;
  add("Тест драйв", `MEGA TEST DRIVE ${e.edition}`, `${when}, ${e.venue.mn}`, `${when}, ${e.venue.en}`, e.film ? `${e.film.poster.key}; ${e.film.teaser}; ${e.film.full}` : "", e.status, e.source);
}

// Services
for (const s of services) {
  add("Үйлчилгээ", s.title.mn, `${s.title.mn}: ${s.body.mn}`, `${s.title.en}: ${s.body.en}`, `брэнд: ${s.brands.join(", ")}`, s.status, s.source);
}

// Pages
for (const [name, page] of Object.entries(pages)) {
  for (const [key, block] of Object.entries(page)) {
    const list = Array.isArray(block) ? block : [block];
    list.forEach((item, i) => {
      if (!item?.value) return;
      add(`Хуудас: ${name}`, list.length > 1 ? `${key} ${i + 1}` : key, text(item.value.mn), text(item.value.en), "", item.status);
    });
  }
}

const header = ["Хэсэг", "Түлхүүр", "MN", "EN", "Зураг/лого", "Хийсэн хүн", "Батлагч", "Төлөв", "Эх сурвалж / тэмдэглэл"];
const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csv = [header, ...rows.map((r) => [r.section, r.key, r.mn, r.en, r.asset, r.madeBy, "", r.status, r.source])]
  .map((line) => line.map(esc).join(","))
  .join("\r\n");
const out = path.join(ROOT, "docs", "content-checklist.csv");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, "﻿" + csv + "\r\n", "utf8");

const counts = rows.reduce((acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc), {});
console.log(`content checklist: ${rows.length} rows → ${path.relative(ROOT, out)}`);
for (const [status, n] of Object.entries(counts)) console.log(`  ${n.toString().padStart(3)}  ${status}`);
