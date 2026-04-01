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
precision highp sampler2D;
in  vec2 vTexCoord;
out vec4 fragColor;

uniform float u_scale;
uniform vec2  u_resolution;
uniform vec2  u_c;
uniform sampler2D u_orbit;   // MAX_ITER x 1, RG32F — Z_i orbit points
uniform int   u_orbit_len;   // valid orbit entries; < MAX_ITER when reference escaped

const int MAX_ITER = 256;

void main() {
  vec2 uv = vTexCoord;
  // Pixel offset from view centre — small at deep zoom, float32 accurate.
  // After the reference orbit runs out, 'delta' is repurposed to hold the
  // pixel's absolute complex value so we can continue with direct iteration.
  vec2 delta = vec2(
     (uv.x - 0.5) * u_resolution.x * u_scale,
    -(uv.y - 0.5) * u_resolution.y * u_scale
  );

  float iter = 0.0;
  vec2 z_escape = delta;

  for (int i = 0; i < MAX_ITER; i++) {
    vec2 z_cur;
    vec2 Zi = vec2(0.0);

    if (i < u_orbit_len) {
      Zi    = texelFetch(u_orbit, ivec2(i, 0), 0).rg;
      z_cur = Zi + delta;          // perturbation: z_i = Z_i + delta_i
    } else {
      z_cur = delta;               // absolute: delta holds z directly
    }

    if (dot(z_cur, z_cur) > 4.0) {
      z_escape = z_cur;
      break;
    }

    if (i < u_orbit_len - 1) {
      // Perturbation update: delta_{i+1} = 2*Z_i*delta_i + delta_i^2
      float dRe2 = 2.0*(Zi.x*delta.x - Zi.y*delta.y) + delta.x*delta.x - delta.y*delta.y;
      float dIm2 = 2.0*(Zi.x*delta.y + Zi.y*delta.x) + 2.0*delta.x*delta.y;
      delta = vec2(dRe2, dIm2);
    } else {
      // Transition (i == u_orbit_len-1) or absolute iteration (i >= u_orbit_len):
      // z_cur is the pixel's actual complex value; iterate it directly and store
      // back in delta so the next loop body reads it via the 'else' branch above.
      delta = vec2(z_cur.x*z_cur.x - z_cur.y*z_cur.y + u_c.x,
                   2.0*z_cur.x*z_cur.y + u_c.y);
    }
    iter = float(i + 1);
  }

  if (iter >= float(MAX_ITER)) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Smooth / continuous coloring (eliminates banding)
  float log2_zn = log(dot(z_escape, z_escape)) * 0.5;
  float nu = log(log2_zn / log(2.0)) / log(2.0);
  float t = (iter + 1.0 - nu) / float(MAX_ITER);

  // Cosine palette — 120-degree channel offsets
  const float TAU = 6.28318530718;
  vec3 col = 0.5 + 0.5 * cos(TAU * (t + vec3(0.0, 0.333, 0.667)));
  fragColor = vec4(col, 1.0);
}
`;
