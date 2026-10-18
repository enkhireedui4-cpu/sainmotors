"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type FocusEvent, type ReactNode } from "react";
import { CircularCarousel, type RingHandle, type RingItem } from "./CircularCarousel";
import { Icon } from "./Icon";

export interface ShowcaseBrand extends Omit<RingItem, "title"> {
  slug: string;
  name: string;
  href: string;
  copy: string;
  draft?: boolean;
}

interface BrandShowcaseProps {
  brands: ShowcaseBrand[];
  marks: ReactNode[];
  chips: ReactNode[];
  labels: { region: string; previous: string; next: string; pause: string; play: string; explore: string; index: string };
  interval?: number;
}

const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);
function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
const pad = (i: number) => String(i).padStart(2, "0");

/** Photography, editorial information and the complete brand index form one gallery. */
export function BrandShowcase({ brands, marks, chips, labels, interval = 5.5 }: BrandShowcaseProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const ring = useRef<RingHandle>(null);
  const navigation = useRef<HTMLElement>(null);
  const informationTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const items = useMemo(() => brands.map(b => ({ ...b, title: b.name })), [brands]);
  const [active, setActive] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const [fading, setFading] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const brand = brands[displayed];
  const playing = hydrated && !reduced && !stopped;
  const held = hover || focusInside;

  useEffect(() => () => clearTimeout(informationTimer.current), []);

  // Scroll only the logo strip. scrollIntoView would also move the page vertically.
  useLayoutEffect(() => {
    const nav = navigation.current;
    const list = nav?.querySelector("ul");
    if (!nav || !list) return;
    const align = () => {
      const item = list.children[active] as HTMLElement;
      list.style.setProperty("--index-x", `${item.offsetLeft}px`);
      list.style.setProperty("--index-width", `${item.offsetWidth}px`);
      const left = Math.max(0, Math.min(nav.scrollWidth - nav.clientWidth, item.offsetLeft - (nav.clientWidth - item.offsetWidth) / 2));
      nav.scrollTo({ left, behavior: reduced ? "instant" : "smooth" });
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [active, reduced]);

  const change = (index: number) => {
    setActive(index);
    clearTimeout(informationTimer.current);
    if (index === displayed || reduced) {
      setDisplayed(index);
      setFading(false);
      return;
    }
    setFading(true);
    informationTimer.current = setTimeout(() => {
      setDisplayed(index);
      setFading(false);
    }, 140);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusInside(false);
  };

  return (
    <div className="brand-showcase" data-ready={hydrated || undefined} data-playing={(playing && !held) || undefined} data-current={displayed}
      onPointerEnter={e => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={e => e.pointerType === "mouse" && setHover(false)}
      onFocus={() => setFocusInside(true)} onBlur={onBlur}>
      <div className="brand-showcase__stage">
        <img className="brand-showcase__still" src={brands[0].src} srcSet={brands[0].srcSet} sizes={brands[0].sizes} width={brands[0].width} height={brands[0].height} alt="" loading="lazy" decoding="async" style={{ objectPosition: brands[0].position }} />
        {hydrated && <CircularCarousel ref={ring} items={items} autoplay={playing ? "step" : "off"} interval={interval} paused={held} reducedMotion={reduced} label={labels.region}
          announce={playing && !held ? "off" : "polite"} onChange={change}
          onItemClick={index => router.push(brands[index].href)} />}
      </div>

      <div className="brand-showcase__panel">
        <div className="brand-showcase__brand" data-fading={fading || undefined}>
          <p className="brand-showcase__mark" translate="no">{marks[displayed]}<span className="sr-only">{brand.name}</span></p>
          <div className="brand-showcase__copy-wrap">
            {/* Reserve the longest approved copy's height at every breakpoint. */}
            {brands.map(b => <p key={b.slug} className="brand-showcase__copy-space" aria-hidden="true">{b.copy}</p>)}
            <p className="brand-showcase__copy" data-status={brand.draft ? "draft" : undefined}>{brand.copy}</p>
          </div>
          <Link className="button button--outline brand-showcase__cta" href={brand.href}>
            {labels.explore}<span className="sr-only">: {brand.name}</span><Icon name="chevronRight" size={18} />
          </Link>
        </div>
        <div className="brand-showcase__controls">
          <p className="brand-showcase__count" aria-hidden="true"><span>{pad(displayed + 1)}</span> / {pad(brands.length)}</p>
          {!reduced && <button type="button" className="icon-button" onClick={() => setStopped(s => !s)} aria-pressed={stopped} aria-label={playing ? labels.pause : labels.play}><Icon name={playing ? "pause" : "play"} size={18} /></button>}
          <button type="button" className="icon-button" onClick={() => ring.current?.previous()} aria-label={labels.previous}><Icon name="chevronLeft" size={20} /></button>
          <button type="button" className="icon-button" onClick={() => ring.current?.next()} aria-label={labels.next}><Icon name="chevronRight" size={20} /></button>
        </div>
      </div>

      <nav ref={navigation} className="brand-showcase__index" aria-label={labels.index}>
        <ul>
          {brands.map((b, i) => <li key={b.slug}>
            <Link href={b.href} aria-label={b.name} aria-current={i === active || undefined}
              onFocus={() => ring.current?.goTo(i)}
              onClick={e => {
                // Keep real destinations for no-JS, new-tab and modified activation.
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !ring.current) return;
                e.preventDefault();
                ring.current.goTo(i);
              }}>{chips[i]}</Link>
          </li>)}
        </ul>
      </nav>
    </div>
  );
}
