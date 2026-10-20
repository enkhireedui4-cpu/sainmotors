"use client";

import { motion, useScroll, useTransform, type MotionStyle } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * A framed photograph that opens to full bleed as the section scrolls through
 * its sticky viewport, while the image settles from a slight push-in. The copy
 * is always visible; only the frame moves. The component writes one --open
 * value (0 framed → 1 full bleed); motion.css turns it into a clip-path whose
 * starting inset suits each screen. Reduced motion shows the open frame.
 */
export function MediaViewfinder({ media, children }: { media: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const open = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [1.18, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, -24]);

  return (
    <div ref={ref} className="viewfinder">
      <div className="viewfinder__viewport">
        <motion.div className="viewfinder__frame" style={{ "--open": open } as MotionStyle}>
          <motion.div className="viewfinder__media" style={{ scale }}>
            {media}
          </motion.div>
        </motion.div>
        <motion.div className="viewfinder__copy" style={{ y }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
