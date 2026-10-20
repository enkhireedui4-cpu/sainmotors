import type { Hero } from "./types";

// Corporate copy based on the brand-team distributor statements and showroom records.
// "{count}" is the number of published brands (Hero fills it in), so the claim follows brands.ts.
export const hero: Hero = {
  title: {
    status: "draft",
    source: "ikon.mn 2026-06-23 (Sain Motors, official distributor of 11 brands); brand list in brands.ts",
    value: { mn: "{count} брэндийн\nалбан ёсны дистрибьютер", en: "{count} brands.\nOne official distributor." },
  },
  text: {
    status: "draft",
    source: "Distributor statements (Drive brand sheets); jetour.mn",
    value: {
      mn: "Сайн Моторс олон улсын {count} автомашины брэндийг Монголд албан ёсоор төлөөлж, Улаанбаатар, Дархан дахь шоурумуудаараа танд хүргэнэ.",
      en: "Sain Motors officially represents {count} international car brands in Mongolia, with showrooms in Ulaanbaatar and Darkhan.",
    },
  },
  cta: { label: { mn: "Брэндүүдтэй танилцах", en: "Explore our brands" }, href: "brands" },
  // Down to the homepage's showroom walk, whose own action then leads to the contact page.
  secondaryCta: { label: { mn: "Шоурум", en: "Showrooms" }, href: "#showroom" },
};
