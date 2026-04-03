(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function e(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(o){if(o.ep)return;o.ep=!0;const a=e(o);fetch(o.href,a)}})();class z{__destroy_into_raw(){const t=this.__wbg_ptr;return this.__wbg_ptr=0,Y.unregister(this),t}free(){const t=this.__destroy_into_raw();u.__wbg_wasmviewstate_free(t,0)}center_im_str(){let t,e;try{const r=u.wasmviewstate_center_im_str(this.__wbg_ptr);return t=r[0],e=r[1],X(r[0],r[1])}finally{u.__wbindgen_free(t,e,1)}}center_re_str(){let t,e;try{const r=u.wasmviewstate_center_re_str(this.__wbg_ptr);return t=r[0],e=r[1],X(r[0],r[1])}finally{u.__wbindgen_free(t,e,1)}}compute_orbit(t,e,r){u.wasmviewstate_compute_orbit(this.__wbg_ptr,t,e,r)}get generation(){return u.wasmviewstate_generation(this.__wbg_ptr)>>>0}constructor(t){const e=u.wasmviewstate_new(t);return this.__wbg_ptr=e>>>0,Y.register(this,this.__wbg_ptr,this),this}orbit_len(){return u.wasmviewstate_orbit_len(this.__wbg_ptr)>>>0}orbit_ptr(){return u.wasmviewstate_orbit_ptr(this.__wbg_ptr)>>>0}pan(t,e){u.wasmviewstate_pan(this.__wbg_ptr,t,e)}reset(t){u.wasmviewstate_reset(this.__wbg_ptr,t)}get scale(){return u.wasmviewstate_scale(this.__wbg_ptr)}zoom(t,e,r,o,a){u.wasmviewstate_zoom(this.__wbg_ptr,t,e,r,o,a)}}Symbol.dispose&&(z.prototype[Symbol.dispose]=z.prototype.free);function k(){return{__proto__:null,"./fractal_vis_bg.js":{__proto__:null,__wbg___wbindgen_throw_6ddd609b62940d55:function(t,e){throw new Error(X(t,e))},__wbindgen_init_externref_table:function(){const t=u.__wbindgen_externrefs,e=t.grow(4);t.set(0,void 0),t.set(e+0,void 0),t.set(e+1,null),t.set(e+2,!0),t.set(e+3,!1)}}}}const Y=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(i=>u.__wbg_wasmviewstate_free(i>>>0,1));function X(i,t){return i=i>>>0,J(i,t)}let x=null;function q(){return(x===null||x.byteLength===0)&&(x=new Uint8Array(u.memory.buffer)),x}let A=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0});A.decode();const K=2146435072;let D=0;function J(i,t){return D+=t,D>=K&&(A=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}),A.decode(),D=t),A.decode(q().subarray(i,i+t))}let u;function Q(i,t){return u=i.exports,x=null,u.__wbindgen_start(),u}async function ee(i,t){if(typeof Response=="function"&&i instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(i,t)}catch(o){if(i.ok&&e(i.type)&&i.headers.get("Content-Type")!=="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",o);else throw o}const r=await i.arrayBuffer();return await WebAssembly.instantiate(r,t)}else{const r=await WebAssembly.instantiate(i,t);return r instanceof WebAssembly.Instance?{instance:r,module:i}:r}function e(r){switch(r){case"basic":case"cors":case"default":return!0}return!1}}async function te(i){if(u!==void 0)return u;i!==void 0&&(Object.getPrototypeOf(i)===Object.prototype?{module_or_path:i}=i:console.warn("using deprecated parameters for the initialization function; pass a single object instead")),i===void 0&&(i=new URL(""+new URL("fractal_vis_bg-BYtPibxN.wasm",import.meta.url).href,import.meta.url));const t=k();(typeof i=="string"||typeof Request=="function"&&i instanceof Request||typeof URL=="function"&&i instanceof URL)&&(i=fetch(i));const{instance:e,module:r}=await ee(await i,t);return Q(e)}const re=`#version 300 es
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
`,ne=`#version 300 es
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
`,G=256;class ie{gl;program;uScale;uResolution;uC;uOrbit;uOrbitLen;orbitTex;constructor(t){const e=t.getContext("webgl2");if(!e)throw new Error("WebGL2 not supported");this.gl=e,this.program=this.compileProgram(re,ne),e.useProgram(this.program),this.uScale=e.getUniformLocation(this.program,"u_scale"),this.uResolution=e.getUniformLocation(this.program,"u_resolution"),this.uC=e.getUniformLocation(this.program,"u_c"),this.uOrbit=e.getUniformLocation(this.program,"u_orbit"),this.uOrbitLen=e.getUniformLocation(this.program,"u_orbit_len"),this.orbitTex=e.createTexture(),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.orbitTex),e.texStorage2D(e.TEXTURE_2D,1,e.RG32F,G,1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.uniform1i(this.uOrbit,0)}resize(t,e){this.gl.viewport(0,0,t,e)}render(t,e,r,o,a,s,l){const d=this.gl;d.activeTexture(d.TEXTURE0),d.bindTexture(d.TEXTURE_2D,this.orbitTex),d.texSubImage2D(d.TEXTURE_2D,0,0,0,G,1,d.RG,d.FLOAT,s),d.uniform1f(this.uScale,t),d.uniform2f(this.uResolution,e,r),d.uniform2f(this.uC,o,a),d.uniform1i(this.uOrbitLen,l),d.drawArrays(d.TRIANGLES,0,6)}compileProgram(t,e){const r=this.gl,o=this.compileShader(r.VERTEX_SHADER,t),a=this.compileShader(r.FRAGMENT_SHADER,e),s=r.createProgram();if(r.attachShader(s,o),r.attachShader(s,a),r.linkProgram(s),!r.getProgramParameter(s,r.LINK_STATUS))throw new Error("Shader link error: "+r.getProgramInfoLog(s));return r.deleteShader(o),r.deleteShader(a),s}compileShader(t,e){const r=this.gl,o=r.createShader(t);if(r.shaderSource(o,e),r.compileShader(o),!r.getShaderParameter(o,r.COMPILE_STATUS))throw new Error("Shader compile error: "+r.getShaderInfoLog(o));return o}}function oe(i,t,e){const r=window.devicePixelRatio??1;i.addEventListener("wheel",n=>{n.preventDefault();const c=n.deltaY>0?1.1:1/1.1;t.zoom(n.offsetX*r,n.offsetY*r,i.width,i.height,c),e()},{passive:!1});let o=!1,a=0,s=0;i.addEventListener("mousedown",n=>{n.button===0&&(o=!0,a=n.clientX,s=n.clientY)}),window.addEventListener("mousemove",n=>{o&&(t.pan((n.clientX-a)*r,(n.clientY-s)*r),a=n.clientX,s=n.clientY,e())}),window.addEventListener("mouseup",n=>{n.button===0&&(o=!1)});let l=[];function d(n){let c=0,h=0;for(let f=0;f<n.length;f++)c+=n[f].clientX,h+=n[f].clientY;return{x:c/n.length,y:h/n.length}}function L(n){const c=n[1].clientX-n[0].clientX,h=n[1].clientY-n[0].clientY;return Math.hypot(c,h)}i.addEventListener("touchstart",n=>{n.preventDefault(),l=[];for(let c=0;c<n.touches.length;c++)l.push({x:n.touches[c].clientX,y:n.touches[c].clientY})},{passive:!1}),i.addEventListener("touchmove",n=>{if(n.preventDefault(),n.touches.length>=2&&l.length>=2){const c={x:l.reduce((_,g)=>_+g.x,0)/l.length,y:l.reduce((_,g)=>_+g.y,0)/l.length},h=d(n.touches);t.pan((h.x-c.x)*r,(h.y-c.y)*r);const f=Math.hypot(l[1].x-l[0].x,l[1].y-l[0].y),b=L(n.touches);if(f>0){const _=i.getBoundingClientRect(),g=(h.x-_.left)*r,E=(h.y-_.top)*r;t.zoom(g,E,i.width,i.height,f/b)}e()}else n.touches.length===1&&l.length>=1&&(t.pan((n.touches[0].clientX-l[0].x)*r,(n.touches[0].clientY-l[0].y)*r),e());l=[];for(let c=0;c<n.touches.length;c++)l.push({x:n.touches[c].clientX,y:n.touches[c].clientY})},{passive:!1}),i.addEventListener("touchend",n=>{n.preventDefault(),l=[];for(let c=0;c<n.touches.length;c++)l.push({x:n.touches[c].clientX,y:n.touches[c].clientY})},{passive:!1})}async function se(){const i=await te(),t=document.getElementById("glcanvas"),e=new ie(t),r=window.devicePixelRatio??1;let o=0,a=0,s=new z(1),l=0;const d=1e4,L=document.getElementById("fps"),n=[],c=10,h=document.getElementById("draw-time"),f=[];let b=0,_=0,g=!1,E=0,P=NaN,C=NaN,U=0;const V=document.getElementById("tsec-display"),T=document.getElementById("tsec-slider"),Z=document.getElementById("view-info"),F=document.getElementById("pause-btn");F.addEventListener("click",()=>{g=!g,F.textContent=g?"Resume":"Pause",T.disabled=!g}),T.addEventListener("input",()=>{g&&(_=Math.min(1,Math.max(0,parseFloat(T.value))))}),document.getElementById("reset-view-btn").addEventListener("click",()=>{s.reset(o)});function $(v){for(n.push(v);n.length>1&&v-n[0]>d;)n.shift();if(n.length<2)return;const R=v-n[0],p=(n.length-1)/R*1e3;let m=0;for(let w=1;w<n.length;w++){const S=n[w]-n[w-1];S>m&&(m=S)}const y=1e3/m;L.textContent=`avg ${p.toFixed(1)} fps  min ${y.toFixed(1)} fps`}function O(){l===0&&(l=requestAnimationFrame(B))}function B(v){l=requestAnimationFrame(B),$(v),g||(_+=1/600,_>1&&(_=0),T.value=String(_)),V.textContent=`t ${_.toFixed(4)}`,Z.textContent=`re ${s.center_re_str()}
im ${s.center_im_str()}
scale ${s.scale.toExponential(4)}`;const R=2*Math.PI,p=.7511*Math.cos(R*_),m=.7511*Math.sin(R*_),y=Math.max(64,Math.ceil(-Math.log2(s.scale))+32);(s.generation!==E||p!==P||m!==C||y!==U)&&(s.compute_orbit(p,m,y),E=s.generation,P=p,C=m,U=y);const w=new Float32Array(i.memory.buffer,s.orbit_ptr(),256*2),S=s.orbit_len(),H=performance.now();e.render(s.scale,o,a,p,m,w,S),b=performance.now()-H,f.length>=c&&f.shift(),f.push(b);let N=0,I=0;for(const M of f)N+=M,M>I&&(I=M);const j=N/f.length;h.textContent=`last ${b.toFixed(1)} ms  avg ${j.toFixed(1)} ms  max ${I.toFixed(1)} ms`}function W(){o=Math.round(window.innerWidth*r),a=Math.round(window.innerHeight*r),t.width=o,t.height=a,s.reset(o),e.resize(o,a),O()}window.addEventListener("resize",W),W(),oe(t,s,O)}se().catch(console.error);
