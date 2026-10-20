"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionStyle, type MotionValue } from "motion/react";
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

/** Distance between photographs along the camera axis, in px (the stage perspective is 1000px). */
const GAP = 900;
/** Lateral lane per photograph, in units of the CSS --spread / --spread-y: the camera threads between them. */
const LANES: [number, number][] = [[0, 0], [-1, 0.25], [1, -0.2], [-0.9, -0.3], [1, 0.3], [0, 0.1]];

/** Scroll progress where the walk starts and ends, leaving a short rest on the first and last photograph. */
const START = 0.04;
const END = 0.96;

/**
 * Depth gallery: photographs stand one behind another in a perspective stage
 * and the scroll moves the camera through them, gliding sideways so the
 * photograph in focus is centred. Far frames converge on the vanishing point
 * and peek out beside it; passed ones swing out past the edges and fade. A fine pointer
 * tilts the whole stage a few degrees. The section's one action stays in view
 * for the whole walk. Reduced motion lays the same figures out as a plain grid
 * (motion.css), overriding the inline transforms.
 */
export function ShowroomDepth({ cards, label, action }: { cards: ReactNode[]; label: string; action?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const count = cards.length;
  // The progress at which each photograph is in focus; the camera glides from lane to lane between them.
  const focus = cards.map((_, index) => START + (index / Math.max(1, count - 1)) * (END - START));
  const cameraX = useTransform(scrollYProgress, focus, focus.map((_, index) => LANES[index % LANES.length][0]));
  const cameraY = useTransform(scrollYProgress, focus, focus.map((_, index) => LANES[index % LANES.length][1]));
  const bar = useTransform(scrollYProgress, [START, END], [0, 1]);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 80, damping: 20 });
  const rotateY = useSpring(tiltY, { stiffness: 80, damping: 20 });
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    tiltY.set(((event.clientX - box.left) / box.width - 0.5) * 8);
    tiltX.set(((event.clientY - box.top) / box.height - 0.5) * -5);
  };
  const onPointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <div ref={ref} className="depth" style={{ "--count": cards.length } as CSSProperties}>
      <div className="depth__viewport" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
        <motion.ul className="depth__stage" aria-label={label} style={{ rotateX, rotateY, "--camera-x": cameraX, "--camera-y": cameraY } as MotionStyle}>
          {cards.map((card, index) => (
            <DepthCard key={index} index={index} count={count} progress={scrollYProgress}>
              {card}
            </DepthCard>
          ))}
        </motion.ul>
        <div className="depth__progress" aria-hidden="true">
          <motion.span style={{ scaleX: bar }} />
        </div>
        {action}
      </div>
    </div>
  );
}

function DepthCard({ index, count, progress, children }: { index: number; count: number; progress: MotionValue<number>; children: ReactNode }) {
  // Depth along the camera axis: 0 when this photograph is in focus, behind the camera once passed.
  const z = useTransform(progress, [START, END], [-index * GAP, (count - 1 - index) * GAP]);
  const opacity = useTransform(z, [-2.4 * GAP, -1.2 * GAP, 0, 380, 640], [0, 1, 1, 0.85, 0]);
  const [lx, ly] = LANES[index % LANES.length];
  return (
    <li className="depth__lane" style={{ "--lx": lx, "--ly": ly, zIndex: count - index } as CSSProperties}>
      <motion.div className="depth__card" style={{ z, opacity }}>
        {children}
      </motion.div>
    </li>
  );
}
