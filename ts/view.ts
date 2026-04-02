export interface ViewState {
  centerRe: string;
  centerIm: string;
  scale: number; // complex-plane units per pixel
}

export function defaultView(canvasWidth: number): ViewState {
  return {
    centerRe: "0",
    centerIm: "0",
    scale: 4.0 / canvasWidth,
  };
}
