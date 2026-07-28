/**
 * SISTEMA INTEGRAL CRUZ ESTUDIO ® 2026
 * Dirección Creativa: Juan Cruz
 * Versión: Consolidada + Fix Reveal + Dynamic Preview
 */

// 1. VARIABLES GLOBALES
let intervalId = null; 
let currentIndex = 0;
let projectImages = [];

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const navbar = document.querySelector('.navbar-brand');
    const loader = document.getElementById('loader') || document.querySelector('.loader');
    const percentage = document.getElementById('loader-percentage'); 
    const loaderBar = document.getElementById('loader-bar');          
    const menuBtn = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    // --- 2. LOADER SISTEMATIZADO (V2) ---
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                const finish = () => {
                    body.classList.remove('scroll-locked');
                    body.style.overflow = 'auto';
                };
                if (typeof window.cruzIntroExit === 'function') {
                    window.cruzIntroExit(finish);
                } else {
                    if (loader) loader.classList.add('hidden');
                    finish();
                }
            }, 400);
        }
        // Formato '00' para estética técnica suiza
        if (percentage) percentage.textContent = String(progress).padStart(2, '0');
        if (loaderBar) loaderBar.style.width = `${progress}%`;
    }, 40);

    // --- 3. HERO KINÉTICO (GSAP) ---
    const kineticTarget = document.getElementById("kinetic-word");
    if (kineticTarget) {
        const words = ["IDEAS", "MARCAS", "ESTRATEGIAS", "IDENTIDADES"];
        let wordIdx = 0;
        setInterval(() => {
            kineticTarget.style.transform = 'translateY(-20px)';
            kineticTarget.style.opacity = '0';
            setTimeout(() => {
                wordIdx = (wordIdx + 1) % words.length;
                kineticTarget.textContent = words[wordIdx];
                kineticTarget.style.transform = 'translateY(20px)';
                requestAnimationFrame(() => {
                    kineticTarget.style.transform = 'translateY(0)';
                    kineticTarget.style.opacity = '1';
                });
            }, 600);
        }, 3000);
    }

    // --- 4. NAVEGACIÓN Y MENÚ MÓVIL ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 90;
                window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
                menuBtn?.classList.remove('open');
                navLinks?.classList.remove('active');
            }
        });
    });

    if (menuBtn && navLinks) {
        const closeMenu = () => {
            menuBtn.classList.remove('open');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        };
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        // Cierre automático al tocar un link del menú (overlay mobile)
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        // Cierre con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) closeMenu();
        });
    }

    // --- 5. CURSOR PERSONALIZADO ---
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        // Expansión en elementos interactivos
        document.querySelectorAll('a, button, .featured-work-item, .fwv2-item, .sw-item').forEach(link => {
            link.addEventListener('mouseenter', () => cursor.classList.add('cursor-expand'));
            link.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expand'));
        });
    }

    // --- 6. LIVE DATA (TIEMPO REAL) ---
    function updateLiveClocks() {
        const clockEls = document.querySelectorAll('#hero-clock, #footer-clock, #loader-clock');
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
        clockEls.forEach(el => { if(el) el.textContent = timeStr; });
    }
    setInterval(updateLiveClocks, 1000);
    updateLiveClocks();

    // --- 7. REVEALS AL SCROLLEAR ---
    // Threshold 0 + rootMargin negativo: dispara apenas el elemento entra al viewport.
    // Más confiable para listas altas (servicios con pills) que con 0.15.
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    const revealSelector = '.works-header, .works-preview, .featured-work-item, .scroll-reveal, .scroll-reveal-stagger';
    document.querySelectorAll(revealSelector).forEach((el) => {
        // Los headers [data-rh] los maneja java/reveal-headers.js con ScrollTrigger
        // (post-refresh), porque el observer acá dispara prematuramente por los pins.
        if (el.hasAttribute('data-rh')) return;
        revealObserver.observe(el);
    });

    // Failsafe SUAVE viewport-aware (1.5s): rescata SOLO lo que ya está en
    // pantalla y no se reveló (loader, transforms, etc.).
    setTimeout(() => {
        const vh = window.innerHeight;
        document.querySelectorAll(revealSelector).forEach((el) => {
            if (el.hasAttribute('data-rh')) return; // headers → reveal-headers.js
            if (el.classList.contains('visible')) return;
            const rect = el.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0) {
                el.classList.add('visible');
                revealObserver.unobserve(el);
            }
        });
    }, 1500);

    // Escape hatch absoluto (4s): todo lo que aún no se reveló se vuelve visible,
    // EXCEPTO los headers [data-rh]. Esos los maneja reveal-headers.js con
    // ScrollTrigger (post-refresh); si los reveláramos acá por temporizador se
    // verían ESTÁTICOS al llegar scrolleando (el hero mide 520vh).
    setTimeout(() => {
        document.querySelectorAll(revealSelector).forEach((el) => {
            if (el.hasAttribute('data-rh')) return;
            if (!el.classList.contains('visible')) el.classList.add('visible');
        });
    }, 4000);
});

