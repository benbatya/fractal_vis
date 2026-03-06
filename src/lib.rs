use wasm_bindgen::prelude::*;

const MAX_ITER: u32 = 256;

#[wasm_bindgen]
pub struct Fractal {
    width: u32,
    height: u32,
    buf: Vec<u8>,
}

#[wasm_bindgen]
impl Fractal {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Fractal {
        let buf = vec![0u8; (width * height * 4) as usize];
        Fractal { width, height, buf }
    }

    pub fn ptr(&self) -> u32 {
        self.buf.as_ptr() as u32
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        self.width = width;
        self.height = height;
        self.buf.resize((width * height * 4) as usize, 0);
    }

    pub fn render(&mut self, center_re: f64, center_im: f64, scale: f64) {
        let w = self.width;
        let h = self.height;
        let half_w = w as f64 / 2.0;
        let half_h = h as f64 / 2.0;

        for py in 0..h {
            for px in 0..w {
                let c_re = center_re + (px as f64 - half_w) * scale;
                let c_im = center_im - (py as f64 - half_h) * scale;

                let (r, g, b) = mandelbrot(c_re, c_im);

                let idx = ((py * w + px) * 4) as usize;
                self.buf[idx]     = r;
                self.buf[idx + 1] = g;
                self.buf[idx + 2] = b;
                self.buf[idx + 3] = 255;
            }
        }
    }
}

fn mandelbrot(c_re: f64, c_im: f64) -> (u8, u8, u8) {
    let mut z_re = 0.0f64;
    let mut z_im = 0.0f64;
    let mut iter = 0u32;

    while z_re * z_re + z_im * z_im <= 4.0 && iter < MAX_ITER {
        let z_re_new = z_re * z_re - z_im * z_im + c_re;
        z_im = 2.0 * z_re * z_im + c_im;
        z_re = z_re_new;
        iter += 1;
    }

    if iter == MAX_ITER {
        return (0, 0, 0);
    }

    // Smooth / renormalized iteration count to avoid banding
    let log_zn = (z_re * z_re + z_im * z_im).ln() / 2.0;
    let nu = (log_zn / 2f64.ln()).ln() / 2f64.ln();
    let t = (iter as f64 + 1.0 - nu) / MAX_ITER as f64;

    palette(t.fract())
}

fn palette(t: f64) -> (u8, u8, u8) {
    use std::f64::consts::TAU;
    let r = (0.5 + 0.5 * (TAU * t).cos()) * 255.0;
    let g = (0.5 + 0.5 * (TAU * (t + 0.33)).cos()) * 255.0;
    let b = (0.5 + 0.5 * (TAU * (t + 0.67)).cos()) * 255.0;
    (r as u8, g as u8, b as u8)
}
