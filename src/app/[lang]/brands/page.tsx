import type { Metadata } from "next";
import Link from "next/link";
import "@/app/brands.css";
import { BrandMark } from "@/components/BrandMark";
import { BrandSelector } from "@/components/BrandSelector";
import { draftAttr } from "@/components/HomeSections";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { Picture } from "@/components/Picture";
import { getBrands, getLocation, liveLinks, pages, ui } from "@/content";
import type { Brand } from "@/content/types";
import type { Locale } from "@/lib/i18n";
import { brandHref } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const meta = pages.brands.meta.value[locale];
  return pageMetadata({ locale, path: "brands", title: meta.title, description: meta.description });
}

/** One list row: the brand's mark and name, its showroom, and the way into its page. */
function BrandRow({ brand, locale }: { brand: Brand; locale: Locale }) {
  const location = brand.location ? getLocation(brand.location) : undefined;
  return (
    <Link className="brand-row" href={brandHref(locale, brand.slug)}>
      <span className="brand-row__plate">
        <BrandMark brand={brand} locale={locale} size="small" decorative lazy={false} />
      </span>
      <span className="brand-row__name" translate="no">{brand.name}</span>
      <span className="brand-row__meta">{location?.name[locale]}</span>
      <Icon name="chevronRight" size={18} />
    </Link>
  );
}

/** The stage panel (a card on phones): photograph, mark, short introduction and the brand's own channel. */
function BrandPanel({ brand, locale, first }: { brand: Brand; locale: Locale; first: boolean }) {
  const photo = (brand.cardPhoto ?? brand.photo)!;
  const copy = brand.cardCopy ?? brand.teaser;
  const location = brand.location ? getLocation(brand.location) : undefined;
  const channel = liveLinks(brand).find((link) => link.kind === "facebook");
  const href = brandHref(locale, brand.slug);
  return (
    <article className="brand-panel" aria-labelledby={`brand-panel-${brand.slug}`}>
      <Link className="brand-panel__media" href={href} tabIndex={-1} aria-hidden="true">
        <Picture photo={photo} locale={locale} sizes="(min-width: 64rem) 56vw, 100vw" priority={first} />
      </Link>
      <div className="brand-panel__body">
        <h2 id={`brand-panel-${brand.slug}`} className="brand-panel__mark" translate="no">
          <BrandMark brand={brand} locale={locale} decorative onDark />
          <span className="sr-only">{brand.name}</span>
        </h2>
        <p className="brand-panel__copy" data-status={draftAttr(copy)}>{copy.value[locale]}</p>
        {(brand.since || location) && (
          <p className="brand-panel__meta">
            {brand.since && <span>{ui.brand.sinceYear[locale].replace("{year}", String(brand.since))}</span>}
            {location && <span>{location.name[locale]}</span>}
          </p>
        )}
        <div className="brand-panel__actions">
          <Link className="brand-panel__explore" href={href}>
            {ui.brand.explore[locale]}
            <Icon name="chevronRight" size={18} />
          </Link>
          {channel && (
            <a className="brand-panel__channel" href={channel.url} rel="noopener">
              <Icon name="facebook" size={16} />
              {ui.brand.facebook[locale]}
              <span className="sr-only"> {ui.external[locale]}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function BrandsPage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const page = pages.brands;
  const brands = getBrands();

  return (
    <>
      <PageHero
        title={page.meta.value[locale].title}
        lead={page.lead.value[locale]}
        leadDraft={page.lead.status === "draft"}
      />
      <section className="brands-page" aria-label={page.meta.value[locale].title}>
        <div className="container">
          <BrandSelector
            label={locale === "mn" ? "Брэндээ сонгох" : "Choose a brand"}
            entries={brands.map((brand, index) => ({
              slug: brand.slug,
              row: <BrandRow brand={brand} locale={locale} />,
              panel: <BrandPanel brand={brand} locale={locale} first={index === 0} />,
            }))}
          />
        </div>
      </section>
    </>
  );
}
