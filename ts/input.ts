import { ViewState, zoom, pan } from './view.js';

export function attachInputHandlers(
  canvas: HTMLCanvasElement,
  getView: () => ViewState,
  setView: (v: ViewState) => void,
  requestFrame: () => void,
): void {
  // Zoom on scroll wheel, centered on cursor
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
    setView(zoom(getView(), e.offsetX, e.offsetY, canvas.width, canvas.height, factor));
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
    setView(pan(getView(), e.clientX - lastX, e.clientY - lastY));
    lastX = e.clientX;
    lastY = e.clientY;
    requestFrame();
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) dragging = false;
  });
}
