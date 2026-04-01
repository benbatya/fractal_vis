import init from '../pkg/fractal_vis.js';
import { Renderer } from './renderer.js';
import { ViewState, defaultView } from './view.js';
import { attachInputHandlers } from './input.js';

async function main() {
  // Initialize WASM module (required for wasm-bindgen init, even though GPU renders directly)
  await init();

  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  const renderer = new Renderer(canvas);

  const dpr = window.devicePixelRatio ?? 1;
  let W = 0;
  let H = 0;

  let view: ViewState = defaultView(1); // placeholder; overwritten on first resize

  let rafId = 0;

  // FPS tracking — rolling window of frame timestamps over the last 10 seconds
  const FPS_WINDOW_MS = 10_000;
  const fpsEl = document.getElementById('fps')!;
  const frameTimes: number[] = [];

  // Draw-time tracking — circular buffer of the last 100 render durations (ms)
  const DRAW_SAMPLES = 10;
  const drawTimeEl = document.getElementById('draw-time')!;
  const drawDurations: number[] = [];
  let lastDrawMs = 0;
  let tSec = -1;
  let paused = false;

  const tsecEl = document.getElementById('tsec-display')!;
  const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
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
      tSec += 1 / 500;
      if (tSec > 1) tSec = -1;
    }
    tsecEl.textContent = `t ${tSec.toFixed(4)}`;
    const omega = (2 * Math.PI);
    const cRe = 0.7511 * Math.cos(omega * tSec);
    const cIm = 0.7511 * Math.sin(omega * tSec);

    const t0 = performance.now();
    // GPU renders directly — Julia set computed in WebGL2 fragment shader
    renderer.render(view.centerRe, view.centerIm, view.scale, W, H, cRe, cIm);
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
