import Link from "next/link";
import { hero } from "@/content";
import type { Locale } from "@/lib/i18n";
import { contentHref } from "@/lib/routes";
import { draftAttr } from "./HomeSections";
import { Icon } from "./Icon";

/** Corporate statement over static satin ribbon artwork. */
export function Hero({ locale }: { locale: Locale }) {
  return (
    <section className="corporate-hero" aria-labelledby="hero-title">
      <div className="corporate-hero__art" aria-hidden="true">
        <img src="/art/sain-ribbon.svg" width={1600} height={640} alt="" fetchPriority="high" />
      </div>
      <div className="container corporate-hero__inner">
        <h1 id="hero-title" data-status={draftAttr(hero.title)}>
          {hero.title.value[locale].split("\n").map((line) => <span key={line}>{line}</span>)}
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
    </section>
  );
}
