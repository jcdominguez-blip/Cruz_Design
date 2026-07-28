/**
 * ============================================================
 *  CRUZ ESTUDIO ® — Reveal de headers de sección (ETAPA II)
 *
 *  Dispara el reveal CSS (clase .visible) de los headers marcados con
 *  [data-rh] usando GSAP ScrollTrigger EN LA POSICIÓN REAL de la sección.
 *
 *  ¿Por qué no IntersectionObserver global (script.js)?
 *  Esta home tiene un hero de 520vh + secciones pineadas. En DOMContentLoaded
 *  los pins/spacers todavía NO están armados, así que las secciones quedan
 *  apiladas cerca del top y el observer las considera "en pantalla" → revela
 *  todo de una al cargar y el header se ve ESTÁTICO cuando llegás scrolleando.
 *  ScrollTrigger recalcula en cada refresh (post-load), así que dispara en el
 *  punto correcto. Mismo criterio que java/featured-work.js.
 *
 *  El movimiento lo define el CSS ([data-rh] … .visible, curva --ease-expo).
 *  Este módulo solo decide CUÁNDO se agrega .visible.
 *
 *  Carga: DESPUÉS de gsap.min.js + ScrollTrigger.min.js.
 * ============================================================
 */
(function () {
    'use strict';

    function init() {
        var headers = Array.prototype.slice.call(
            document.querySelectorAll('[data-rh]')
        );
        if (!headers.length) return;

        // Reduced motion: mostramos el header ya revelado, sin animación.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            headers.forEach(function (h) { h.classList.add('visible'); });
            return;
        }

        var hasST = typeof gsap !== 'undefined' &&
                    typeof window.ScrollTrigger !== 'undefined';

        // Fallback sin GSAP: observer registrado en `load`, cuando el layout ya
        // está estable (si se registra antes, dispara todo junto por lo del pin).
        if (!hasST) {
            var start = function () {
                if (!('IntersectionObserver' in window)) {
                    headers.forEach(function (h) { h.classList.add('visible'); });
                    return;
                }
                var io = new IntersectionObserver(function (entries) {
                    entries.forEach(function (e) {
                        if (!e.isIntersecting) return;
                        e.target.classList.add('visible');
                        io.unobserve(e.target);
                    });
                }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
                headers.forEach(function (h) { io.observe(h); });
            };
            if (document.readyState === 'complete') start();
            else window.addEventListener('load', start);
            return;
        }

        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}

        headers.forEach(function (h) {
            window.ScrollTrigger.create({
                trigger: h,
                start: 'top 82%',
                once: true,
                onEnter: function () { h.classList.add('visible'); }
            });
        });

        // El layout definitivo llega tras cargar imágenes y aplicar los pins.
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
