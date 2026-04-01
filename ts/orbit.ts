export const MAX_ITER = 256;

/**
 * Compute the reference orbit for a Julia set starting at z0 = (centerRe, centerIm)
 * with parameter c = (cRe, cIm), using JS float64 throughout.
 *
 * Returns:
 *   orbit — Float32Array of length MAX_ITER * 2: [Z0.re, Z0.im, Z1.re, Z1.im, ...]
 *   len   — number of valid orbit entries. Less than MAX_ITER when the reference
 *           orbit escapes early; the shader must fall back to absolute iteration
 *           for steps >= len.
 */
export function computeOrbit(
  centerRe: number, centerIm: number,
  cRe: number, cIm: number,
): { orbit: Float32Array; len: number } {
  const orbit = new Float32Array(MAX_ITER * 2);
  let zRe = centerRe, zIm = centerIm;
  let len = MAX_ITER;
  for (let i = 0; i < MAX_ITER; i++) {
    orbit[i * 2]     = zRe;
    orbit[i * 2 + 1] = zIm;
    if (zRe * zRe + zIm * zIm > 4.0) { len = i + 1; break; }
    const newRe = zRe * zRe - zIm * zIm + cRe;
    const newIm = 2.0 * zRe * zIm + cIm;
    zRe = newRe; zIm = newIm;
  }
  return { orbit, len };
}
