import init, { OrbitBuffer } from '../pkg/fractal_vis.js';
import { Renderer } from './renderer.js';
import { ViewState, defaultView } from './view.js';
import { attachInputHandlers } from './input.js';

async function main() {
  // Initialize WASM module and get access to linear memory
  const wasm = await init();

  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  const renderer = new Renderer(canvas);
  const orbitBuf = new OrbitBuffer();

  const dpr = window.devicePixelRatio ?? 1;
  let W = 0;
  let H = 0;

  let view: ViewState = defaultView(1); // placeholder; overwritten on first resize

  let rafId = 0;

  // FPS tracking — rolling window of frame timestamps over the last 10 seconds
  const FPS_WINDOW_MS = 10_000;
  const fpsEl = document.getElementById('fps')!;
  const frameTimes: number[] = [];

  // Draw-time tracking — circular buffer of the last 10 render durations (ms)
  const DRAW_SAMPLES = 10;
  const drawTimeEl = document.getElementById('draw-time')!;
  const drawDurations: number[] = [];
  let lastDrawMs = 0;
  let tSec = 0;
  let paused = false;

  // Orbit cache — skip WASM recomputation when inputs haven't changed
  let cachedCenterRe = '';
  let cachedCenterIm = '';
  let cachedCRe = NaN;
  let cachedCIm = NaN;
  let cachedPrecision = 0;

  const tsecEl = document.getElementById('tsec-display')!;
  const tsecSlider = document.getElementById('tsec-slider') as HTMLInputElement;
  const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    tsecSlider.disabled = !paused;
  });
  tsecSlider.addEventListener('input', () => {
    if (paused) {
      tSec = Math.min(1, Math.max(0, parseFloat(tsecSlider.value)));
    }
  });

  function updateFps(now: number) {
    frameTimes.push(now);
    // Drop frames older than the window
    while (frameTimes.length > 1 && now - frameTimes[0] > FPS_WINDOW_MS) {
      frameTimes.shift();
    }
    if (frameTimes.length < 2) return;

    const windowMs = now - frameTimes[0];
    const avg = ((frameTimes.length - 1) / windowMs) * 1000;

    // Min FPS = largest gap between consecutive frames
    let maxGap = 0;
    for (let i = 1; i < frameTimes.length; i++) {
      const gap = frameTimes[i] - frameTimes[i - 1];
      if (gap > maxGap) maxGap = gap;
    }
    const min = 1000 / maxGap;

    fpsEl.textContent = `avg ${avg.toFixed(1)} fps  min ${min.toFixed(1)} fps`;
  }

  function scheduleFrame() {
    if (rafId === 0) {
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  function renderFrame(now: number) {
    rafId = requestAnimationFrame(renderFrame);
    updateFps(now);

    if (!paused) {
      tSec += 1 / 600;
      if (tSec > 1) tSec = 0;
      tsecSlider.value = String(tSec);
    }
    tsecEl.textContent = `t ${tSec.toFixed(4)}`;
    const omega = (2 * Math.PI);
    const cRe = 0.7511 * Math.cos(omega * tSec);
    const cIm = 0.7511 * Math.sin(omega * tSec);

    const precision = Math.max(64, Math.ceil(-Math.log2(view.scale)) + 32);

    // Only recompute the orbit when inputs have actually changed
    if (
      view.centerRe !== cachedCenterRe ||
      view.centerIm !== cachedCenterIm ||
      cRe !== cachedCRe ||
      cIm !== cachedCIm ||
      precision !== cachedPrecision
    ) {
      orbitBuf.compute(
        view.centerRe,
        view.centerIm,
        cRe,
        cIm,
        precision,
      );
      cachedCenterRe = view.centerRe;
      cachedCenterIm = view.centerIm;
      cachedCRe = cRe;
      cachedCIm = cIm;
      cachedPrecision = precision;
    }

    const orbit = new Float32Array(
      wasm.memory.buffer,
      orbitBuf.ptr(),
      256 * 2,
    );
    const len = orbitBuf.len();
    const t0 = performance.now();
    renderer.render(view.scale, W, H, cRe, cIm, orbit, len);
    lastDrawMs = performance.now() - t0;

    if (drawDurations.length >= DRAW_SAMPLES) drawDurations.shift();
    drawDurations.push(lastDrawMs);

    let sum = 0, max = 0;
    for (const d of drawDurations) {
      sum += d;
      if (d > max) max = d;
    }
    const avg = sum / drawDurations.length;
    drawTimeEl.textContent = `last ${lastDrawMs.toFixed(1)} ms  avg ${avg.toFixed(1)} ms  max ${max.toFixed(1)} ms`;
  }

  function onResize() {
    W = Math.round(window.innerWidth * dpr);
    H = Math.round(window.innerHeight * dpr);
    canvas.width = W;
    canvas.height = H;

    view = defaultView(W);

    renderer.resize(W, H);
    scheduleFrame();
  }

  window.addEventListener('resize', onResize);
  onResize(); // trigger initial sizing

  attachInputHandlers(
    canvas,
    () => view,
    (v) => { view = v; },
    scheduleFrame,
  );
}

main().catch(console.error);
