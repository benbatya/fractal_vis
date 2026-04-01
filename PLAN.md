# Plan: Rust + WASM Arbitrary-Precision Orbit Calculation with `astro-float`

## Context

The fractal visualizer uses perturbation theory: a single **reference orbit** is computed on the CPU, then the GPU applies per-pixel delta perturbations. Currently the reference orbit is computed in TypeScript (`ts/orbit.ts`) using JS `f64` — this limits deep-zoom precision to ~15 decimal digits. Beyond that, the reference orbit accumulates rounding error and the image breaks down.

By moving the orbit computation to Rust/WASM with arbitrary-precision floats (`astro-float::BigFloat`), the reference orbit can maintain accuracy at any zoom depth. The GPU shader (which uses `float32` perturbation deltas) remains unchanged — only the CPU-side reference orbit gains precision.

**Why `astro-float`?** Pure Rust, no C dependencies, compiles cleanly to `wasm32-unknown-unknown`. Provides `BigFloat` with configurable bit-precision and all needed arithmetic. Chosen over `rug` (GMP wrapper, won't cross-compile to WASM) and `dashu`.

## Files to Modify

| File | Action |
|------|--------|
| `Cargo.toml` | Add `astro-float` dependency |
| `src/lib.rs` | Replace old `Fractal` struct with `OrbitBuffer` using `BigFloat` |
| `ts/main.ts` | Switch from `computeOrbit()` to WASM `OrbitBuffer.compute()` |
| `ts/orbit.ts` | Keep as fallback/reference (no changes) |
| `ts/renderer.ts` | No changes needed |
| `ts/shaders.ts` | No changes needed |
| `ts/view.ts` | No changes needed (deep-zoom coordinate storage is a follow-up) |

## Step 1: Update `Cargo.toml`

Add `astro-float` with std feature (wasm-pack supports std):

```toml
[dependencies]
wasm-bindgen = "0.2"
astro-float = "0.9"
```

## Step 2: Rewrite `src/lib.rs`

Replace the unused `Fractal` CPU renderer with an `OrbitBuffer` struct that:
- Holds a pre-allocated `Vec<f32>` (512 floats = 256 iterations × 2 components)
- Exposes `ptr()` for zero-copy JS access to WASM linear memory
- Exposes `compute(center_re, center_im, c_re, c_im, precision)` taking string coordinates

```rust
use wasm_bindgen::prelude::*;
use astro_float::{BigFloat, Consts, RoundingMode};

const MAX_ITER: usize = 256;
const RM: RoundingMode = RoundingMode::None; // defer rounding for perf

#[wasm_bindgen]
pub struct OrbitBuffer {
    data: Vec<f32>,
    len: usize,
}

#[wasm_bindgen]
impl OrbitBuffer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> OrbitBuffer {
        OrbitBuffer {
            data: vec![0.0f32; MAX_ITER * 2],
            len: 0,
        }
    }

    pub fn ptr(&self) -> *const f32 {
        self.data.as_ptr()
    }

    pub fn len(&self) -> usize {
        self.len
    }

    /// Compute reference orbit with arbitrary precision.
    /// Coordinates are decimal strings. Precision is in bits (e.g. 128, 256).
    pub fn compute(
        &mut self,
        center_re: &str,
        center_im: &str,
        c_re: &str,
        c_im: &str,
        precision: usize,
    ) {
        let mut cc = Consts::new().unwrap();
        let p = precision;

        let mut z_re: BigFloat = center_re.parse().unwrap_or(BigFloat::from_f64(0.0, p));
        let mut z_im: BigFloat = center_im.parse().unwrap_or(BigFloat::from_f64(0.0, p));
        let c_re: BigFloat = c_re.parse().unwrap_or(BigFloat::from_f64(0.0, p));
        let c_im: BigFloat = c_im.parse().unwrap_or(BigFloat::from_f64(0.0, p));
        let four = BigFloat::from_f64(4.0, p);
        let two = BigFloat::from_f64(2.0, p);

        self.len = MAX_ITER;

        for i in 0..MAX_ITER {
            // Store orbit point as f32 for GPU texture upload
            // BigFloat → f64 → f32
            let re_f64 = f64::try_from(z_re.clone()).unwrap_or(0.0);
            let im_f64 = f64::try_from(z_im.clone()).unwrap_or(0.0);
            self.data[i * 2]     = re_f64 as f32;
            self.data[i * 2 + 1] = im_f64 as f32;

            // Escape check: |z|² > 4
            let re_sq = z_re.mul(&z_re, p, RM);
            let im_sq = z_im.mul(&z_im, p, RM);
            let mag_sq = re_sq.add(&im_sq, p, RM);

            if mag_sq.cmp(&four) == Some(std::cmp::Ordering::Greater) {
                self.len = i + 1;
                break;
            }

            // z = z² + c
            let new_re = re_sq.sub(&im_sq, p, RM).add(&c_re, p, RM);
            let new_im = two.mul(&z_re, p, RM).mul(&z_im, p, RM).add(&c_im, p, RM);
            z_re = new_re;
            z_im = new_im;
        }
    }
}
```

**Key design decisions:**
- `OrbitBuffer` is allocated once in JS, reused every frame — no per-frame heap churn
- `ptr()` returns pointer to the `Vec<f32>` in WASM linear memory — JS wraps it as `Float32Array` with zero copy
- `RoundingMode::None` during iteration for performance; precision bits provide the accuracy
- `BigFloat → f64` via `TryFrom` (need to verify exact API; may need `.to_f64()` or string round-trip)
- String inputs because JS `number` can't represent arbitrary-precision values

**Note:** The exact `BigFloat → f64` conversion API needs verification during implementation. If `TryFrom<BigFloat> for f64` isn't available, alternatives are: `.to_f64()` method, or formatting to string and parsing.

## Step 3: Update `ts/main.ts`

Replace the TypeScript orbit call with WASM:

```typescript
// Remove: import { computeOrbit } from './orbit.js';
// Add:
import { OrbitBuffer } from '../pkg/fractal_vis.js';

// In main(), after init():
const orbitBuf = new OrbitBuffer();

// In renderFrame(), replace line 91:
// Old: const { orbit, len } = computeOrbit(view.centerRe, view.centerIm, cRe, cIm);
// New:
const precision = Math.max(64, Math.ceil(-Math.log2(view.scale)) + 32);
orbitBuf.compute(
  view.centerRe.toString(),
  view.centerIm.toString(),
  cRe.toString(),
  cIm.toString(),
  precision,
);
const orbit = new Float32Array(
  (wasm as any).memory.buffer,  // WASM linear memory
  orbitBuf.ptr(),
  256 * 2,
);
const len = orbitBuf.len();
```

**Precision scaling:** `precision = max(64, ceil(log2(1/scale)) + 32)` — at normal zoom (~4 units visible) this is 64 bits (more than f64). At deep zoom (scale = 1e-30), this is ~132 bits. The +32 provides guard bits against accumulated rounding.

**WASM memory access:** The `Float32Array` view must be created *after* `compute()` since WASM memory could grow during computation (though unlikely with pre-allocated buffer). The `init()` function from wasm-pack returns the WASM instance which has `.memory`.

## Step 4: Build & Verify

1. Run `npm run wasm` — confirm `astro-float` compiles to WASM without errors
2. Run `npm run dev` — confirm the app loads and renders
3. Visual check: at default zoom, rendering should be identical to before
4. Check FPS/draw-time HUD — orbit computation will be slower than f64 but should stay under ~5ms at 64-bit precision
5. Deep zoom test: zoom in past 1e-15 scale and verify the image doesn't degrade (the key benefit)

## Follow-up Tasks (out of scope for this PR)

These are needed for full deep-zoom support but are separate work:

1. **String-based view coordinates** — `ViewState.centerRe/Im` must become string (or BigDecimal) to preserve precision when panning at deep zoom. Currently JS `number` loses precision past ~15 digits.
2. **Adaptive MAX_ITER** — at deep zoom, 256 iterations is often insufficient. Should scale with zoom depth.
3. **Series approximation** — for extreme zoom depths (>1e-100), computing 256 iterations of arbitrary-precision math per frame becomes expensive. Series approximation can skip many early iterations.
4. **Web Worker** — if orbit computation exceeds ~8ms, move it off the main thread to avoid frame drops.
