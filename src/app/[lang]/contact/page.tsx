import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { LocationCard } from "@/components/LocationCard";
import { PageHero } from "@/components/PageHero";
import { Picture } from "@/components/Picture";
import { contact, getLocation, getLocations, pages, socials, ui } from "@/content";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const meta = pages.contact.meta.value[locale];
  return pageMetadata({ locale, path: "contact", title: meta.title, description: meta.description });
}

export default async function ContactPage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const page = pages.contact;
  const pictured = getLocation("jetour-c1");

  return (
    <>
      <PageHero
        title={page.meta.value[locale].title}
        lead={page.lead.value[locale]}
        leadDraft={page.lead.status === "draft"}
      />

      <section className="pb-[var(--section)]" aria-label={ui.contact.showrooms[locale]}>
        <div className="container location-list">
          {getLocations().map((location) => (
            <LocationCard key={location.id} location={location} locale={locale} headingLevel="h2" />
          ))}
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="general-heading">
        <div className="container contact-more">
          <div className="contact-more__lists">
            <div>
              <h2 id="general-heading" className="heading-3 mb-4">
                {ui.contact.general[locale]}
              </h2>
              <ul className="grid gap-1">
                <li>
                  <a className="text-link" href={contact.phone.href}>
                    <Icon name="phone" size={18} />
                    {contact.phone.display}
                  </a>
                </li>
                <li>
                  <a className="text-link" href={`mailto:${contact.email}`}>
                    <Icon name="mail" size={18} />
                    {contact.email}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="heading-3 mb-4">{ui.contact.social[locale]}</h2>
              <ul className="grid gap-1">
                {socials.map((social) => (
                  <li key={social.id}>
                    <a className="text-link" href={social.url} rel="noopener">
                      <Icon name={social.id} size={18} />
                      {social.label}
                      <span className="sr-only"> {ui.external[locale]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {pictured.photo && (
            <figure className="contact-more__photo">
              <Picture photo={pictured.photo} locale={locale} sizes="(min-width: 60rem) 36rem, 100vw" />
              <figcaption>
                {pictured.name[locale]}, {pictured.landmark?.[locale] ?? pictured.address[locale]}
              </figcaption>
            </figure>
          )}
        </div>
      </section>
    </>
  );
}
