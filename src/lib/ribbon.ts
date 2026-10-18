/**
 * Geometry and lighting for the home page ribbons: satin bands that twist
 * along road-like curves, in Sain Motors reds.
 *
 * Each band is cut into short slices along its length and a few across its
 * width; every slice is lit from its own surface normal (a soft front-left
 * light, a specular sheen, a darker back face where the band turns over).
 * That gives a glossy, three-dimensional read from plain SVG polygons, with
 * no WebGL.
 *
 * Pure and deterministic: the server renders time 0 as static SVG; the
 * browser re-evaluates it for slow motion (src/components/Ribbon.tsx).
 */

type Point = [number, number];
type Curve = [Point, Point, Point, Point];

export interface RibbonSpec {
  /** Cubic Bézier centreline as fractions of the viewBox. */
  curve: Curve;
  /** Half-width of the band, as a share of the viewBox height. */
  band: number;
  /** Turns of the twist along the curve, and its starting angle. */
  twists: number;
  phase: number;
  /** Slices along the band. */
  samples: number;
  /** Overall strength; the secondary ribbon sits back in the dark. */
  intensity: number;
}

export interface RibbonLayout {
  width: number;
  height: number;
  ribbons: RibbonSpec[];
}

/** Landscape: a broad satin sweep crosses the frame; a second ribbon loops down the right. */
export const WIDE: RibbonLayout = {
  width: 1600,
  height: 640,
  ribbons: [
    {
      curve: [
        [-0.16, 0.08],
        [0.35, 1.48],
        [0.48, -0.85],
        [1.16, 0.65],
      ],
      band: 0.21,
      twists: 1.35,
      phase: 0.4,
      samples: 192,
      intensity: 1,
    },
    {
      curve: [
        [0.62, -0.48],
        [0.85, 0.18],
        [0.52, 0.76],
        [1.16, 1.28],
      ],
      band: 0.12,
      twists: 0.95,
      phase: 2.1,
      samples: 112,
      intensity: 0.72,
    },
  ],
};

/** Portrait: one band sweeps under the copy and rises off the right edge. */
export const NARROW: RibbonLayout = {
  width: 800,
  height: 960,
  ribbons: [
    {
      curve: [
        [-0.3, 1.02],
        [0.25, 0.6],
        [0.75, 1.16],
        [1.3, 0.6],
      ],
      band: 0.115,
      twists: 1.25,
      phase: 0.6,
      samples: 72,
      intensity: 1,
    },
  ],
};

/** Across the band: edge, body, body, edge. */
const ACROSS = [-1, -0.45, 0, 0.45, 1];

// Light from the front, slightly left and above (screen y grows downward).
const LIGHT = (() => {
  const v = [-0.35, -0.45, 0.82];
  const l = Math.hypot(v[0], v[1], v[2]);
  return v.map((c) => c / l) as [number, number, number];
})();

const FRONT: [number, number, number] = [226, 10, 23]; // Sain red
const BACK: [number, number, number] = [118, 8, 18]; // deep red
const SHADOW: [number, number, number] = [34, 6, 9];
const SHEEN: [number, number, number] = [255, 150, 145];

function bezier(p: Curve, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
}

function tangent(p: Curve, t: number): Point {
  const u = 1 - t;
  const a = 3 * u * u;
  const b = 6 * u * t;
  const c = 3 * t * t;
  return [
    a * (p[1][0] - p[0][0]) + b * (p[2][0] - p[1][0]) + c * (p[3][0] - p[2][0]),
    a * (p[1][1] - p[0][1]) + b * (p[2][1] - p[1][1]) + c * (p[3][1] - p[2][1]),
  ];
}

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const rgb = (c: number[]) => `rgb(${c.map((v) => Math.round(Math.max(0, Math.min(255, v)))).join(" ")})`;

export interface RibbonShape {
  /** One entry per slice: polygon points and its lit colour. */
  slices: { points: string; fill: string }[];
  /** Thin highlight lines running along the band. */
  stripes: string[];
}

