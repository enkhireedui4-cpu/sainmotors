/**
 * Smooth renderer for the home page ribbons: a single small WebGL program,
 * no library. The band geometry is evaluated in the vertex shader from the
 * same curve parameters as src/lib/ribbon.ts (the SVG fallback), and lit per
 * pixel in the fragment shader, so the satin reads smooth at any size.
 * Animation only updates a few uniforms per frame.
 */
import type { RibbonLayout } from "./ribbon";

const VERTEX = `
attribute vec2 a_ts;
uniform vec2 u_p0;
uniform vec2 u_p1;
uniform vec2 u_p2;
uniform vec2 u_p3;
uniform float u_band;
uniform float u_twists;
uniform float u_roll;
uniform float u_scale;
uniform vec2 u_offset;
uniform vec2 u_res;
varying vec3 v_n;
varying float v_s;
varying float v_face;
void main() {
  float t = a_ts.x;
  float s = a_ts.y;
  float u = 1.0 - t;
  vec2 c = u * u * u * u_p0 + 3.0 * u * u * t * u_p1 + 3.0 * u * t * t * u_p2 + t * t * t * u_p3;
  vec2 d = 3.0 * u * u * (u_p1 - u_p0) + 6.0 * u * t * (u_p2 - u_p1) + 3.0 * t * t * (u_p3 - u_p2);
  vec2 tn = normalize(d);
  vec2 n = vec2(-tn.y, tn.x);
  float w = u_band * (0.38 + 0.62 * sin(3.14159265 * t));
  float th = 6.28318531 * u_twists * t + u_roll;
  float ct = cos(th);
  float st = sin(th);
  vec2 p = c + n * w * s * ct + vec2(0.0, w * s * st * 0.3);
  vec2 px = p * u_scale + u_offset;
  vec2 clip = px / u_res * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_n = vec3(-n * st, ct);
  v_s = s;
  v_face = ct;
}`;

const FRAGMENT = `
precision mediump float;
varying vec3 v_n;
varying float v_s;
varying float v_face;
uniform float u_intensity;
void main() {
  vec3 light = vec3(-0.3505, -0.4506, 0.8211);
  vec3 halfway = vec3(-0.1837, -0.2361, 0.9542);
  vec3 n = normalize(v_n);
  float front = step(0.0, v_face);
  if (v_face < 0.0) n = -n;
  float diffuse = max(dot(n, light), 0.0);
  float spec = pow(max(dot(n, halfway), 0.0), 34.0);
  float across = 1.0 - abs(v_s);
  // Sain red on the face, deep red on the reverse.
  vec3 base = mix(vec3(0.42, 0.03, 0.06), vec3(0.886, 0.039, 0.09), front);
  vec3 col = mix(vec3(0.12, 0.022, 0.032), base, 0.2 + 0.8 * pow(diffuse, 0.85));
  // Satin sheen, strongest down the middle of the band.
  col += vec3(1.0, 0.58, 0.52) * spec * (0.3 + 0.7 * across) * (0.4 + 0.6 * front);
  // Fine pinstripes along the band, fading as it turns edge-on.
  float stripe = 1.0 - smoothstep(0.0, 0.035, abs(abs(v_s) - 0.7));
  col += vec3(1.0, 0.62, 0.6) * stripe * 0.16 * abs(v_face);
  // Slightly darker edges give the band a rolled, physical edge.
  col *= 0.8 + 0.2 * smoothstep(0.0, 0.55, across);
  col = mix(vec3(0.09, 0.086, 0.078), col, u_intensity);
  gl_FragColor = vec4(col, 1.0);
}`;

const SAMPLES = 260;
const ACROSS = 20;

export interface RibbonRenderer {
  draw(time: number): boolean;
  resize(): void;
  dispose(): void;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "compile");
  return shader;
}

/**
 * Sets up the renderer on `canvas`, or returns null when WebGL is not
 * available (the SVG stays in place).
 */
export function createRibbonRenderer(
  canvas: HTMLCanvasElement,
  layout: RibbonLayout,
  align: "xMidYMid" | "xMidYMax",
): RibbonRenderer | null {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) return null;

  let program: WebGLProgram;
  try {
    program = gl.createProgram()!;
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  } catch {
    return null;
  }
  gl.useProgram(program);

  // One (t, s) grid shared by every ribbon.
  const verts = new Float32Array((SAMPLES + 1) * (ACROSS + 1) * 2);
  let v = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    for (let j = 0; j <= ACROSS; j++) {
      verts[v++] = i / SAMPLES;
      verts[v++] = -1 + (2 * j) / ACROSS;
    }
  }
  const indices = new Uint16Array(SAMPLES * ACROSS * 6);
  let k = 0;
  for (let i = 0; i < SAMPLES; i++) {
    for (let j = 0; j < ACROSS; j++) {
      const a = i * (ACROSS + 1) + j;
      const b = a + ACROSS + 1;
      indices.set([a, b, a + 1, a + 1, b, b + 1], k);
      k += 6;
    }
  }
  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  const attr = gl.getAttribLocation(program, "a_ts");
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const loc = {
    p: [u("u_p0"), u("u_p1"), u("u_p2"), u("u_p3")],
    band: u("u_band"),
    twists: u("u_twists"),
    roll: u("u_roll"),
    scale: u("u_scale"),
    offset: u("u_offset"),
    res: u("u_res"),
    intensity: u("u_intensity"),
  };

  let cssW = 0;
  let cssH = 0;
  const resize = () => {
    cssW = canvas.clientWidth;
    cssH = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2_400_000 / Math.max(1, cssW * cssH)));
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  const draw = (time: number) => {
    if (!cssW || !cssH || gl.isContextLost()) return false;
    // preserveAspectRatio "slice", matching the SVG layers.
    const scale = Math.max(cssW / layout.width, cssH / layout.height);
    const offX = (cssW - layout.width * scale) / 2;
    const offY = align === "xMidYMax" ? cssH - layout.height * scale : (cssH - layout.height * scale) / 2;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(loc.scale, scale);
    gl.uniform2f(loc.offset, offX, offY);
    gl.uniform2f(loc.res, cssW, cssH);
    // Back to front: secondary ribbons first.
    for (let r = layout.ribbons.length - 1; r >= 0; r--) {
      const spec = layout.ribbons[r];
      const breathe = Math.sin(time * 0.28 + r) * 0.02;
      spec.curve.forEach(([x, y], i) => {
        gl.uniform2f(loc.p[i], x * layout.width, (y + (i === 1 ? breathe : i === 2 ? -breathe : 0)) * layout.height);
      });
      gl.uniform1f(loc.band, spec.band * layout.height);
      gl.uniform1f(loc.twists, spec.twists);
      gl.uniform1f(loc.roll, spec.phase + time * (0.16 + r * 0.05));
      gl.uniform1f(loc.intensity, spec.intensity);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
    return true;
  };

  return {
    draw,
    resize,
    // React Strict Mode sets up effects again on the same canvas. Release our
    // resources without permanently losing the context needed by that setup.
    dispose: () => {
      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteProgram(program);
    },
  };
}
