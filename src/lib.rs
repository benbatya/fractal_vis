use wasm_bindgen::prelude::*;
use dashu_float::DBig;

const MAX_ITER: usize = 256;

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
    /// Coordinates are decimal strings. Precision is in bits —
    /// converted internally to decimal digits for DBig (base-10).
    pub fn compute(
        &mut self,
        center_re: &str,
        center_im: &str,
        c_re: &str,
        c_im: &str,
        precision: usize,
    ) {
        // Convert bit precision to decimal digits: digits = ceil(bits * log10(2))
        let p = ((precision as f64) * 0.30103).ceil() as usize;
        let p = p.max(20);

        let parse = |s: &str| -> DBig {
            s.parse::<DBig>()
                .unwrap_or(DBig::ZERO)
                .with_precision(p)
                .value()
        };

        let mut z_re = parse(center_re);
        let mut z_im = parse(center_im);
        let c_re = parse(c_re);
        let c_im = parse(c_im);
        let four: DBig = DBig::from(4).with_precision(p).value();
        let two: DBig = DBig::from(2).with_precision(p).value();

        self.len = MAX_ITER;

        for i in 0..MAX_ITER {
            // Store orbit point as f32 for GPU texture upload
            let re_f64: f64 = z_re.to_f64().value();
            let im_f64: f64 = z_im.to_f64().value();
            self.data[i * 2] = re_f64 as f32;
            self.data[i * 2 + 1] = im_f64 as f32;

            // Escape check: |z|² > 4
            let re_sq = (&z_re * &z_re).with_precision(p).value();
            let im_sq = (&z_im * &z_im).with_precision(p).value();
            let mag_sq = (&re_sq + &im_sq).with_precision(p).value();

            if mag_sq > four {
                self.len = i + 1;
                break;
            }

            // z = z² + c
            let new_re = (&re_sq - &im_sq + &c_re).with_precision(p).value();
            let new_im = (&two * &z_re * &z_im + &c_im).with_precision(p).value();
            z_re = new_re;
            z_im = new_im;
        }
    }
}