/** Number of slices a ribbon produces (stable across time, for keyed DOM updates). */
export const sliceCount = (spec: RibbonSpec) => spec.samples * (ACROSS.length - 1);
export const STRIPES = [-0.72, 0.62];

/**
 * Every ribbon at `time` seconds. Motion is a slow roll of the twist and a
 * slight breathing of the curve; time 0 is the static pose.
 */
export function ribbonShapes(layout: RibbonLayout, time = 0): RibbonShape[] {
  const { width: W, height: H } = layout;
  return layout.ribbons.map((spec, r) => {
    const roll = spec.phase + time * (0.16 + r * 0.05);
    const breathe = Math.sin(time * 0.28 + r) * 0.02;
    const curve = spec.curve.map(([x, y], i) => [
      x * W,
      (y + (i === 1 ? breathe : i === 2 ? -breathe : 0)) * H,
    ]) as Curve;

    // Frame along the centreline.
    const frame: { x: number; y: number; nx: number; ny: number; w: number; c: number; s: number }[] = [];
    for (let k = 0; k <= spec.samples; k++) {
      const t = k / spec.samples;
      const [x, y] = bezier(curve, t);
      const [dx, dy] = tangent(curve, t);
      const len = Math.hypot(dx, dy) || 1;
      const w = spec.band * H * (0.38 + 0.62 * Math.sin(Math.PI * t));
      const theta = 2 * Math.PI * spec.twists * t + roll;
      frame.push({ x, y, nx: -dy / len, ny: dx / len, w, c: Math.cos(theta), s: Math.sin(theta) });
    }
    const at = (k: number, across: number): Point => {
      const f = frame[k];
      return [f.x + f.nx * f.w * across * f.c, f.y + f.ny * f.w * across * f.c + f.w * across * f.s * 0.3];
    };

    const slices: RibbonShape["slices"] = [];
    for (let k = 0; k < spec.samples; k++) {
      const a = frame[k];
      const b = frame[k + 1];
      const c = (a.c + b.c) / 2;
      const s = (a.s + b.s) / 2;
      const nx = (a.nx + b.nx) / 2;
      const ny = (a.ny + b.ny) / 2;
      // Surface normal of a band twisted by theta around its centreline.
      const normal = [-nx * s, -ny * s, c];
      const facing = normal[0] * LIGHT[0] + normal[1] * LIGHT[1] + normal[2] * LIGHT[2];
      const front = c >= 0;
      const diffuse = Math.abs(facing);
      const base = front ? FRONT : BACK;
      for (let j = 0; j < ACROSS.length - 1; j++) {
        const mid = (ACROSS[j] + ACROSS[j + 1]) / 2;
        // A soft sheen down the middle of the band, falling off to the edges.
        const sheen = front ? Math.pow(diffuse, 9) * (1 - Math.abs(mid) * 0.7) : 0;
        let color = mix(SHADOW, base, 0.25 + 0.75 * Math.pow(diffuse, 0.8));
        color = mix(color, SHEEN, sheen * 0.75);
        color = mix([23, 22, 20], color, spec.intensity);
        const p1 = at(k, ACROSS[j]);
        const p2 = at(k, ACROSS[j + 1]);
        const p3 = at(k + 1, ACROSS[j + 1]);
        const p4 = at(k + 1, ACROSS[j]);
        slices.push({
          points: [p1, p2, p3, p4].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "),
          fill: rgb(color),
        });
      }
    }

    const stripes = STRIPES.map((across) => {
      let d = "";
      for (let k = 0; k <= spec.samples; k += 2) {
        const [x, y] = at(k, across);
        d += `${k ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      return d;
    });

    return { slices, stripes };
  });
}

/** Centrelines, for the soft glow beneath the bands. */
export function ribbonSpines(layout: RibbonLayout): string[] {
  return layout.ribbons.map((spec) => {
    const p = spec.curve.map(([x, y]) => `${(x * layout.width).toFixed(1)} ${(y * layout.height).toFixed(1)}`);
    return `M${p[0]}C${p[1]} ${p[2]} ${p[3]}`;
  });
}
