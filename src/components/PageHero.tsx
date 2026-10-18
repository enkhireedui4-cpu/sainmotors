import Link from "next/link";
import type { ReactNode } from "react";

export interface BreadcrumbProps {
  label: string;
  items: { href: string; label: string }[];
  current: string;
}

export function Breadcrumb({ label, items, current }: BreadcrumbProps) {
  return (
    <nav aria-label={label}>
      <ol className="breadcrumb">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
            <span aria-hidden="true">/</span>
          </li>
        ))}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}

interface PageHeroProps {
  title: ReactNode;
  lead?: ReactNode;
  leadDraft?: boolean;
  breadcrumb?: BreadcrumbProps;
  children?: ReactNode;
}

/** Title block for supporting pages: a large serif title with the lead set beside it on wide screens. */
export function PageHero({ title, lead, leadDraft, breadcrumb, children }: PageHeroProps) {
  return (
    <div className="container page-hero">
      {breadcrumb && <Breadcrumb {...breadcrumb} />}
      <div className="page-hero__grid">
        <h1>{title}</h1>
        {lead && (
          <p className="lead" data-status={leadDraft ? "draft" : undefined}>
            {lead}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
