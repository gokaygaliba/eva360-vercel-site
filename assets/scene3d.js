import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const host = document.getElementById('three-stage');
if (host && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 8.2);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x8abaff, 1.25));
    const key = new THREE.PointLight(0x3c8dff, 38, 18); key.position.set(3, 3, 5); scene.add(key);
    const cyan = new THREE.PointLight(0x59d8ff, 24, 14); cyan.position.set(-4, -1, 3); scene.add(cyan);
    const violet = new THREE.PointLight(0x765bff, 18, 12); violet.position.set(1, -3, -2); scene.add(violet);

    const group = new THREE.Group(); scene.add(group);
    const liquidMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPointer: { value: new THREE.Vector2(0, 0) } },
      vertexShader: `
        uniform float uTime; uniform vec2 uPointer;
        varying vec3 vNormal; varying vec3 vView; varying vec3 vPos;
        void main(){
          vec3 p=position; float n=sin(p.x*3.1+uTime*.8)*cos(p.y*3.4-uTime*.6)*sin(p.z*2.7+uTime*.45);
          p+=normal*(n*.075 + sin(uTime*.7+p.y*5.0)*.025);
          p+=normal*(uPointer.x*p.y*.025 + uPointer.y*p.x*.025);
          vec4 mv=modelViewMatrix*vec4(p,1.0);
          vNormal=normalize(normalMatrix*normal); vView=normalize(-mv.xyz); vPos=p;
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader: `
        uniform float uTime; varying vec3 vNormal; varying vec3 vView; varying vec3 vPos;
        void main(){
          vec3 n=normalize(vNormal); vec3 v=normalize(vView);
          float fres=pow(1.0-max(dot(n,v),0.0),2.3);
          float bands=.5+.5*sin(vPos.y*7.0+vPos.x*3.0+uTime);
          vec3 deep=vec3(.012,.055,.19); vec3 blue=vec3(.08,.38,.95); vec3 cyan=vec3(.45,.85,1.0); vec3 lilac=vec3(.42,.31,.95);
          vec3 col=mix(deep,blue,bands*.48); col=mix(col,cyan,clamp(fres*1.25,0.0,1.0)); col=mix(col,lilac,smoothstep(.68,.98,fres)*.5);
          float highlight=pow(max(dot(reflect(-normalize(vec3(.4,.7,1.0)),n),v),0.0),18.0);
          col+=vec3(.45,.72,1.0)*highlight*.8;
          gl_FragColor=vec4(col, .78+fres*.2);
        }`,
      transparent: true, side: THREE.DoubleSide
    });
    const liquid = new THREE.Mesh(new THREE.TorusKnotGeometry(1.28, .39, 220, 32, 2, 3), liquidMat);
    liquid.scale.set(1.08, .88, .8); group.add(liquid);

    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x397eff, metalness: .28, roughness: .12, transmission: .55, thickness: .8, clearcoat: 1, clearcoatRoughness: .08, transparent: true, opacity: .72 });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(2.05, .012, 12, 180), new THREE.MeshBasicMaterial({ color: 0x398cff, transparent: true, opacity: .48 }));
    halo.rotation.set(1.15, .4, -.3); group.add(halo);
    const halo2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, .009, 8, 160), new THREE.MeshBasicMaterial({ color: 0x9c9cff, transparent: true, opacity: .36 }));
    halo2.rotation.set(.2, 1.1, .8); group.add(halo2);

    const particles = new THREE.Group(); scene.add(particles);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0x83caff, transparent: true, opacity: .75 });
    for (let i=0;i<24;i++) {
      const size=.018+Math.random()*.035;
      const dot=new THREE.Mesh(new THREE.IcosahedronGeometry(size,1),particleMat);
      const a=Math.random()*Math.PI*2, r=2.1+Math.random()*1.2;
      dot.position.set(Math.cos(a)*r,(Math.random()-.5)*3.6,Math.sin(a)*r*.35);
      particles.add(dot);
    }

    const pointer = new THREE.Vector2(0,0), target = new THREE.Vector2(0,0);
    let scrollTarget=0, raf=0, visible=true, disposed=false;
    const onPointer=e=>{const r=host.getBoundingClientRect();target.set(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*-2);};
    const onScroll=()=>{scrollTarget=Math.min(window.scrollY/Math.max(window.innerHeight,1),1);};
    host.addEventListener('pointermove',onPointer,{passive:true});
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
    const ro=new ResizeObserver(resize);ro.observe(host);
    const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});io.observe(host);
    const clock=new THREE.Clock();
    function animate(){
      if(disposed)return;
      raf=requestAnimationFrame(animate);
      if(!visible||document.hidden)return;
      const t=clock.getElapsedTime();
      pointer.lerp(target,.035);
      group.rotation.y=.12+ t*.12 + pointer.x*.22;
      group.rotation.x=Math.sin(t*.24)*.12 + pointer.y*.16;
      group.rotation.z=Math.sin(t*.18)*.08;
      liquidMat.uniforms.uTime.value=t;
      liquidMat.uniforms.uPointer.value.copy(pointer);
      halo.rotation.z=-t*.08; halo2.rotation.y=t*.09;
      particles.rotation.y=-t*.035;
      group.position.y=-scrollTarget*.24;
      camera.position.z=8.2+scrollTarget*.4;
      renderer.render(scene,camera);
    }
    animate();
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible)clock.start();});
    window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();renderer.dispose();},{once:true});
  } catch (err) {
    console.warn('3D scene unavailable; CSS visual fallback remains active.', err);
    host.classList.add('three-fallback');
  }
}
