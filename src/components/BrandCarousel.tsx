"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { Icon } from "./Icon";

interface BrandCarouselProps {
  /** One rendered card per brand (with ids for aria-describedby). */
  slides: ReactNode[];
  /** The same cards without ids; offscreen loop copies are inert. */
  copies: ReactNode[];
  names: string[];
  labels: { region: string; slide: string; previous: string; next: string; pause: string; play: string };
  /** Milliseconds per step while playing. */
  interval?: number;
  autoPlay?: boolean;
  resumeAfterInteraction?: boolean;
  showPosition?: boolean;
  showPlaybackControl?: boolean;
}

/** Copies kept on each side: at least the most cards ever visible at once. */
const BUFFER = 4;
const TRANSITION_MS = 700;

const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const useReducedMotion = () =>
  useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);

const wrap = (i: number, n: number) => ((i % n) + n) % n;

/**
 * Horizontal brand carousel that moves one card at a time.
 *
 * Loop: inert, aria-hidden copies sit on both sides, so stepping past the last
 * brand slides on to the first without a rewind; once the move ends the track
 * jumps (invisibly, between identical cards) back into the real range. A timer
 * backs up `transitionend`, so the jump never depends on the event firing.
 *
 * Autoplay: every `interval` ms, one card. It waits while the pointer is over
 * the carousel, keyboard focus is inside it, it is off screen or the tab is
 * hidden. Any deliberate step (buttons, keys, swipe) stops it until the
 * visitor presses play. With reduced motion it never starts.
 * `resumeAfterInteraction` restarts the interval after manual input once hover
 * and keyboard focus leave. Every focused control holds the carousel still.
 *
 * Cards per view come from the CSS custom property --per-view (container
 * breakpoints in globals.css).
 */
