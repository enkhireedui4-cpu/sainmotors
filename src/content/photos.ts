import type { Photo } from "./types";

// Section photography outside the hero and brand pages: Sain Motors' own
// showroom photos (from the jetour.mn build). Each image appears once on a
// page and none repeats a hero slide. There is no service-centre photography,
// so the services section is text-led rather than borrowing a showroom photo.
export const sitePhotos = {
  story: {
    key: "showroom-lounge",
    alt: {
      mn: "Сайн Моторс-ын шоурумын зөвлөгөөний хэсэг, хоёр давхар оффис",
      en: "Advice desks and the two-storey office inside the Sain Motors showroom",
    },
    status: "sourced",
    focus: "40% 60%",
  },
  /** Home, locations: the JETOUR showroom hall (C1 TV building). */
  showroomBand: {
    key: "showroom-hall",
    alt: {
      mn: "JETOUR шоурумын танхим: SAIN MOTORS хаягийн доор эгнэн зогсох шинэ автомашинууд",
      en: "The JETOUR showroom hall: new cars on display beneath the SAIN MOTORS sign",
    },
    status: "sourced",
    focus: "50% 50%",
  },
  aboutHeader: {
    key: "showroom-entrance",
    alt: {
      mn: "Сайн Моторс-ын шоурумд эгнэн зогсох JETOUR автомашинууд",
      en: "JETOUR cars lined up in the Sain Motors showroom",
    },
    status: "sourced",
    focus: "50% 62%",
  },
  aboutDetail: {
    key: "showroom-gallery",
    alt: {
      mn: "Дэлгэц бүхий шоурумын үзэсгэлэнгийн коридор",
      en: "Showroom display corridor with screens",
    },
    status: "sourced",
    focus: "50% 55%",
  },
} satisfies Record<string, Photo>;
