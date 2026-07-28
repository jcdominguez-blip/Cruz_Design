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
    
    // ── SCROLL STATE (proxies leídos por el render loop) ──
    // La esfera queda SIEMPRE centrada (sin desplazamiento en X). El scroll
    // solo controla su escala (zoom) y su atenuación (dim). Los reveals de
    // texto NO son scrubbeados: se disparan por umbral y se reproducen solos,
    // dejando el H1 estático y legible durante toda la banda de la fase.
    const sphereState = { scale: 1, dim: 0 };
    let curScale = 1, curDim = 0;

    const heroText   = document.getElementById('hero-text');
    const statStrip  = document.getElementById('stat-strip');
    const invertBg   = document.getElementById('hero-invert-bg');
    const statements = gsap.utils.toArray('.hero-statement');

    // Colores del design system
    const C_CREMA = '#FFFDF3';
    const C_DARK  = '#1D1E1C';
    const RGB_WHITE = { r: 1, g: 1, b: 1 };
    const RGB_DARK  = { r: 29/255, g: 30/255, b: 28/255 }; // #1D1E1C

    // ── SPLIT EN PALABRAS ── cada .hs-inner se parte en <span.hs-word> para
    // un reveal palabra por palabra (blur + slide) más orgánico y dinámico.
    statements.forEach(st => {
      st.querySelectorAll('.hs-inner').forEach(inner => {
        const nodes = Array.from(inner.childNodes);
        const frag = document.createDocumentFragment();
        nodes.forEach(node => {
          if (node.nodeType === 3) { // texto suelto → una palabra por token
            node.textContent.split(/(\s+)/).forEach(tok => {
              if (tok === '') return;
              if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span');
              w.className = 'hs-word';
              w.textContent = tok;
              frag.appendChild(w);
            });
          } else { // elemento (p.ej. .hl) → cuenta como una palabra
            node.classList.add('hs-word');
            frag.appendChild(node);
          }
        });
        inner.textContent = '';
        inner.appendChild(frag);
      });
    });
    const wordsOf = el => el.querySelectorAll('.hs-word');

    // Configuración de las 3 fases (fondo / texto / color de esfera / statement)
    const PHASES = [
      { bg: C_DARK,  fg: C_CREMA, sphere: RGB_WHITE, stmt: statements[0] },
      { bg: C_CREMA, fg: C_DARK,  sphere: RGB_DARK,  stmt: statements[1] },
      { bg: C_DARK,  fg: C_CREMA, sphere: RGB_WHITE, stmt: statements[2] },
    ];

    // Estado inicial: sin texto, fondo transparente (se ve el Silk original)
    statements.forEach(st => {
      gsap.set(st, { opacity: 0 });
      gsap.set(wordsOf(st), { yPercent: 115, opacity: 0, filter: 'blur(10px)' });
    });
    gsap.set(heroText, { color: C_CREMA, opacity: 0 });
    gsap.set(invertBg, { backgroundColor: C_DARK, opacity: 0 });

    let currentPhase = -1, phaseTween = null;

    function resetHero() {
      if (currentPhase === -1) return;
      currentPhase = -1;
      if (phaseTween) phaseTween.kill();
      gsap.set(heroText, { opacity: 0 });
      gsap.set(invertBg, { opacity: 0 });
      gsap.to(mat.color, { r: 1, g: 1, b: 1, duration: 0.4 });
      gsap.to(statStrip, { opacity: 0, duration: 0.4, overwrite: 'auto' });
      statements.forEach(st => {
        gsap.set(st, { opacity: 0 });
        gsap.set(wordsOf(st), { yPercent: 115, opacity: 0, filter: 'blur(10px)' });
      });
    }

    // ── SCRAMBLE REVEAL del stat-strip (LOCATION / LIVE DATA / SAY HELLO) ──
    // Efecto tipo GSAP ScrambleText hecho a mano (el plugin oficial es de pago).
    // Baraja glifos y va fijando el texto real de izquierda a derecha.
    const SCRAMBLE_GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>_[]#*+=';
    function scrambleReveal(el, dur = 0.8) {
      const finalText = (el.dataset.final ?? el.textContent).trim();
      el.dataset.final = finalText;
      const len = finalText.length;
      const o = { p: 0 };
      gsap.to(o, {
        p: 1, duration: dur, ease: 'power2.out',
        onUpdate() {
          const locked = Math.floor(o.p * len);
          let out = finalText.slice(0, locked);
          for (let i = locked; i < len; i++) {
            out += finalText[i] === ' '
              ? ' '
              : SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0];
          }
          el.textContent = out;
        },
        onComplete() { el.textContent = finalText; }
      });
    }

    let statStripRevealed = false;
    function revealStatStrip() {
      if (statStripRevealed || !statStrip) return;
      statStripRevealed = true;
      // Labels + valores estáticos (ubicación, email). El reloj/clima viven en
      // tiempo real (setInterval) → se quedan con fade simple, sin scramble.
      const targets = [...statStrip.querySelectorAll('.mono-tag')];
      statStrip.querySelectorAll('.context-data').forEach(el => {
        if (!el.querySelector('#hero-clock')) targets.push(el);
      });
      targets.forEach((el, i) => {
        gsap.delayedCall(0.15 + i * 0.1, () => scrambleReveal(el, 0.8));
      });
    }

    // Reveal autónomo de una fase (dinámico, tipo ouro-labs). Al cruzar el
    // umbral: sale el statement previo, se invierte el fondo SIN texto en
    // pantalla, y entra el nuevo palabra por palabra.
    function goToPhase(n) {
      if (n === currentPhase) return;
      const prev = currentPhase;
      currentPhase = n;
      const ph = PHASES[n];
      if (phaseTween) phaseTween.kill();

      const tl = gsap.timeline();
      gsap.set(heroText, { opacity: 1 });
      // La franja de datos acompaña solo los estados oscuros (0 y 2).
      gsap.to(statStrip, { opacity: (n === 1 ? 0 : 1), duration: 0.5, overwrite: 'auto' });
      if (n !== 1) revealStatStrip();   // scramble solo la primera vez

      const first = prev < 0;

      // 1. Salida del statement anterior (rápida, hacia arriba con blur)
      if (!first) {
        const pst = PHASES[prev].stmt;
        tl.to(wordsOf(pst), {
          yPercent: -115, opacity: 0, filter: 'blur(8px)',
          duration: 0.4, stagger: 0.035, ease: 'power3.in'
        }, 0);
        tl.set(pst, { opacity: 0 });
      }

      // 2. Inversión de fondo + esfera + color de texto (cuando ya no hay texto)
      const flipAt = first ? 0 : 0.28;
      tl.to(invertBg,  { backgroundColor: ph.bg, opacity: 1, duration: 0.55, ease: 'power2.inOut' }, flipAt);
      tl.to(mat.color, { r: ph.sphere.r, g: ph.sphere.g, b: ph.sphere.b, duration: 0.55, ease: 'power2.inOut' }, flipAt);
      tl.set(heroText, { color: ph.fg }, first ? 0 : flipAt + 0.12);

      // 3. Entrada del nuevo statement palabra por palabra (blur → nítido)
      const enterAt = first ? 0.15 : 0.5;
      tl.set(ph.stmt, { opacity: 1 }, enterAt - 0.01);
      tl.set(wordsOf(ph.stmt), { yPercent: 115, opacity: 0, filter: 'blur(10px)' }, enterAt - 0.01);
      tl.to(wordsOf(ph.stmt), {
        yPercent: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.9, stagger: 0.055, ease: 'power4.out'
      }, enterAt);

      phaseTween = tl;
    }

    // ── DRIVER DE SCROLL ── zoom/dim scrubbeados + fases por umbral.
    ScrollTrigger.create({
      trigger: '#spacer', start: 'top top', end: 'bottom bottom',
      // Al salir del hero, el detector genérico (nav-contrast.js) retoma el control
      onLeave() {
        document.body.removeAttribute('data-nav-force');
        window.cruzNavContrast?.();
      },
      onUpdate(self) {
        const p = self.progress;

        // Zoom centrado: llega a tope antes de que aparezca el texto.
        sphereState.scale = 1 + Math.min(p / 0.14, 1) * 0.55;

        // Umbrales de fase (bandas anchas → mucho tiempo de lectura estático).
        let target;
        if (p < 0.15)      target = -1;   // solo zoom, sin texto
        else if (p < 0.43) target = 0;    // negro / crema
        else if (p < 0.71) target = 1;    // crema / negro (invertido)
        else               target = 2;    // negro / crema (cierre)

        sphereState.dim = target >= 0 ? 0.72 : 0;

        if (target < 0) resetHero();
        else            goToPhase(target);

        // Chrome del hero
        document.getElementById('click-hint')?.classList.toggle('hide', p > 0.01);
        document.getElementById('hero-we-badge')?.classList.toggle('hide', p > 0.05);
        heroText.style.pointerEvents = target >= 0 ? 'auto' : 'none';

        // Contraste de la nav: durante el hero manda la fase (la 1 es crema).
        document.body.setAttribute('data-nav-force', target === 1 ? 'light' : 'dark');
        window.cruzNavContrast?.();
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

    // ── INTRO CINEMÁTICA DE CÁMARA ────────────────────────────────
    // Tras el loader de ingreso, la cámara hace un recorrido orbitando la
    // esfera (estilo threejs webgl_camera) y aterriza en el encuadre de
    // reposo (0,0,REST_Z) mirando al origen. Solo en la primera impresión.
    const REST_Z = 5.5;
    let introActive = false, introDone = false;
    // Recorrido paramétrico: un único progreso p (0→1) define toda la toma.
    const introState = { p: 0 };
    const introCfg = { azStart: 0, radStart: REST_Z, elDown: 0.9, elUp: 0.95 };

    function applyIntroCamera() {
      const p = introState.p;
      // Azimut: orbita varias vueltas y aterriza de frente (az → 0)
      const az  = introCfg.azStart * (1 - p);
      // Elevación: arranca por DEBAJO, sube rodeando por ENCIMA y baja al centro
      const el  = -introCfg.elDown * (1 - p) + introCfg.elUp * Math.sin(p * Math.PI);
      // Radio: orbita lejos casi todo el trayecto y hace ZOOM IN sobre el final
      const rad = introCfg.radStart + (REST_Z - introCfg.radStart) * Math.pow(p, 2.2);
      camera.position.set(
        rad * Math.cos(el) * Math.sin(az),
        rad * Math.sin(el),
        rad * Math.cos(el) * Math.cos(az)
      );
      camera.lookAt(0, 0, 0);
    }

    function startIntro() {
      if (introDone || introActive) return;
      introDone = true; introActive = true;

      const isMobile = window.innerWidth <= 768;
      const TWO_PI = Math.PI * 2;
      const TURNS = isMobile ? 1.1 : 1.6;       // vueltas alrededor de la esfera
      introCfg.azStart  = -(TWO_PI * TURNS);
      introCfg.radStart = isMobile ? 12 : 16;   // distancia inicial (orbita lejana)
      introCfg.elDown   = isMobile ? 0.75 : 0.95; // cuánto arranca por debajo
      introCfg.elUp     = isMobile ? 0.7  : 0.95; // cuánto sube por encima
      introState.p = 0;
      applyIntroCamera();

      // Bloqueo de scroll e interacción durante el recorrido
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      renderer.domElement.style.pointerEvents = 'none';
      window.scrollTo(0, 0);

      gsap.to(introState, {
        p: 1,
        duration: isMobile ? 5.0 : 6.2,
        ease: 'power2.inOut',
        onComplete() {
          introActive = false;
          camera.position.set(0, 0, REST_Z);
          camera.lookAt(0, 0, 0);
          document.body.style.overflow = ''; // siempre termina desbloqueado
          renderer.domElement.style.pointerEvents = '';
        }
      });
    }

    function scheduleIntro() {
      // Respeta reduced-motion y el caso loader salteado → cámara directa al reposo
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || document.documentElement.classList.contains('skip-loader')) {
        introDone = true; return;
      }
      const loaderEl = document.getElementById('loader');
      if (!loaderEl) { startIntro(); return; }
      if (loaderEl.classList.contains('hidden')) { startIntro(); return; }
      // Disparador principal: el loader avisa al iniciar su salida → la cámara
      // arranca mientras el loader se desvanece encima (transición continua).
      window.addEventListener('cruz:intro-exit', startIntro);
      // Respaldo: si el loader recibe .hidden sin haber emitido el evento.
      const mo = new MutationObserver(() => {
        if (loaderEl.classList.contains('hidden')) { mo.disconnect(); startIntro(); }
      });
      mo.observe(loaderEl, { attributes: true, attributeFilter: ['class'] });
      // Failsafe: si el loader nunca se oculta, arrancar igual
      setTimeout(() => { if (!introDone) { mo.disconnect(); startIntro(); } }, 9000);
    }
    scheduleIntro();

    // ── RENDER LOOP (CON OPACIDAD DINÁMICA ACTUALIZADA) ────────────
    let time=0;
    (function animate(){
      requestAnimationFrame(animate);
      time+=0.003;
      sphere.rotation.y+=0.0013;
      sphere.rotation.x=Math.sin(time*.28)*.04;

      // Esfera SIEMPRE centrada; el scroll solo controla el zoom (escala).
      curScale += (sphereState.scale - curScale) * .08;
      sphere.position.x = 0;
      sphere.scale.setScalar(curScale);

      // Opacidad: base 0.42, atenuada por 'dim' cuando aparece el texto por
      // encima (para contraste). El latido sutil se reduce al atenuarse.
      curDim += (sphereState.dim - curDim) * 0.06;
      const base = 0.42 * (1 - curDim * 0.78);
      mat.opacity = Math.max(0.05, base + Math.sin(time * 0.7) * 0.055 * (1 - curDim));

      // Durante la intro, la cámara sigue el recorrido orbital
      if (introActive) applyIntroCamera();

      renderer.render(scene,camera);
    })();

    window.addEventListener('resize',()=>{
      W=window.innerWidth; H=window.innerHeight;
      camera.aspect=W/H; camera.updateProjectionMatrix();
      renderer.setSize(W,H);
    });
});