// --- 8. FUNCIONES DE TRABAJOS Y ACORDEÓN (GLOBALES) ---
window.changePreview = function(projectNum) {
    // Apuntamos al contenedor de la nueva versión V2
    const container = document.querySelector('.preview-inner-v2');
    if (!container) return;
    
    const allImages = container.querySelectorAll('img');
    
    // 1. Limpieza técnica: quitamos la clase activa de todas
    allImages.forEach(img => {
        img.classList.remove('active');
    });
    
    // 2. Activamos la imagen solicitada (la opacidad la gestiona el CSS)
    const target = document.getElementById(`project-image-${projectNum}`);
    if (target) {
        target.classList.add('active');
    }
};

window.redirectWithAnimation = function(element) {
    const url = element.getAttribute('data-url');
    const transition = document.querySelector('.page-transition');
    if (url && transition) {
        transition.classList.add('entering');
        setTimeout(() => { window.location.href = url; }, 800);
    }
};

window.toggleAccordion = function(element) {
    const allAccordions = document.querySelectorAll('.accordion');
    const content = element.nextElementSibling;
    const isNowActive = element.classList.contains('active');

    allAccordions.forEach(acc => {
        acc.classList.remove('active');
        if (acc.nextElementSibling) acc.nextElementSibling.style.display = "none";
    });

    if (intervalId) clearInterval(intervalId);

    if (!isNowActive) {
        element.classList.add('active');
        content.style.display = "block";
        const span = element.querySelector('span');
        projectImages = JSON.parse(span?.getAttribute('data-images') || "[]");
        currentIndex = 0;
        if (projectImages.length > 0) {
            updateProjectImage();
            intervalId = setInterval(updateProjectImage, 2500);
        }
    }
};

function updateProjectImage() {
    const imgElement = document.getElementById('project-image');
    if (imgElement && projectImages.length > 0) {
        imgElement.style.opacity = 0.5;
        setTimeout(() => {
            imgElement.src = projectImages[currentIndex];
            imgElement.style.opacity = 1;
            currentIndex = (currentIndex + 1) % projectImages.length;
        }, 300);
    }
}

// ==========================================================================
// SECCIÓN 9: SISTEMA DE SONIDO INTEGRAL (CRUZ ESTUDIO ®)
// Control de Pista de Fondo + Efecto Dropdown
// ==========================================================================

const bgMusic = document.getElementById('bg-music-continuum');
const sfxZoom = document.getElementById('sfx-zoom');
const soundToggle = document.getElementById('global-sound-toggle');
let isGlobalSoundEnabled = false; // El sonido empieza desactivado por defecto (Mejor UX)

// --- A. GESTIÓN AUTOPLAY (Browser Workaround) ---
// La mayoría de navegadores bloquean el sonido hasta que el usuario interactúa.
// Intentamos reproducir cuando termina el loader, si el navegador lo permite.
window.addEventListener('load', () => {
    // Si no existen los elementos de sonido en esta página, no hacemos nada.
    if (!bgMusic || !soundToggle) return;

    // Escuchamos el final del loader que ya tenías en la Sección 2
    const loaderCheck = setInterval(() => {
        const loader = document.getElementById('loader');
        if (loader && loader.classList.contains('hidden')) {
            clearInterval(loaderCheck);

            // Intentamos reproducir la pista de fondo
            bgMusic.play().then(() => {
                // Autoplay exitoso: Actualizamos el botón a ON
                isGlobalSoundEnabled = true;
                soundToggle.classList.remove('muted');
                soundToggle.classList.add('active');
            }).catch(() => {
                // Autoplay bloqueado (User must click): Botón queda en OFF
                console.log("Autoplay de audio bloqueado por el navegador. El usuario debe activarlo.");
                soundToggle.classList.remove('active');
                soundToggle.classList.add('muted');
            });
        }
    }, 100);
});

