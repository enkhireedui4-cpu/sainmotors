"use client";

import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import "@/app/circular-carousel.css";

export interface RingItem {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  title: string;
  alt?: string;
  position?: string;
}

export interface RingHandle {
  next(): void;
  previous(): void;
  goTo(index: number): void;
}

interface CircularCarouselProps {
  items: RingItem[];
  aspectRatio?: number;
  autoplay?: "step" | "off";
  interval?: number;
  paused?: boolean;
  reducedMotion?: boolean;
  label: string;
  announce?: "polite" | "off";
  onChange?: (index: number) => void;
  onItemClick?: (index: number) => void;
  ref?: Ref<RingHandle>;
}

const mod = (n: number, count: number) => ((n % count) + count) % count;
/** Signed shortest distance, including across the last/first boundary. */
const offset = (n: number, count: number) => mod(n + count / 2, count) - count / 2;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const ease = (t: number) => t * t * t * (t * (6 * t - 15) + 10);
const imageWindow = (index: number, count: number) => Array.from({ length: count }, (_, i) => i).filter(i => Math.abs(offset(i - index, count)) <= 2);

/** A continuous cyclic coverflow. Photographs stay flat; only their placement has depth. */
export function CircularCarousel({ items, aspectRatio = 1.6, autoplay = "step", interval = 5.5, paused = false, reducedMotion = false, label, announce = "polite", onChange, onItemClick, ref }: CircularCarouselProps) {
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const engine = useRef<RingHandle | null>(null);
  const runtime = useRef({ autoplay, paused, reducedMotion, onChange, onItemClick });
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(() => imageWindow(0, items.length));
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({
    next: () => engine.current?.next(),
    previous: () => engine.current?.previous(),
    goTo: (i) => engine.current?.goTo(i),
  }), []);

  useLayoutEffect(() => { runtime.current = { autoplay, paused, reducedMotion, onChange, onItemClick }; });

  useLayoutEffect(() => {
    const element = root.current;
    const count = items.length;
    if (!element || !count) return;
    let alive = true;
    let frame = 0;
    let inView = false;
    let width = 0;
    let cardWidth = 0;
    let position = 0;
    let desired = 0;
    let from = 0;
    let target = 0;
    let started = 0;
    let moving = false;
    let deadline = 0;
    let requestId = 0;
    let suppressedClick = false;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;
    let wheelOrigin = 0;
    let press: { id: number; x: number; y: number; origin: number; dragged: boolean } | undefined;
    const cache = new Map<number, Promise<void>>();

    const paint = () => {
      const mobile = width < 768;
      for (let i = 0; i < count; i++) {
        const card = cards.current[i];
        if (!card) continue;
        const d = offset(i - position, count);
        const distance = Math.abs(d);
        // Smooth spatial curves avoid a change of velocity as a photograph
        // passes between center, neighbor and peripheral positions.
        const scale = Math.exp(-(mobile ? 0.10536 : 0.22314) * distance);
        const travel = mobile ? distance * 0.72 + 0.2 * Math.tanh(distance * 1.4) : distance * 0.64 + 0.23 * Math.tanh(distance * 1.35);
        const x = Math.sign(d) * cardWidth * travel;
        const y = distance * Math.tanh(distance) * (mobile ? 2 : 7);
        const recession = mobile ? 15 : width < 1024 ? 75 : 110;
        const z = -recession * distance * Math.tanh(distance * 1.5) / Math.tanh(1.5);
        const angle = -(mobile ? 10 : 24) * Math.tanh(d * (mobile ? 0.55 : 0.45));
        // The next outer photograph disappears before it becomes an edge
        // fragment; at rest only the deliberately framed neighbors remain.
        const edge = clamp(distance - 1, 0, 1);
        const opacity = Math.exp(-(mobile ? 0.18 : 0.3) * distance * distance) * (1 - edge * edge * (3 - 2 * edge));
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${angle}deg) scale(${scale})`;
        card.style.opacity = String(opacity);
        card.style.zIndex = String(100 - Math.round(distance * 10));
        const visible = opacity > 0.02;
        card.style.pointerEvents = visible ? "auto" : "none";
        card.setAttribute("aria-hidden", String(!visible));
      }
    };

    const measure = () => {
      width = element.clientWidth;
      cardWidth = width < 768 ? Math.min(width * 0.84, 560) : width < 1024 ? Math.min(width * 0.68, 640) : clamp(width * 0.44, 512, 704);
      element.style.setProperty("--cc-width", `${cardWidth}px`);
      element.style.setProperty("--cc-ratio", String(aspectRatio));
      paint();
    };

    const prepare = (index: number) => {
      if (!cache.has(index)) {
        const photo = new Image();
        const item = items[index];
        if (item.sizes) photo.sizes = item.sizes;
        if (item.srcSet) photo.srcset = item.srcSet;
        photo.src = item.src;
        // Keep the previous photograph visible until the incoming one is decoded.
        cache.set(index, photo.decode().catch(() => {}));
      }
      return cache.get(index)!;
    };

    const navigate = (destination: number) => {
      desired = destination;
      const index = mod(Math.round(desired), count);
      const id = ++requestId;
      deadline = performance.now() + interval * 1000;
      setLoaded(previous => Array.from(new Set([...previous, ...imageWindow(index, count)])));
      void prepare(index).then(() => {
        if (!alive || id !== requestId) return;
        from = position;
        target = destination;
        started = performance.now();
        moving = !runtime.current.reducedMotion && Math.abs(target - from) > 0.001;
        if (!moving) { position = target; paint(); }
        element.toggleAttribute("data-moving", moving);
        setActive(index);
        runtime.current.onChange?.(index);
      });
    };

    engine.current = {
      next: () => navigate(Math.round(desired) + 1),
      previous: () => navigate(Math.round(desired) - 1),
      goTo: (i) => navigate(position + offset(i - position, count)),
    };

    const tick = (now: number) => {
      if (!alive) return;
      if (moving) {
        const progress = runtime.current.reducedMotion ? 1 : Math.min((now - started) / 800, 1);
        position = from + (target - from) * ease(progress);
        paint();
        if (progress === 1) {
          moving = false;
          element.removeAttribute("data-moving");
          // Keep the latest requested destination independent of a finishing
          // transition: its photograph may still be decoding.
        }
      }
      const held = runtime.current.paused || runtime.current.autoplay === "off" || runtime.current.reducedMotion || press || wheelTimer;
      if (held) deadline = 0;
      else if (!deadline) deadline = now + interval * 1000;
      else if (now >= deadline && !moving) engine.current?.next();
      frame = requestAnimationFrame(tick);
    };

    const visibility = () => {
      cancelAnimationFrame(frame);
      deadline = 0;
      if (inView && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; visibility(); }, { threshold: 0.15 });
    observer.observe(element);
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    measure();
    document.addEventListener("visibilitychange", visibility);

    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      suppressedClick = false;
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: position, dragged: false };
      deadline = 0;
    };
    const move = (event: PointerEvent) => {
      if (!press || event.pointerId !== press.id) return;
      const dx = event.clientX - press.x;
      const dy = event.clientY - press.y;
      if (!press.dragged && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        press.dragged = true;
        requestId++;
        moving = false;
        element.setPointerCapture(event.pointerId);
        element.setAttribute("data-dragging", "");
      }
      if (!press.dragged) return;
      event.preventDefault();
      position = press.origin - clamp(dx / (cardWidth * 0.82), -2, 2);
      paint();
    };
    const up = (event: PointerEvent) => {
      if (!press || event.pointerId !== press.id) return;
      const dragged = press.dragged;
      const origin = press.origin;
      press = undefined;
      element.removeAttribute("data-dragging");
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      if (dragged) {
        suppressedClick = true;
        const delta = position - origin;
        navigate(Math.abs(delta) > 0.12 && Math.abs(delta) < 0.5 ? Math.round(origin) + Math.sign(delta) : Math.round(position));
      }
    };
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 2) return;
      event.preventDefault();
      if (!wheelTimer) wheelOrigin = position;
      moving = false;
      requestId++;
      // One trackpad gesture explores one neighboring brand. This also keeps
      // every traversed photograph inside the already mounted image window.
      position = clamp(position + clamp(event.deltaX / (cardWidth * 0.82), -0.35, 0.35), wheelOrigin - 1, wheelOrigin + 1);
      paint();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelTimer = undefined; navigate(Math.round(position)); }, 140);
    };
    const key = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) element.focus({ preventScroll: true });
      if (["ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "].includes(event.key)) event.preventDefault();
      if (event.key === "ArrowLeft") engine.current?.previous();
      if (event.key === "ArrowRight") engine.current?.next();
      if (event.key === "Home") engine.current?.goTo(0);
      if (event.key === "End") engine.current?.goTo(count - 1);
      if ((event.key === "Enter" || event.key === " ") && !moving) runtime.current.onItemClick?.(mod(Math.round(position), count));
    };
    const click = (event: MouseEvent) => {
      if (suppressedClick) { suppressedClick = false; return; }
      const card = (event.target as HTMLElement).closest<HTMLElement>("[data-cc-index]");
      if (!card) return;
      const index = Number(card.dataset.ccIndex);
      if (!moving && Math.abs(offset(index - position, count)) < 0.01) runtime.current.onItemClick?.(index);
      else engine.current?.goTo(index);
    };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("keydown", key);
    element.addEventListener("click", click);
    return () => {
      alive = false;
      requestId++;
      cancelAnimationFrame(frame);
      clearTimeout(wheelTimer);
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("keydown", key);
      element.removeEventListener("click", click);
      engine.current = null;
    };
  }, [items, aspectRatio, interval]);

  return (
    <div ref={root} className="circular-carousel" role="group" aria-roledescription="carousel" aria-label={label} tabIndex={0} data-ready={ready || undefined} data-shape="coverflow">
      <div className="circular-carousel__stage">
        {items.map((item, i) => (
          <button key={item.src} ref={el => { cards.current[i] = el; }} type="button" className="circular-carousel__card" data-cc-index={i} data-active={i === active || undefined} tabIndex={-1} aria-label={`${i + 1} / ${items.length}: ${item.title}`}>
            {loaded.includes(i) && <img className="circular-carousel__photo" src={item.src} srcSet={item.srcSet} sizes={item.sizes} width={item.width} height={item.height} alt={item.alt ?? item.title} style={{ objectPosition: item.position }} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === active ? "high" : "auto"} decoding="async" draggable={false} onLoad={() => { if (i === 0) setReady(true); }} />}
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live={announce} aria-atomic="true">{active + 1} / {items.length}: {items[active]?.title}</span>
    </div>
  );
}
