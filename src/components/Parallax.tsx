"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

/** A clipped frame whose photograph drifts against the scroll, so it reads as a window rather than a print. */
export function Parallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  return (
    <div ref={ref} className={`parallax ${className ?? ""}`}>
      <motion.div className="parallax__media" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
