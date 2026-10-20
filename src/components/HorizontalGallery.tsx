"use client";

import { animate, motion, scroll, useMotionValue, useTransform, type AnimationPlaybackControls } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Mirrors the motion.css query that turns the pinned strip into a native swipe strip. */
const NATIVE_STRIP = "(max-width: 47.99rem), (prefers-reduced-motion: reduce)";

/**
 * A photo strip that is pinned while the page scrolls past it and travels
 * sideways by exactly its overflow, so vertical scrolling reads it end to end.
 * The travel is a transform animation handed to scroll(), so it runs on the
 * compositor wherever the browser has scroll timelines. Sizes are read only in
 * ResizeObserver callbacks (after layout) and written through Motion's frame
 * loop, so measuring never forces a synchronous layout.
 * Phones and reduced motion get a native swipeable strip instead (motion.css),
 * which then takes keyboard focus so arrow keys can scroll it.
 */
export function HorizontalGallery({ items, label }: { items: ReactNode[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const distance = useMotionValue(0);
  const height = useTransform(() => `calc(100svh + ${distance.get()}px)`);
  const [native, setNative] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(NATIVE_STRIP);
    const update = () => setNative(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (track.current && viewport.current) distance.set(Math.max(0, track.current.offsetWidth - viewport.current.clientWidth));
    });
    if (track.current) observer.observe(track.current);
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [distance]);

  useEffect(() => {
    const strip = track.current;
    const section = ref.current;
    if (!strip || !section || native) return;
    let travel: AnimationPlaybackControls | undefined;
    let detach: (() => void) | undefined;
    const release = () => {
      detach?.();
      travel?.stop();
      travel = detach = undefined;
      strip.style.transform = "";
    };
    const attach = (overflow: number) => {
      release();
      if (overflow === 0) return;
      travel = animate(strip, { transform: ["translateX(0px)", `translateX(${-overflow}px)`] }, { ease: "linear" });
      detach = scroll(travel, { target: section, offset: ["start start", "end end"] });
    };
    attach(distance.get());
    const unsubscribe = distance.on("change", attach);
    return () => {
      unsubscribe();
      release();
    };
  }, [distance, native]);

  return (
    <motion.div ref={ref} className="hscroll" style={{ height }}>
      <div
        ref={viewport}
        className="hscroll__viewport"
        {...(native ? { tabIndex: 0, role: "region", "aria-label": label } : {})}
      >
        <ul ref={track} className="hscroll__track" aria-label={label}>
          {items.map((item, index) => (
            <li key={index} className="hscroll__item">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
