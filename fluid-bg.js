// Lightweight auto fluid background adapted from a WebGL fluid simulation.
// Runs autonomously with slow, soothing emitters; no pointer interaction.
(function () {
  const cfg = {
    SIM_RES: 96,
    DYE_RES: 720,
    DENSITY_DISSIPATION: 5.0,
    VELOCITY_DISSIPATION: 3.0,
    PRESSURE: 0.08,
    PRESSURE_ITERATIONS: 15,
    CURL: 2.0,
    SPLAT_RADIUS: 0.18,
    SPLAT_FORCE: 1200,
    SHADING: true,
    EMITTERS: 4,
    EMIT_INTERVAL: 1.6,
    HUE_SPEED: 0.03,
    SAT: 0.35,
    VAL: 0.95,
  };

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createCanvas() {
    const c = document.createElement('canvas');
    c.id = 'fluid-bg-canvas';
    Object.assign(c.style, {
      position: 'fixed', inset: '0', width: '100vw', height: '100vh',
      zIndex: '-1', pointerEvents: 'none'
    });
    document.body.appendChild(c);
    return c;
  }

  function scaleByPixelRatio(n) { const r = window.devicePixelRatio || 1; return Math.floor(n * r); }
  function clamp01(v) { return Math.min(1, Math.max(0, v)); }

  // HSV to RGB (pastel)
  function hsv(h, s, v) {
    let r, g, b, i = Math.floor(h * 6), f = h * 6 - i;
    const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i % 6) { case 0: r=v; g=t; b=p; break; case 1: r=q; g=v; b=p; break; case 2: r=p; g=v; b=t; break; case 3: r=p; g=q; b=v; break; case 4: r=t; g=p; b=v; break; default: r=v; g=p; b=q; }
    return { r, g, b };
  }

  function initGL(canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext('webgl2', params);
    const is2 = !!gl;
    if (!is2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
    let halfFloat, supportLinearFiltering;
    if (is2) { gl.getExtension('EXT_color_buffer_float'); supportLinearFiltering = gl.getExtension('OES_texture_float_linear'); }
    else { halfFloat = gl.getExtension('OES_texture_half_float'); supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear'); }
    const halfFloatTexType = is2 ? gl.HALF_FLOAT : (halfFloat && halfFloat.HALF_FLOAT_OES);

    function supportRenderTextureFormat(internalFormat, format, type) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }
    function getSupportedFormat(internalFormat, format, type) {
      if (!supportRenderTextureFormat(internalFormat, format, type)) {
        switch (internalFormat) {
          case gl.R16F: return getSupportedFormat(gl.RG16F, gl.RG, type);
          case gl.RG16F: return getSupportedFormat(gl.RGBA16F, gl.RGBA, type);
          default: return null;
        }
      }
      return { internalFormat, format };
    }
    const formatRGBA = is2 ? getSupportedFormat(gl.RGBA16F, gl.RGBA, halfFloatTexType) : getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
    const formatRG   = is2 ? getSupportedFormat(gl.RG16F, gl.RG, halfFloatTexType)   : getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
    const formatR    = is2 ? getSupportedFormat(gl.R16F, gl.RED, halfFloatTexType)   : getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);

    return { gl, is2, ext: { halfFloatTexType, supportLinearFiltering, formatRGBA, formatRG, formatR } };
  }

  function compile(gl, type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  function program(gl, vs, fs) { const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p); return p; }
  function uniforms(gl, prog) { const u = []; const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS); for (let i=0;i<n;i++){ const name = gl.getActiveUniform(prog, i).name; u[name] = gl.getUniformLocation(prog, name);} return u; }

  function start() {
    const canvas = createCanvas();
    const SIM = prefersReduced ? 64 : cfg.SIM_RES;
    let DYE = prefersReduced ? 480 : cfg.DYE_RES;

    const { gl, ext } = initGL(canvas);
    if (!ext.supportLinearFiltering) { DYE = 256; cfg.SHADING = false; }

    const baseVS = compile(gl, gl.VERTEX_SHADER, `
      precision highp float; attribute vec2 aPosition; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform vec2 texelSize;
      void main(){ vUv=aPosition*0.5+0.5; vL=vUv-vec2(texelSize.x,0.0); vR=vUv+vec2(texelSize.x,0.0); vT=vUv+vec2(0.0,texelSize.y); vB=vUv-vec2(0.0,texelSize.y); gl_Position=vec4(aPosition,0.0,1.0);} 
    `);
    const copyFS = compile(gl, gl.FRAGMENT_SHADER, `precision mediump float; varying highp vec2 vUv; uniform sampler2D uTexture; void main(){ gl_FragColor = texture2D(uTexture, vUv);} `);
    const clearFS = compile(gl, gl.FRAGMENT_SHADER, `precision mediump float; varying highp vec2 vUv; uniform sampler2D uTexture; uniform float value; void main(){ gl_FragColor = value * texture2D(uTexture, vUv);} `);
    const displayFS = compile(gl, gl.FRAGMENT_SHADER, `precision highp float; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform sampler2D uTexture; uniform vec2 texelSize; void main(){ vec3 c=texture2D(uTexture,vUv).rgb; ${cfg.SHADING?`vec3 lc=texture2D(uTexture,vL).rgb; vec3 rc=texture2D(uTexture,vR).rgb; vec3 tc=texture2D(uTexture,vT).rgb; vec3 bc=texture2D(uTexture,vB).rgb; float dx=length(rc)-length(lc); float dy=length(tc)-length(bc); vec3 n=normalize(vec3(dx,dy,length(texelSize))); c *= clamp(dot(n, vec3(0.0,0.0,1.0))+0.7, 0.7, 1.0);`:''} gl_FragColor=vec4(c, max(c.r,max(c.g,c.b))); }`);
    const splatFS = compile(gl, gl.FRAGMENT_SHADER, `precision highp float; varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius; void main(){ vec2 p=vUv-point.xy; p.x*=aspectRatio; vec3 splat=exp(-dot(p,p)/radius)*color; vec3 base=texture2D(uTarget,vUv).xyz; gl_FragColor=vec4(base+splat,1.0);} `);
    const advectionFS = compile(gl, gl.FRAGMENT_SHADER, `precision highp float; varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation; void main(){ vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize; vec4 result = texture2D(uSource, coord); float decay = 1.0 + dissipation * dt; gl_FragColor = result/decay; }`);
    const divergenceFS = compile(gl, gl.FRAGMENT_SHADER, `precision mediump float; varying highp vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity; void main(){ float L=texture2D(uVelocity,vL).x; float R=texture2D(uVelocity,vR).x; float T=texture2D(uVelocity,vT).y; float B=texture2D(uVelocity,vB).y; vec2 C=texture2D(uVelocity,vUv).xy; if(vL.x<0.0){L=-C.x;} if(vR.x>1.0){R=-C.x;} if(vT.y>1.0){T=-C.y;} if(vB.y<0.0){B=-C.y;} gl_FragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0);} `);
    const curlFS = compile(gl, gl.FRAGMENT_SHADER, `precision mediump float; varying highp vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity; void main(){ float L=texture2D(uVelocity,vL).y; float R=texture2D(uVelocity,vR).y; float T=texture2D(uVelocity,vT).x; float B=texture2D(uVelocity,vB).x; float vort=R-L-T+B; gl_FragColor=vec4(0.5*vort,0.0,0.0,1.0);} `);
    const vorticityFS = compile(gl, gl.FRAGMENT_SHADER, `precision highp float; varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt; void main(){ float L=texture2D(uCurl,vL).x; float R=texture2D(uCurl,vR).x; float T=texture2D(uCurl,vT).x; float B=texture2D(uCurl,vB).x; float C=texture2D(uCurl,vUv).x; vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L)); force/=length(force)+0.0001; force*=curl*C; force.y*=-1.0; vec2 v=texture2D(uVelocity,vUv).xy; v+=force*dt; v=min(max(v,-1000.0),1000.0); gl_FragColor=vec4(v,0.0,1.0);} `);
    const pressureFS = compile(gl, gl.FRAGMENT_SHADER, `precision mediump float; varying highp vec2 vUv,vL,vR,vT,vB; uniform sampler2D uPressure; uniform sampler2D uDivergence; void main(){ float L=texture2D(uPressure,vL).x; float R=texture2D(uPressure,vR).x; float T=texture2D(uPressure,vT).x; float B=texture2D(uPressure,vB).x; float div=texture2D(uDivergence,vUv).x; float p=(L+R+B+T-div)*0.25; gl_FragColor=vec4(p,0.0,0.0,1.0);} `);
    const gradSubFS = compile(gl, gl.FRAGMENT_SHADER, `precision mediump float; varying highp vec2 vUv,vL,vR,vT,vB; uniform sampler2D uPressure; uniform sampler2D uVelocity; void main(){ float L=texture2D(uPressure,vL).x; float R=texture2D(uPressure,vR).x; float T=texture2D(uPressure,vT).x; float B=texture2D(uPressure,vB).x; vec2 v=texture2D(uVelocity,vUv).xy; v-=vec2(R-L,T-B); gl_FragColor=vec4(v,0.0,1.0);} `);

    function createProgram(fs) { const p = program(gl, baseVS, fs); return { p, u: uniforms(gl, p) }; }
    const copyP = createProgram(copyFS);
    const clearP = createProgram(clearFS);
    const splatP = createProgram(splatFS);
    const advP = createProgram(advectionFS);
    const divP = createProgram(divergenceFS);
    const curlP = createProgram(curlFS);
    const vortP = createProgram(vorticityFS);
    const presP = createProgram(pressureFS);
    const gradP = createProgram(gradSubFS);
    const dispP = createProgram(displayFS);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);
    function blit(target, clear){ if(!target){ gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER,null);} else { gl.viewport(0,0,target.width,target.height); gl.bindFramebuffer(gl.FRAMEBUFFER,target.fbo);} if(clear){ gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);} gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);} 

    function createFBO(w,h,internalFormat,format,type,param){ gl.activeTexture(gl.TEXTURE0); const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,param); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,param); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D,0,internalFormat,w,h,0,format,type,null); const fbo=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0); gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT); const obj={ texture:tex,fbo,width:w,height:h, texelSizeX:1/w, texelSizeY:1/h, attach(id){ gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D,tex); return id; } }; return obj; }
    function createDoubleFBO(w,h,internalFormat,format,type,param){ let fbo1=createFBO(w,h,internalFormat,format,type,param), fbo2=createFBO(w,h,internalFormat,format,type,param); return { width:w,height:h, texelSizeX:fbo1.texelSizeX, texelSizeY:fbo1.texelSizeY, get read(){return fbo1;}, set read(v){fbo1=v;}, get write(){return fbo2;}, set write(v){fbo2=v;}, swap(){const t=fbo1; fbo1=fbo2; fbo2=t;} }; }
    function resizeFBO(target,w,h,internalFormat,format,type,param){ const nf=createFBO(w,h,internalFormat,format,type,param); gl.useProgram(copyP.p); gl.uniform1i(copyP.u.uTexture, target.attach(0)); blit(nf); return nf; }
    function resizeDoubleFBO(target,w,h,internalFormat,format,type,param){ if(target.width===w && target.height===h) return target; target.read=resizeFBO(target.read,w,h,internalFormat,format,type,param); target.write=createFBO(w,h,internalFormat,format,type,param); target.width=w; target.height=h; target.texelSizeX=1/w; target.texelSizeY=1/h; return target; }

    let dye, velocity, divergence, curl, pressure;
    function getResolution(res){ let ar = gl.drawingBufferWidth/gl.drawingBufferHeight; if(ar<1) ar = 1/ar; const min=Math.round(res), max=Math.round(res*ar); return (gl.drawingBufferWidth>gl.drawingBufferHeight)?{width:max,height:min}:{width:min,height:max}; }
    function initFBOs(){ const sim=getResolution(SIM); let dyeRes=getResolution(DYE); const texType=ext.halfFloatTexType; const rgba=ext.formatRGBA; const rg=ext.formatRG; const r=ext.formatR; const filt=ext.supportLinearFiltering?gl.LINEAR:gl.NEAREST; if(!dye) dye=createDoubleFBO(dyeRes.width,dyeRes.height,rgba.internalFormat,rgba.format,texType,filt); else dye=resizeDoubleFBO(dye,dyeRes.width,dyeRes.height,rgba.internalFormat,rgba.format,texType,filt); if(!velocity) velocity=createDoubleFBO(sim.width,sim.height,rg.internalFormat,rg.format,texType,filt); else velocity=resizeDoubleFBO(velocity,sim.width,sim.height,rg.internalFormat,rg.format,texType,filt); divergence=createFBO(sim.width,sim.height,r.internalFormat,r.format,texType,gl.NEAREST); curl=createFBO(sim.width,sim.height,r.internalFormat,r.format,texType,gl.NEAREST); pressure=createDoubleFBO(sim.width,sim.height,r.internalFormat,r.format,texType,gl.NEAREST); }

    function resizeCanvas(){ const w=scaleByPixelRatio(canvas.clientWidth||window.innerWidth), h=scaleByPixelRatio(canvas.clientHeight||window.innerHeight); if(canvas.width!==w||canvas.height!==h){ canvas.width=w; canvas.height=h; return true;} return false; }

    function step(dt){ gl.disable(gl.BLEND);
      gl.useProgram(curlP.p); gl.uniform2f(curlP.u.texelSize, velocity.texelSizeX, velocity.texelSizeY); gl.uniform1i(curlP.u.uVelocity, velocity.read.attach(0)); blit(curl);
      gl.useProgram(vortP.p); gl.uniform2f(vortP.u.texelSize, velocity.texelSizeX, velocity.texelSizeY); gl.uniform1i(vortP.u.uVelocity, velocity.read.attach(0)); gl.uniform1i(vortP.u.uCurl, curl.attach(1)); gl.uniform1f(vortP.u.curl, cfg.CURL); gl.uniform1f(vortP.u.dt, dt); blit(velocity.write); velocity.swap();
      gl.useProgram(divP.p); gl.uniform2f(divP.u.texelSize, velocity.texelSizeX, velocity.texelSizeY); gl.uniform1i(divP.u.uVelocity, velocity.read.attach(0)); blit(divergence);
      gl.useProgram(clearP.p); gl.uniform1i(clearP.u.uTexture, pressure.read.attach(0)); gl.uniform1f(clearP.u.value, cfg.PRESSURE); blit(pressure.write); pressure.swap();
      gl.useProgram(presP.p); gl.uniform2f(presP.u.texelSize, velocity.texelSizeX, velocity.texelSizeY); gl.uniform1i(presP.u.uDivergence, divergence.attach(0));
      for(let i=0;i<cfg.PRESSURE_ITERATIONS;i++){ gl.uniform1i(presP.u.uPressure, pressure.read.attach(1)); blit(pressure.write); pressure.swap(); }
      gl.useProgram(gradP.p); gl.uniform2f(gradP.u.texelSize, velocity.texelSizeX, velocity.texelSizeY); gl.uniform1i(gradP.u.uPressure, pressure.read.attach(0)); gl.uniform1i(gradP.u.uVelocity, velocity.read.attach(1)); blit(velocity.write); velocity.swap();
      gl.useProgram(advP.p); gl.uniform2f(advP.u.texelSize, velocity.texelSizeX, velocity.texelSizeY); let vid=velocity.read.attach(0); gl.uniform1i(advP.u.uVelocity, vid); gl.uniform1i(advP.u.uSource, vid); gl.uniform1f(advP.u.dt, dt); gl.uniform1f(advP.u.dissipation, cfg.VELOCITY_DISSIPATION); blit(velocity.write); velocity.swap();
      gl.uniform1i(advP.u.uVelocity, velocity.read.attach(0)); gl.uniform1i(advP.u.uSource, dye.read.attach(1)); gl.uniform1f(advP.u.dissipation, cfg.DENSITY_DISSIPATION); blit(dye.write); dye.swap();
    }

    function render(){ gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.BLEND); gl.useProgram(dispP.p); if(cfg.SHADING){ gl.uniform2f(dispP.u.texelSize, 1.0/(gl.drawingBufferWidth||1), 1.0/(gl.drawingBufferHeight||1)); } gl.uniform1i(dispP.u.uTexture, dye.read.attach(0)); blit(null); }

    function correctRadius(r){ const ar = (canvas.width||1)/(canvas.height||1); if(ar>1) r *= ar; return r; }
    function splat(x,y,dx,dy,color){ gl.useProgram(splatP.p); gl.uniform1i(splatP.u.uTarget, velocity.read.attach(0)); gl.uniform1f(splatP.u.aspectRatio, (canvas.width||1)/(canvas.height||1)); gl.uniform2f(splatP.u.point, x, y); gl.uniform3f(splatP.u.color, dx, dy, 0.0); gl.uniform1f(splatP.u.radius, correctRadius(cfg.SPLAT_RADIUS/100.0)); blit(velocity.write); velocity.swap(); gl.uniform1i(splatP.u.uTarget, dye.read.attach(0)); gl.uniform3f(splatP.u.color, color.r, color.g, color.b); blit(dye.write); dye.swap(); }

    const emitters = [];
    function rand(a,b){ return a + Math.random()*(b-a); }
    function initEmitters(){ const n = cfg.EMITTERS; for(let i=0;i<n;i++){ emitters.push({ x:Math.random(), y:Math.random(), tx:Math.random(), ty:Math.random(), t:0, period:rand(4,8), hue:Math.random(), timer:rand(0,cfg.EMIT_INTERVAL) }); } }
    function tickEmitters(dt){ for(const e of emitters){ e.t += dt / e.period; if(e.t>=1){ e.t=0; e.period=rand(4,8); e.tx=Math.random(); e.ty=Math.random(); } const k = e.t<.5? 2*e.t*e.t : -1 + (4-2*e.t)*e.t; const nx=(1-k)*e.x + k*e.tx; const ny=(1-k)*e.y + k*e.ty; const dx=nx-e.x, dy=ny-e.y; e.x=clamp01(nx); e.y=clamp01(ny); e.hue=(e.hue + cfg.HUE_SPEED*dt)%1; e.timer -= dt; if(e.timer<=0){ e.timer += cfg.EMIT_INTERVAL*rand(0.7,1.3); const col=hsv(e.hue, cfg.SAT, cfg.VAL); splat(e.x, e.y, dx*cfg.SPLAT_FORCE, dy*cfg.SPLAT_FORCE, col); } } }

    function getResized(){ const w=scaleByPixelRatio(canvas.clientWidth||window.innerWidth); const h=scaleByPixelRatio(canvas.clientHeight||window.innerHeight); if(canvas.width!==w||canvas.height!==h){ canvas.width=w; canvas.height=h; return true; } return false; }

    function frame(){ if(getResized()) initFBOs(); const dt = 0.016; tickEmitters(dt); step(dt); render(); requestAnimationFrame(frame); }

    initFBOs(); initEmitters(); frame();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

