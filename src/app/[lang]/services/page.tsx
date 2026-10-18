import type { Metadata } from "next";
import { ServiceList } from "@/components/HomeSections";
import { LocationCard } from "@/components/LocationCard";
import { PageHero } from "@/components/PageHero";
import { getLocation, pages, ui } from "@/content";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const meta = pages.services.meta.value[locale];
  return pageMetadata({ locale, path: "services", title: meta.title, description: meta.description });
}

export default async function ServicesPage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const page = pages.services;

  return (
    <>
      <PageHero
        title={page.meta.value[locale].title}
        lead={page.lead.value[locale]}
        leadDraft={page.lead.status === "draft"}
      />
      <section className="pb-[var(--section)]">
        <div className="container services-page">
          <div>
            <ServiceList locale={locale} headingLevel="h2" />
            <p className="services-page__note">{ui.services.others[locale]}</p>
          </div>

          {/* The two places that repair and supply parts, with their own hours and lines. */}
          <aside className="services-page__aside" aria-label={ui.services.where[locale]}>
            <div className="location-list location-list--stacked">
              <LocationCard location={getLocation("service-centre")} locale={locale} />
              <LocationCard location={getLocation("byd-4s")} locale={locale} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
