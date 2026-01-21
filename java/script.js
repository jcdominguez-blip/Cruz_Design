/**
 * SISTEMA INTEGRAL CRUZ ESTUDIO ® 2026
 * Versión: Navegación Libre y Revelado por Scroll
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

    // --- 2. GESTIÓN DE LOADER (SIN BLOQUEO DE PANTALLA) ---
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            
            setTimeout(() => {
                loader?.classList.add('hidden');
                // LIBERTAD TOTAL: Aseguramos que el scroll esté habilitado desde el inicio
                body.style.overflow = 'auto';
                body.style.height = 'auto';
                body.style.position = 'static';
                body.classList.remove('scroll-locked');
            }, 500);
        }
        if (percentage) percentage.textContent = `${progress}%`;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }, 40);

    // --- 3. NAVEGACIÓN SUAVE (SMOOTH SCROLL) ---
    document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const targetId = href.includes('#') ? '#' + href.split('#')[1] : href;
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 90;
                window.scrollTo({
                    top: targetElement.offsetTop - navHeight,
                    behavior: 'smooth'
                });

                // Cerrar menú móvil si está abierto
                if (navLinks?.classList.contains('active')) {
                    menuBtn?.classList.remove('open');
                    navLinks?.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            }
        });
    });

    // --- 4. MENÚ MÓVIL (TOGGLE) ---
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }

    // --- 5. TYPEWRITER EFFECT (HERO) ---
    const typewriterTarget = document.getElementById("hero-title");
    if (typewriterTarget) {
        const texts = ["Sistematizamos marcas", "Diseñamos estrategias", "Creamos valor visual"];
        let idx = 0, charIdx = 0, isDeleting = false;

        function type() {
            const fullText = texts[idx];
            typewriterTarget.textContent = isDeleting ? fullText.substring(0, charIdx--) : fullText.substring(0, charIdx++);
            let speed = isDeleting ? 50 : 100;

            if (!isDeleting && charIdx > fullText.length) { isDeleting = true; speed = 1500; }
            else if (isDeleting && charIdx < 0) { isDeleting = false; idx = (idx + 1) % texts.length; speed = 500; }
            setTimeout(type, speed);
        }
        type();
    }

    // --- 6. RELOJ DEL FOOTER ---
    function updateClock() {
        const clockElements = document.querySelectorAll('#clock, #loader-clock');
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-AR', { hour12: false });
        clockElements.forEach(el => el.textContent = timeStr);
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- 7. SISTEMA DE REVELADO AUTOMÁTICO (REVEAL ON SCROLL) ---
    // Este observador activa tanto el manifiesto de Cruz Estudio como los demás elementos
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { 
        threshold: 0.2, // Se activa cuando el 20% del elemento es visible
        rootMargin: "0px 0px -50px 0px" // Dispara un poco antes de llegar
    });

    // Elementos a observar
    document.querySelectorAll('.scroll-reveal, #studio-intro, .featured-work-item').forEach((el) => {
        revealObserver.observe(el);
    });
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