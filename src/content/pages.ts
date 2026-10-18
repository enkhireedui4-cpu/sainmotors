import type { Block } from "./types";

type Meta = Block<{ title: string; description: string }>;
type Section = Block<{ heading: string; body: string }>;

// Page copy by the web team over sourced facts (docs/content-sources.md).
// Everything here is a draft until the content team approves or replaces it.
export const pages = {
  home: {
    meta: {
      status: "draft",
      value: {
        mn: {
          title: "Сайн Моторс — олон улсын автомашины брэндүүд Монголд",
          description:
            "Сайн Моторс JETOUR, HONGQI, BYD, AITO, RIDDARA, 212, BESTUNE, MAXUS, RELY брэндийн автомашиныг Монголд албан ёсны эрхтэйгээр борлуулдаг.",
        },
        en: {
          title: "Sain Motors — international car brands in Mongolia",
          description:
            "Sain Motors sells JETOUR, HONGQI, BYD, AITO, RIDDARA, 212, BESTUNE, MAXUS and RELY in Mongolia under official rights. Showrooms, sales lines, service.",
        },
      },
    } satisfies Meta,
    brands: {
      status: "draft",
      value: {
        mn: { heading: "Брэндүүд", body: "Брэнд бүрийн танилцуулга, шоурум, борлуулалтын утас." },
        en: { heading: "Our brands", body: "Each brand’s introduction, showroom and sales line." },
      },
    } satisfies Section,
    company: {
      status: "draft",
      value: {
        mn: { heading: "Сайн Моторс-ын тухай", body: "" },
        en: { heading: "About Sain Motors", body: "" },
      },
    } satisfies Section,
    /** Facts from the distributor statements (years per brand sheet); wording by the web team. */
    story: {
      status: "draft",
      source: "Drive brand sheets: distributor statements",
      value: {
        mn: {
          heading: "2024 оноос хойш нэмэгдсэн брэндүүд",
          body: "Сайн Моторс 2024 онд HONGQI-ийн албан ёсны борлуулалтыг эхлүүлж, 2025 онд BYD, AITO, RIDDARA, 212, BESTUNE, MAXUS, 2026 онд CHERY RELY брэндийг багцдаа нэмсэн. Брэнд бүрийг өөрийн шоурумд нь танилцуулж, борлуулалтын утсаар нь зөвлөгөө өгдөг.",
        },
        en: {
          heading: "Brands added since 2024",
          body: "Sain Motors began official sales of HONGQI in 2024, added BYD, AITO, RIDDARA, 212, BESTUNE and MAXUS in 2025, and CHERY RELY in 2026. Each of these brands is presented at its own showroom and has its own sales line.",
        },
      },
    } satisfies Section,
    locations: {
      status: "draft",
      value: {
        mn: {
          heading: "Шоурумууд",
          body: "Брэнд бүр тодорхой шоурумд байрладаг. Очихоосоо өмнө брэндийн утсаар залгаж лавлана уу.",
        },
        en: {
          heading: "Showrooms",
          body: "Each brand is sold at a specific showroom. Call the brand’s line before you visit.",
        },
      },
    } satisfies Section,
  },

  about: {
    meta: {
      status: "draft",
      value: {
        mn: {
          title: "Бидний тухай",
          description:
            "Сайн Моторс ХХК олон улсын автомашины брэндүүдийг Монголд албан ёсны эрхтэйгээр борлуулж, борлуулалтын дараах үйлчилгээ үзүүлдэг.",
        },
        en: {
          title: "About us",
          description:
            "Sain Motors LLC sells international car brands in Mongolia under official rights and provides after-sales service.",
        },
      },
    } satisfies Meta,
    lead: {
      status: "draft",
      value: {
        mn: "Сайн Моторс ХХК олон улсын автомашины брэндүүдийг Монголд албан ёсны эрхтэйгээр борлуулж, борлуулалтын дараах үйлчилгээ үзүүлдэг.",
        en: "Sain Motors LLC sells international car brands in Mongolia under official rights and provides after-sales service.",
      },
    } satisfies Block,
    sections: [
      {
        status: "draft",
        value: {
          mn: {
            heading: "Бид юу хийдэг вэ",
            body: "Брэнд бүрийг өөрийн шоурумд нь танилцуулж, борлуулалтын утсаар нь зөвлөгөө өгдөг. Ихэнх брэндийн автомашин үйлдвэрийн баталгаа, борлуулалтын дараах үйлчилгээтэй. JETOUR-ын засвар үйлчилгээг үйлчилгээний төв, BYD-ийн засвар, сэлбэгийг BYD 4S шоурум хариуцдаг.",
          },
          en: {
            heading: "What we do",
            body: "We present each brand at its own showroom and advise customers on its sales line. Most of our brands come with factory warranty and after-sales service. The JETOUR service centre maintains JETOUR vehicles, and the BYD 4S showroom handles BYD repairs and parts.",
          },
        },
      },
      {
        status: "draft",
        value: {
          mn: {
            heading: "Хаана байрладаг вэ",
            body: "Улаанбаатар, Дархан хотод шоурумтай бөгөөд Улаанбаатарт JETOUR-ын үйлчилгээний төвтэй. Брэнд бүрийн шоурум, утсыг холбоо барих хуудаснаас харна уу.",
          },
          en: {
            heading: "Where we are",
            body: "We have showrooms in Ulaanbaatar and Darkhan, and a JETOUR service centre in Ulaanbaatar. Each brand’s showroom and phone number are on the contact page.",
          },
        },
      },
    ] satisfies Section[],
    closing: {
      status: "draft",
      value: {
        mn: { heading: "Шоурумд уулзъя", body: "Брэнд бүрийн шоурум, борлуулалтын утас холбоо барих хуудсанд байна." },
        en: { heading: "Visit a showroom", body: "Every brand’s showroom and sales line is on the contact page." },
      },
    } satisfies Section,
    milestones: {
      status: "draft",
      value: {
        mn: { heading: "Албан ёсны борлуулалт эхэлсэн он", body: "Брэнд бүрийн мэдээллийн хуудсанд дурдсан оноор." },
        en: { heading: "When official sales began", body: "As stated in each brand’s fact sheet." },
      },
    } satisfies Section,
  },

  brands: {
    meta: {
      status: "draft",
      value: {
        mn: {
          title: "Брэндүүд",
          description:
            "Сайн Моторс-ын албан ёсны эрхтэй борлуулдаг автомашины брэндүүд: танилцуулга, шоурум, борлуулалтын утас, албан ёсны холбоос.",
        },
        en: {
          title: "Brands",
          description:
            "The car brands Sain Motors sells in Mongolia, with each brand’s introduction, showroom, sales line and official links.",
        },
      },
    } satisfies Meta,
    lead: {
      status: "draft",
      value: {
        mn: "Брэнд бүрийн товч танилцуулга, шоурум, борлуулалтын утас. Загвар, тоноглолын дэлгэрэнгүйг брэндийн албан ёсны сайтаас үзнэ үү.",
        en: "A short introduction to each brand, with its showroom and sales line. Full model details are on each brand’s official website.",
      },
    } satisfies Block,
  },

  services: {
    meta: {
      status: "draft",
      value: {
        mn: {
          title: "Үйлчилгээ",
          description:
            "Шинэ автомашин, санхүүжилтийн зөвлөгөө, үйлдвэрийн баталгаа, засвар, сэлбэг: аль брэндэд, хаана үзүүлдэг вэ.",
        },
        en: {
          title: "Services",
          description: "New cars, financing advice, factory warranty, repairs and parts: which brands each covers, and where.",
        },
      },
    } satisfies Meta,
    lead: {
      status: "draft",
      value: {
        mn: "Үйлчилгээ брэнд, байршлаас хамаарч өөр. Тодорхой асуултаа брэндийн борлуулалтын утсаар лавлана уу.",
        en: "Services differ by brand and location. For specific questions, call the brand’s sales line.",
      },
    } satisfies Block,
  },

  contact: {
    meta: {
      status: "draft",
      value: {
        mn: {
          title: "Холбоо барих",
          description: "Сайн Моторс-ын шоурумууд, үйлчилгээний төвийн хаяг, брэнд бүрийн борлуулалтын утас, ерөнхий лавлагаа.",
        },
        en: {
          title: "Contact",
          description: "Showroom and service centre addresses, each brand’s sales line and general enquiries for Sain Motors.",
        },
      },
    } satisfies Meta,
    lead: {
      status: "draft",
      value: {
        mn: "Брэнд бүр өөрийн шоурум, борлуулалтын утастай. Очихоосоо өмнө залгаж лавлана уу.",
        en: "Each brand has its own showroom and sales line. Call before you visit.",
      },
    } satisfies Block,
  },

  privacy: {
    meta: {
      status: "draft",
      value: {
        mn: { title: "Нууцлалын бодлого", description: "Sain Motors-ын вэбсайт ямар мэдээлэл цуглуулдаг, хэрхэн ашигладаг тухай." },
        en: { title: "Privacy policy", description: "What information the Sain Motors website collects and how it is used." },
      },
    } satisfies Meta,
    /** Reflects the site as built: no forms, accounts, cookies or analytics. */
    sections: [
      {
        status: "draft",
        value: {
          mn: {
            heading: "Бид ямар мэдээлэл цуглуулдаг вэ",
            body: "Энэ сайтад маягт, бүртгэл байхгүй бөгөөд хувийн мэдээлэл цуглуулдаггүй. Сайт күүки болон зочдыг хянах аналитик хэрэгсэл ашигладаггүй.",
          },
          en: {
            heading: "What we collect",
            body: "This site has no forms or accounts and does not collect personal information. It does not use cookies or visitor-tracking analytics.",
          },
        },
      },
      {
        status: "draft",
        value: {
          mn: {
            heading: "Серверийн бүртгэл",
            body: "Сайтыг байршуулж буй хостинг үйлчилгээ нь аюулгүй байдал, алдаа илрүүлэх зорилгоор IP хаяг, хөтчийн төрөл, хандсан хуудас зэрэг техникийн бүртгэлийг автоматаар хадгалж болно.",
          },
          en: {
            heading: "Server logs",
            body: "Our hosting provider may automatically keep technical logs, such as IP address, browser type and the pages requested, for security and troubleshooting.",
          },
        },
      },
      {
        status: "draft",
        value: {
          mn: {
            heading: "Гадны холбоос",
            body: "Брэндийн сайт, Google Maps, сошиал сүлжээ рүү орох холбоосууд нь тухайн байгууллагын өөрийн нууцлалын бодлогоор зохицуулагдана.",
          },
          en: {
            heading: "Links to other sites",
            body: "Links to brand websites, Google Maps and social networks lead to services governed by those organisations’ own privacy policies.",
          },
        },
      },
    ] satisfies Section[],
    review: {
      status: "draft",
      value: {
        mn: "Энэ хуудас хуулийн хяналт хүлээж буй ноорог.",
        en: "This page is a draft awaiting legal review.",
      },
    } satisfies Block,
  },
};
