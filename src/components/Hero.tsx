import Link from "next/link";
import type { CSSProperties } from "react";
import { hero, sitePhotos } from "@/content";
import type { Locale } from "@/lib/i18n";
import { contentHref } from "@/lib/routes";
import { draftAttr } from "./HomeSections";
import { Icon } from "./Icon";
import { Picture } from "./Picture";
import { ScrollHero } from "./ScrollHero";

/** Corporate statement over the company's own building: several brands, no single brand leads. */
export function Hero({ locale }: { locale: Locale }) {
  return (
    <ScrollHero labelledBy="hero-title" media={<Picture photo={sitePhotos.hero} locale={locale} sizes="(max-width: 40rem) 280vw, (max-width: 64rem) 220vw, 130vw" priority />}>
      <div className="container corporate-hero__inner">
        <h1 id="hero-title" data-status={draftAttr(hero.title)}>
          {hero.title.value[locale].split("\n").map((line, i) => (
            <span key={line} style={{ "--line": i } as CSSProperties}>{line}</span>
          ))}
        </h1>
        <p className="corporate-hero__description" data-status={draftAttr(hero.text)}>{hero.text.value[locale]}</p>
        <div className="corporate-hero__actions">
          <Link className="button button--outline corporate-hero__cta" href="#brands-heading">
            {hero.cta.label[locale]}<Icon name="chevronRight" size={18} />
          </Link>
          <Link className="corporate-hero__secondary" href={contentHref(locale, hero.secondaryCta.href)}>
            {hero.secondaryCta.label[locale]}<Icon name="chevronRight" size={16} />
          </Link>
        </div>
      </div>
    </ScrollHero>
  );
}
