import Link from "next/link";
import { ui } from "@/content";
import type { Brand } from "@/content/types";
import type { Locale } from "@/lib/i18n";
import { brandHref } from "@/lib/routes";
import { BrandCarousel } from "./BrandCarousel";
import { BrandMark } from "./BrandMark";
import { draftAttr } from "./HomeSections";
import { Icon } from "./Icon";
import { Picture } from "./Picture";

/**
 * One brand card: a single link (no nested controls). On pointer devices the
 * stone plate shows the logo and name, and hover or keyboard focus wipes in a
 * dark panel with the brand's introduction; on touch screens that panel is
 * simply shown below the logo, so nothing depends on hover.
 */
function BrandCard({ brand, locale, copy }: { brand: Brand; locale: Locale; copy: boolean }) {
  const descId = copy ? undefined : `brand-card-${brand.slug}`;
  return (
    <Link
      href={brandHref(locale, brand.slug)}
      className="bcard"
      aria-label={`${brand.name}: ${ui.brand.overview[locale]}`}
      aria-describedby={descId}
    >
      <span className="bcard__plate">
        <BrandMark brand={brand} locale={locale} decorative lazy={false} />
      </span>
      <span className="bcard__name" translate="no">
        {brand.name}
      </span>
      <span className="bcard__reveal">
        <span className="bcard__title" translate="no">
          {brand.name}
        </span>
        <span className="bcard__desc" id={descId} data-status={draftAttr(brand.teaser)}>
          {brand.teaser.value[locale]}
        </span>
        <span className="bcard__cta" aria-hidden="true">
          {ui.brand.overview[locale]}
          <Icon name="chevronRight" size={16} />
        </span>
      </span>
    </Link>
  );
}

/** The home page portfolio: every published brand in a one-card-at-a-time carousel. */
export function BrandPortfolio({ brands, locale }: { brands: Brand[]; locale: Locale }) {
  return (
    <BrandCarousel
      slides={brands.map((b) => (
        <BrandCard key={b.slug} brand={b} locale={locale} copy={false} />
      ))}
      copies={brands.map((b) => (
        <BrandCard key={b.slug} brand={b} locale={locale} copy />
      ))}
      names={brands.map((b) => b.name)}
      labels={{
        region: ui.brand.portfolio[locale],
        slide: ui.carousel.slide[locale],
        previous: ui.carousel.previous[locale],
        next: ui.carousel.next[locale],
        pause: ui.carousel.pause[locale],
        play: ui.carousel.play[locale],
      }}
    />
  );
}

/** All brands remain one click away, without making visitors page through a carousel. */
export function BrandChooser({ brands, locale }: { brands: Brand[]; locale: Locale }) {
  return (
    <nav className="brand-chooser" aria-label={locale === "mn" ? "Брэндээ сонгох" : "Choose your brand"}>
      <div className="container">
        <ul>{brands.map((brand) => (
          <li key={brand.slug}>
            <Link href={brandHref(locale, brand.slug)} aria-label={brand.name}>
              <BrandMark brand={brand} locale={locale} size="small" decorative />
            </Link>
          </li>
        ))}</ul>
      </div>
    </nav>
  );
}

function VehicleBrandCard({ brand, locale, copy = false }: { brand: Brand; locale: Locale; copy?: boolean }) {
  const description = brand.cardCopy ?? brand.teaser;
  const photo = brand.cardPhoto ?? brand.photo;
  const descId = copy ? undefined : `vehicle-brand-${brand.slug}`;
  return (
    <Link href={brandHref(locale, brand.slug)} className="vehicle-card" aria-label={`${brand.name}: ${ui.brand.overview[locale]}`} aria-describedby={descId}>
      <div className="vehicle-card__media">
        {photo && <Picture photo={photo} locale={locale} sizes="(min-width: 96rem) 30rem, (min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 90vw" />}
      </div>
      <div className="vehicle-card__body">
        <h3 className="vehicle-card__heading" translate="no">
          <BrandMark brand={brand} locale={locale} decorative onDark />
          <span className="sr-only">{brand.name}</span>
        </h3>
        <p id={descId} data-status={draftAttr(description)}>{description.value[locale]}</p>
        <span className="vehicle-card__cta">{locale === "mn" ? "Брэнд үзэх" : "Explore brand"}<Icon name="chevronRight" size={17} /></span>
      </div>
    </Link>
  );
}

/** All published brands share the same photo-led card and advance every 4.5 seconds. */
export function VehiclePortfolio({ brands, locale }: { brands: Brand[]; locale: Locale }) {
  return (
    <div className="vehicle-portfolio">
      <BrandCarousel
        slides={brands.map((brand) => <VehicleBrandCard key={brand.slug} brand={brand} locale={locale} />)}
        copies={brands.map((brand) => <VehicleBrandCard key={brand.slug} brand={brand} locale={locale} copy />)}
        names={brands.map((brand) => brand.name)}
        autoPlay
        interval={4500}
        resumeAfterInteraction
        showPosition={false}
        showPlaybackControl={false}
        labels={{ region: ui.brand.portfolio[locale], slide: ui.carousel.slide[locale], previous: ui.carousel.previous[locale], next: ui.carousel.next[locale], pause: ui.carousel.pause[locale], play: ui.carousel.play[locale] }}
      />
    </div>
  );
}

/** Compact logo row for "other brands" on a brand page. */
export function BrandStrip({ brands, locale }: { brands: Brand[]; locale: Locale }) {
  return (
    <ul className="brand-strip">
      {brands.map((brand) => (
        <li key={brand.slug}>
          <Link href={brandHref(locale, brand.slug)} aria-label={brand.name}>
            <BrandMark brand={brand} locale={locale} size="small" decorative />
          </Link>
        </li>
      ))}
    </ul>
  );
}
