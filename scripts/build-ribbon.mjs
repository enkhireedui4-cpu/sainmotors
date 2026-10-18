import fs from "node:fs/promises";
import path from "node:path";
import { WIDE, ribbonShapes } from "../src/lib/ribbon.ts";

// Reuse the original satin geometry as a static, compressed SVG. No client animation.
const shapes = ribbonShapes(WIDE, 0.25);
const paths = shapes.map((shape) => {
  const colors = new Map();
  for (const slice of shape.slices) {
    const d = `M${slice.points.replaceAll(" ", "L")}Z`;
    colors.set(slice.fill, (colors.get(slice.fill) ?? "") + d);
  }
  return [...colors].map(([fill, d]) => `<path d="${d}" fill="${fill}" stroke="${fill}" stroke-width="0.7"/>`).join("");
}).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDE.width} ${WIDE.height}"><defs><filter id="s"><feGaussianBlur stdDeviation="0.7"/></filter></defs><g filter="url(#s)">${paths}</g></svg>`;
const dir = path.resolve(import.meta.dirname, "../public/art");
await fs.mkdir(dir, { recursive: true });
await fs.writeFile(path.join(dir, "sain-ribbon.svg"), svg);
