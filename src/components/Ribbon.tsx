"use client";

import { useEffect, useRef } from "react";
import type { RibbonLayout } from "@/lib/ribbon";
import { createRibbonRenderer, type RibbonRenderer } from "@/lib/ribbon-gl";

interface RibbonProps {
  layout: RibbonLayout;
  variant: "wide" | "narrow";
  align: "xMidYMid" | "xMidYMax";
}

/** Satin mesh rendered on the GPU; the original artwork stays visible until the first valid frame. */
export function Ribbon({ layout, variant, align }: RibbonProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!box || !canvas || !image) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 639px)");
    let renderer: RibbonRenderer | null = null;
    let attempted = false;
    let fallback: Animation | null = null;
    let raf = 0;
    let last = 0;
    let elapsed = 0.25;
    let visible = true;
    let disposed = false;

    const clearRendererState = () => {
      delete box.dataset.renderer;
      delete box.dataset.gl;
    };
    const draw = () => {
      if (renderer?.draw(elapsed)) {
        box.dataset.renderer = "webgl";
        box.dataset.gl = "";
        return true;
      }
      clearRendererState();
      return false;
    };
    const frame = (now: number) => {
      raf = 0;
      if (disposed || reduce.matches || document.hidden || !visible) return;
      if (!last) last = now;
      const delta = now - last;
      if (delta >= 1000 / (compact.matches ? 24 : 30)) {
        elapsed += Math.min(delta, 100) / 1000;
        last = now;
        draw();
      }
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (reduce.matches) {
        fallback?.cancel();
        fallback = null;
        clearRendererState();
        box.dataset.motion = "reduced";
        return;
      }
      if (document.hidden || !visible) {
        fallback?.pause();
        box.dataset.motion = "paused";
        return;
      }
      if (!attempted) {
        attempted = true;
        renderer = createRibbonRenderer(canvas, layout, align);
      }
      if (renderer) {
        renderer.resize();
        if (draw()) {
          fallback?.cancel();
          fallback = null;
          box.dataset.motion = "running";
          raf = requestAnimationFrame(frame);
          return;
        }
      }
      // A compositor-only floating treatment when WebGL is unavailable.
      clearRendererState();
      if (!fallback) {
        fallback = image.animate([
          { transform: "translate3d(-1.5%, 1%, 0) rotate(-1.5deg) scale(1.06)" },
          { transform: "translate3d(1.5%, -1%, 0) rotate(1.5deg) scale(1.06)" },
        ], { duration: 18000, direction: "alternate", iterations: Infinity, easing: "cubic-bezier(.45,0,.55,1)" });
      }
      fallback.play();
      box.dataset.renderer = "fallback";
      box.dataset.motion = "running";
    };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resize = new ResizeObserver(() => sync());
    const lost = (event: Event) => {
      event.preventDefault();
      renderer = null;
      attempted = true;
      sync();
    };
    const restored = () => { attempted = false; sync(); };
    intersection.observe(box);
    resize.observe(box);
    reduce.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    sync();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      fallback?.cancel();
      intersection.disconnect();
      resize.disconnect();
      reduce.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      renderer?.dispose();
    };
  }, [layout, align]);

  return (
    <div ref={boxRef} className={`ribbon ribbon--${variant}`}>
      <img ref={imageRef} className="ribbon__fallback" src="/art/sain-ribbon.svg" width={layout.width} height={layout.height} alt="" fetchPriority="high" />
      <canvas ref={canvasRef} className="ribbon__canvas" aria-hidden="true" />
    </div>
  );
}
