/**
 * The animated hero background: a single fluid ribbon drawn in WebGL.
 *
 * The shape is one long rising diagonal with two inflections — the middle
 * stroke of the Yooz Z, relaxed into something continuous — layered two or
 * three deep so it reads as translucent material rather than a flat sweep.
 * Rich Blue carries the form; Pink travels through it as energy rather than
 * sitting on it as a mass.
 *
 * Every colour is read at runtime from the Yooz design tokens in `yooz.css`,
 * so the palette has exactly one source of truth and cannot drift.
 *
 * The canvas is decorative: `aria-hidden`, `pointer-events: none`, and it
 * never affects layout. It stops drawing when the tab is hidden, when it
 * scrolls out of view, and entirely under `prefers-reduced-motion`, where it
 * paints one static frame with the same composition. If WebGL is missing or
 * the context is lost, a static image takes its place.
 */

import { useEffect, useRef, useState } from 'preact/hooks';

/* The plane is a subdivided grid so the vertex stage can warp the ribbon's
   whole surface continuously — a slow, low-frequency deformation that no
   amount of fragment noise imitates convincingly. */
const GRID = 48;

const VERT = `
attribute vec2 aPos;

uniform float uTime;

varying vec2 vUv;

void main() {
  vec2 uv = aPos * 0.5 + 0.5;

  // Gentle continuous deformation of the ribbon's plane.
  uv.y += sin(uv.x * 2.3 + uTime * 0.070) * 0.013
        + sin(uv.y * 3.1 - uTime * 0.052) * 0.008;
  uv.x += sin(uv.y * 2.7 + uTime * 0.045) * 0.011;

  vUv = uv;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uLayers;   // 3 desktop, 2 tablet, 1 mobile / low power
uniform float uMobile;
uniform vec3  uRichBlue;
uniform vec3  uPink;
uniform vec3  uBlue;
uniform vec3  uTeal;
uniform vec3  uWhite;
uniform vec3  uBgA;
uniform vec3  uBgB;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// Centreline: rises to the right, with two inflections so it never reads as
// a plain wave.
float pathY(float x, float phase, float t) {
  float base = mix(0.32, 0.92, smoothstep(-0.10, 1.05, x));
  base += 0.095 * sin(x * 2.5  + t * 0.085 + phase);
  base += 0.040 * sin(x * 5.7  - t * 0.115 + phase * 1.7);
  base += 0.015 * sin(x * 10.5 + t * 0.061 + phase * 2.3);
  return base;
}

// Widest where it leaves to the upper right, tapering into the lower left.
float halfWidth(float x, float k) {
  return (0.070 + 0.105 * smoothstep(0.0, 1.0, x)) * k;
}

vec4 ribbon(vec2 uv, float phase, float widthK, float t, float seed) {
  float hw = halfWidth(uv.x, widthK);
  float across = (uv.y - pathY(uv.x, phase, t)) / hw;
  float aa = abs(across);
  if (aa > 1.30) return vec4(0.0);

  float n  = fbm(vec2(uv.x * 3.0 + seed, uv.y * 2.4 - t * 0.030));
  float n2 = fbm(vec2(uv.x * 7.0 - t * 0.050, across * 2.0 + seed * 2.0));

  // Soft, slightly irregular edge: translucent material, not a cut-out.
  float edge = 1.0 - smoothstep(0.62 + 0.18 * n, 1.06, aa);

  // Rich Blue carries the form — deepest at the core.
  vec3 col = mix(uRichBlue * 0.72, uRichBlue * 1.06, 1.0 - aa * 0.62);

  // Light-blue reflections, in bands rather than as a wash.
  col = mix(col, uBlue, 0.22 * smoothstep(0.42, 0.95, n));

  // Pink energy travelling along the ribbon: a streak crossing it, never a
  // mass sitting on it.
  float energy = smoothstep(0.28, 0.98, sin(uv.x * 3.4 - t * 0.18 + across * 1.2 + n * 2.2));
  col = mix(col, uPink, 0.62 * energy * (0.42 + 0.58 * (1.0 - aa)));

  // Directional lines following the curve. Frequency and brightness are
  // noise-modulated so they never fall into a visible repeat.
  float stripe = sin(across * (9.0 + 3.5 * n) + n2 * 2.2 + uv.x * 1.6);
  float line = smoothstep(0.90, 1.0, abs(stripe));
  line *= (0.35 + 0.65 * (0.5 + 0.5 * sin(uv.x * 5.5 - t * 0.55 + across * 2.0)));
  line *= 1.0 - smoothstep(0.70, 1.06, aa);
  col = mix(col, uWhite, 0.42 * line);
  col = mix(col, uPink, 0.30 * line * smoothstep(0.55, 1.0, n2));

  // Occasional white glints, and a trace of the secondary accent.
  col = mix(col, uWhite, 0.14 * smoothstep(0.80, 1.0, n2));
  col = mix(col, uTeal, 0.05 * smoothstep(0.88, 1.0, fbm(vec2(uv.x * 5.0 - seed, uv.y * 5.0 + t * 0.02))));

  return vec4(col, edge * (0.90 + 0.10 * n));
}

void main() {
  vec2 uv = vUv;
  float t = uTime;

  vec3 col = mix(uBgA, uBgB, smoothstep(0.0, 1.0, uv.y));

  // Mobile is framed on its own terms, not scaled down: the ribbon sits
  // higher and flatter so it stays clear of the copy.
  if (uMobile > 0.5) uv.y = (uv.y - 0.74) * 1.15 + 0.62;

  vec4 l1 = ribbon(uv, 0.0, 1.00, t, 0.0);
  col = mix(col, l1.rgb, l1.a);

  if (uLayers > 1.5) {
    vec4 l2 = ribbon(uv + vec2(0.0, 0.055), 1.35, 0.68, t, 3.1);
    col = mix(col, l2.rgb, l2.a * 0.72);
  }

  if (uLayers > 2.5) {
    vec4 l3 = ribbon(uv - vec2(0.0, 0.072), 2.60, 0.42, t, 6.7);
    col = mix(col, l3.rgb, l3.a * 0.55);
  }

  // Keeps the wide gradients from banding on 8-bit displays.
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.006;

  gl_FragColor = vec4(col, 1.0);
}
`;

