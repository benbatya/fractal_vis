(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(n){if(n.ep)return;n.ep=!0;const s=e(n);fetch(n.href,s)}})();class I{__destroy_into_raw(){const t=this.__wbg_ptr;return this.__wbg_ptr=0,W.unregister(this),t}free(){const t=this.__destroy_into_raw();a.__wbg_wasmviewstate_free(t,0)}center_im_str(){let t,e;try{const r=a.wasmviewstate_center_im_str(this.__wbg_ptr);return t=r[0],e=r[1],L(r[0],r[1])}finally{a.__wbindgen_free(t,e,1)}}center_re_str(){let t,e;try{const r=a.wasmviewstate_center_re_str(this.__wbg_ptr);return t=r[0],e=r[1],L(r[0],r[1])}finally{a.__wbindgen_free(t,e,1)}}compute_orbit(t,e,r){a.wasmviewstate_compute_orbit(this.__wbg_ptr,t,e,r)}get generation(){return a.wasmviewstate_generation(this.__wbg_ptr)>>>0}constructor(t){const e=a.wasmviewstate_new(t);return this.__wbg_ptr=e>>>0,W.register(this,this.__wbg_ptr,this),this}orbit_len(){return a.wasmviewstate_orbit_len(this.__wbg_ptr)>>>0}orbit_ptr(){return a.wasmviewstate_orbit_ptr(this.__wbg_ptr)>>>0}pan(t,e){a.wasmviewstate_pan(this.__wbg_ptr,t,e)}reset(t){a.wasmviewstate_reset(this.__wbg_ptr,t)}get scale(){return a.wasmviewstate_scale(this.__wbg_ptr)}zoom(t,e,r,n,s){a.wasmviewstate_zoom(this.__wbg_ptr,t,e,r,n,s)}}Symbol.dispose&&(I.prototype[Symbol.dispose]=I.prototype.free);function j(){return{__proto__:null,"./fractal_vis_bg.js":{__proto__:null,__wbg___wbindgen_throw_6ddd609b62940d55:function(t,e){throw new Error(L(t,e))},__wbindgen_init_externref_table:function(){const t=a.__wbindgen_externrefs,e=t.grow(4);t.set(0,void 0),t.set(e+0,void 0),t.set(e+1,null),t.set(e+2,!0),t.set(e+3,!1)}}}}const W=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(i=>a.__wbg_wasmviewstate_free(i>>>0,1));function L(i,t){return i=i>>>0,J(i,t)}let b=null;function k(){return(b===null||b.byteLength===0)&&(b=new Uint8Array(a.memory.buffer)),b}let T=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0});T.decode();const K=2146435072;let A=0;function J(i,t){return A+=t,A>=K&&(T=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}),T.decode(),A=t),T.decode(k().subarray(i,i+t))}let a;function Q(i,t){return a=i.exports,b=null,a.__wbindgen_start(),a}async function ee(i,t){if(typeof Response=="function"&&i instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(i,t)}catch(n){if(i.ok&&e(i.type)&&i.headers.get("Content-Type")!=="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",n);else throw n}const r=await i.arrayBuffer();return await WebAssembly.instantiate(r,t)}else{const r=await WebAssembly.instantiate(i,t);return r instanceof WebAssembly.Instance?{instance:r,module:i}:r}function e(r){switch(r){case"basic":case"cors":case"default":return!0}return!1}}async function te(i){if(a!==void 0)return a;i!==void 0&&(Object.getPrototypeOf(i)===Object.prototype?{module_or_path:i}=i:console.warn("using deprecated parameters for the initialization function; pass a single object instead")),i===void 0&&(i=new URL("/assets/fractal_vis_bg-BYtPibxN.wasm",import.meta.url));const t=j();(typeof i=="string"||typeof Request=="function"&&i instanceof Request||typeof URL=="function"&&i instanceof URL)&&(i=fetch(i));const{instance:e,module:r}=await ee(await i,t);return Q(e)}const re=`#version 300 es
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
`,ie=`#version 300 es
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
`,B=256;class ne{gl;program;uScale;uResolution;uC;uOrbit;uOrbitLen;orbitTex;constructor(t){const e=t.getContext("webgl2");if(!e)throw new Error("WebGL2 not supported");this.gl=e,this.program=this.compileProgram(re,ie),e.useProgram(this.program),this.uScale=e.getUniformLocation(this.program,"u_scale"),this.uResolution=e.getUniformLocation(this.program,"u_resolution"),this.uC=e.getUniformLocation(this.program,"u_c"),this.uOrbit=e.getUniformLocation(this.program,"u_orbit"),this.uOrbitLen=e.getUniformLocation(this.program,"u_orbit_len"),this.orbitTex=e.createTexture(),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.orbitTex),e.texStorage2D(e.TEXTURE_2D,1,e.RG32F,B,1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.uniform1i(this.uOrbit,0)}resize(t,e){this.gl.viewport(0,0,t,e)}render(t,e,r,n,s,o,c){const l=this.gl;l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,this.orbitTex),l.texSubImage2D(l.TEXTURE_2D,0,0,0,B,1,l.RG,l.FLOAT,o),l.uniform1f(this.uScale,t),l.uniform2f(this.uResolution,e,r),l.uniform2f(this.uC,n,s),l.uniform1i(this.uOrbitLen,c),l.drawArrays(l.TRIANGLES,0,6)}compileProgram(t,e){const r=this.gl,n=this.compileShader(r.VERTEX_SHADER,t),s=this.compileShader(r.FRAGMENT_SHADER,e),o=r.createProgram();if(r.attachShader(o,n),r.attachShader(o,s),r.linkProgram(o),!r.getProgramParameter(o,r.LINK_STATUS))throw new Error("Shader link error: "+r.getProgramInfoLog(o));return r.deleteShader(n),r.deleteShader(s),o}compileShader(t,e){const r=this.gl,n=r.createShader(t);if(r.shaderSource(n,e),r.compileShader(n),!r.getShaderParameter(n,r.COMPILE_STATUS))throw new Error("Shader compile error: "+r.getShaderInfoLog(n));return n}}function oe(i,t,e){const r=window.devicePixelRatio??1;i.addEventListener("wheel",c=>{c.preventDefault();const l=c.deltaY>0?1.1:1/1.1;t.zoom(c.offsetX*r,c.offsetY*r,i.width,i.height,l),e()},{passive:!1});let n=!1,s=0,o=0;i.addEventListener("mousedown",c=>{c.button===0&&(n=!0,s=c.clientX,o=c.clientY)}),window.addEventListener("mousemove",c=>{n&&(t.pan((c.clientX-s)*r,(c.clientY-o)*r),s=c.clientX,o=c.clientY,e())}),window.addEventListener("mouseup",c=>{c.button===0&&(n=!1)})}async function se(){const i=await te(),t=document.getElementById("glcanvas"),e=new ne(t),r=window.devicePixelRatio??1;let n=0,s=0,o=new I(1),c=0;const l=1e4,N=document.getElementById("fps"),u=[],G=10,V=document.getElementById("draw-time"),p=[];let x=0,d=0,f=!1,M=0,z=NaN,P=NaN,D=0;const Z=document.getElementById("tsec-display"),v=document.getElementById("tsec-slider"),$=document.getElementById("view-info"),F=document.getElementById("pause-btn");F.addEventListener("click",()=>{f=!f,F.textContent=f?"Resume":"Pause",v.disabled=!f}),v.addEventListener("input",()=>{f&&(d=Math.min(1,Math.max(0,parseFloat(v.value))))}),document.getElementById("reset-view-btn").addEventListener("click",()=>{o.reset(n)});function Y(w){for(u.push(w);u.length>1&&w-u[0]>l;)u.shift();if(u.length<2)return;const y=w-u[0],m=(u.length-1)/y*1e3;let _=0;for(let g=1;g<u.length;g++){const E=u[g]-u[g-1];E>_&&(_=E)}const h=1e3/_;N.textContent=`avg ${m.toFixed(1)} fps  min ${h.toFixed(1)} fps`}function U(){c===0&&(c=requestAnimationFrame(X))}function X(w){c=requestAnimationFrame(X),Y(w),f||(d+=1/600,d>1&&(d=0),v.value=String(d)),Z.textContent=`t ${d.toFixed(4)}`,$.textContent=`re ${o.center_re_str()}
im ${o.center_im_str()}
scale ${o.scale.toExponential(4)}`;const y=2*Math.PI,m=.7511*Math.cos(y*d),_=.7511*Math.sin(y*d),h=Math.max(64,Math.ceil(-Math.log2(o.scale))+32);(o.generation!==M||m!==z||_!==P||h!==D)&&(o.compute_orbit(m,_,h),M=o.generation,z=m,P=_,D=h);const g=new Float32Array(i.memory.buffer,o.orbit_ptr(),256*2),E=o.orbit_len(),q=performance.now();e.render(o.scale,n,s,m,_,g,E),x=performance.now()-q,p.length>=G&&p.shift(),p.push(x);let O=0,R=0;for(const S of p)O+=S,S>R&&(R=S);const H=O/p.length;V.textContent=`last ${x.toFixed(1)} ms  avg ${H.toFixed(1)} ms  max ${R.toFixed(1)} ms`}function C(){n=Math.round(window.innerWidth*r),s=Math.round(window.innerHeight*r),t.width=n,t.height=s,o.reset(n),e.resize(n,s),U()}window.addEventListener("resize",C),C(),oe(t,o,U)}se().catch(console.error);
