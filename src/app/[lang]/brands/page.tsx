import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { draftAttr } from "@/components/HomeSections";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { getBrands, getLocation, pages, ui } from "@/content";
import type { Locale } from "@/lib/i18n";
import { brandHref } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const meta = pages.brands.meta.value[locale];
  return pageMetadata({ locale, path: "brands", title: meta.title, description: meta.description });
}

export default async function BrandsPage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const page = pages.brands;

  return (
    <>
      <PageHero
        title={page.meta.value[locale].title}
        lead={page.lead.value[locale]}
        leadDraft={page.lead.status === "draft"}
      />
      <section className="pb-[var(--section)]" aria-label={page.meta.value[locale].title}>
        <div className="container">
          <ul className="directory">
            {getBrands().map((brand) => {
              const location = brand.location ? getLocation(brand.location) : undefined;
              return (
                <li key={brand.slug} className="directory__row">
                  <div className="directory__mark">
                    <BrandMark brand={brand} locale={locale} decorative />
                  </div>
                  <div className="directory__main">
                    <h2 className="directory__name" translate="no">
                      <Link href={brandHref(locale, brand.slug)}>{brand.name}</Link>
                    </h2>
                    <p className="directory__summary" data-status={draftAttr(brand.summary)}>
                      {brand.summary.value[locale]}
                    </p>
                  </div>
                  <p className="directory__facts">
                    {brand.since && <span>{ui.brand.sinceYear[locale].replace("{year}", String(brand.since))}</span>}
                    {location && <span>{location.name[locale]}</span>}
                  </p>
                  <Icon name="chevronRight" size={20} />
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
