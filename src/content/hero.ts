import type { Hero } from "./types";

// Corporate copy based on the brand-team distributor statements and showroom records.
export const hero: Hero = {
  title: {
    status: "draft",
    value: { mn: "Олон улсын брэндүүд,\nМонголд албан ёсоор", en: "International brands,\nofficially in Mongolia" },
  },
  text: {
    status: "draft",
    source: "Distributor statements (Drive brand sheets); jetour.mn",
    value: {
      mn: "Олон улсын автомашины брэндүүдийг Улаанбаатар, Дархан дахь шоурумуудаараа танд хүргэнэ.",
      en: "Discover international automotive brands through our showrooms in Ulaanbaatar and Darkhan.",
    },
  },
  cta: { label: { mn: "Брэндүүдтэй танилцах", en: "Explore our brands" }, href: "brands" },
  secondaryCta: { label: { mn: "Шоурум, байршил", en: "Find a showroom" }, href: "contact" },
};
