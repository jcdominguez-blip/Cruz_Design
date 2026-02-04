/**
 * SISTEMA INTEGRAL CRUZ ESTUDIO ® 2026
 * Dirección Creativa: Juan Cruz
 * Versión: Navegación Sistematizada + Hero Kinético (NYT Style)
 */

// 1. VARIABLES GLOBALES ÚNICAS
let projectInterval = null;
let intervalId = null; 
let currentIndex = 0;
let projectImages = [];

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const navbar = document.querySelector('.navbar-brand');
    const loader = document.querySelector('.loader');
    const percentage = document.querySelector('.loader-percentage');
    const progressBar = document.querySelector('.progress-bar');
    const menuBtn = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    // Detectamos si la URL tiene un ancla (#) para evitar bloqueos en navegación externa
    const isExternalNav = window.location.hash !== "";

    // --- 2. GESTIÓN DE LOADER (SISTEMATIZADO) ---
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            
            setTimeout(() => {
                loader?.classList.add('hidden');
                
                if (isExternalNav) {
                    // Si viene de otra página a una sección: Desbloqueo inmediato
                    unlockBodyScroll();
                    setTimeout(() => handleInitialHash(), 150);
                } else {
                    // Si entra al Home: Libertad de scroll pero con inicio controlado
                    unlockBodyScroll();
                }
            }, 500);
        }
        if (percentage) percentage.textContent = `${progress}%`;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }, 40);

    function unlockBodyScroll() {
        body.classList.remove('scroll-locked');
        body.style.overflow = 'auto';
        body.style.height = 'auto';
        body.style.position = 'static';
    }

    function handleInitialHash() {
        const hash = window.location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                const navHeight = navbar ? navbar.offsetHeight : 90;
                window.scrollTo({
                    top: target.offsetTop - navHeight,
                    behavior: 'smooth'
                });
            }
        }
    }

    // --- 3. HERO KINÉTICO (REEMPLAZA TYPEWRITER) ---
    // Efecto de rotación vertical: IDEAS, MARCAS, SISTEMAS, IDENTIDADES
    const kineticTarget = document.getElementById("kinetic-word");
    if (kineticTarget) {
        const words = ["IDEAS", "MARCAS", "ESTRATEGIAS", "IDENTIDADES"];
        let wordIdx = 0;

        setInterval(() => {
            // Fase 1: Salida (Dropdown/Persiana)
            kineticTarget.style.transform = 'translateY(-20px)';
            kineticTarget.style.opacity = '0';

            setTimeout(() => {
                // Fase 2: Cambio de palabra
                wordIdx = (wordIdx + 1) % words.length;
                kineticTarget.textContent = words[wordIdx];
                
                // Posicionamos abajo para la entrada
                kineticTarget.style.transform = 'translateY(20px)';
                
                // Fase 3: Entrada
                requestAnimationFrame(() => {
                    kineticTarget.style.transform = 'translateY(0)';
                    kineticTarget.style.opacity = '1';
                });
            }, 600); // Sincronizado con la transición CSS
        }, 3000);
    }

    // --- 4. NAVEGACIÓN SUAVE (SMOOTH SCROLL) ---
    document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const targetId = href.includes('#') ? '#' + href.split('#')[1] : href;
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                unlockBodyScroll();
                const navHeight = navbar ? navbar.offsetHeight : 90;
                window.scrollTo({
                    top: targetElement.offsetTop - navHeight,
                    behavior: 'smooth'
                });

                // Cierre de menú móvil
                if (navLinks?.classList.contains('active')) {
                    menuBtn?.classList.remove('open');
                    navLinks?.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            }
        });
    });

    // --- 5. MENÚ MÓVIL (TOGGLE) ---
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }
// Reloj del Footer
function updateFooterClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false, 
        timeZone: 'America/Argentina/Buenos_Aires' 
    });
    document.getElementById('footer-clock').textContent = timeString;
}
setInterval(updateFooterClock, 1000);

// Cursor Estilo Flair Digital
const cursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Efecto de expansión al pasar por links
const links = document.querySelectorAll('a, button');
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(4)';
        cursor.style.opacity = '0.5';
    });
    link.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.opacity = '1';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Función del Reloj (Buenos Aires)
    function updateFooterClock() {
        const clockElement = document.getElementById('footer-clock');
        if (clockElement) {
            const now = new Date();
            const options = { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false, 
                timeZone: 'America/Argentina/Buenos_Aires' 
            };
            clockElement.textContent = now.toLocaleTimeString('es-AR', options);
        }
    }

    // Ejecución inmediata y actualización cada minuto
    updateFooterClock();
    setInterval(updateFooterClock, 60000);

    // Lógica del Cursor Personalizado (Flair Digital)
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Efecto hover en links
        const links = document.querySelectorAll('a, button, .featured-work-item');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => cursor.classList.add('cursor-expand'));
            link.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expand'));
        });
    }
});
    // --- 6. RELOJ Y REVEALS ---
    function updateClock() {
        const clockElements = document.querySelectorAll('#clock, #loader-clock');
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-AR', { hour12: false });
        clockElements.forEach(el => el.textContent = timeStr);
    }
    setInterval(updateClock, 1000);
    updateClock();

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { 
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px" 
    });

    document.querySelectorAll('.scroll-reveal, #studio-intro, .featured-work-item, .service-row').forEach((el) => {
        revealObserver.observe(el);
    });

    // --- 7. FORMULARIO ESTRATÉGICO ---
    const textarea = document.getElementById('userMsg');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + "px";
        });
    }

    const contactForm = document.querySelector('.form-sistematizado');
    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            const nombreInput = document.getElementById('userName');
            if (nombreInput) {
                localStorage.setItem('clienteNombre', nombreInput.value);
            }
        });
    }
});

// --- 8. FUNCIONES GLOBALES (ACORDEÓN Y PREVIEWS) ---
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
        projectImages = JSON.parse(span.getAttribute('data-images') || "[]");
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

function changePreview(projectNum) {
    const allImages = document.querySelectorAll('.preview-inner img');
    allImages.forEach(img => img.classList.remove('active'));
    const targetImage = document.getElementById(`project-image-${projectNum}`);
    if (targetImage) targetImage.classList.add('active');
}

function redirectWithAnimation(element) {
    const url = element.getAttribute('data-url');
    const transition = document.querySelector('.page-transition');
    if (url && transition) {
        transition.style.transformOrigin = "left";
        transition.classList.add('entering');
        setTimeout(() => { window.location.href = url; }, 800);
    }
}