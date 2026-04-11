/**
 * SISTEMA CRUZ ESTUDIO ® - 3D Sphere Interactive Engine
 * REEMPLAZAR TODO EL CONTENIDO DE hero-3d.js POR ESTE CÓDIGO
 * FIX DEFINITIVO: Contraste Mobile Sincronizado con Texto + Sistema Integral
 */

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById('canvas-wrap')) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
   // ── DATA PROYECTOS (ORDEN SINCRONIZADO CON LA LISTA) ──
    const PROJECTS = [
      {
        label: 'BRANDING · IDENTIDAD',
        title: 'Trenes Argentinos Cargas',
        desc: 'Rediseño del sistema visual ferroviario.',
        img: 'https://i.ibb.co/dmkbM0K/tac.jpg' 
      },
      {
        label: 'MARCA GESTIÓN',
        title: 'Municipalidad de San Cristobal',
        desc: 'Revitalización del escudo y marca gestión.',
        img: 'https://i.ibb.co/gb4PTXst/img4.jpg' 
      },
      {
        label: 'BRANDING · IDENTIDAD',
        title: 'SUUAM',
        desc: 'Identidad de alto rendimiento gráfico.',
        img: 'https://i.ibb.co/357FqBCw/tp1.jpg' 
      },
      {
        label: 'BRANDING · IDENTIDAD',
        title: 'Rovex',
        desc: 'Identidad sólida para maquinaria vial.',
        img: './img/ROVEX-PREVIEW.png' 
      }
    ];
    
    // ── PERLIN NOISE ──────────────────────────────────────────
    const _p = Array.from({length:256},(_,i)=>i).sort(()=>Math.random()-.5);
    const PP = [..._p,..._p];
    const fd = t=>t*t*t*(t*(t*6-15)+10);
    const lp = (t,a,b)=>a+t*(b-a);
    function gr(h,x,y,z){h&=15;const u=h<8?x:y,v=h<4?y:(h===12||h===14?x:z);return((h&1)?-u:u)+((h&2)?-v:v);}
    function noise(x,y,z){
      const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;
      x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);
      const u=fd(x),v=fd(y),w=fd(z);
      const A=PP[X]+Y,AA=PP[A]+Z,AB=PP[A+1]+Z,B=PP[X+1]+Y,BA=PP[B]+Z,BB=PP[B+1]+Z;
      return lp(w,lp(v,lp(u,gr(PP[AA],x,y,z),gr(PP[BA],x-1,y,z)),lp(u,gr(PP[AB],x,y-1,z),gr(PP[BB],x-1,y-1,z))),lp(v,lp(u,gr(PP[AA+1],x,y,z-1),gr(PP[BA+1],x-1,y,z-1)),lp(u,gr(PP[AB+1],x,y-1,z-1),gr(PP[BB+1],x-1,y-1,z-1))));
    }
    
    // ── THREE.JS SETUP ──────────────────────────────────────────────
    let W = window.innerWidth, H = window.innerHeight;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(52, W/H, 0.1, 100);
    camera.position.z = 5.5;
    
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    document.getElementById('canvas-wrap').appendChild(renderer.domElement);
    
    // ── GENERATE SPHERE ────────────────────────────────────────────────
    const SEG = 76;
    const geo  = new THREE.SphereGeometry(2, SEG, SEG);
    const pos  = geo.attributes.position;
    const N    = pos.count;
    const base = new Float32Array(N * 3);
    
    for (let i = 0; i < N; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const len = Math.sqrt(x*x + y*y + z*z);
      const nx = x/len, ny = y/len, nz = z/len;
      const n = noise(nx*2.4, ny*2.4, nz*2.4)*0.32 + noise(nx*5.2, ny*5.2, nz*5.2)*0.10;
      const r = 2 + n;
      base[i*3]=nx*r; base[i*3+1]=ny*r; base[i*3+2]=nz*r;
      pos.setXYZ(i, nx*r, ny*r, nz*r);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    
    const mat = new THREE.MeshBasicMaterial({ color:0xffffff, wireframe:true, transparent:true, opacity:0.42 });
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);
    
    const ray   = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // ── SCROLL STATE & BOOSTER GLOBAL ──
    let targetX=0, targetScale=1, curX=0, curScale=1;
    let mobileOpacityBoost = 0; // Accesible en ScrollTrigger y Render Loop
    
    const heroText  = document.getElementById('hero-text');
    const statStrip = document.getElementById('stat-strip');
    
    ScrollTrigger.create({
      trigger: '#spacer', 
      start: 'top top', 
      end: 'bottom bottom', 
      scrub: 1.2,
      onUpdate(self) {
        const p = self.progress;
        
        // 1. Calculamos primero la visibilidad del texto (Shared Scope)
        let currentTextAlpha = 0;
        if(p < 0.22) {
          currentTextAlpha = 0;
        } else {
          // Curva de entrada acelerada
          const entranceT = (p - 0.22) / 0.12; 
          currentTextAlpha = Math.min(entranceT * entranceT, 1); 
        }

       // --- 2. NUEVO FIX CONTRASTE MOBILE (SUBTILE DIM) ---
        if (window.innerWidth <= 768) {
            // En móvil, cuando el texto aparece (currentTextAlpha sube), 
            // RESTAMOS opacidad a la esfera para que no compita.
            // Pasa de 0.42 a ~0.10 cuando el texto está al 100%.
            mobileOpacityBoost = -(currentTextAlpha * 0.32); 
        } else {
            mobileOpacityBoost = 0;
        }

        // Lógica de visibilidad del Hint
        const clickHint = document.getElementById('click-hint');
        if(p > 0.01) clickHint?.classList.add('hide');
        else clickHint?.classList.remove('hide');

        // Lógica de posición y opacidad del Hero Text (GSAP)
        if(p < 0.22) {
          targetScale = 1; targetX = 0;
          gsap.set(heroText, { opacity: 0, y: 15, pointerEvents: 'none' });
          gsap.set(statStrip, { opacity: 0 });
        } 
        else {
          targetScale = 1 + (p * 0.45); 
          targetX = (p - 0.22) * 2.8;   
          
          gsap.set(heroText, {
            opacity: currentTextAlpha, // Usamos la variable compartida
            y: 10 * (1 - currentTextAlpha),
            pointerEvents: currentTextAlpha > 0.8 ? 'all' : 'none' 
          });
          gsap.set(statStrip, { opacity: currentTextAlpha });
        }
      }
    });
    
    // ── EXTRUSION LOGIC ─────────────────────────────────────────────
    let extVerts=[], extTween=null, isExtruded=false;
    
    function findVerts(lp, radius){
      const out=[];
      for(let i=0;i<N;i++){
        const vx=base[i*3],vy=base[i*3+1],vz=base[i*3+2];
        const d=Math.sqrt((vx-lp.x)**2+(vy-lp.y)**2+(vz-lp.z)**2);
        if(d<radius) out.push({idx:i, f:1-d/radius});
      }
      return out;
    }
    
    function applyExt(verts, t, amt){
      for(const v of verts){
        const vx=base[v.idx*3],vy=base[v.idx*3+1],vz=base[v.idx*3+2];
        const l=Math.sqrt(vx*vx+vy*vy+vz*vz)||1;
        const d=t*amt*v.f;
        pos.setXYZ(v.idx, vx+vx/l*d, vy+vy/l*d, vz+vz/l*d);
      }
      pos.needsUpdate=true;
    }
    
    function retract(){
      if(!isExtruded||!extVerts.length) return;
      if(extTween) extTween.kill();
      const o={t:1};
      extTween=gsap.to(o,{t:0,duration:.5,ease:'power2.inOut',
        onUpdate(){ applyExt(extVerts,o.t,0.72); },
        onComplete(){ isExtruded=false; extVerts=[]; gsap.to(mat.color,{r:1,g:1,b:1,duration:.5}); }
      });
    }
    
    function extrude(verts){
      extVerts=verts; isExtruded=true;
      if(extTween) extTween.kill();
      const o={t:0};
      extTween=gsap.to(o,{t:1,duration:.65,ease:'power3.out',
        onUpdate(){ applyExt(verts,o.t,0.72); }
      });
      gsap.to(mat.color,{r:242/255,g:195/255,b:53/255,duration:.25,
        onComplete:()=>gsap.to(mat.color,{r:1,g:1,b:1,duration:1.2,delay:.5})
      });
    }
    
    // ── CARD LOGIC ────────────────────────────────────────────────────────
    const card  = document.getElementById('proj-card');
    const pcLbl = document.getElementById('pc-lbl');
    const pcTtl = document.getElementById('pc-title');
    const pcDsc = document.getElementById('pc-desc');
    const pcImg = document.getElementById('pc-img'); 
    
    function showCard(proj, ex, ey){
      pcLbl.textContent = proj.label;
      pcTtl.textContent = proj.title;
      pcDsc.textContent = proj.desc;
      if(pcImg && proj.img) pcImg.src = proj.img;
      
      const cx = Math.max(20, Math.min(ex+24, W-300));
      const cy = Math.max(70, Math.min(ey-60, H-200));
      card.style.left=cx+'px'; card.style.top=cy+'px';
      card.classList.add('show');
    }
    
    function hideCard(){ card.classList.remove('show'); }
    
    document.getElementById('card-close').addEventListener('click',e=>{
      e.stopPropagation(); hideCard(); retract(); animateHintText('[CLICK EN LA ESFERA]');
    });
    
    let currentProjectIndex = 0; 

    const animateHintText = (newText) => {
        const hintSpan = document.querySelector('#click-hint span');
        if (!hintSpan) return;
        gsap.to(hintSpan, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                hintSpan.textContent = newText;
                gsap.to(hintSpan, { opacity: 1, duration: 0.3 });
            }
        });
    };

    renderer.domElement.addEventListener('click', e => {
        if (isExtruded) { 
            retract(); hideCard(); animateHintText('[CLICK EN LA ESFERA]');
            return; 
        }
        
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera(mouse, camera);
        const hits = ray.intersectObject(sphere);
    
        if (hits.length) {
            animateHintText('[SCROLL PARA DESCUBRIR CRUZ ESTUDIO®]');
            const local = sphere.worldToLocal(hits[0].point.clone());
            let pi = currentProjectIndex;
            currentProjectIndex = (currentProjectIndex + 1) % PROJECTS.length;
            const verts = findVerts(local, 0.88);
            if (verts.length) extrude(verts);
            showCard(PROJECTS[pi], e.clientX, e.clientY);
        }
    });
    
    renderer.domElement.addEventListener('mousemove', e => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera(mouse, camera);
        const isHoveringSphere = ray.intersectObject(sphere).length > 0;
        renderer.domElement.style.cursor = (isHoveringSphere && !isExtruded) ? 'crosshair' : 'default';
    });

    // ── RENDER LOOP (CON OPACIDAD DINÁMICA ACTUALIZADA) ────────────
    let time=0;
    (function animate(){
      requestAnimationFrame(animate);
      time+=0.003;
      sphere.rotation.y+=0.0013;
      sphere.rotation.x=Math.sin(time*.28)*.04;
      curX     +=(targetX    -curX)    *.055;
      curScale +=(targetScale-curScale)*.055;
      sphere.position.x=curX;
      sphere.scale.setScalar(curScale);
      
      // APLICACIÓN TÉCNICA DEL FIX:
      // mat.opacity base es 0.42. 
      // En móvil sumamos 'mobileOpacityBoost' (que sube al ritmo del texto).
      // Math.sin mantiene el latido sutil.
      mat.opacity = (0.42 + mobileOpacityBoost) + Math.sin(time * 0.7) * 0.06;
      
      renderer.render(scene,camera);
    })();
    
    window.addEventListener('resize',()=>{
      W=window.innerWidth; H=window.innerHeight;
      camera.aspect=W/H; camera.updateProjectionMatrix();
      renderer.setSize(W,H);
    });
});