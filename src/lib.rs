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

// ── WasmViewState: owns view coordinates + orbit buffer ─────────────────

#[wasm_bindgen]
pub struct WasmViewState {
    center_re: DBig,
    center_im: DBig,
    scale: f64,
    generation: u32,
    orbit_data: Vec<f32>,
    orbit_len: usize,
}

#[wasm_bindgen]
impl WasmViewState {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_width: f64) -> WasmViewState {
        WasmViewState {
            center_re: DBig::ZERO,
            center_im: DBig::ZERO,
            scale: 4.0 / canvas_width,
            generation: 0,
            orbit_data: vec![0.0f32; MAX_ITER * 2],
            orbit_len: 0,
        }
    }

    pub fn reset(&mut self, canvas_width: f64) {
        self.center_re = DBig::ZERO;
        self.center_im = DBig::ZERO;
        self.scale = 4.0 / canvas_width;
        self.generation = self.generation.wrapping_add(1);
    }

    // ── Accessors ───────────────────────────────────────────────────────

    #[wasm_bindgen(getter)]
    pub fn scale(&self) -> f64 {
        self.scale
    }

    #[wasm_bindgen(getter)]
    pub fn generation(&self) -> u32 {
        self.generation
    }

    pub fn center_re_str(&self) -> String {
        self.center_re.to_string()
    }

    pub fn center_im_str(&self) -> String {
        self.center_im.to_string()
    }

    // ── Pan / Zoom (mutate in place) ────────────────────────────────────

    pub fn pan(&mut self, delta_x: f64, delta_y: f64) {
        let p = precision_digits(self.scale);
        let dx = f64_to_big(delta_x * self.scale, p);
        let dy = f64_to_big(delta_y * self.scale, p);

        self.center_re = (&self.center_re - &dx).with_precision(p).value();
        self.center_im = (&self.center_im + &dy).with_precision(p).value();
        self.generation = self.generation.wrapping_add(1);
    }

    pub fn zoom(
        &mut self,
        cursor_x: f64,
        cursor_y: f64,
        canvas_w: f64,
        canvas_h: f64,
        factor: f64,
    ) {
        let new_scale = self.scale * factor;
        let p = precision_digits(new_scale);

        let dx = cursor_x - canvas_w / 2.0;
        let dy = cursor_y - canvas_h / 2.0;

        let dx_old = f64_to_big(dx * self.scale, p);
        let dy_old = f64_to_big(dy * self.scale, p);
        let dx_new = f64_to_big(dx * new_scale, p);
        let dy_new = f64_to_big(dy * new_scale, p);

        let cursor_re = (&self.center_re + &dx_old).with_precision(p).value();
        let cursor_im = (&self.center_im - &dy_old).with_precision(p).value();

        self.center_re = (&cursor_re - &dx_new).with_precision(p).value();
        self.center_im = (&cursor_im + &dy_new).with_precision(p).value();
        self.scale = new_scale;
        self.generation = self.generation.wrapping_add(1);
    }

    // ── Reference-orbit computation ─────────────────────────────────────

    pub fn compute_orbit(&mut self, c_re: f64, c_im: f64, precision: usize) {
        let p = bits_to_digits(precision).max(20);

        let mut z_re = self.center_re.clone().with_precision(p).value();
        let mut z_im = self.center_im.clone().with_precision(p).value();
        let c_re = f64_to_big(c_re, p);
        let c_im = f64_to_big(c_im, p);
        let four: DBig = DBig::from(4).with_precision(p).value();
        let two: DBig = DBig::from(2).with_precision(p).value();

        self.orbit_len = MAX_ITER;

        for i in 0..MAX_ITER {
            let re_f64: f64 = z_re.to_f64().value();
            let im_f64: f64 = z_im.to_f64().value();
            self.orbit_data[i * 2] = re_f64 as f32;
            self.orbit_data[i * 2 + 1] = im_f64 as f32;

            let re_sq = (&z_re * &z_re).with_precision(p).value();
            let im_sq = (&z_im * &z_im).with_precision(p).value();
            let mag_sq = (&re_sq + &im_sq).with_precision(p).value();

            if mag_sq > four {
                self.orbit_len = i + 1;
                break;
            }

            let new_re = (&re_sq - &im_sq + &c_re).with_precision(p).value();
            let new_im = (&two * &z_re * &z_im + &c_im).with_precision(p).value();
            z_re = new_re;
            z_im = new_im;
        }
    }

    pub fn orbit_ptr(&self) -> *const f32 {
        self.orbit_data.as_ptr()
    }

    pub fn orbit_len(&self) -> usize {
        self.orbit_len
    }
}
