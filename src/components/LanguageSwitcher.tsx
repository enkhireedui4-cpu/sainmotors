"use client";

import { usePathname } from "next/navigation";
import { localeNames, locales, localePath, switchLocalePath, type Locale } from "@/lib/i18n";

/**
 * MN / EN. Links to the same page in the other language. A plain <a> (full
 * page load) so <html lang>, metadata and hreflang always match the language.
 */
export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? localePath(locale);
  return (
    <div className="lang-switch" role="group" aria-label={label}>
      {locales.map((l, i) => [
        i > 0 && (
          <span key={`sep-${l}`} className="lang-switch__sep" aria-hidden="true">
            /
          </span>
        ),
        l === locale ? (
          <span key={l} className="lang-switch__item" aria-current="true" lang={l}>
            <span aria-hidden="true">{localeNames[l].short}</span>
            <span className="sr-only">{localeNames[l].full}</span>
          </span>
        ) : (
          <a key={l} className="lang-switch__item" href={switchLocalePath(pathname, l)} hrefLang={l} lang={l}>
            <span aria-hidden="true">{localeNames[l].short}</span>
            <span className="sr-only">{localeNames[l].full}</span>
          </a>
        ),
      ])}
    </div>
  );
}
