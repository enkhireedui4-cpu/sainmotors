"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/**
 * A muted loop that plays only while it is on screen and the tab is visible.
 * Nothing is fetched until it first comes into view (preload="none"); a lazy
 * poster image sits beneath it until the first frame arrives, and stays the
 * picture with reduced motion or when the browser refuses to autoplay.
 *
 * A visitor's choice made with TeaserToggle (data-choice: "paused" | "play")
 * outranks everything: paused stays paused, and play overrides reduced motion.
 */
export function TeaserVideo({ id, src, label }: { id: string; src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const sync = () => {
      const choice = video.dataset.choice;
      const wanted = choice === "play" || (choice !== "paused" && !reduce);
      if (inView && wanted && document.visibilityState === "visible") video.play().catch(() => {});
      else video.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [inView, reduce]);

  return (
    <video
      ref={ref}
      id={id}
      className="teaser-video"
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      disablePictureInPicture
      onPlaying={(event) => event.currentTarget.setAttribute("data-ready", "")}
    />
  );
}

/** Pause/play for the teaser (WCAG 2.2.2): a visitor's pause holds until they press play. */
export function TeaserToggle({ target, pauseLabel, playLabel }: { target: string; pauseLabel: string; playLabel: string }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = document.getElementById(target) as HTMLVideoElement | null;
    if (!video) return;
    const update = () => setPlaying(!video.paused);
    video.addEventListener("play", update);
    video.addEventListener("pause", update);
    update();
    return () => {
      video.removeEventListener("play", update);
      video.removeEventListener("pause", update);
    };
  }, [target]);

  const toggle = () => {
    const video = document.getElementById(target) as HTMLVideoElement | null;
    if (!video) return;
    if (video.paused) {
      video.dataset.choice = "play";
      video.play().catch(() => {});
    } else {
      video.dataset.choice = "paused";
      video.pause();
    }
  };

  return (
    <button type="button" className="teaser-toggle" onClick={toggle} aria-controls={target}>
      <Icon name={playing ? "pause" : "play"} size={16} />
      {playing ? pauseLabel : playLabel}
    </button>
  );
}
