import type { Metadata } from "next";
import { BrandShowroom } from "@/components/BrandGrid";
import { Hero } from "@/components/Hero";
import { HomeDiscover } from "@/components/HomeDiscover";
import { CompanyFacts, HomeServices, ShowroomExperience, draftAttr } from "@/components/HomeSections";
import { Reveal } from "@/components/Reveal";
import { TestDrive } from "@/components/TestDrive";
import { getBrands, pages } from "@/content";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const meta = pages.home.meta.value[locale];
  return pageMetadata({ locale, path: "", title: meta.title, description: meta.description, absoluteTitle: true });
}

// Corporate statement, portfolio, showroom walk-through, test-drive film and events, services, company facts and editorial invitations.
export default async function HomePage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const brandsSection = pages.home.brands;
  const brands = getBrands();

  return (
    <div className="home-premium">
      <Hero locale={locale} />

      <section className="section section--alt home-portfolio" aria-labelledby="brands-heading">
        <div className="container">
          <Reveal className="section-head section-head--split">
            <h2 id="brands-heading" className="display-2" data-status={draftAttr(brandsSection)}>
              {brandsSection.value[locale].heading}
            </h2>
          </Reveal>
          <BrandShowroom brands={brands} locale={locale} />
        </div>
      </section>

      <section className="section home-experience" aria-labelledby="company-heading">
        <ShowroomExperience locale={locale} />
      </section>

      <section className="home-test-drive" aria-labelledby="test-drive-heading">
        <TestDrive locale={locale} />
      </section>

      <section className="section home-services" aria-labelledby="home-services-heading">
        <HomeServices locale={locale} />
      </section>

      <section className="section company-facts-section" aria-labelledby="services-heading">
        <CompanyFacts locale={locale} />
      </section>

      <HomeDiscover locale={locale} />
    </div>
  );
}