/** #RRGGBB (or #RGB) from a token, as linear 0..1 components. */
function hexToRgb(hex: string, fallback: [number, number, number]): [number, number, number] {
  const m = hex.trim().replace(/^#/, '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (!/^[0-9a-f]{6}$/i.test(full)) return fallback;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

function token(name: string, fallback: [number, number, number]): [number, number, number] {
  if (typeof window === 'undefined') return fallback;
  return hexToRgb(getComputedStyle(document.documentElement).getPropertyValue(name), fallback);
}

function buildGrid(n: number): Float32Array {
  const verts: number[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const x0 = (x / n) * 2 - 1, x1 = ((x + 1) / n) * 2 - 1;
      const y0 = (y / n) * 2 - 1, y1 = ((y + 1) / n) * 2 - 1;
      verts.push(x0, y0, x1, y0, x1, y1, x0, y0, x1, y1, x0, y1);
    }
  }
  return new Float32Array(verts);
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function RibbonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: false,
    } as WebGLContextAttributes) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) {
      setFailed(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = vs && fs ? gl.createProgram() : null;
    if (!vs || !fs || !prog) {
      setFailed(true);
      return;
    }

    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);

    const grid = buildGrid(GRID);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uTime = u('uTime');
    const uLayers = u('uLayers');
    const uMobile = u('uMobile');

    gl.uniform3fv(u('uRichBlue'), token('--yz-rich-blue', [0.078, 0.208, 0.306]));
    gl.uniform3fv(u('uPink'), token('--yz-pink', [0.878, 0.094, 0.369]));
    gl.uniform3fv(u('uBlue'), token('--yz-blue', [0.0, 0.416, 1.0]));
    gl.uniform3fv(u('uTeal'), token('--yz-teal', [0.0, 0.749, 0.647]));
    gl.uniform3fv(u('uWhite'), token('--yz-grey-10', [0.996, 0.996, 0.996]));
    gl.uniform3fv(u('uBgA'), token('--yz-grey-20', [0.961, 0.961, 0.961]));
    gl.uniform3fv(u('uBgB'), token('--yz-grey-10', [0.996, 0.996, 0.996]));

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fewer layers where there is less to spend: narrow viewports, and
    // machines that report few cores.
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4;

    let raf = 0;
    let clock = 0;
    let prev = 0;
    let visible = true;
    let onScreen = true;

    const resize = () => {
      // Capped device pixel ratio: past 1.5 this effect costs a lot and
      // gains nothing the eye can find.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      const cssW = canvas.clientWidth;
      const mobile = cssW <= 700;
      const layers = lowPower || mobile ? 1 : cssW <= 1024 ? 2 : 3;
      gl.uniform1f(uLayers, layers);
      gl.uniform1f(uMobile, mobile ? 1 : 0);
    };

    const draw = () => {
      gl.uniform1f(uTime, clock);
      gl.drawArrays(gl.TRIANGLES, 0, grid.length / 2);
    };

    resize();

    if (reduced) {
      // One frame, at a point in the cycle where the ribbon reads well. Same
      // composition, no loop, no repaint.
      clock = 12;
      draw();
    } else {
      const minFrame = lowPower ? 1000 / 30 : 0;
      let lastFrame = 0;

      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!visible || !onScreen) {
          prev = now;
          return;
        }
        if (now - lastFrame < minFrame) return;
        lastFrame = now;

        // Advance from the delta rather than from absolute time, so pausing
        // freezes the material instead of letting it jump on resume.
        if (prev) clock += Math.min((now - prev) / 1000, 0.1);
        prev = now;
        draw();
      };
      raf = requestAnimationFrame(loop);
    }

    const onVisibility = () => {
      visible = !document.hidden;
      prev = 0;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) onScreen = e.isIntersecting;
        prev = 0;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(canvas);

    const onLost = (ev: Event) => {
      ev.preventDefault();
      cancelAnimationFrame(raf);
      setFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      io.disconnect();
      ro.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <div class="hp-bg" aria-hidden="true">
      {/* Painted immediately, under the canvas: no flash before WebGL is
          ready, and the whole background if it never is. */}
      <div class="hp-bg__static" />
      {/* Only fetched when there is no WebGL to fetch it for: a real frame of
          the ribbon beats the gradient approximation underneath. */}
      {failed && (
        <img
          class="hp-bg__fallback"
          src="/home/ribbon-fallback.webp"
          alt=""
          width="1600"
          height="1000"
          decoding="async"
        />
      )}
      {!failed && <canvas ref={canvasRef} class="hp-bg__canvas" />}
      <div class="hp-bg__dots" />
      <div class="hp-bg__veil" />
    </div>
  );
}
