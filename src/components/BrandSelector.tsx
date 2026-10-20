"use client";

import { LayoutGroup, motion } from "motion/react";
import { useState, type ReactNode } from "react";

export interface BrandEntry {
  slug: string;
  /** The row in the list: a link to the brand page. */
  row: ReactNode;
  /** Photograph, mark, introduction and channels: the stage on wide screens, a card on narrow ones. */
  panel: ReactNode;
}

/**
 * Brand index. On wide screens the list sits beside one sticky stage:
 * pointing at or focusing a brand brings its panel onto the stage and slides a
 * red rule to its row. Nothing changes on its own and every brand stays one
 * click away. Panels off the stage are visibility: hidden, so they take no
 * focus even before hydration. Narrow screens show every panel as a card (brands.css).
 */
export function BrandSelector({ entries, label }: { entries: BrandEntry[]; label: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="brand-index">
      <LayoutGroup>
        <ul className="brand-index__list" aria-label={label}>
          {entries.map((entry, index) => (
            <li
              key={entry.slug}
              className="brand-index__row"
              data-active={index === active || undefined}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              {index === active && <motion.span layoutId="brand-index-rule" className="brand-index__rule" transition={{ type: "spring", bounce: 0, visualDuration: 0.3 }} />}
              {entry.row}
            </li>
          ))}
        </ul>
      </LayoutGroup>
      <div className="brand-index__stage">
        {entries.map((entry, index) => (
          <div key={entry.slug} className="brand-index__panel" data-active={index === active || undefined}>
            {entry.panel}
          </div>
        ))}
      </div>
    </div>
  );
}
