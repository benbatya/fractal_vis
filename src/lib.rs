use wasm_bindgen::prelude::*;
use dashu_float::DBig;

const MAX_ITER: usize = 256;

fn bits_to_digits(bits: usize) -> usize {
    ((bits as f64) * 0.30103).ceil() as usize
}

fn precision_digits(scale: f64) -> usize {
    let bits = ((-scale.log2()).ceil() as usize).saturating_add(32).max(64);
    bits_to_digits(bits).max(20)
}

fn parse_big(s: &str, p: usize) -> DBig {
    s.parse::<DBig>()
        .unwrap_or(DBig::ZERO)
        .with_precision(p)
        .value()
}

fn f64_to_big(v: f64, p: usize) -> DBig {
    if !v.is_finite() {
        return DBig::ZERO;
    }
    format!("{:e}", v)
        .parse::<DBig>()
        .unwrap_or(DBig::ZERO)
        .with_precision(p)
        .value()
}

// ── View coordinate helpers (arbitrary-precision pan / zoom) ─────────────

#[wasm_bindgen]
pub struct ViewCoords {
    re: String,
    im: String,
    scale: f64,
}

#[wasm_bindgen]
impl ViewCoords {
    #[wasm_bindgen(getter)]
    pub fn re(&self) -> String {
        self.re.clone()
    }
    #[wasm_bindgen(getter)]
    pub fn im(&self) -> String {
        self.im.clone()
    }
    #[wasm_bindgen(getter)]
    pub fn scale(&self) -> f64 {
        self.scale
    }
}

#[wasm_bindgen]
pub fn pan_view(
    center_re: &str,
    center_im: &str,
    scale: f64,
    delta_x: f64,
    delta_y: f64,
) -> ViewCoords {
    let p = precision_digits(scale);
    let re = parse_big(center_re, p);
    let im = parse_big(center_im, p);
    let dx = f64_to_big(delta_x * scale, p);
    let dy = f64_to_big(delta_y * scale, p);

    ViewCoords {
        re: (&re - &dx).with_precision(p).value().to_string(),
        im: (&im + &dy).with_precision(p).value().to_string(),
        scale,
    }
}

#[wasm_bindgen]
pub fn zoom_view(
    center_re: &str,
    center_im: &str,
    scale: f64,
    cursor_x: f64,
    cursor_y: f64,
    canvas_w: f64,
    canvas_h: f64,
    factor: f64,
) -> ViewCoords {
    let new_scale = scale * factor;
    let p = precision_digits(new_scale);
    let re = parse_big(center_re, p);
    let im = parse_big(center_im, p);

    let dx = cursor_x - canvas_w / 2.0;
    let dy = cursor_y - canvas_h / 2.0;

    let dx_old = f64_to_big(dx * scale, p);
    let dy_old = f64_to_big(dy * scale, p);
    let dx_new = f64_to_big(dx * new_scale, p);
    let dy_new = f64_to_big(dy * new_scale, p);

    let cursor_re = (&re + &dx_old).with_precision(p).value();
    let cursor_im = (&im - &dy_old).with_precision(p).value();

    ViewCoords {
        re: (&cursor_re - &dx_new).with_precision(p).value().to_string(),
        im: (&cursor_im + &dy_new).with_precision(p).value().to_string(),
        scale: new_scale,
    }
}

// ── Reference-orbit computation ──────────────────────────────────────────

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
    /// Center coordinates are decimal strings (arbitrary precision).
    /// c_re / c_im are f64 — the Julia parameter is inherently double-precision
    /// since it is computed from trigonometric functions in JS.
    pub fn compute(
        &mut self,
        center_re: &str,
        center_im: &str,
        c_re: f64,
        c_im: f64,
        precision: usize,
    ) {
        let p = bits_to_digits(precision).max(20);

        let mut z_re = parse_big(center_re, p);
        let mut z_im = parse_big(center_im, p);
        let c_re = f64_to_big(c_re, p);
        let c_im = f64_to_big(c_im, p);
        let four: DBig = DBig::from(4).with_precision(p).value();
        let two: DBig = DBig::from(2).with_precision(p).value();

        self.len = MAX_ITER;

        for i in 0..MAX_ITER {
            let re_f64: f64 = z_re.to_f64().value();
            let im_f64: f64 = z_im.to_f64().value();
            self.data[i * 2] = re_f64 as f32;
            self.data[i * 2 + 1] = im_f64 as f32;

            let re_sq = (&z_re * &z_re).with_precision(p).value();
            let im_sq = (&z_im * &z_im).with_precision(p).value();
            let mag_sq = (&re_sq + &im_sq).with_precision(p).value();

            if mag_sq > four {
                self.len = i + 1;
                break;
            }

            let new_re = (&re_sq - &im_sq + &c_re).with_precision(p).value();
            let new_im = (&two * &z_re * &z_im + &c_im).with_precision(p).value();
            z_re = new_re;
            z_im = new_im;
        }
    }
}
