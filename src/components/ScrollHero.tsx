"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * Full-bleed photographic hero that lays back in depth as the page scrolls:
 * the frame shrinks and tilts away (rotateX inside the section's perspective)
 * while the photograph slowly pushes in and the headline rises faster than the
 * image. Every value starts at identity, so the server render, the first client
 * render and the reduced-motion state all match: with reduced motion the same
 * identity values are set statically, so nothing is bound to the scroll (not
 * even Motion's native scroll-timeline opacity) and hydration sees no change.
 */
export function ScrollHero({ media, children, labelledBy }: { media: ReactNode; children: ReactNode; labelledBy: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 16]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.35], [0, 18]);
  const push = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const still = useReducedMotion() === true;

  return (
    <section ref={ref} className="corporate-hero" aria-labelledby={labelledBy}>
      <motion.div className="corporate-hero__frame" style={still ? { scale: 1, rotateX: 0, borderRadius: 0 } : { scale, rotateX, borderRadius }}>
        <motion.div className="corporate-hero__media" style={{ scale: still ? 1 : push }}>
          {media}
        </motion.div>
      </motion.div>
      <motion.div className="corporate-hero__content" style={still ? { y: 0, opacity: 1 } : { y, opacity }}>
        {children}
      </motion.div>
    </section>
  );
}
