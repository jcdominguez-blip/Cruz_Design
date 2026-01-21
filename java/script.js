document.addEventListener('DOMContentLoaded', () => {
    // 1. LOADER & PERCENTAGE
    const loader = document.querySelector('.loader');
    const percentage = document.querySelector('.loader-percentage');
    const progressBar = document.querySelector('.progress-bar');
    let progress = 0;

    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                loader?.classList.add('hidden');
                document.body.classList.add('scroll-locked');
            }, 500);
        }
        if (percentage) percentage.textContent = `${progress}%`;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }, 50);

    // 2. NAV TOGGLE (HAMBURGER TO X)
    const menuBtn = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // 3. TYPEWRITER EFFECT
    const texts = ["Sistematizamos marcas", "Diseñamos estrategias", "Creamos valor visual"];
    let idx = 0, charIdx = 0, isDeleting = false;
    const target = document.getElementById("hero-title");

    function type() {
        if (!target) return;
        const fullText = texts[idx];
        target.textContent = isDeleting ? fullText.substring(0, charIdx--) : fullText.substring(0, charIdx++);
        let speed = isDeleting ? 50 : 100;

        if (!isDeleting && charIdx > fullText.length) { isDeleting = true; speed = 1500; }
        else if (isDeleting && charIdx < 0) { isDeleting = false; idx = (idx + 1) % texts.length; speed = 500; }
        setTimeout(type, speed);
    }
    type();

    // 4. SCROLL & REVEAL
    const scrollBtn = document.querySelector('.scroll-down-btn');
    scrollBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.remove('scroll-locked');
        const studio = document.querySelector('#studio-intro');
        window.scrollTo({ top: studio.offsetTop - 80, behavior: 'smooth' });
        setTimeout(() => studio?.classList.add('visible'), 600);
    });
});


// 1. Redirección con animación de cortina
function redirectWithAnimation(element) {
    const url = element.getAttribute('data-url');
    const transition = document.querySelector('.page-transition');

    if (url) {
        // Activamos la clase 'entering' definida en tu CSS
        transition.style.transformOrigin = "left";
        transition.classList.add('entering');
        
        // Esperamos 800ms (duración de la animación) antes de cambiar de página
        setTimeout(() => {
            window.location.href = url;
        }, 800);
    }
}

// 2. Cambio de imagen en el Preview (Hover)
function changePreview(projectNum) {
    // Quitamos la clase active de todas las imágenes de la preview
    const allImages = document.querySelectorAll('.preview-inner img');
    allImages.forEach(img => {
        img.classList.remove('active');
    });

    // Activamos la imagen que coincide con el ID del proyecto
    const targetImage = document.getElementById(`project-image-${projectNum}`);
    if (targetImage) {
        targetImage.classList.add('active');
    }
}

// --- GESTIÓN DE ACORDEÓN Y PROYECTOS (Unificada) ---
let currentIndex = 0;
let projectImages = [];
let projectInterval;

window.toggleAccordion = function(element) {
    const allAccordions = document.querySelectorAll('.accordion');
    const content = element.nextElementSibling;
    const isNowActive = element.classList.contains('active');

    // Resetear otros
    allAccordions.forEach(acc => {
        acc.classList.remove('active');
        acc.nextElementSibling.style.display = "none";
    });

    if (intervalId) clearInterval(intervalId);

    if (!isNowActive) {
        element.classList.add('active');
        content.style.display = "block";

        // Cargar galería de imágenes del proyecto
        const span = element.querySelector('span');
        projectImages = JSON.parse(span.getAttribute('data-images'));
        currentIndex = 0;
        
        if (projectImages && projectImages.length > 0) {
            updateProjectImage();
            intervalId = setInterval(updateProjectImage, 2500);
        }
    }
};

function updateProjectImage() {
    const imgElement = document.getElementById('project-image');
    if (projectImages.length > 0) {
        imgElement.style.opacity = 0.5; // Efecto transición simple
        setTimeout(() => {
            imgElement.src = projectImages[currentIndex];
            imgElement.style.opacity = 1;
            currentIndex = (currentIndex + 1) % projectImages.length;
        }, 300);
    }
}

// --- TRADUCCIÓN (Consolidada) ---
document.addEventListener('DOMContentLoaded', () => {
    const languageToggle = document.getElementById('language-toggle');
    
    languageToggle.addEventListener('click', () => {
        const isEsp = languageToggle.textContent.trim().toLowerCase() === 'español';
        languageToggle.textContent = isEsp ? 'English' : 'Español';
        document.documentElement.lang = isEsp ? 'en' : 'es';

        document.querySelectorAll('[data-en], [data-es]').forEach(el => {
            el.textContent = isEsp ? el.getAttribute('data-en') : el.getAttribute('data-es');
        });
        
        // Actualizar labels del formulario
        document.querySelectorAll('.form-group label').forEach(label => {
            label.textContent = isEsp ? label.getAttribute('data-en') : label.getAttribute('data-es');
        });
    });
});

