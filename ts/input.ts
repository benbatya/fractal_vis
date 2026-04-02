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
}
