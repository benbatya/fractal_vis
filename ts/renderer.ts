import { VERT_SRC, FRAG_SRC } from './shaders.js';

const MAX_ITER = 256;

export class Renderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private uScale:      WebGLUniformLocation;
  private uResolution: WebGLUniformLocation;
  private uC:          WebGLUniformLocation;
  private uOrbit:      WebGLUniformLocation;
  private uOrbitLen:   WebGLUniformLocation;
  private orbitTex:    WebGLTexture;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;

    this.program = this.compileProgram(VERT_SRC, FRAG_SRC);
    gl.useProgram(this.program);

    this.uScale      = gl.getUniformLocation(this.program, 'u_scale')!;
    this.uResolution = gl.getUniformLocation(this.program, 'u_resolution')!;
    this.uC          = gl.getUniformLocation(this.program, 'u_c')!;
    this.uOrbit      = gl.getUniformLocation(this.program, 'u_orbit')!;
    this.uOrbitLen   = gl.getUniformLocation(this.program, 'u_orbit_len')!;

    // Allocate orbit texture once: 256 x 1, RG32F (re, im per orbit step)
    this.orbitTex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.orbitTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RG32F, MAX_ITER, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(this.uOrbit, 0);
  }

  resize(width: number, height: number): void {
    this.gl.viewport(0, 0, width, height);
  }

  render(scale: number, width: number, height: number, cRe: number, cIm: number, orbit: Float32Array, orbitLen: number): void {
    const gl = this.gl;

    // Upload reference orbit (512 bytes, negligible cost)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.orbitTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_ITER, 1, gl.RG, gl.FLOAT, orbit);

    gl.uniform1f(this.uScale, scale);
    gl.uniform2f(this.uResolution, width, height);
    gl.uniform2f(this.uC, cRe, cIm);
    gl.uniform1i(this.uOrbitLen, orbitLen);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private compileProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const gl = this.gl;
    const vert = this.compileShader(gl.VERTEX_SHADER, vertSrc);
    const frag = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);

    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Shader link error: ' + gl.getProgramInfoLog(program));
    }

    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return program;
  }

  private compileShader(type: number, src: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('Shader compile error: ' + gl.getShaderInfoLog(shader));
    }
    return shader;
  }
}