export function BrandCarousel({ slides, copies, names, labels, interval = 5000, autoPlay = true, resumeAfterInteraction = false, showPosition = true, showPlaybackControl = true }: BrandCarouselProps) {
  const viewportId = useId();
  const n = slides.length;
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const nextAdvanceAt = useRef(0);

  const [pos, setPos] = useState(0);
  const [instant, setInstant] = useState(true);
  const [stopped, setStopped] = useState(!autoPlay);
  const [hover, setHover] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [focusOnSlide, setFocusOnSlide] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const [perView, setPerView] = useState(3);

  const current = wrap(pos, n);
  const autoplay = hydrated && !stopped && !reduced && n > 1;
  const running = autoplay && !focusOnSlide && !hover && !focusInside && onScreen && !tabHidden;

  // Back into the real range after moving onto a copy.
  const settle = useCallback(() => {
    if (pos >= 0 && pos < n) return;
    setInstant(true);
    setPos(wrap(pos, n));
  }, [pos, n]);

  // Re-enable the transition once the instant jump has painted.
  useEffect(() => {
    if (!instant) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setInstant(false));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [instant]);

  // Fallback for a missing transitionend (and the only path with reduced motion).
  useEffect(() => {
    if (pos >= 0 && pos < n) return;
    const id = setTimeout(settle, reduced ? 0 : TRANSITION_MS + 100);
    return () => clearTimeout(id);
  }, [pos, n, reduced, settle]);

  const step = useCallback(
    (dir: 1 | -1, deliberate: boolean) => {
      if (deliberate) {
        nextAdvanceAt.current = 0;
        if (!resumeAfterInteraction) setStopped(true);
      }
      if (pos < 0 || pos >= n) {
        // Still on a copy after a quick previous step: continue from the real card.
        setInstant(true);
        setPos(wrap(pos, n) + dir);
      } else {
        setPos(pos + dir);
      }
    },
    [pos, n, resumeAfterInteraction],
  );

  // Autoplay: one card per interval.
  useEffect(() => {
    if (!running) {
      nextAdvanceAt.current = 0;
      return;
    }
    // Loop normalization must keep the original deadline, while manual steps restart it.
    if (!nextAdvanceAt.current) nextAdvanceAt.current = performance.now() + interval;
    const id = setTimeout(() => {
      nextAdvanceAt.current = 0;
      step(1, false);
    }, Math.max(0, nextAdvanceAt.current - performance.now()));
    return () => clearTimeout(id);
  }, [running, pos, interval, step]);

  // Cards per view, from CSS.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const read = () => {
      setInstant(true);
      setPerView(parseFloat(getComputedStyle(viewport).getPropertyValue("--per-view")) || 1);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, []);

  // Off screen and hidden-tab holds.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.2 });
    io.observe(root);
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // A focused card that is out of view slides into view.
  const onFocus = (event: React.FocusEvent) => {
    setFocusInside(true);
    const slide = (event.target as HTMLElement).closest<HTMLElement>("[data-index], [data-loop-index]");
    setFocusOnSlide(Boolean(slide));
    if (!slide || slide.dataset.index === undefined) return;
    const index = Number(slide.dataset.index);
    const visible = Math.max(1, Math.floor(perView));
    if (index < current || index >= current + visible) setPos(index);
  };

  const onBlur = (event: React.FocusEvent) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setFocusInside(false);
      setFocusOnSlide(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const dir = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    event.preventDefault();
    const slide = (event.target as HTMLElement).closest<HTMLElement>("[data-index], [data-loop-index]");
    if (slide) {
      const index = Number(slide.dataset.index ?? slide.dataset.loopIndex);
      const next = wrap(index + dir, n);
      nextAdvanceAt.current = 0;
      if (!resumeAfterInteraction) setStopped(true);
      // Arrow keys move between links. Keep keyboard focus visible rather than
      // sliding its current link behind the viewport. Wrap without a long rewind.
      if (slide.dataset.loopIndex !== undefined || next !== index + dir) {
        setInstant(true);
        setPos(next);
      }
      rootRef.current?.querySelector<HTMLAnchorElement>(`[data-index="${next}"] a`)?.focus({ preventScroll: true });
      return;
    }
    step(dir, true);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1, true);
  };

  const before = hydrated ? Array.from({ length: BUFFER }, (_, k) => wrap(n - BUFFER + k, n)) : [];
  const after = hydrated ? Array.from({ length: BUFFER }, (_, k) => wrap(k, n)) : [];
  const trackStyle = { "--i": hydrated ? pos + BUFFER : 0 } as CSSProperties;
  const counter = (i: number) => String(i + 1).padStart(2, "0");
  const visibleCopy = (slot: number) => slot >= pos && slot < pos + Math.ceil(perView);

  return (
    <div
      ref={rootRef}
      className="bc"
      role="group"
      aria-roledescription="carousel"
      aria-label={labels.region}
      data-ready={hydrated || undefined}
      data-instant={instant || undefined}
      data-playing={running || undefined}
      data-current={current}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <div id={viewportId} ref={viewportRef} className="bc__viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp}
        onScroll={event => {
          // Focus can natively scroll an overflow:hidden element. In track
          // mode its transform owns horizontal positioning, so do not add a
          // second scroll offset. The no-JS horizontal scroller is unchanged.
          if (hydrated && event.currentTarget.scrollLeft) event.currentTarget.scrollLeft = 0;
        }}>
        <ul
          className="bc__track"
          style={trackStyle}
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget && e.propertyName === "transform") settle();
          }}
        >
          {before.map((i, k) => (
            <li key={`b${k}`} className="bc__slide" data-loop-index={i} aria-hidden={!visibleCopy(k - BUFFER) || undefined} inert={!visibleCopy(k - BUFFER)}>
              {copies[i]}
            </li>
          ))}
          {slides.map((slide, i) => (
            <li
              key={names[i]}
              className="bc__slide"
              data-index={i}
              role="group"
              aria-roledescription={labels.slide}
              aria-label={`${i + 1} / ${n}: ${names[i]}`}
            >
              {slide}
            </li>
          ))}
          {after.map((i, k) => (
            <li key={`a${k}`} className="bc__slide" data-loop-index={i} aria-hidden={!visibleCopy(n + k) || undefined} inert={!visibleCopy(n + k)}>
              {copies[i]}
            </li>
          ))}
        </ul>
      </div>

      <div className="bc__controls">
        {showPosition ? <div className="bc__position">
          <ol className="bc__dots" aria-hidden="true">
            {names.map((name, i) => (
              <li key={name} data-current={i === current || undefined} />
            ))}
          </ol>
          <p className="bc__count">
            <span aria-hidden="true">
              {counter(current)} / {String(n).padStart(2, "0")}
            </span>
            <span className="sr-only" aria-live={running ? "off" : "polite"} aria-atomic="true">
              {`${names[current]}, ${current + 1} / ${n}`}
            </span>
          </p>
        </div> : <p className="sr-only" aria-live={running ? "off" : "polite"} aria-atomic="true">{`${names[current]}, ${current + 1} / ${n}`}</p>}
        <div className="bc__buttons">
          {showPlaybackControl && !reduced && (
            <button
              type="button"
              className="icon-button"
              onClick={() => setStopped((s) => !s)}
              data-paused={stopped}
              aria-label={autoplay ? labels.pause : labels.play}
              aria-controls={viewportId}
              title={autoplay ? labels.pause : labels.play}
            >
              <Icon name={autoplay ? "pause" : "play"} size={18} />
            </button>
          )}
          <button type="button" className="icon-button" onClick={() => step(-1, true)} aria-label={labels.previous} aria-controls={viewportId} title={labels.previous}>
            <Icon name="chevronLeft" size={20} />
          </button>
          <button type="button" className="icon-button" onClick={() => step(1, true)} aria-label={labels.next} aria-controls={viewportId} title={labels.next}>
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
