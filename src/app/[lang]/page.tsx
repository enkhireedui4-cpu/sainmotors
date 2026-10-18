import type { Metadata } from "next";
import { VehiclePortfolio } from "@/components/BrandGrid";
import { Hero } from "@/components/Hero";
import { Locations, ServiceSection, ShowroomExperience, draftAttr } from "@/components/HomeSections";
import { getBrands, pages } from "@/content";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const meta = pages.home.meta.value[locale];
  return pageMetadata({ locale, path: "", title: meta.title, description: meta.description, absoluteTitle: true });
}

// Corporate statement, the complete brand portfolio, then showrooms and after-sales support.
export default async function HomePage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const brandsSection = pages.home.brands;
  const brands = getBrands();

  return (
    <div className="home-premium">
      <Hero locale={locale} />

      <section className="section section--alt home-portfolio" aria-labelledby="brands-heading">
        <div className="container">
          <div className="section-head section-head--split">
            <h2 id="brands-heading" className="display-2" data-status={draftAttr(brandsSection)}>
              {brandsSection.value[locale].heading}
            </h2>
          </div>
          <VehiclePortfolio brands={brands} locale={locale} />
        </div>
      </section>

      <section className="section home-experience" aria-labelledby="company-heading">
        <ShowroomExperience locale={locale} />
      </section>

      <section className="section section--charcoal" aria-labelledby="services-heading">
        <ServiceSection locale={locale} />
      </section>

      <section className="section" aria-labelledby="locations-heading">
        <Locations locale={locale} />
      </section>
    </div>
  );
}
