/**
 * METODOLOGÍA — CRUZ ESTUDIO ®
 * Motor de animaciones y Esfera 3D pasiva (Background)
 */

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // ── 1. ANIMACIONES DE TEXTO (GSAP) ──────────────────────────────────
    
    // Entrada del Hero
    gsap.from(".reveal-item", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out"
    });

    // Revelado de Fases
    gsap.utils.toArray(".reveal-fase").forEach(fase => {
        gsap.from(fase, {
            x: -30,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: fase,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });


    // ── 2. ESFERA 3D BACKGROUND (SISTEMA CRUZ ESTUDIO) ──────────────────
    const container = document.getElementById('canvas-metodo-wrap');
    if (!container) return;

    // Setup Básico
    let W = container.clientWidth, H = container.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
    camera.position.z = 5.5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Funciones de Ruido (Perlin simplificado para textura)
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

    // Geometría y Material
    const geo = new THREE.SphereGeometry(2.2, 64, 64);
    const pos = geo.attributes.position;
    const base = new Float32Array(pos.count * 3);
    
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const len = Math.sqrt(x*x + y*y + z*z);
        const nx = x/len, ny = y/len, nz = z/len;
        const n = noise(nx*2.4, ny*2.4, nz*2.4)*0.32;
        const r = 2.2 + n;
        base[i*3]=nx*r; base[i*3+1]=ny*r; base[i*3+2]=nz*r;
        pos.setXYZ(i, nx*r, ny*r, nz*r);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    // Material sutil (Opacidad bajada al 6% para no competir con el H1)
    const mat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.06 // <--- ACÁ ESTÁ EL VALOR EXACTO PARA MODIFICAR
    });
    const sphere = new THREE.Mesh(geo, mat);
    
    // Posicionamos la esfera hacia la derecha para que solo se vea la mitad
    sphere.position.x = 2.8; 
    scene.add(sphere);

    // Efecto Parallax atado al Scroll (Baja lentamente)
    ScrollTrigger.create({
        trigger: ".metodo-hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
            sphere.position.y = -(self.progress * 2); 
        }
    });

    // Render Loop (Rotación lenta y constante)
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.002;
        sphere.rotation.y += 0.001;
        sphere.rotation.x = Math.sin(time) * 0.05;
        renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
        W = container.clientWidth; H = container.clientHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
    });
});