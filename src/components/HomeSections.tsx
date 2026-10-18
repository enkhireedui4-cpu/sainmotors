import Link from "next/link";
import {
  company,
  getBrand,
  getBrands,
  getLocation,
  getLocations,
  homeExperience,
  pages,
  sainLogos,
  services,
  sitePhotos,
  ui,
} from "@/content";
import type { Block, Service } from "@/content/types";
import type { Locale } from "@/lib/i18n";
import { pageHref } from "@/lib/routes";
import { Icon } from "./Icon";
import { Picture } from "./Picture";

export const draftAttr = (block: Pick<Block, "status">) => (block.status === "draft" ? "draft" : undefined);

/** Brand coverage in words: "All brands" when it is every published brand. */
function coverage(service: Service, locale: Locale): string {
  const published = getBrands();
  if (published.every((b) => service.brands.includes(b.slug))) return ui.brand.allBrands[locale];
  return published.filter((b) => service.brands.includes(b.slug)).map((b) => b.name).join(", ");
}

function where(service: Service, locale: Locale): string {
  if (!service.locations) return ui.services.atShowroom[locale];
  return service.locations.map((id) => getLocation(id).name[locale]).join(", ");
}

/** Service-page coverage by brand and location. */
export function ServiceList({ locale, headingLevel = "h3" }: { locale: Locale; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ul className="service-list">
      {services.map((service) => (
        <li key={service.id} id={`service-${service.id}`} className="service" data-status={draftAttr(service)}>
          <Heading className="service__title">{service.title[locale]}</Heading>
          <p>{service.body[locale]}</p>
          <dl className="service__facts">
            <div>
              <dt>{ui.services.brands[locale]}</dt>
              <dd translate="no">{coverage(service, locale)}</dd>
            </div>
            <div>
              <dt>{ui.services.where[locale]}</dt>
              <dd>{where(service, locale)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

/** The company in one statement: the logotype beside the introduction, as a corporate masthead. */
export function Intro({ locale }: { locale: Locale }) {
  const section = pages.home.company;
  const [lead, ...rest] = company.introduction.value[locale].split("\n\n");
  const logo = sainLogos["sain-on-dark"];
  return (
    <div className="container split">
      <h2 id="company-heading" className="split__aside intro__mark" data-status={draftAttr(section)}>
        <img src={logo.src} width={logo.width} height={logo.height} alt={company.name} loading="lazy" />
        <span className="sr-only">{section.value[locale].heading}</span>
      </h2>
      <div className="split__main" data-status={draftAttr(company.introduction)}>
        <p className="statement">{lead}</p>
        {rest.map((p) => (
          <p key={p.slice(0, 24)} className="body-muted">
            {p}
          </p>
        ))}
        <Link className="text-link" href={pageHref(locale, "about")}>
          {ui.company.more[locale]}
          <Icon name="chevronRight" size={18} />
        </Link>
      </div>
    </div>
  );
}

/** Homepage showroom invitation: short, practical copy beside a real showroom. */
export function ShowroomExperience({ locale }: { locale: Locale }) {
  const copy = homeExperience.value[locale];
  return (
    <div className="container showroom-experience">
      <figure className="showroom-experience__media">
        <Picture photo={sitePhotos.story} locale={locale} sizes="(min-width: 64rem) 48vw, 100vw" />
        <figcaption>{locale === "mn" ? "Сайн Моторс шоурум" : "Sain Motors showroom"}</figcaption>
      </figure>
      <div className="showroom-experience__copy" data-status={draftAttr(homeExperience)}>
        <h2 id="company-heading" className="display-2">{copy.heading}</h2>
        <p>{copy.body}</p>
        <ul>{copy.points.map((point) => <li key={point}><Icon name="chevronRight" size={16} />{point}</li>)}</ul>
        <Link className="button button--primary" href={pageHref(locale, "contact")}>
          {locale === "mn" ? "Шоурум, байршил" : "Find a showroom"}<Icon name="chevronRight" size={18} />
        </Link>
      </div>
    </div>
  );
}

/** Editorial image with an overlapping card: how the portfolio grew, year by year, from the sheets. */
export function Story({ locale }: { locale: Locale }) {
  const story = pages.home.story;
  return (
    <div className="container story">
      <figure className="story__media">
        <Picture photo={sitePhotos.story} locale={locale} sizes="(min-width: 84rem) 56rem, (min-width: 64rem) 68vw, 100vw" />
      </figure>
      <div className="story__card">
        <h2 id="story-heading" className="display-3" data-status={draftAttr(story)}>
          {story.value[locale].heading}
        </h2>
        <p data-status={draftAttr(story)}>{story.value[locale].body}</p>
        <ol className="milestones" data-status={draftAttr(company.milestones)}>
          {company.milestones.items.map((item) => (
            <li key={item.year}>
              <span className="milestones__year">{item.year}</span>
              <span className="milestones__brands" translate="no">
                {item.brands
                  .map((slug) => getBrand(slug)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </li>
          ))}
        </ol>
        <Link className="text-link" href={pageHref(locale, "about")}>
          {ui.company.more[locale]}
          <Icon name="chevronRight" size={18} />
        </Link>
      </div>
    </div>
  );
}

/** Counts derive from the existing brand, location and service records. */
export function CompanyFacts({ locale }: { locale: Locale }) {
  const locations = getLocations();
  const facts = [
    { key: "brands", value: getBrands().length, label: ui.company.factBrands[locale] },
    { key: "showrooms", value: locations.filter((location) => location.kind === "showroom").length, label: ui.company.factShowrooms[locale] },
    { key: "cities", value: new Set(locations.map((location) => location.city.en)).size, label: ui.company.factCities[locale] },
    { key: "services", value: services.length, label: ui.company.factServices[locale] },
  ];
  return (
    <div className="container">
      <h2 id="services-heading" className="sr-only">{ui.company.factsHeading[locale]}</h2>
      <dl className="company-facts">
        {facts.map((fact) => (
          <div className="company-facts__item" data-fact={fact.key} key={fact.key}>
            <dt className="company-facts__label">{fact.label}</dt>
            <dd className="company-facts__value">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
