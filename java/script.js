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
                if (loader) loader.classList.add('hidden');
                body.classList.remove('scroll-locked');
                body.style.overflow = 'auto';
            }, 500);
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

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks?.classList.toggle('active');
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
        document.querySelectorAll('a, button, .featured-work-item, .fwv2-item').forEach(link => {
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

    // --- 7. REVEALS AL SCROLLEAR (FIX PARA TRABAJOS DESTACADOS) ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    // Observamos los elementos de la sección de trabajos y el intro del estudio
    document.querySelectorAll('.works-header, .works-preview, .featured-work-item, #studio-intro, .scroll-reveal').forEach((el) => {
        revealObserver.observe(el);
    });
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
            }).catch(error => {
                // Autoplay bloqueado (User must click): Botón queda en OFF
                console.log("Autoplay de audio bloqueado por el navegador. El usuario debe activarlo.");
                soundToggle.classList.remove('active');
                soundToggle.classList.add('muted');
            });
        }
    }, 100);
});

// --- B. LÓGICA DEL BOTÓN SWITCH GLOBAL ---
soundToggle.addEventListener('click', () => {
    isGlobalSoundEnabled = !isGlobalSoundEnabled;

    if (isGlobalSoundEnabled) {
        // ACTIVAR SONIDO GLOBAL
        bgMusic.play();
        bgMusic.muted = false; // Aseguramos que no esté muted
        soundToggle.classList.remove('muted');
        soundToggle.classList.add('active');
    } else {
        // DESACTIVAR SONIDO GLOBAL
        bgMusic.pause();
        bgMusic.muted = true; // Muteamos la pista de fondo
        soundToggle.classList.remove('active');
        soundToggle.classList.add('muted');
    }
});

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

// --- IMPORTANTE: También añadimos el efecto SFX al hover de los proyectos V2 ---
// Para una experiencia más Flair Digital en la lista que venimos trabajando.
document.querySelectorAll('.fwv2-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        if (isGlobalSoundEnabled && sfxZoom) {
            // Un toque de zoom SFX al posar el cursor
            sfxZoom.currentTime = 0; 
            sfxZoom.play();
        }
    });
});