// --- B. LÓGICA DEL BOTÓN SWITCH GLOBAL ---
if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        isGlobalSoundEnabled = !isGlobalSoundEnabled;

        if (isGlobalSoundEnabled) {
            // ACTIVAR SONIDO GLOBAL
            if (bgMusic) {
                bgMusic.play();
                bgMusic.muted = false; // Aseguramos que no esté muted
            }
            soundToggle.classList.remove('muted');
            soundToggle.classList.add('active');
        } else {
            // DESACTIVAR SONIDO GLOBAL
            if (bgMusic) {
                bgMusic.pause();
                bgMusic.muted = true; // Muteamos la pista de fondo
            }
            soundToggle.classList.remove('active');
            soundToggle.classList.add('muted');
        }
    });
}

// ==========================================================================
// REEMPLAZO SECCIÓN 8: FUNCIONES DE TRABAJOS Y ACORDEÓN (MODIFICADA CON SONIDO)
// ==========================================================================
window.toggleAccordion = function(element) {
    const allAccordions = document.querySelectorAll('.accordion');
    const content = element.nextElementSibling;
    const isNowActive = element.classList.contains('active');

    // --- REPRODUCCIÓN EFECTO ZOOM ---
    // Solo si el sonido global está activo y estamos ABRIENDO un acordeón
    if (isGlobalSoundEnabled && sfxZoom && !isNowActive) {
        // Reiniciamos la pista por si se toca rápido
        sfxZoom.currentTime = 0; 
        sfxZoom.play();
    }

    allAccordions.forEach(acc => {
        acc.classList.remove('active');
        if (acc.nextElementSibling) acc.nextElementSibling.style.display = "none";
    });

    if (intervalId) clearInterval(intervalId);

    if (!isNowActive) {
        element.classList.add('active');
        content.style.display = "block";
        const span = element.querySelector('span');
        projectImages = JSON.parse(span?.getAttribute('data-images') || "[]");
        currentIndex = 0;
        if (projectImages.length > 0) {
            updateProjectImage();
            intervalId = setInterval(updateProjectImage, 2500);
        }
    }
};

// --- Scroll Progress Bar ---
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    let rafId = null;
    function update() {
        const h = document.documentElement;
        const scrollTop = h.scrollTop || document.body.scrollTop;
        const max = h.scrollHeight - h.clientHeight;
        const progress = max > 0 ? (scrollTop / max) * 100 : 0;
        bar.style.width = progress + '%';
        rafId = null;
    }

    function onScroll() {
        if (rafId) return;
        rafId = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
}

// --- Cursor Magnético en CTAs ---
function initMagneticCursor() {
    const targets = document.querySelectorAll('[data-magnetic]');
    if (!targets.length) return;

    targets.forEach(function(el) {
        const strength = parseFloat(el.dataset.magneticStrength || '0.3');
        let rafId = null;

        el.addEventListener('mousemove', function(e) {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * strength;
            const dy = (e.clientY - cy) * strength;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(function() {
                el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
            });
        });

        el.addEventListener('mouseleave', function() {
            if (rafId) cancelAnimationFrame(rafId);
            el.style.transform = '';
        });
    });
}

