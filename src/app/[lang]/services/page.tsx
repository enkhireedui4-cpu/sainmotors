import type { Metadata } from "next";
import { ServiceList } from "@/components/HomeSections";
import { HorizontalGallery } from "@/components/HorizontalGallery";
import { LocationCard } from "@/components/LocationCard";
import { PageHero } from "@/components/PageHero";
import { Parallax } from "@/components/Parallax";
import { Picture } from "@/components/Picture";
import { Reveal } from "@/components/Reveal";
import { getLocation, pages, sitePhotos, ui } from "@/content";
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
  const team = page.team.value[locale];

  return (
    <>
      <PageHero
        title={page.meta.value[locale].title}
        lead={page.lead.value[locale]}
        leadDraft={page.lead.status === "draft"}
      />
      <Parallax className="container services-header">
        <Picture photo={sitePhotos.servicesHeader} locale={locale} sizes="(max-width: 48rem) 140vw, (min-width: 84rem) 84rem, 100vw" priority />
      </Parallax>
      <section className="section services-section">
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

      <section className="services-team" aria-labelledby="team-heading">
        <Reveal className="container section-head section-head--split services-team__head">
          <h2 id="team-heading" className="display-2" data-status={page.team.status === "draft" ? "draft" : undefined}>{team.heading}</h2>
          <p data-status={page.team.status === "draft" ? "draft" : undefined}>{team.body}</p>
        </Reveal>
        <HorizontalGallery
          label={team.heading}
          items={sitePhotos.serviceGallery.map((photo) => (
            <figure key={photo.key} className="hscroll__figure">
              <Picture photo={photo} locale={locale} sizes="(min-width: 48rem) 48vw, 82vw" />
              <figcaption>{photo.label?.[locale]}</figcaption>
            </figure>
          ))}
        />
      </section>
    </>
  );
}
