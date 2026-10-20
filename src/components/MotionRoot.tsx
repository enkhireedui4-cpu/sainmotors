"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** One MotionConfig for the site: Motion drops transform and layout animation for visitors who ask for reduced motion. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
