import { WasmViewState } from '../pkg/fractal_vis.js';

export function attachInputHandlers(
  canvas: HTMLCanvasElement,
  viewState: WasmViewState,
  requestFrame: () => void,
): void {
  const dpr = window.devicePixelRatio ?? 1;

  // Zoom on scroll wheel, centered on cursor
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
    viewState.zoom(
      e.offsetX * dpr, e.offsetY * dpr,
      canvas.width, canvas.height,
      factor,
    );
    requestFrame();
  }, { passive: false });

  // Pan on left-mouse drag
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  // Attach move/up to window so dragging outside the canvas doesn't get stuck
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    viewState.pan(
      (e.clientX - lastX) * dpr,
      (e.clientY - lastY) * dpr,
    );
    lastX = e.clientX;
    lastY = e.clientY;
    requestFrame();
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) dragging = false;
  });

  // Touch: pinch-to-zoom and two-finger pan
  let lastTouches: { x: number; y: number }[] = [];

  function touchCenter(touches: TouchList): { x: number; y: number } {
    let x = 0, y = 0;
    for (let i = 0; i < touches.length; i++) {
      x += touches[i].clientX;
      y += touches[i].clientY;
    }
    return { x: x / touches.length, y: y / touches.length };
  }

  function touchDist(touches: TouchList): number {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.hypot(dx, dy);
  }

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    lastTouches = [];
    for (let i = 0; i < e.touches.length; i++) {
      lastTouches.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length >= 2 && lastTouches.length >= 2) {
      // Two-finger pan
      const prevCenter = {
        x: lastTouches.reduce((s, t) => s + t.x, 0) / lastTouches.length,
        y: lastTouches.reduce((s, t) => s + t.y, 0) / lastTouches.length,
      };
      const curCenter = touchCenter(e.touches);
      viewState.pan(
        (curCenter.x - prevCenter.x) * dpr,
        (curCenter.y - prevCenter.y) * dpr,
      );

      // Pinch-to-zoom
      const prevDist = Math.hypot(
        lastTouches[1].x - lastTouches[0].x,
        lastTouches[1].y - lastTouches[0].y,
      );
      const curDist = touchDist(e.touches);
      if (prevDist > 0) {
        const rect = canvas.getBoundingClientRect();
        const cx = (curCenter.x - rect.left) * dpr;
        const cy = (curCenter.y - rect.top) * dpr;
        viewState.zoom(cx, cy, canvas.width, canvas.height, prevDist / curDist);
      }

      requestFrame();
    } else if (e.touches.length === 1 && lastTouches.length >= 1) {
      // Single-finger pan
      viewState.pan(
        (e.touches[0].clientX - lastTouches[0].x) * dpr,
        (e.touches[0].clientY - lastTouches[0].y) * dpr,
      );
      requestFrame();
    }

    lastTouches = [];
    for (let i = 0; i < e.touches.length; i++) {
      lastTouches.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    lastTouches = [];
    for (let i = 0; i < e.touches.length; i++) {
      lastTouches.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
    }
  }, { passive: false });
}