// --- TYPEWRITER HERO (Identidad Cruz) ---
document.addEventListener("DOMContentLoaded", () => {
    const texts = ["Sistematizamos marcas", "Diseñamos estrategias", "Creamos valor visual"];
    let idx = 0, charIdx = 0, isDeleting = false;
    const target = document.getElementById("hero-title");

    function type() {
        const fullText = texts[idx];
        target.textContent = isDeleting 
            ? fullText.substring(0, charIdx--) 
            : fullText.substring(0, charIdx++);

        let speed = isDeleting ? 50 : 100;

        if (!isDeleting && charIdx > fullText.length) {
            isDeleting = true;
            speed = 1500; // Pausa al terminar de escribir
        } else if (isDeleting && charIdx < 0) {
            isDeleting = false;
            idx = (idx + 1) % texts.length;
            speed = 500;
        }

        setTimeout(type, speed);
    }
    if(target) type();
});

// --- LOADER (Fluidez de Sistema) ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loader');
    const progressBar = document.querySelector('.progress-bar');
    const percentage = document.querySelector('.loader-percentage');
    let progress = 0;

    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.style.overflow = '';
            }, 500);
        }
        progressBar.style.width = `${progress}%`;
        percentage.textContent = `${progress}%`;
    }, 40);
});

/**
 * SISTEMA DE NAVEGACIÓN ESTRATÉGICA - CRUZ ESTUDIO
 * Manejo de desplazamiento suave con compensación de Navbar
 */
document.addEventListener('DOMContentLoaded', () => {
    const scrollBtn = document.querySelector('.scroll-down-btn');
    const navbar = document.querySelector('.navbar-brand');

    if (scrollBtn && navbar) {
        scrollBtn.addEventListener('click', function(e) {
            // 1. Prevenimos el salto brusco original
            e.preventDefault();

            // 2. Identificamos el destino (el id del href, ej: #work)
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // 3. Calculamos la altura dinámica del Navbar para el offset
                const navHeight = navbar.offsetHeight;

                // 4. Calculamos la posición final: (Distancia al tope) - (Altura Navbar)
                const targetPosition = targetElement.offsetTop - navHeight;

                // 5. Ejecutamos el desplazamiento cinematográfico
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
});

/**
 * SISTEMA DE INTERACCIÓN CRUZ DISEÑO ®
 * Gestiona el bloqueo de scroll, la transición fluida y el reveal de texto.
 */
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const scrollBtn = document.querySelector('.scroll-down-btn');
    const studioSection = document.querySelector('#studio-intro');
    const navbar = document.querySelector('.navbar-brand');

    // 1. BLOQUEO DE SEGURIDAD
    // Evita que el usuario scrollee antes de interactuar con el Hero.
    body.classList.add('scroll-locked');

    if (scrollBtn) {
        scrollBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // 2. DESBLOQUEO DE EXPERIENCIA
            // Permite el movimiento libre una vez presionado el botón circular.
            body.classList.remove('scroll-locked');

            if (studioSection) {
                // 3. CÁLCULO DE POSICIÓN DINÁMICA
                // Restamos la altura del navbar para una alineación milimétrica.
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = studioSection.offsetTop - navHeight;

                // 4. TRANSICIÓN CINEMATOGRÁFICA (DROP)
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // 5. DISPARO DE MANIFIESTO (REVEAL UP)
                // Delay estratégico para que la tipografía aparezca durante el desplazamiento.
                setTimeout(() => {
                    studioSection.classList.add('visible');
                }, 600); // 600ms es el punto óptimo de sincronización visual.
            }
        });
    }

    // Opcional: Re-bloqueo al volver al inicio (Home/Logo)
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            // Si el usuario vuelve al Hero, se puede restaurar el bloqueo si se desea.
            // body.classList.add('scroll-locked');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const workItems = document.querySelectorAll('.featured-work-item');
    const previewImages = document.querySelectorAll('.preview-inner img');

    workItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const projectId = item.getAttribute('data-project');
            
            // Ocultar todas las imágenes
            previewImages.forEach(img => img.classList.remove('active'));
            
            // Mostrar la imagen correspondiente
            const targetImage = document.getElementById(`project-image-${projectId}`);
            if (targetImage) {
                targetImage.classList.add('active');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
});