// Ejecutar cuando el DOM esté listo (script tiene defer, así que ya debería estarlo)
// --- Hero WE.directory badge: fallback de ocultamiento ---
// La lógica principal vive en hero-3d.js (sincronizada con la aparición del hero text
// vía ScrollTrigger del #spacer). Este listener solo actúa como red de seguridad
// por si GSAP/ScrollTrigger no carga: oculta el badge a partir de un scroll alto.
function initHeroWeBadge() {
    const badge = document.getElementById('hero-we-badge');
    if (!badge) return;

    const FALLBACK_THRESHOLD = 600; // alto: solo entra si ScrollTrigger no actuó
    let ticking = false;

    function update() {
        if (window.scrollY > FALLBACK_THRESHOLD) badge.classList.add('hide');
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
}

/* ============================================================
   STUDIO INTRO — Malla 3D animada con waves interactivas
   Adaptado del demo classic de https://threejs.org (geometry-plane
   con displacement por suma de senos + mouse).

   Diferencias con el original:
   - Usa el THREE global (r128 ya cargado en index.html), no ES module.
   - Sizing al contenedor (.studio-text-container, 40% del section),
     no al window.
   - Mouse coords relativas al section, no a la ventana.
   - Pausa con IntersectionObserver cuando la sección sale de viewport.
============================================================ */
function initStudioWaves() {
    const canvas  = document.getElementById('studio-mesh-bg');
    const section = document.getElementById('studio-intro');
    if (!canvas || !section || typeof THREE === 'undefined') return;

    const container = canvas.parentElement; // .studio-text-container

    // ── Renderer ────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    // ── Escena + cámara (parámetros estilo threejs.org) ─
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 15, 45);

    // ── Plano wireframe con fuerte inclinación hacia cámara
    const geometry = new THREE.PlaneGeometry(150, 80, 50, 30);
    const material = new THREE.MeshBasicMaterial({
        color: 0xfffdf3,        // crema corporativo
        wireframe: true,
        transparent: true,
        opacity: 0.32
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2.2; // ≈ -81.8°, vertical inclinado
    scene.add(plane);

    // Guardamos las Z originales para no acumular el desplazamiento
    const positions = plane.geometry.attributes.position;
    const initialZ = new Float32Array(positions.count);
    for (let i = 0; i < positions.count; i++) initialZ[i] = positions.getZ(i);

    // ── Mouse (coords relativas al section) ─────────────
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        // Mismo factor 0.1 que tu código original
        mouseX = ((e.clientX - rect.left) - rect.width  / 2) * 0.1;
        mouseY = ((e.clientY - rect.top)  - rect.height / 2) * 0.1;
    }, { passive: true });

    section.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        if (!t) return;
        const rect = section.getBoundingClientRect();
        mouseX = ((t.clientX - rect.left) - rect.width  / 2) * 0.1;
        mouseY = ((t.clientY - rect.top)  - rect.height / 2) * 0.1;
    }, { passive: true });

    // ── Resize sincronizado al contenedor ───────────────
    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();

    // ── Loop ────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId = null;
    let running = false;
    const baseCamY = 15;

    function tick() {
        const time = clock.getElapsedTime();

        // Suavizado del mouse (Lerp)
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Displacement por vértice: ola base + efecto del mouse
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);

            const wave1 = Math.sin(x * 0.1 + time) * 2;
            const wave2 = Math.cos(y * 0.1 + time) * 2;

            // Distorsión por proximidad al cursor, modulada por sin(t·3)
            const distX = Math.abs(x - targetX);
            const distY = Math.abs(y + targetY);
            const mouseEffect = Math.max(0, 10 - (distX + distY) * 0.2) * Math.sin(time * 3);

            positions.setZ(i, initialZ[i] + wave1 + wave2 + mouseEffect);
        }
        positions.needsUpdate = true;

        // Leve rotación panorámica del plano
        plane.rotation.z = time * 0.05;

        // Parallax sutil de cámara
        camera.position.x += (mouseX * 0.1 - camera.position.x) * 0.05;
        camera.position.y += ((-mouseY * 0.1 + baseCamY) - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
    }

    function start() {
        if (running) return;
        running = true;
        clock.start(); // reinicia el reloj al volver a viewport
        rafId = requestAnimationFrame(tick);
    }
    function stop() {
        running = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    // Solo animar cuando la sección está en viewport
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => entry.isIntersecting ? start() : stop());
    }, { threshold: 0 });
    io.observe(section);

    // Resize debounced
    let resizeRaf = null;
    window.addEventListener('resize', () => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(resize);
    }, { passive: true });
}

function bootCruzInteractions() {
    initScrollProgress();
    initMagneticCursor();
    initHeroWeBadge();
    initStudioWaves();       // no-op si no hay canvas
    // initServicesLayers() ahora vive en java/capas.js como módulo aislado.
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootCruzInteractions);
} else {
    bootCruzInteractions();
}