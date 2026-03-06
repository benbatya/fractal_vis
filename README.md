# fractal_vis

Interactive Mandelbrot set explorer running in the browser. Rust (compiled to WebAssembly) computes every pixel; TypeScript and WebGL2 display the result.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Rust / WASM (src/lib.rs)                   │
│  • Owns the RGBA framebuffer (Vec<u8>)       │
│  • Mandelbrot iteration + smooth colouring  │
│  • Exposes ptr() so JS can read zero-copy   │
└───────────────┬─────────────────────────────┘
                │  shared memory (no copy)
┌───────────────▼─────────────────────────────┐
│  TypeScript (ts/)                            │
│  • Zero-copy Uint8ClampedArray view into     │
│    WASM linear memory                        │
│  • Dirty-flag RAF loop                       │
│  • Zoom / pan input handling                 │
└───────────────┬─────────────────────────────┘
                │  texSubImage2D each frame
┌───────────────▼─────────────────────────────┐
│  WebGL2 (ts/renderer.ts + ts/shaders.ts)    │
│  • Full-screen quad via gl_VertexID          │
│  • Texture lookup in fragment shader         │
└─────────────────────────────────────────────┘
```

### Key design points

- **Zero-copy framebuffer** — `new Uint8ClampedArray(wasm.memory.buffer, fractal.ptr(), W * H * 4)` creates a view directly into WASM heap memory. Rust writes pixels in-place; TypeScript reads the same bytes with no copying.
- **Texture lifecycle** — `texImage2D(..., null)` allocates GPU storage on resize; `texSubImage2D` updates it every frame without reallocating.
- **Smooth colouring** — renormalized iteration count (Inigo Quilez) eliminates integer banding. Colours are mapped through a cosine palette with 120° channel offsets.
- **Cursor-anchored zoom** — the complex coordinate under the cursor is computed before and after the scale change, and the centre is repositioned so that coordinate stays fixed.

## Controls

| Action | Input |
|---|---|
| Zoom in | Scroll wheel up |
| Zoom out | Scroll wheel down |
| Pan | Left-click drag |

## HUD

Two overlays appear in the top-left corner:

- **FPS** — average and minimum frames per second over the last 10 seconds
- **Draw time** — last, average, and maximum render duration (ms) over the last 10 frames

## File structure

```
fractal_vis/
├── src/lib.rs          # Rust compute kernel (Fractal struct, Mandelbrot, palette)
├── ts/
│   ├── main.ts         # App entry: WASM init, RAF loop, resize, HUD
│   ├── renderer.ts     # WebGL2 setup, texture management, draw
│   ├── view.ts         # ViewState, zoom/pan math
│   ├── input.ts        # Mouse wheel + drag event handlers
│   └── shaders.ts      # GLSL vertex + fragment source strings
├── index.html          # Canvas + HUD elements
├── vite.config.ts      # Vite + vite-plugin-wasm + top-level-await
├── Cargo.toml
└── package.json
```

## Prerequisites

- [Rust](https://rustup.rs/) with the `wasm32-unknown-unknown` target
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- Node.js ≥ 18

## Getting started

```bash
# Add the WASM target (one-time)
rustup target add wasm32-unknown-unknown

# Install JS dependencies
npm install

# Build WASM + start dev server
npm run dev
```

Open the URL printed by Vite (default: `http://localhost:5173`).

### Other commands

```bash
npm run build    # production bundle → dist/
npm run preview  # serve the production build locally
npm run wasm     # rebuild only the WASM crate (runs wasm-pack)
```
