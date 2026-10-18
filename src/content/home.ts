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

/** Editorial invitations grounded in the existing BYD/JETOUR and showroom records. */
export const homeDiscover: Block<{
  heading: string;
  tabsLabel: string;
  topics: { tab: string; title: string; body: string; cta: string }[];
}> = {
  status: "draft",
  source: "Existing BYD and JETOUR brand sheets; showroom and service records. Condensed by the web team.",
  value: {
    mn: {
      heading: "Таны хэрэгцээнд нийцэх сонголт.",
      tabsLabel: "Автомашины сонголт, зөвлөгөө",
      topics: [
        {
          tab: "Цахилгаан хөдөлгөөн",
          title: "Өдөр тутмын шинэ хэмнэл.",
          body: "BYD-ийн цахилгаан болон plug-in hybrid автомашинуудтай танилцаарай. Загвар, худалдан авалтын нөхцөлийг BYD 4S үзэсгэлэнгийн танхимаас лавлах боломжтой.",
          cta: "BYD-тэй танилцах",
        },
        {
          tab: "Аялал, адал явдал",
          title: "Хотын замаас цааш.",
          body: "JETOUR-ийн аялал, адал явдалд зориулсан SUV загваруудыг сонирхоорой. Тоноглол, загварын дэлгэрэнгүй мэдээллийг брэндийн хуудаснаас үзнэ үү.",
          cta: "JETOUR-тай танилцах",
        },
        {
          tab: "Мэргэжлийн зөвлөгөө",
          title: "Сонголтоо итгэлтэй хийгээрэй.",
          body: "Автомашинуудыг дэргэдээс нь харьцуулж, тухайн брэндийн багтай ярилцаарай. Загвар, худалдан авалтын нөхцөл, борлуулалтын дараах үйлчилгээний талаар зөвлөгөө аваарай.",
          cta: "Холбоо барих",
        },
      ],
    },
    en: {
      heading: "A choice that fits your life.",
      tabsLabel: "Explore cars and advice",
      topics: [
        {
          tab: "Electric mobility",
          title: "A new rhythm for every day.",
          body: "Explore BYD’s electric and plug-in hybrid cars. Visit the BYD 4S showroom for guidance on models and purchase options.",
          cta: "Explore BYD",
        },
        {
          tab: "Travel and adventure",
          title: "Beyond the city streets.",
          body: "Discover JETOUR’s SUVs for travel and adventure. Visit the brand page for model details, equipment and more about the range.",
          cta: "Explore JETOUR",
        },
        {
          tab: "Personal guidance",
          title: "Choose with confidence.",
          body: "Compare the cars in person and speak with the brand’s team. Get advice on models, purchase options and the after-sales services available for your brand.",
          cta: "Contact us",
        },
      ],
    },
  },
};
