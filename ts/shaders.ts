export const VERT_SRC = `#version 300 es
out vec2 vTexCoord;

void main() {
  // Full-screen quad from gl_VertexID — no VBO needed
  vec2 pos[6];
  pos[0] = vec2(-1.0,  1.0);
  pos[1] = vec2(-1.0, -1.0);
  pos[2] = vec2( 1.0, -1.0);
  pos[3] = vec2(-1.0,  1.0);
  pos[4] = vec2( 1.0, -1.0);
  pos[5] = vec2( 1.0,  1.0);

  vec2 uv[6];
  uv[0] = vec2(0.0, 0.0);
  uv[1] = vec2(0.0, 1.0);
  uv[2] = vec2(1.0, 1.0);
  uv[3] = vec2(0.0, 0.0);
  uv[4] = vec2(1.0, 1.0);
  uv[5] = vec2(1.0, 0.0);

  gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
  vTexCoord   = uv[gl_VertexID];
}
`;

export const FRAG_SRC = `#version 300 es
precision highp float;
in  vec2 vTexCoord;
out vec4 fragColor;

uniform vec2  u_center;
uniform float u_scale;
uniform vec2  u_resolution;
uniform vec2  u_c;

void main() {
  // Map UV to complex plane coordinates
  vec2 uv = vTexCoord;
  // vTexCoord y=0 is top, y=1 is bottom; flip y so +im is up
  float re = u_center.x + (uv.x - 0.5) * u_resolution.x * u_scale;
  float im = u_center.y - (uv.y - 0.5) * u_resolution.y * u_scale;

  vec2 z = vec2(re, im);
  vec2 c = u_c;
  const int MAX_ITER = 256;
  float iter = 0.0;

  for (int i = 0; i < MAX_ITER; i++) {
    if (dot(z, z) > 4.0) break;
    z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * z.x * z.y + c.y);
    iter += 1.0;
  }

  if (iter >= float(MAX_ITER)) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Smooth / continuous coloring (eliminates banding)
  float log2_zn = log(dot(z, z)) * 0.5;
  float nu = log(log2_zn / log(2.0)) / log(2.0);
  float t = (iter + 1.0 - nu) / float(MAX_ITER);

  // Cosine palette — 120-degree channel offsets (matches Rust kernel)
  const float TAU = 6.28318530718;
  vec3 col = 0.5 + 0.5 * cos(TAU * (t + vec3(0.0, 0.333, 0.667)));
  fragColor = vec4(col, 1.0);
}
`;
