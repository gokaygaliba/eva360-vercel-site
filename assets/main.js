/* Eva360 V3 interactions + lightweight real-time WebGL atmosphere */
const menuButton=document.querySelector('.menu-toggle');
const navLinks=document.querySelector('.nav-links');
menuButton?.addEventListener('click',()=>{
  const open=navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded',String(open));
});
navLinks?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  navLinks.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false');
}));

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=matchMedia('(pointer:fine)').matches;
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}
}),{threshold:.12,rootMargin:'0px 0px -35px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const progress=document.getElementById('progress');
const nav=document.querySelector('.nav');
let scrollBusy=false;
function updateScroll(){
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=(max>0?(scrollY/max)*100:0)+'%';
  nav?.classList.toggle('is-scrolled',scrollY>24);
  document.documentElement.style.setProperty('--page-scroll',String(scrollY));
  scrollBusy=false;
}
window.addEventListener('scroll',()=>{if(!scrollBusy){requestAnimationFrame(updateScroll);scrollBusy=true;}},{passive:true});
updateScroll();

// Pointer-following light and restrained 3D tilt across service + portfolio cards.
if(finePointer&&!reduceMotion){
  document.querySelectorAll('.service-card,.work-card,.team-card').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const x=e.clientX-r.left,y=e.clientY-r.top;
      const px=x/r.width,py=y/r.height;
      card.style.setProperty('--mx',x+'px');card.style.setProperty('--my',y+'px');
      const strength=card.classList.contains('team-card')?3.2:5.5;
      const rx=(.5-py)*strength,ry=(px-.5)*strength;
      const lift=card.matches(':hover')?-5:0;
      card.style.transform=`perspective(850px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${lift}px)`;
      card.style.zIndex='4';
    });
    card.addEventListener('pointerleave',()=>{
      card.style.transform='';
      card.style.zIndex='';
    });
  });
}

// Lightweight WebGL shader: animated blue aurora / liquid light field.
// Falls back gracefully to the CSS gradients if WebGL is unavailable.
(function initWebGL(){
  const canvas=document.getElementById('webgl-canvas');
  if(!canvas||reduceMotion)return;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});
  if(!gl){canvas.classList.add('webgl-fallback');return;}
  const vertex=`attribute vec2 p; varying vec2 vUv; void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
  const fragment=`precision mediump float;
    varying vec2 vUv; uniform float uTime; uniform vec2 uPointer; uniform float uScroll;
    float blob(vec2 uv,vec2 pos,float radius){float d=length(uv-pos);return exp(-d*d/radius);}
    void main(){
      vec2 uv=vUv; float t=uTime*.11;
      vec2 p=uPointer*.5+.5;
      float wave=sin(uv.x*5.0+t+sin(uv.y*4.0-t))*0.035;
      wave+=cos(uv.y*7.0-t*.8+uv.x*2.0)*0.022;
      vec2 q=uv+vec2(wave,wave*.65);
      float a=blob(q,vec2(.77+sin(t)*.06,.54+cos(t*.8)*.08),.075);
      float b=blob(q,vec2(.24+cos(t*.7)*.08,.28+sin(t)*.05),.055);
      float c=blob(q,p,.12)*.22;
      float ribbon=exp(-pow((q.y-(.22+sin(q.x*5.0+t)*.07+uScroll*.000018))/.055,2.0))*.13;
      vec3 blue=vec3(.025,.22,.72); vec3 cyan=vec3(.06,.55,.95); vec3 violet=vec3(.24,.16,.62);
      vec3 col=blue*a+cyan*b+violet*c+cyan*ribbon;
      float edge=smoothstep(0.0,.5,uv.x)*smoothstep(0.0,.5,uv.y);
      col*=edge*.72;
      float alpha=clamp((a+b+c+ribbon)*.8,0.0,.48);
      gl_FragColor=vec4(col,alpha);
    }`;
  function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
  if(!vs||!fs){canvas.classList.add('webgl-fallback');return;}
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){canvas.classList.add('webgl-fallback');return;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const timeLoc=gl.getUniformLocation(program,'uTime'),pointerLoc=gl.getUniformLocation(program,'uPointer'),scrollLoc=gl.getUniformLocation(program,'uScroll');
  let pointer=[.5,.5],start=performance.now(),frame=0,visible=true;
  const resize=()=>{const dpr=Math.min(devicePixelRatio||1,1.35);const w=Math.max(1,Math.floor(canvas.clientWidth*dpr)),h=Math.max(1,Math.floor(canvas.clientHeight*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});observer.observe(canvas);
  window.addEventListener('resize',resize,{passive:true});resize();
  window.addEventListener('pointermove',e=>{pointer=[e.clientX/innerWidth,1-e.clientY/innerHeight];},{passive:true});
  function render(now){
    if(!document.hidden&&visible){
      resize();gl.useProgram(program);
      gl.uniform1f(timeLoc,(now-start)/1000);
      gl.uniform2f(pointerLoc,pointer[0],pointer[1]);
      gl.uniform1f(scrollLoc,window.scrollY||0);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
    frame=requestAnimationFrame(render);
  }
  frame=requestAnimationFrame(render);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else frame=requestAnimationFrame(render);});
})();

// Small depth movement for the hero visual.
const art=document.querySelector('.hero-art');
if(art&&finePointer&&!reduceMotion){
  window.addEventListener('pointermove',e=>{
    const x=(e.clientX/innerWidth-.5)*7,y=(e.clientY/innerHeight-.5)*7;
    art.style.transform=`translate3d(${x}px,${y}px,0)`;
  },{passive:true});
}

// Accessible FAQ: keep the open state calm and predictable.
document.querySelectorAll('.faq-item').forEach(item=>{
  item.addEventListener('toggle',()=>{
    if(item.open)document.querySelectorAll('.faq-item').forEach(other=>{if(other!==item)other.open=false;});
  });
});

// Contact form: open a prefilled email draft (no form data is stored on the site).
document.getElementById('lead-form')?.addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const subject=encodeURIComponent('Eva360 Proje Talebi — '+data.get('service'));
  const body=encodeURIComponent(
    'Ad / Şirket: '+data.get('name')+'\nE-posta: '+data.get('email')+
    '\nHizmet: '+data.get('service')+'\n\nProje detayı:\n'+(data.get('message')||'')
  );
  window.location.href='mailto:merhaba@eve360dijital.com?subject='+subject+'&body='+body;
});

// Mobile navigation accessibility and active-section indicator.
const navToggle=document.querySelector('.menu-toggle');
navToggle?.addEventListener('keydown',e=>{if(e.key==='Escape'){navLinks?.classList.remove('open');navToggle.setAttribute('aria-expanded','false');navToggle.focus();}});
const sectionLinks=[...document.querySelectorAll('.nav-links a')];
const sectionObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      sectionLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));
    }
  });
},{rootMargin:'-35% 0px -55% 0px'});
document.querySelectorAll('main section[id]').forEach(section=>sectionObserver.observe(section));

// Make every external link opened in a new tab safe; preserve mailto/tel behavior.
document.querySelectorAll('a[target="_blank"]').forEach(a=>a.setAttribute('rel','noopener noreferrer'));
