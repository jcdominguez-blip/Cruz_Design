/**
 * SISTEMA CRUZ ESTUDIO ® - 3D Sphere Interactive Engine
 * REEMPLAZAR TODO EL CONTENIDO DE hero-3d.js POR ESTE CÓDIGO
 * FIX DEFINITIVO: Contraste Mobile Sincronizado con Texto + Sistema Integral
 */

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById('canvas-wrap')) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
   // ── DATA PROYECTOS ── (label/desc bilingües: base ES + variantes EN; el título
   //    es nombre propio, no se traduce). El idioma se sincroniza con el switch
   //    del nav vía localStorage 'cruz-lang', igual que trabajos-canvas.js/about.js.
    const PROJECTS = [
      { label: 'BRANDING · IDENTIDAD',   labelEn: 'BRANDING · IDENTITY',   title: 'Trenes Argentinos Cargas',       desc: 'Rediseño del sistema visual ferroviario.',    descEn: 'Redesign of the railway visual system.',        img: '/img/tac-index.png',            url: '/trenescargas' },
      { label: 'MARCA GESTIÓN',          labelEn: 'GOVERNMENT BRANDING',   title: 'Municipalidad de San Cristóbal', desc: 'Revitalización del escudo y marca gestión.',  descEn: 'Revitalization of the crest and civic brand.',  img: '/img/sc-index.png',             url: '/sc' },
      { label: 'BRANDING · IDENTIDAD',   labelEn: 'BRANDING · IDENTITY',   title: 'SUUAM',                          desc: 'Identidad de alto rendimiento gráfico.',      descEn: 'High-performance graphic identity.',            img: '/img/suuam-index.png',          url: '/suuam' },
      { label: 'IDENTIDAD · MAQUINARIA', labelEn: 'IDENTITY · MACHINERY',  title: 'Rovex',                          desc: 'Identidad sólida para maquinaria vial.',      descEn: 'A solid identity for road machinery.',          img: '/img/rovex-index.png',          url: '/rovex' },
      { label: 'BRANDING · TERRITORIO',  labelEn: 'BRANDING · TERRITORY',  title: 'Estación Sur',                   desc: 'Sistema de marca para un polo gastronómico.', descEn: 'Brand system for a gastronomic hub.',           img: '/img/estacion-sur-img-1.webp',  url: '/estacion-sur' },
      { label: 'PACKAGING · MARCA',      labelEn: 'PACKAGING · BRAND',     title: 'Pinta Gaucha',                   desc: 'Identidad y packaging con raíz local.',       descEn: 'Identity and packaging with local roots.',      img: '/img/nueva-img-pinta-01.webp',  url: '/pinta-gaucha' },
      { label: 'IDENTIDAD · EVENTOS',    labelEn: 'IDENTITY · EVENTS',     title: 'Vientos de Ruta',                desc: 'Marca para la experiencia en ruta.',          descEn: 'A brand for the on-the-road experience.',       img: '/img/vdr-header.webp',          url: '/vientos-de-ruta' },
    ];

    // Idioma actual (el toggle del nav recarga la página, así que basta leerlo una vez).
    const LANG = (function(){ try { return localStorage.getItem('cruz-lang') === 'en' ? 'en' : 'es'; } catch(e){ return 'es'; } })();
    const T = {
      es: { hint: '[CLICk EN LA ESFERA]', cursor: 'Cerrar para elegir otro', cta: 'Ver caso' },
      en: { hint: '[CLICK THE SPHERE]',   cursor: 'Close to pick another',   cta: 'View case' }
    }[LANG];
    
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

    // ── MORPH DE FORMAS ("las ideas se transforman") ───────────────────────
    // El keyvisual muta entre formas SIN romper el estilo lineal: se conserva la
    // MISMA malla wireframe (mismos vértices y aristas) y solo cambia el radio
    // por dirección (campos radiales). Todas las formas usadas son "estrelladas"
    // respecto al centro → el morph es limpio, sin cruces raras de aristas.
    const dir = new Float32Array(N * 3);   // dirección unitaria de cada vértice
    for (let i = 0; i < N; i++) {
      const x = base[i*3], y = base[i*3+1], z = base[i*3+2];
      const l = Math.hypot(x, y, z) || 1;
      dir[i*3] = x/l; dir[i*3+1] = y/l; dir[i*3+2] = z/l;
    }
    const EPS = 1e-6;
    const SHAPE_RADIUS = {
      // Cruz 3D: unión de 3 barras ortogonales (símbolo de la marca).
      cross(dx, dy, dz) {
        const L = 2.55, t = 0.72;                 // largo de brazo · semi-espesor
        const ax = Math.abs(dx)||EPS, ay = Math.abs(dy)||EPS, az = Math.abs(dz)||EPS;
        return Math.max(
          Math.min(L/ax, t/ay, t/az),
          Math.min(t/ax, L/ay, t/az),
          Math.min(t/ax, t/ay, L/az)
        );
      },
      // Diamante (octaedro): |x|+|y|+|z| = c.
      diamond(dx, dy, dz) {
        return 2.5 / (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) || EPS);
      },
      // Cubo redondeado (superquadric de exponente alto).
      cube(dx, dy, dz) {
        const n = 6, c = 1.95;
        return c / Math.pow(Math.pow(Math.abs(dx),n) + Math.pow(Math.abs(dy),n) + Math.pow(Math.abs(dz),n), 1/n);
      }
    };
    function buildShape(name) {
      const arr = new Float32Array(N * 3);
      if (name === 'sphere') { arr.set(base); return arr; }        // esfera orgánica original
      if (name === 'figure') return fitShape(buildFigure(arr));    // busto/figura
      if (name === 'house')  return fitShape(buildHouse(arr));     // casa
      if (name === 'tree')   return fitShape(buildTree(arr));      // árbol
      if (name === 'bird')   return fitShape(buildBird(arr), 4.0); // ave (más ancha)
      const fn = SHAPE_RADIUS[name];
      for (let i = 0; i < N; i++) {
        const dx = dir[i*3], dy = dir[i*3+1], dz = dir[i*3+2];
        const nz = noise(dx*2.4, dy*2.4, dz*2.4) * 0.06;      // respiración sutil, como la esfera
        const r = fn(dx, dy, dz) + nz;
        arr[i*3] = dx*r; arr[i*3+1] = dy*r; arr[i*3+2] = dz*r;
      }
      return arr;
    }

    // Todas las formas complejas comparten el mismo truco: NO son radiales, sino
    // un mapeo SUAVE por "anillos" — la latitud del vértice (s: 0 corona → 1 base)
    // define la altura y su azimut lo ubica en el anillo. Así las latitudes de la
    // esfera se vuelven secciones horizontales de la forma, conservando la
    // vecindad de los vértices → el wireframe drapea limpio (sin aristas cruzadas)
    // y vuelve a la esfera de forma natural.

    // Busto/figura humana estilizada (cabeza → cuello → hombros).
    function buildFigure(arr) {
      for (let i = 0; i < N; i++) {
        const dx = dir[i*3], dy = dir[i*3+1], dz = dir[i*3+2];
        const ang = Math.atan2(dz, dx);
        const s = (1 - dy) / 2;                 // 0 = arriba, 1 = abajo
        let y, rx, rz, front = 0;
        if (s < 0.34) {                          // CABEZA (elipsoide)
          const u = s / 0.34;
          y = 2.05 - u * 1.42;                   // corona → mentón
          const w = Math.sin(u * Math.PI) * 0.52 + 0.5;
          rx = 0.90 * w; rz = 1.00 * w;
          // leve empuje frontal (z+) a media cara → insinúa nariz/frente
          front = Math.max(0, Math.sin(u * Math.PI)) * Math.max(0, Math.sin(ang)) * 0.18;
        } else if (s < 0.46) {                   // CUELLO
          const u = (s - 0.34) / 0.12;
          y = 0.63 - u * 0.5;
          rx = 0.40 - u * 0.02; rz = 0.44;
        } else {                                 // HOMBROS / TORSO
          const u = (s - 0.46) / 0.54;
          y = 0.13 - u * 2.5;
          rx = 0.5 + u * 1.85;                   // se abre a los hombros
          rz = 0.55 + u * 0.22;                  // busto poco profundo
        }
        const nz = noise(dx*3, dy*3, dz*3) * 0.03;
        arr[i*3]   = Math.cos(ang) * rx + nz;
        arr[i*3+1] = y + nz;
        arr[i*3+2] = Math.sin(ang) * rz + front + nz;
      }
      return arr;
    }

    // Sección cuadrada (para formas "duras" como la casa): mapea el azimut a un
    // cuadrado de semilado hw en vez de un círculo.
    function squareXZ(ang, hw) {
      const c = Math.cos(ang), s = Math.sin(ang);
      const k = hw / Math.max(Math.abs(c), Math.abs(s), 1e-6);
      return [c * k, s * k];
    }

    // Casa: cuerpo (caja) + techo (pirámide), sección cuadrada.
    function buildHouse(arr) {
      for (let i = 0; i < N; i++) {
        const dx = dir[i*3], dy = dir[i*3+1], dz = dir[i*3+2];
        const ang = Math.atan2(dz, dx);
        const s = (1 - dy) / 2;
        let y, hw;
        if (s < 0.34) {                 // TECHO (pirámide)
          const u = s / 0.34;           // 0 vértice → 1 alero
          y = 2.0 - u * 1.0;
          hw = u * 1.65;                // sale del pico y se abre (con alero)
        } else {                        // CUERPO (caja)
          const u = (s - 0.34) / 0.66;
          y = 1.0 - u * 2.6;
          hw = 1.28;
        }
        const [px, pz] = squareXZ(ang, hw);
        const nz = noise(dx*3, dy*3, dz*3) * 0.02;
        arr[i*3] = px + nz; arr[i*3+1] = y + nz; arr[i*3+2] = pz + nz;
      }
      return arr;
    }

    // Árbol: copa (esfera) arriba + tronco (cilindro fino) abajo.
    function buildTree(arr) {
      const R = 1.5, CY = 0.7;          // radio de copa y su centro
      const canopyBottom = CY - R;      // y donde termina la copa
      for (let i = 0; i < N; i++) {
        const dx = dir[i*3], dy = dir[i*3+1], dz = dir[i*3+2];
        const ang = Math.atan2(dz, dx);
        const s = (1 - dy) / 2;
        let x, y, z;
        if (s < 0.66) {                 // COPA (esfera compacta)
          const th = (s / 0.66) * Math.PI;      // 0..π como una sub-esfera
          const ringR = Math.sin(th) * R;
          y = CY + Math.cos(th) * R;
          x = Math.cos(ang) * ringR;
          z = Math.sin(ang) * ringR;
        } else {                        // TRONCO (cilindro fino)
          const u = (s - 0.66) / 0.34;
          y = canopyBottom - u * 1.15;
          const tr = 0.17;
          x = Math.cos(ang) * tr;
          z = Math.sin(ang) * tr;
        }
        const nz = noise(dx*3, dy*3, dz*3) * 0.04;
        arr[i*3] = x + nz; arr[i*3+1] = y + nz; arr[i*3+2] = z + nz;
      }
      return arr;
    }

    // Ave estilizada en vuelo (gaviota): dos alas simétricas barridas hacia atrás
    // con diedral en "V", cuerpo al centro y cola. Es la forma más abstracta del
    // set. a = posición en la envergadura (−1 izq .. 1 der); s = cuerda (frente↔dorso).
    function buildBird(arr) {
      const SPAN = 2.9;
      for (let i = 0; i < N; i++) {
        const dx = dir[i*3], dy = dir[i*3+1], dz = dir[i*3+2];
        const ang = Math.atan2(dz, dx);
        const a  = Math.cos(ang);              // -1..1 a lo largo del ala
        const aa = Math.abs(a);
        const s  = (1 - dy) / 2;               // 0..1 cuerda del ala
        // Envergadura
        const x = a * SPAN;
        // Cuerda: ancha en el cuerpo, angosta en la punta
        const chord = (1 - aa) * 0.85 + 0.14;
        // Frente/atrás: alas barridas hacia atrás (−z) y cuerpo/pico adelante
        const z = (s - 0.5) * chord * 2.4 - aa * 1.15 + 0.55;
        // Diedral en V (puntas arriba) + leve quiebre de gaviota + espesor mínimo
        const y = aa * 0.62 - Math.sin(aa * Math.PI) * 0.14 - 0.05
                  + (Math.sin(s * Math.PI) - 0.5) * 0.14 * (1 - aa);
        const nz = noise(dx*3, dy*3, dz*3) * 0.025;
        arr[i*3] = x + nz; arr[i*3+1] = y + nz; arr[i*3+2] = z + nz;
      }
      return arr;
    }

    // Escala/centra una forma para que encaje en el cuadro (mismo envoltorio que
    // la esfera), tomando su bounding box. Solo para las formas complejas.
    function fitShape(arr, targetMax = 3.5) {
      let mnx=1e9,mny=1e9,mnz=1e9,mxx=-1e9,mxy=-1e9,mxz=-1e9;
      for (let i = 0; i < N; i++) {
        const x=arr[i*3], y=arr[i*3+1], z=arr[i*3+2];
        if(x<mnx)mnx=x; if(x>mxx)mxx=x;
        if(y<mny)mny=y; if(y>mxy)mxy=y;
        if(z<mnz)mnz=z; if(z>mxz)mxz=z;
      }
      const cx=(mnx+mxx)/2, cy=(mny+mxy)/2, cz=(mnz+mxz)/2;
      const ext=Math.max(mxx-mnx, mxy-mny, mxz-mnz) || 1;
      const k=targetMax/ext;
      for (let i = 0; i < N; i++) {
        arr[i*3]   = (arr[i*3]-cx)*k;
        arr[i*3+1] = (arr[i*3+1]-cy)*k;
        arr[i*3+2] = (arr[i*3+2]-cz)*k;
      }
      return arr;
    }

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
    const sphereState = { scale: 1, offsetX: 0, opacity: 0.5 };
    let curScale = 1, curOffsetX = 0, curOpacity = 0.5;

    const heroText      = document.getElementById('hero-text');
    const heroLead      = document.querySelector('.hero-lead');
    const heroSweep     = document.getElementById('hero-sweep');
    const statStrip     = document.getElementById('stat-strip');
    const invertBg      = document.getElementById('hero-invert-bg');
    const statements    = gsap.utils.toArray('.hero-statement');
    const heroStatement = statements[0];

    // Encuadre de la esfera: offset a la DERECHA + escala de reposo según el
    // viewport, para que quede grande y sangrando por el borde derecho (modelo).
    const REST_SCALE_DESK = 1.22, REST_SCALE_MOB = 1.05;
    let restScale = REST_SCALE_DESK, restOffsetX = 2.1, neutralRGB = { r: 1, g: 1, b: 1 };
    function computeFraming() {
      if (window.innerWidth <= 768) { restScale = REST_SCALE_MOB; restOffsetX = 0; return; }
      const halfW = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z * (W / H);
      restScale = REST_SCALE_DESK;
      restOffsetX = halfW * 0.6;    // centro de la esfera ~80% del ancho (más a la derecha)
    }
    computeFraming();

    // Stat-strip dividido en dos grupos:
    //  · par estático (LOCATION + SAY HELLO): visible ya al ingresar al hero.
    //  · LIVE DATA (reloj + clima): aparece recién al hacer scroll-down.
    const liveItem    = document.getElementById('hero-live-item');
    const staticItems = statStrip
      ? [...statStrip.querySelectorAll('.context-item')].filter(it => it !== liveItem)
      : [];

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

    // Estado inicial: textos ocultos (se revelan tras el barrido crema). El Silk
    // oscuro queda a la vista durante el intro (círculo centrado sobre negro).
    statements.forEach(st => {
      gsap.set(st, { opacity: 0 });
      gsap.set(wordsOf(st), { yPercent: 115, opacity: 0, filter: 'blur(10px)' });
    });
    gsap.set(heroText, { opacity: 0 });
    if (heroLead) gsap.set(heroLead, { opacity: 0, y: 16, filter: 'blur(6px)' });
    if (invertBg) gsap.set(invertBg, { opacity: 0 });
    if (heroSweep) gsap.set(heroSweep, { clipPath: 'inset(100% 0 0 0)' });

    // El contenedor queda visible; la visibilidad se maneja por grupo de items.
    if (statStrip) gsap.set(statStrip, { opacity: 1 });
    if (staticItems.length) gsap.set(staticItems, { opacity: 0 });
    if (liveItem) gsap.set(liveItem, { opacity: 0 });

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

    // Par estático (LOCATION + SAY HELLO): visible desde el ingreso al hero.
    let staticRevealed = false;
    function revealStaticPair() {
      if (!statStrip || !staticItems.length) return;
      gsap.to(staticItems, { opacity: 1, duration: 0.5, overwrite: 'auto' });
      if (staticRevealed) return;   // scramble una sola vez
      staticRevealed = true;
      const targets = [];
      staticItems.forEach(it => {
        it.querySelectorAll('.mono-tag').forEach(t => targets.push(t));
        it.querySelectorAll('.context-data').forEach(d => targets.push(d));
      });
      targets.forEach((el, i) => {
        gsap.delayedCall(0.15 + i * 0.1, () => scrambleReveal(el, 0.8));
      });
    }
    function hideStaticPair() {
      if (staticItems.length) gsap.to(staticItems, { opacity: 0, duration: 0.4, overwrite: 'auto' });
    }

    // LIVE DATA (reloj + clima): aparece recién al hacer scroll-down.
    let liveRevealed = false;
    function revealLiveData() {
      if (!liveItem) return;
      gsap.to(liveItem, { opacity: 1, duration: 0.5, overwrite: 'auto' });
      if (liveRevealed) return;     // scramble del label una sola vez
      liveRevealed = true;
      const tag = liveItem.querySelector('.mono-tag');
      if (tag) gsap.delayedCall(0.1, () => scrambleReveal(tag, 0.8));
    }
    function hideLiveData() {
      if (liveItem) gsap.to(liveItem, { opacity: 0, duration: 0.4, overwrite: 'auto' });
    }

    // ── REVEAL DEL HERO ESTÁTICO (automático) ──
    // Tras aterrizar la cámara (círculo centrado sobre negro), la capa crema
    // BARRE de abajo hacia arriba y queda de fondo; la esfera se corre a la
    // derecha y vira a wireframe oscuro; luego entra el titular palabra por
    // palabra, la bajada y los datos/reconocimientos. Secuencia sin interacción.
    let heroRevealed = false;
    function setNavCream(on) {
      if (on) document.body.setAttribute('data-nav-force', 'light');
      else document.body.removeAttribute('data-nav-force');
      window.cruzNavContrast && window.cruzNavContrast();
    }
    function startHeroReveal(instant) {
      if (heroRevealed) return;
      heroRevealed = true;
      neutralRGB = RGB_DARK;                 // color de reposo del wireframe sobre crema
      document.body.classList.add('hero-cream');
      setNavCream(true);

      computeFraming();
      sphereState.offsetX = restOffsetX;
      sphereState.scale   = restScale;
      sphereState.opacity = (window.innerWidth <= 768) ? 0.13 : 0.17;

      if (instant) {
        if (heroSweep) gsap.set(heroSweep, { clipPath: 'inset(0% 0 0 0)' });
        gsap.set(mat.color, { r: RGB_DARK.r, g: RGB_DARK.g, b: RGB_DARK.b });
        curOffsetX = restOffsetX; curScale = restScale; curOpacity = sphereState.opacity;
        gsap.set(heroText, { opacity: 1 });
        gsap.set(heroStatement, { opacity: 1 });
        gsap.set(wordsOf(heroStatement), { yPercent: 0, opacity: 1, filter: 'blur(0px)' });
        if (heroLead) gsap.set(heroLead, { opacity: 1, y: 0, filter: 'blur(0px)' });
        revealStaticPair(); revealLiveData();
        startMorphCycle();
        return;
      }

      const tl = gsap.timeline();
      // 1) Barrido crema (abajo → arriba) que queda de fondo del hero.
      if (heroSweep) tl.to(heroSweep, { clipPath: 'inset(0% 0 0 0)', duration: 0.95, ease: 'power3.inOut' }, 0);
      // 2) La esfera vira a oscuro mientras llega el crema (el desplazamiento a la
      //    derecha + escala lo interpola el render loop hacia sphereState).
      tl.to(mat.color, { r: RGB_DARK.r, g: RGB_DARK.g, b: RGB_DARK.b, duration: 1.0, ease: 'power2.inOut' }, 0.15);
      // 3) Titular palabra por palabra + bajada.
      tl.set(heroText, { opacity: 1 }, 0.5);
      tl.set(heroStatement, { opacity: 1 }, 0.5);
      tl.to(wordsOf(heroStatement), {
        yPercent: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.9, stagger: 0.05, ease: 'power4.out'
      }, 0.55);
      if (heroLead) tl.to(heroLead, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, 0.95);
      // 4) Datos (LOCATION / LIVE DATA / SAY HELLO) con scramble.
      tl.add(() => { revealStaticPair(); revealLiveData(); }, 0.7);
      // 5) Arranca el ciclo de morph del keyvisual (rota + cambia de forma).
      tl.add(() => startMorphCycle(), 1.15);
    }
    window.cruzStartHeroReveal = startHeroReveal;
    
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
        onComplete(){ isExtruded=false; extVerts=[]; gsap.to(mat.color,{r:neutralRGB.r,g:neutralRGB.g,b:neutralRGB.b,duration:.5}); }
      });
    }
    
    function extrude(verts){
      extVerts=verts; isExtruded=true;
      if(extTween) extTween.kill();
      const o={t:0};
      extTween=gsap.to(o,{t:1,duration:.65,ease:'power3.out',
        onUpdate(){ applyExt(verts,o.t,0.72); }
      });
      gsap.to(mat.color,{r:neutralRGB.r,g:neutralRGB.g,b:neutralRGB.b,duration:.25,
        onComplete:()=>gsap.to(mat.color,{r:neutralRGB.r,g:neutralRGB.g,b:neutralRGB.b,duration:1.2,delay:.5})
      });
    }
    
    // ── CARD DE PROYECTO ──────────────────────────────────────────────────
    // Al clickear la esfera sale UNA card del proyecto (diseño tipo "profile
    // card"). El fondo se desenfoca un punto (para entender que seguís en el
    // mismo lugar) y cada click en otra zona de la esfera muestra otro proyecto.
    const projOverlay = document.getElementById('proj-overlay');
    const projCard    = document.getElementById('proj-card');
    const pjImg   = document.getElementById('pj-img');
    const pjTitle = document.getElementById('pj-title');
    const pjDesc  = document.getElementById('pj-desc');
    const pjCta   = document.getElementById('pj-cta');
    const pjMeta  = document.getElementById('pj-meta');
    const NP = PROJECTS.length;

    // Perillas de ajuste: desenfoque del fondo (un grado menos que antes).
    const CARDCFG = { blur: 7 };

    // Desenfoque animado de las capas del hero (fondo). filter:blur (no
    // backdrop-filter) → fiable sobre el canvas WebGL.
    const heroBlurEls = ['#silk-bg','#hero-invert-bg','#canvas-wrap','#hero-text','#stat-strip','#award-ribbons','.grid-bg']
      .map(s => document.querySelector(s)).filter(Boolean);
    const blurProxy = { b: 0 };
    function applyHeroBlur(){
      const f = blurProxy.b > 0.05 ? `blur(${blurProxy.b}px)` : '';
      heroBlurEls.forEach(el => { el.style.filter = f; });
    }

    let cardOpen = false, cycleIdx = 0;

    // ── CICLO DE MORPH ─────────────────────────────────────────────────────
    // Secuencia (siempre vuelve a la esfera entre forma y forma):
    //   esfera → cruz → figura → diamante → casa → árbol → ave → cubo → (loop)
    // Todo en el MISMO wireframe lineal (nunca puntos): cada forma es un mapeo
    // suave de la malla, así las aristas drapean limpias y vuelve a la esfera
    // de forma natural. El morph arranca SIEMPRE desde la 'base' vigente
    // (snapshot) hacia la forma destino → se retoma suave tras abrir/cerrar card.
    // Híbrido: formas geométricas por morph de vértices (cruz/diamante/cubo) +
    // modelos 3D reales (cara, cerebro) re-muestreados. Vuelve a la esfera entre cada una.
    const MORPH_SEQ  = ['cross', 'sphere', 'face', 'sphere', 'brain', 'sphere', 'diamond', 'sphere', 'cube', 'sphere'];
    const MORPH_HOLD = 3.0;    // segundos que se sostiene cada forma
    const MORPH_TIME = 1.15;   // segundos de la transición
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shapeCache = { sphere: buildShape('sphere') };
    const shapeOf = n => shapeCache[n] || (shapeCache[n] = buildShape(n));

    // ── MODELOS 3D REALES (targets pre-horneados) ─────────────────────────────
    // El muestreo por raycast (miles de rayos por modelo) se hornea OFFLINE y se
    // guarda como un binario chiquito (Float32 de N*3). En runtime solo se baja
    // ese .bin y se usa directo como forma destino → cero raycasts, cero GLTF,
    // cero jank (clave para mobile). Se regenera con scripts/bake si cambia el GLB.
    const MODELS = {
      face:  { bin: '/models/face.morph.bin',
               credit: '“Wireframe Gregos face” by <a href="https://skfb.ly/U7uW" target="_blank" rel="noopener noreferrer">alban</a> · <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>' },
      brain: { bin: '/models/brain.morph.bin',
               credit: '' }   // TODO: completar crédito/licencia del cerebro si corresponde
    };
    const creditEl = document.getElementById('hero-credit');
    const modelReady = {};
    function isModel(name){ return !!MODELS[name]; }
    function creditSet(name){
      const c = MODELS[name] && MODELS[name].credit;
      if (!creditEl) return;
      if (c) { creditEl.innerHTML = c; creditEl.classList.add('show'); }
      else { creditEl.classList.remove('show'); }
    }

    function loadModel(name){
      const cfg = MODELS[name];
      if (!cfg) return;
      fetch(cfg.bin).then(r => r.arrayBuffer()).then(buf => {
        const arr = new Float32Array(buf);
        if (arr.length !== N * 3) { if (window.console) console.warn('[hero] morph size mismatch', name, arr.length, 'vs', N*3); return; }
        shapeCache[name] = arr;
        modelReady[name] = true;
      }).catch(err => { if (window.console) console.warn('[hero] no cargó morph (' + name + '):', err); });
    }
    Object.keys(MODELS).forEach(loadModel);

    let morphActive = false, morphTween = null, morphTimer = null;
    let seqIdx = 0, pendingTarget = null, curShapeName = 'sphere';

    function morphToShape(toName, onDone) {
      const fromArr = base.slice();          // snapshot de la forma actual
      const toArr = shapeOf(toName);
      const o = { t: 0 };
      if (morphTween) morphTween.kill();
      morphTween = gsap.to(o, {
        t: 1, duration: MORPH_TIME, ease: 'power2.inOut',
        onUpdate() {
          if (cardOpen || isExtruded) return;  // congelado mientras hay card/extrusión
          const t = o.t;
          for (let i = 0; i < N * 3; i++) base[i] = fromArr[i] + (toArr[i] - fromArr[i]) * t;
          pos.array.set(base);
          pos.needsUpdate = true;
        },
        onComplete() { morphTween = null; if (onDone) onDone(); }
      });
    }

    // Todas las formas (incluidos los modelos) morfan por vértices y GIRAN en su
    // eje como el resto (el giro nunca se pausa). Al entrar en un modelo se muestra
    // su crédito; en cualquier otra forma se oculta.
    function transitionTo(name, onDone){
      if (isModel(name) && !modelReady[name]) { if (onDone) onDone(); return; }  // modelo no listo → saltear
      creditSet(name);
      curShapeName = name;
      morphToShape(name, onDone);
    }

    function afterMorph() {
      pendingTarget = null;
      seqIdx = (seqIdx + 1) % MORPH_SEQ.length;
      scheduleNextMorph();
    }
    function runMorphStep() {
      morphTimer = null;
      if (!morphActive) return;
      // Espera si hay card abierta, extrusión, o el hero no está a la vista.
      if (cardOpen || isExtruded || !heroVisible) { morphTimer = setTimeout(runMorphStep, 600); return; }
      pendingTarget = MORPH_SEQ[seqIdx];
      transitionTo(pendingTarget, afterMorph);
    }
    function scheduleNextMorph() {
      if (morphTimer) clearTimeout(morphTimer);
      morphTimer = setTimeout(runMorphStep, MORPH_HOLD * 1000);
    }
    function startMorphCycle() {
      if (reduceMotion || morphActive) return;   // respeta prefers-reduced-motion
      morphActive = true;
      seqIdx = 0;
      scheduleNextMorph();   // primero sostiene la esfera, luego arranca el ciclo
    }
    function pauseMorph() {
      if (morphTimer) { clearTimeout(morphTimer); morphTimer = null; }
      if (morphTween) { morphTween.kill(); morphTween = null; }
    }
    function resumeMorph() {
      if (!morphActive) return;
      if (pendingTarget) transitionTo(pendingTarget, afterMorph);  // termina la transición interrumpida
      else scheduleNextMorph();
    }

    function fillCard(p){
      const label = (LANG === 'en' && p.labelEn) ? p.labelEn : p.label;
      const desc  = (LANG === 'en' && p.descEn)  ? p.descEn  : p.desc;
      pjImg.src = p.img; pjImg.alt = p.title;
      pjTitle.textContent = p.title;        // nombre propio: igual en ambos idiomas
      pjDesc.textContent = desc;
      pjCta.setAttribute('href', p.url);
      pjCta.innerHTML = T.cta + ' <span aria-hidden="true">→</span>';
      // El label ("BRANDING · IDENTIDAD") se parte en hasta 2 chips reales.
      const tags = label.split('·').map(s => s.trim()).filter(Boolean).slice(0, 2);
      pjMeta.innerHTML = tags.map(t => `<span class="pj-tag">${t}</span>`).join('');
    }

    const projInner = projCard.querySelector('.pj-inner');

    // Mostrar/ocultar la card se maneja por CLASES + transiciones CSS (las corre
    // el compositor y SIEMPRE llegan a su estado final; no dependen del ticker de
    // GSAP). GSAP sólo anima el desenfoque del fondo.
    //
    // La card SALE en el punto donde se clickeó la esfera (no centrada). Se
    // ubica centrada sobre el click y se recorta al viewport para que entre
    // siempre entera.
    function positionCard(x, y){
      const pad = 16;
      const cw = projCard.offsetWidth  || 320;
      const ch = projCard.offsetHeight || 470;
      const W = window.innerWidth, H = window.innerHeight;
      let cx = x - cw / 2, cy = y - ch / 2;
      cx = Math.max(pad, Math.min(cx, W - cw - pad));
      cy = Math.max(pad, Math.min(cy, H - ch - pad));
      projCard.style.left = cx + 'px';
      projCard.style.top  = cy + 'px';
    }

    function openCard(idx, x, y){
      if (cardOpen) return;
      cardOpen = true;
      pauseMorph();                               // congela la forma mientras se ve la card
      fillCard(PROJECTS[idx]);
      positionCard(x, y);                         // ← posición en el punto de click
      projOverlay.classList.add('open');          // → CSS: bloom de la card
      lockScroll(true);
      window.cruzCursorHint && window.cruzCursorHint(T.cursor);
      gsap.to(blurProxy, { b: CARDCFG.blur, duration: 0.6, ease: 'power2.out', overwrite: true, onUpdate: applyHeroBlur });
    }

    function closeCard(){
      if (!cardOpen) return;
      cardOpen = false;
      projOverlay.classList.remove('open');       // → CSS: la card se va (fade/scale)
      lockScroll(false);
      retract();                                  // la esfera retrae su protuberancia
      resumeMorph();                              // retoma el ciclo de transformación
      animateHintText(T.hint);
      window.cruzCursorHint && window.cruzCursorHint(null);   // cursor vuelve al hint por defecto
      gsap.to(blurProxy, { b: 0, duration: 0.5, ease: 'power2.in', overwrite: true, onUpdate: applyHeroBlur });
    }

    // ── Bloqueo de scroll mientras la card está abierta ──────────────────────
    // No alcanza con overflow:hidden en <body> (el scroller real es <html>) ni
    // con lenis.stop() (el observer de smooth-scroll.js puede reiniciarlo). El
    // método a prueba de todo es CANCELAR los eventos de scroll en captura:
    // wheel, touchmove y las teclas de navegación. Así no scrollea ni nativo ni
    // Lenis; al cerrar se quitan los listeners y todo vuelve a la normalidad.
    const SCROLL_KEYS = [32, 33, 34, 35, 36, 38, 40]; // space, pgup/pgdn, end, home, ↑, ↓
    function blockWheel(e){ e.preventDefault(); }
    function blockKeys(e){
      if (SCROLL_KEYS.indexOf(e.keyCode) > -1 &&
          !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''))) {
        e.preventDefault();
      }
    }
    let scrollLocked = false;
    function lockScroll(on){
      if (on === scrollLocked) return;
      scrollLocked = on;
      document.body.classList.toggle('card-open', on);
      // 1) Frenamos Lenis (scroll suave).
      if (window.cruzLenis) { on ? window.cruzLenis.stop() : window.cruzLenis.start(); }
      // 2) overflow:hidden DIRECTO en <html> y <body>: mata el scrollbar y el
      //    scroll nativo (el scroller real es <html>, no <body>). Sin position
      //    fixed → no hay salto de posición.
      document.documentElement.style.overflow = on ? 'hidden' : '';
      document.body.style.overflow = on ? 'hidden' : '';
      // 3) Cancelamos los eventos de scroll (rueda, táctil y teclas de navegación)
      //    como red final: cubre inercia y cualquier resto que se escape.
      const method = on ? 'addEventListener' : 'removeEventListener';
      window[method]('wheel', blockWheel, { passive: false });
      window[method]('touchmove', blockWheel, { passive: false });
      window[method]('keydown', blockKeys, { passive: false });
    }
    
    // ── Interacción de la card ───────────────────────────────────────────
    document.getElementById('proj-close').addEventListener('click', e => { e.stopPropagation(); closeCard(); });
    // Click en el fondo (fuera de la card) también cierra → así se libera la
    // esfera para elegir otro sector.
    projOverlay.addEventListener('click', e => { if (e.target === projOverlay) closeCard(); });
    window.addEventListener('keydown', e => { if (cardOpen && e.key === 'Escape') closeCard(); });

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

    // La esfera es puramente decorativa (keyvisual que rota y morfa). La
    // interacción de "click en la esfera → card de proyecto" se retiró: el canvas
    // no captura el puntero y no muestra cursor de click.
    renderer.domElement.style.pointerEvents = 'none';

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
          renderer.domElement.style.pointerEvents = 'none'; // esfera decorativa (sin interacción)
          // Cámara aterrizada (círculo centrado sobre negro) → barrido crema + reveal.
          startHeroReveal(false);
        }
      });
    }

    function scheduleIntro() {
      // Respeta reduced-motion y el caso loader salteado → cámara directa al reposo
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || document.documentElement.classList.contains('skip-loader')) {
        introDone = true;
        startHeroReveal(true);   // sin intro → hero crema directo (sin barrido)
        return;
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
    // Perf: la esfera vive en un canvas fixed a pantalla completa. Pasado el hero
    // queda tapada por el contenido, pero seguía renderizando cada frame (contexto
    // WebGL extra que, junto a los Silks, trababa el scroll en MacBook retina).
    // La pausamos cuando el hero sale de vista; la intro nunca se congela.
    // El hero se pinea sobre #spacer (520vh); la esfera debe animar toda esa zona
    // y recién pausarse cuando el spacer pasó del todo (el contenido la tapa).
    let heroVisible = true;
    const spacerEl = document.getElementById('spacer');
    const updateHeroVisible = () => {
      heroVisible = !spacerEl || spacerEl.getBoundingClientRect().bottom > 0;
      if (!heroRevealed) return;
      // Dentro del hero manda el crema (nav oscura); fuera, el contenido oscuro
      // retoma el contraste genérico (nav-contrast.js).
      if (heroVisible) {
        if (document.body.getAttribute('data-nav-force') !== 'light') setNavCream(true);
      } else if (document.body.hasAttribute('data-nav-force')) {
        setNavCream(false);
      }
    };
    window.addEventListener('scroll', updateHeroVisible, { passive: true });
    window.addEventListener('resize', updateHeroVisible, { passive: true });
    updateHeroVisible();

    let time=0;
    (function animate(){
      requestAnimationFrame(animate);
      if (!heroVisible && !introActive) return;  // fuera del hero: no renderiza
      time+=0.003;
      sphere.rotation.y+=0.0013;
      sphere.rotation.x=Math.sin(time*.28)*.04;

      // Esfera: se desplaza suave a su encuadre (derecha) y escala de reposo.
      curScale   += (sphereState.scale   - curScale)   * .06;
      curOffsetX += (sphereState.offsetX - curOffsetX) * .06;
      sphere.position.x = curOffsetX;
      sphere.scale.setScalar(curScale);

      // Opacidad: objetivo de reposo (tenue sobre crema, visible sobre negro en
      // el intro) + latido muy sutil. Lectura de segundo nivel.
      curOpacity += (sphereState.opacity - curOpacity) * 0.05;
      mat.opacity = Math.max(0.04, curOpacity + Math.sin(time * 0.7) * 0.03);

      // Durante la intro, la cámara sigue el recorrido orbital
      if (introActive) applyIntroCamera();

      renderer.render(scene,camera);
    })();

    window.addEventListener('resize',()=>{
      W=window.innerWidth; H=window.innerHeight;
      camera.aspect=W/H; camera.updateProjectionMatrix();
      renderer.setSize(W,H);
      computeFraming();
      if (heroRevealed) {
        sphereState.offsetX = restOffsetX;
        sphereState.scale   = restScale;
        sphereState.opacity = (W <= 768) ? 0.13 : 0.17;
      }
    });
});