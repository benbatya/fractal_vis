# Design: Orbit Calculation & Deep Zoom

This document describes how the Julia set visualizer computes fractal orbits and
how perturbation theory enables deep zoom without losing precision.

## Architecture Overview

The renderer is split across three computational tiers:

| Layer | Technology | Precision | Role |
|---|---|---|---|
| View state & reference orbit | Rust / WASM | Arbitrary (`DBig`) | One orbit shared by all pixels |
| Per-pixel iteration | WebGL2 fragment shader | `float` (f32) | Massively parallel perturbation |
| Coordination & input | TypeScript | `f64` | Event loop, caching, uniforms |

## Reference Orbit (CPU, arbitrary precision)

A single **reference orbit** is computed from the view center through the
standard Julia iteration `z -> z^2 + c`. Because the center coordinates are
stored as `DBig` (arbitrary-precision floats from `dashu-float`), the orbit
can be evaluated to hundreds of decimal digits — whatever the zoom depth
demands.

The precision is chosen dynamically based on the current scale factor
([lib.rs:10-13](src/lib.rs#L10-L13)):

```rust
fn precision_digits(scale: f64) -> usize {
    let bits = ((-scale.log2()).ceil() as usize).saturating_add(32).max(64);
    bits_to_digits(bits).max(20)
}
```

At normal zoom (`scale ~ 4`), 64 bits (~20 digits) suffice. At `scale = 1e-100`,
precision scales to ~332 bits (~100 digits). The extra 32 guard bits prevent
accumulated rounding error from corrupting the orbit.

The orbit loop ([lib.rs:133-152](src/lib.rs#L133-L152)) iterates up to 256
times, storing each `(re, im)` pair downsampled to `f32` in a flat buffer. It
terminates early if `|z|^2 > 4` (escape). The resulting buffer is shared
directly with the GPU via WASM linear memory — no copy required.

## Perturbation Theory (GPU, f32)

Computing every pixel's orbit independently at arbitrary precision would be
prohibitively expensive. Perturbation theory avoids this by observing that
nearby pixels follow nearly identical trajectories.

For pixel `p` near the view center, define:

```
z_i = Z_i + delta_i
```

where `Z_i` is the reference orbit point (from CPU) and `delta_i` is the
per-pixel deviation. Substituting into `z -> z^2 + c` and simplifying:

```
delta_{i+1} = 2 * Z_i * delta_i + delta_i^2
```

The key insight: `delta_i` stays tiny because all visible pixels are close to
the reference point. Even at deep zoom where the absolute coordinates require
100+ digits, the *delta* fits comfortably in f32.

The fragment shader ([shaders.ts:54-83](ts/shaders.ts#L54-L83)) implements this
in two phases:

**Phase 1 — Perturbation** (`i < orbit_len`): The shader reads `Z_i` from the
orbit texture and updates `delta` using the perturbation formula.

**Phase 2 — Absolute** (`i >= orbit_len`): If the reference orbit escapes before
MAX_ITER, the shader switches to direct Mandelbrot iteration on the pixel's
full `z` value (stored in `delta` at that point).

The transition is seamless — the last perturbation step produces `z_cur = Z_i +
delta_i`, which becomes the initial value for direct iteration.

## Data Flow

```
User input (wheel/drag)
    |
    v
WasmViewState.zoom() / pan()        -- arbitrary-precision center update
    |                                   (lib.rs:81-117)
    v
generation counter incremented
    |
    v
renderFrame() detects cache miss     -- compares generation, c, precision
    |                                   (main.ts:104-115)
    v
compute_orbit(c_re, c_im, prec)     -- arbitrary-precision orbit loop
    |                                   (lib.rs:121-153)
    v
Float32Array view of WASM memory     -- zero-copy orbit access
    |                                   (main.ts:117-122)
    v
renderer.render()                    -- uploads orbit as RG32F texture,
    |                                   sets uniforms, draws full-screen quad
    v                                   (renderer.ts:45-57)
Fragment shader                      -- perturbation iteration per pixel
                                        (shaders.ts:54-83)
```

## What Enables Deep Zoom

1. **Arbitrary-precision center coordinates.** Pan and zoom update `center_re`
   and `center_im` as `DBig` values, so the view center never loses digits no
   matter how far you zoom ([lib.rs:30-31](src/lib.rs#L30-L31)).

2. **Arbitrary-precision reference orbit.** The single orbit from the center is
   computed with enough precision to match the zoom depth, scaling automatically.

3. **Perturbation theory.** Per-pixel work uses only f32 deltas relative to the
   reference orbit. The absolute value of these deltas is proportional to `scale
   * pixel_offset`, which is always small — typically well within f32 range.

4. **Amortized cost.** Only one expensive arbitrary-precision orbit is computed
   per frame. All pixels share it, so the GPU does the heavy lifting with cheap
   f32 math.

5. **Cursor-anchored zoom.** The zoom function ([lib.rs:91-117](src/lib.rs#L91-L117))
   computes the complex coordinate under the cursor before and after the scale
   change, then adjusts the center so that coordinate stays fixed. All arithmetic
   is done in `DBig`, preserving sub-pixel accuracy at any depth.

## Orbit Caching

The orbit is only recomputed when one of these inputs changes
([main.ts:104-115](ts/main.ts#L104-L115)):

- `generation` — incremented on pan/zoom
- `c` parameter — the Julia constant, animated as `0.7511 * e^(i * 2pi * t)`
- `precision` — derived from zoom depth

During frames where none of these change (e.g. while paused), the cached orbit
is reused and only the GPU draw call runs.

## Smooth Coloring

The shader avoids discrete iteration banding using a continuous escape-time
formula ([shaders.ts:90-97](ts/shaders.ts#L90-L97)):

```glsl
float log2_zn = log(dot(z_escape, z_escape)) * 0.5;
float nu = log(log2_zn / log(2.0)) / log(2.0);
float t = (iter + 1.0 - nu) / float(MAX_ITER);
```

This produces a smooth `t in [0, 1]` which is mapped to color via a cosine
palette with 120-degree channel offsets.

## Current Limitations

- **No series approximation.** At extreme zoom depths (>1e-100), the 256
  arbitrary-precision iterations per frame become the bottleneck. Series
  approximation could skip early iterations where all pixels follow the
  reference closely, but is not yet implemented.

- **No glitch detection.** If a pixel's delta grows large enough to lose f32
  accuracy, the result can be visually wrong (a "glitch"). Rebasing the
  perturbation onto a secondary reference orbit would fix this.

- **f32 orbit texture.** The reference orbit is stored as f32 in the GPU
  texture. At very deep zoom, the reference orbit points themselves may lose
  precision when downsampled. Double-precision emulation or split
  high/low textures could address this.
