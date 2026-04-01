export interface ViewState {
  centerRe: number;
  centerIm: number;
  scale: number; // complex-plane units per pixel
}

export function defaultView(canvasWidth: number): ViewState {
  return {
    centerRe: 0.0,
    centerIm: 0.0,
    scale: 4.0 / canvasWidth,
  };
}

/**
 * Zoom centered on cursor position.
 * The complex coordinate under the cursor is held fixed before and after zoom.
 * factor < 1 zooms in, factor > 1 zooms out.
 */
export function zoom(
  v: ViewState,
  cursorX: number,
  cursorY: number,
  canvasW: number,
  canvasH: number,
  factor: number,
): ViewState {
  const newScale = v.scale * factor;
  const dx = cursorX - canvasW / 2;
  const dy = cursorY - canvasH / 2;
  const cursorRe = v.centerRe + dx * v.scale;
  const cursorIm = v.centerIm - dy * v.scale;
  return {
    centerRe: cursorRe - dx * newScale,
    centerIm: cursorIm + dy * newScale,
    scale: newScale,
  };
}

/**
 * Pan by delta pixels.
 */
export function pan(v: ViewState, deltaX: number, deltaY: number): ViewState {
  return {
    centerRe: v.centerRe - deltaX * v.scale,
    centerIm: v.centerIm + deltaY * v.scale,
    scale: v.scale,
  };
}
