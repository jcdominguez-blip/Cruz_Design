/**
 * CRUZ ESTUDIO ® — INFRAESTRUCTURA DE REVEAL GLOBAL (.gsap-reveal)
 *
 * Fade-Up Reveal para cualquier elemento con la clase `.gsap-reveal`.
 * Reutiliza el stack ya inicializado en el sitio:
 *   · Lenis (smooth scroll)  → java/smooth-scroll.js
 *   · GSAP + ScrollTrigger   → cargados en el <head>, sincronizados con Lenis
 *     vía ScrollTrigger.update en smooth-scroll.js.
 * No re-inicializa Lenis ni el ticker (evita doble RAF).
 *
 * Estado inicial: y 60 · opacity 0 · rotation 2 (sutil enderezado).
 * Animación:      y 0  · opacity 1 · rotation 0 · duration 1.2 · power4.out.
 * ScrollTrigger:  start "top 85%" · toggleActions "play none none reverse".
 *
 * Respeta prefers-reduced-motion (muestra todo, sin animar).
 */
(function () {
    'use strict';

    var SELECTOR = '.gsap-reveal';

    function init() {
        if (typeof gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;

        var els = gsap.utils.toArray(SELECTOR);
        if (!els.length) return;

        // Reduced motion: sin animación, contenido visible.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.set(els, { opacity: 1, y: 0, rotation: 0, clearProps: 'transform' });
            return;
        }

        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}

        els.forEach(function (el) {
            gsap.set(el, { y: 60, opacity: 0, rotation: 2, willChange: 'transform' });
            gsap.to(el, {
                y: 0,
                opacity: 1,
                rotation: 0,
                duration: 1.2,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        });

        // El layout definitivo llega tras fuentes/imágenes/pins.
        window.addEventListener('load', function () {
            requestAnimationFrame(function () {
                try { window.ScrollTrigger.refresh(); } catch (_) {}
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
