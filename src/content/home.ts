import type { Block } from "./types";

/** Short homepage copy, based on the existing brand sheets and showroom records. */
export const homeExperience: Block<{ heading: string; body: string; points: string[] }> = {
  status: "draft",
  source: "Brand team distributor sheets; existing showroom and service records",
  value: {
    mn: {
      heading: "Автомашинаа дэргэдээс нь мэдэр.",
      body: "Улаанбаатар, Дархан дахь шоурумуудад автомашинуудаа ойроос үзэж, сонголтоо харьцуулаарай. Манай баг танд тохирох загвар, борлуулалтын нөхцөл, тухайн брэндийн үйлчилгээний талаар зөвлөнө.",
      points: ["Албан ёсны эрхтэй брэндүүд", "Улаанбаатар, Дархан дахь шоурумууд", "Брэнд тус бүрийн борлуулалтын дараах үйлчилгээ"],
    },
    en: {
      heading: "Experience your next car in person.",
      body: "Visit our showrooms in Ulaanbaatar and Darkhan to see the cars and compare your options. Our team can guide you through models, purchase options and the services available for your brand.",
      points: ["Officially represented brands", "Showrooms in Ulaanbaatar and Darkhan", "After-sales support tailored to each brand"],
    },
  },
};
