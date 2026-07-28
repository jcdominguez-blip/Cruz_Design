/**
 * CRUZ ESTUDIO ® — PROYECTOS DESTACADOS (grilla asimétrica, ref. produx.design).
 *
 * · Reveal: al entrar en pantalla se agrega `.is-in` y el CSS abre el contenedor
 *   (clip-path) + desescala la imagen + entra el texto.
 * · Parallax: GSAP mueve la imagen en Y DENTRO del contenedor al scrollear.
 *
 * El disparo del reveal usa ScrollTrigger y NO IntersectionObserver: esta página
 * tiene un hero de 520vh y secciones pineadas, así que en DOMContentLoaded el
 * layout todavía no está armado y un observer dispara todo de una (la sección
 * "cae" dentro del viewport). ScrollTrigger recalcula en cada refresh.
 */
(function () {
    'use strict';

    function init() {
        const items = Array.prototype.slice.call(
            document.querySelectorAll('#featured-works .pw-item')
        );
        if (!items.length) return;

        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
            items.forEach(el => el.classList.add('is-in'));
            return;
        }

        initSectionSilk();

        const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

        if (hasGSAP) {
            gsap.registerPlugin(ScrollTrigger);
            items.forEach(item => {
                ScrollTrigger.create({
                    trigger: item,
                    start: 'top 88%',
                    once: true,
                    onEnter: () => item.classList.add('is-in')
                });
            });
            initParallax(items);
            // El layout cambia cuando cargan imágenes y se aplican los pins
            window.addEventListener('load', () => ScrollTrigger.refresh());
        } else {
            // Fallback sin GSAP: observer registrado recién en `load`, cuando el
            // layout ya está estable (si no, dispara todo junto).
            const start = () => {
                if (!('IntersectionObserver' in window)) {
                    items.forEach(el => el.classList.add('is-in'));
                    return;
                }
                const io = new IntersectionObserver(entries => {
                    entries.forEach(e => {
                        if (!e.isIntersecting) return;
                        e.target.classList.add('is-in');
                        io.unobserve(e.target);
                    });
                }, { threshold: 0.15 });
                items.forEach(el => io.observe(el));
            };
            if (document.readyState === 'complete') start();
            else window.addEventListener('load', start);
        }
    }

    /**
     * Silk propio de la sección (mismo shader que el hero → continuidad visual).
     * Va sobre el negro sólido: si WebGL falla, el fondo sigue siendo opaco.
     * En pantallas chicas no se monta (perf): queda el negro + el grano.
     */
    function initSectionSilk() {
        const mount = document.querySelector('#featured-works .pw-silk');
        if (!mount) return;
        if (matchMedia('(max-width: 700px)').matches) return;

        let tries = 0;
        (function attempt() {
            if (window.cruzCreateSilk && window.THREE) {
                // rama oscura (igual que el hero) + DPR capado: el mount cubre
                // toda la sección, así el canvas no se vuelve enorme.
                window.cruzCreateSilk(mount, { maxDpr: 1 });
                return;
            }
            if (tries++ < 120) setTimeout(attempt, 80);   // espera a THREE / silk-bg.js
        })();
    }

    /**
     * Parallax: al scrollear hacia abajo la imagen se desplaza suavemente hacia
     * abajo dentro del contenedor. La imagen mide 118% de alto y arranca en
     * top:-9%, así el ±6% de recorrido nunca deja asomar un borde.
     */
    function initParallax(items) {
        items.forEach(item => {
            const img = item.querySelector('.pw-img');
            if (!img) return;
            gsap.fromTo(img,
                { yPercent: -6 },
                {
                    yPercent: 6,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: item,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                        invalidateOnRefresh: true
                    }
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
