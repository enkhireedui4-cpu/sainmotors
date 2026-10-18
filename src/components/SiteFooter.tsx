import Link from "next/link";
import { company, contact, sainLogos, socials, ui } from "@/content";
import type { Locale } from "@/lib/i18n";
import { navPages, pageHref } from "@/lib/routes";
import { Icon } from "./Icon";

export function SiteFooter({ locale }: { locale: Locale }) {
  const logo = sainLogos["sain-on-dark"];
  const year = 2026;
  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link href={pageHref(locale, "home")} aria-label={ui.home[locale]}>
              <img src={logo.src} width={logo.width} height={logo.height} alt="" loading="lazy" />
            </Link>
            <p>{company.legalName.value[locale]}</p>
          </div>

          <nav aria-labelledby="footer-site">
            <h2 id="footer-site">{ui.footer.explore[locale]}</h2>
            <ul>
              {navPages.map((page) => (
                <li key={page}>
                  <Link href={pageHref(locale, page)}>{ui.nav[page][locale]}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2>{ui.footer.follow[locale]}</h2>
            <ul>
              {socials.map((social) => (
                <li key={social.id}>
                  <a href={social.url} rel="noopener">
                    <Icon name={social.id} size={18} />
                    {social.label}
                    <span className="sr-only"> {ui.external[locale]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="site-footer__contact">
            <h2>{ui.footer.contact[locale]}</h2>
            <ul>
              <li>
                <a href={contact.phone.href}>
                  <Icon name="phone" size={16} />
                  {contact.phone.display}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`}>
                  <Icon name="mail" size={16} />
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="site-footer__base">
          <p>
            © {year} {company.legalName.value[locale]}
          </p>
          <Link href={pageHref(locale, "privacy")}>{ui.footer.privacy[locale]}</Link>
        </div>
      </div>
    </footer>
  );
}
