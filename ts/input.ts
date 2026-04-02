import { ViewState } from './view.js';
import { pan_view, zoom_view } from '../pkg/fractal_vis.js';

export function attachInputHandlers(
  canvas: HTMLCanvasElement,
  getView: () => ViewState,
  setView: (v: ViewState) => void,
  requestFrame: () => void,
): void {
  const dpr = window.devicePixelRatio ?? 1;

  // Zoom on scroll wheel, centered on cursor
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const v = getView();
    const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
    const result = zoom_view(
      v.centerRe, v.centerIm, v.scale,
      e.offsetX * dpr, e.offsetY * dpr,
      canvas.width, canvas.height,
      factor,
    );
    setView({ centerRe: result.re, centerIm: result.im, scale: result.scale });
    result.free();
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
    const v = getView();
    const result = pan_view(
      v.centerRe, v.centerIm, v.scale,
      (e.clientX - lastX) * dpr,
      (e.clientY - lastY) * dpr,
    );
    setView({ centerRe: result.re, centerIm: result.im, scale: result.scale });
    result.free();
    lastX = e.clientX;
    lastY = e.clientY;
    requestFrame();
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) dragging = false;
  });
}
