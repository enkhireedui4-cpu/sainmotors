"use client";

import { useAnimate, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

/**
 * Lifts content into place the first time it enters the viewport. The server
 * HTML stays fully visible: only content the first intersection report places
 * below the fold is hidden and then revealed, so nothing needs JavaScript to be
 * readable. Positions come from IntersectionObserver entries, never from a
 * layout read during render. Reduced motion never hides anything.
 */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduce = useReducedMotion();

  useEffect(() => {
    const element = scope.current;
    if (reduce || !element) return;
    let armed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // Only content still ahead of the reader is hidden; anything already passed stays as it is.
          if (!armed && entry.boundingClientRect.top > 0) {
            armed = true;
            animate(element, { opacity: 0, y: 24 }, { duration: 0 });
          }
          return;
        }
        observer.disconnect();
        // A critically damped spring: a large surface settles in ~0.5s with no overshoot.
        if (armed) animate(element, { opacity: 1, y: 0 }, { type: "spring", bounce: 0, visualDuration: 0.5, delay });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [animate, delay, reduce, scope]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
