/**
 * SISTEMA INTEGRAL CRUZ ESTUDIO ® 2026
 * Dirección Creativa: Juan Cruz
 * Versión: Consolidada + Loader V2 (barra de progreso)
 */
 
// 1. VARIABLES GLOBALES
let intervalId = null; 
let currentIndex = 0;
let projectImages = [];
 
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const navbar = document.querySelector('.navbar-brand');
    const loader = document.querySelector('.loader') || document.getElementById('loader');
    const percentage = document.getElementById('loader-percentage'); // número ghost
    const loaderBar = document.getElementById('loader-bar');          // barra de progreso
    const menuBtn = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
 
    // --- 2. LOADER V2 SISTEMATIZADO ---
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
                body.style.height = 'auto';
            }, 500);
        }
        // Actualizar número fantasma
        if (percentage) percentage.textContent = String(progress).padStart(2, '0');
        // Actualizar barra de progreso
        if (loaderBar) loaderBar.style.width = `${progress}%`;
    }, 40);
 
    // --- 3. HERO KINÉTICO (ROTACIÓN DE CONCEPTOS) ---
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
                body.classList.remove('menu-open');
            }
        });
    });
 
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }
 
    // --- 5. CURSOR PERSONALIZADO (FLAIR DIGITAL) ---
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        document.querySelectorAll('a, button, .featured-work-item, .fwv2-card').forEach(link => {
            link.addEventListener('mouseenter', () => cursor.classList.add('cursor-expand'));
            link.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expand'));
        });
    }
 
    // --- 6. LIVE DATA (RELOJES Y CLIMA REAL) ---
    function updateLiveClocks() {
        const clockEls = document.querySelectorAll(
            '#hero-clock, #footer-clock, #loader-clock'
        );
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-AR', { 
            hour: '2-digit', minute: '2-digit', hour12: false, 
            timeZone: 'America/Argentina/Buenos_Aires' 
        });
        clockEls.forEach(el => { if (el) el.textContent = timeStr; });
    }
 
    async function updateWeather() {
        const tempEl = document.getElementById('hero-temp');
        const iconEl = document.getElementById('hero-weather-icon');
        try {
            const res = await fetch(
                'https://api.open-meteo.com/v1/forecast?latitude=-34.60&longitude=-58.38&current_weather=true'
            );
            const data = await res.json();
            if (data && data.current_weather) {
                const temp = Math.round(data.current_weather.temperature);
                const code = data.current_weather.weathercode;
                let icon = 'cloud';
                if (code === 0) icon = 'wb_sunny';
                if (code >= 1 && code <= 3) icon = 'partly_cloudy_day';
                if (code >= 51) icon = 'rainy';
                if (tempEl) tempEl.textContent = `${temp}°C`;
                if (iconEl) iconEl.textContent = icon;
            }
        } catch (e) { console.warn("Clima no disponible temporalmente"); }
    }
 
    setInterval(updateLiveClocks, 1000);
    updateLiveClocks();
    updateWeather();
 
    // --- 7. REVEALS AL SCROLLEAR ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stagger para hijos directos en la misma sección
                const siblings = [...entry.target.parentElement
                    .querySelectorAll('.scroll-reveal:not(.visible)')];
                const idx = siblings.indexOf(entry.target);
                if (idx > 0) {
                    entry.target.style.transitionDelay = `${idx * 0.08}s`;
                }
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
 
    document.querySelectorAll(
        '#studio-intro, .scroll-reveal, .featured-work-item, .service-block, .fwv2-card'
    ).forEach(el => revealObserver.observe(el));
});
 
 
// --- 8. FUNCIONES GLOBALES ---
window.changePreview = function(projectNum) {
    document.querySelectorAll('.preview-inner img').forEach(img => img.classList.remove('active'));
    document.getElementById(`project-image-${projectNum}`)?.classList.add('active');
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