import type { Block, DriveEvent } from "./types";

const MTD_REPO = "MEGA TEST DRIVE registration sites, github.com/Enhireedui/mega-test-drive";

/**
 * MEGA TEST DRIVE editions, newest first. Dates and venues come from the
 * registration sites built for each edition (README at the commit noted) and
 * the ikon.mn report of 2026-06-23; none of these has a registration link,
 * because every listed edition is over. Provenance: docs/content-sources.md.
 */
export const driveEvents: DriveEvent[] = [
  {
    id: "mega-test-drive-8",
    edition: 8,
    days: ["2026-10-09", "2026-10-10"],
    hours: "10:00–19:00",
    venue: { mn: "Дархан хот", en: "Darkhan" },
    status: "sourced",
    source: `${MTD_REPO} @b7c5045 (2026-10-02; moved from 10.01–02)`,
  },
  {
    id: "mega-test-drive-7",
    edition: 7,
    title: { mn: "Off-road", en: "Off-road edition" },
    days: ["2026-08-22", "2026-08-22"],
    hours: "11:00–19:00",
    venue: { mn: "Морингийн даваа", en: "Moringiin Davaa pass" },
    status: "sourced",
    source: `${MTD_REPO} @31cbce4 (2026-08-18); event film supplied by the user (Facebook video 1366867448896240)`,
    film: {
      poster: {
        key: "mtd7-river-crossing",
        alt: {
          mn: "MEGA TEST DRIVE 7: 212 автомашин голыг гатлан давхиж буй нь",
          en: "MEGA TEST DRIVE 7: a 212 fording a river",
        },
        status: "sourced",
        focus: "50% 60%",
      },
      teaser: "/video/mtd7-teaser.mp4",
      full: "/video/mtd7-full.mp4",
      duration: "1:27",
    },
  },
  {
    id: "mega-test-drive-6",
    edition: 6,
    days: ["2026-08-08", "2026-08-09"],
    venue: { mn: "Шилийн Богд Moto Festival", en: "Shiliin Bogd Moto Festival" },
    status: "sourced",
    source: `${MTD_REPO} @c476715 (2026-08-04): held within the festival, Sain Motors as general sponsor`,
  },
];

/** Homepage test-drive feature over the edition 7 film. */
export const testDrive: Block<{ heading: string; body: string; watch: string; request: string; events: string; past: string; editions: string }> = {
  status: "draft",
  source: "ikon.mn 2026-06-23 (MEGA TEST DRIVE: 11 brands, 20+ models to drive); edition numbering of the registration sites",
  value: {
    mn: {
      heading: "Жолоодож мэдэр.",
      body: "MEGA TEST DRIVE өдөрлөгөөр Сайн Моторс-ын брэндүүдийн автомашиныг өөрөө жолоодож туршина. Долоо дахь өдөрлөг Морингийн даваагаар off-road замд гарсан.",
      watch: "Бичлэг үзэх",
      request: "Тест драйв хүсэх",
      events: "Сүүлийн өдөрлөгүүд",
      past: "Болсон",
      editions: "удаагийн өдөрлөг",
    },
    en: {
      heading: "Feel it behind the wheel.",
      body: "At MEGA TEST DRIVE events you drive the cars of Sain Motors’ brands yourself. The seventh edition went off-road over the Moringiin Davaa pass.",
      watch: "Watch the film",
      request: "Request a test drive",
      events: "Recent events",
      past: "Held",
      editions: "editions so far",
    },
  },
};
