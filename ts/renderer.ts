import { VERT_SRC, FRAG_SRC } from './shaders.js';

export class Renderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private uCenter: WebGLUniformLocation;
  private uScale: WebGLUniformLocation;
  private uResolution: WebGLUniformLocation;
  private uC: WebGLUniformLocation;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;

    this.program = this.compileProgram(VERT_SRC, FRAG_SRC);
    gl.useProgram(this.program);

    this.uCenter     = gl.getUniformLocation(this.program, 'u_center')!;
    this.uScale      = gl.getUniformLocation(this.program, 'u_scale')!;
    this.uResolution = gl.getUniformLocation(this.program, 'u_resolution')!;
    this.uC          = gl.getUniformLocation(this.program, 'u_c')!;
  }

  resize(width: number, height: number): void {
    this.gl.viewport(0, 0, width, height);
  }

  render(centerRe: number, centerIm: number, scale: number, width: number, height: number, cRe: number, cIm: number): void {
    const gl = this.gl;
    gl.uniform2f(this.uCenter, centerRe, centerIm);
    gl.uniform1f(this.uScale, scale);
    gl.uniform2f(this.uResolution, width, height);
    gl.uniform2f(this.uC, cRe, cIm);
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
