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
precision mediump float;
in  vec2      vTexCoord;
out vec4      fragColor;
uniform sampler2D uTex;

void main() {
  fragColor = texture(uTex, vTexCoord);
}
`;
