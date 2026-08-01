/**
 * ============================================================
 *  CRUZ ESTUDIO ® — Preguntas Frecuentes (FAQ)
 *
 *  · Acordeón: un panel abierto a la vez (click en la pregunta abre y cierra
 *    los demás). Accesible vía aria-expanded. La animación de apertura es CSS
 *    (clase .open + grid-template-rows).
 *  · Scroll reveal: "fade in up" con stagger, disparado por IntersectionObserver
 *    cuando la sección entra al viewport. El observer se registra en `load`
 *    (layout ya estable tras los pins del hero de 520vh) y la sección está al
 *    final de la página, así que nunca se pre-dispara.
 *
 *  Failsafe: si el JS no corre, la sección queda visible (no se agrega .js-faq).
 * ============================================================
 */
(function () {
    'use strict';

    function init() {
        var section = document.getElementById('faq');
        if (!section) return;

        // ── Acordeón: uno abierto a la vez ──
        var items = Array.prototype.slice.call(
            section.querySelectorAll('[data-faq-item]')
        );

        items.forEach(function (item) {
            var btn = item.querySelector('.faq-q');
            if (!btn) return;
            btn.addEventListener('click', function () {
                var wasOpen = item.classList.contains('open');
                items.forEach(function (it) {
                    it.classList.remove('open');
                    var b = it.querySelector('.faq-q');
                    if (b) b.setAttribute('aria-expanded', 'false');
                });
                if (!wasOpen) {
                    item.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // ── Scroll reveal ──
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Cascada: asigna el retraso incremental a cada elemento marcado.
        var revealEls = Array.prototype.slice.call(
            section.querySelectorAll('[data-faq-reveal]')
        );
        revealEls.forEach(function (el, i) {
            el.style.setProperty('--faq-d', (i * 0.08).toFixed(2) + 's');
        });

        // Activa el estado oculto inicial (CSS .js-faq). Sin esto la sección
        // queda visible por defecto (failsafe si este módulo no corre).
        document.documentElement.classList.add('js-faq');

        var reveal = function () { section.classList.add('faq-in'); };

        if (reduce) { reveal(); return; }

        // Preferimos GSAP ScrollTrigger (igual que reveal-headers.js /
        // services-accordion.js): calcula el trigger en la posición REAL de la
        // sección tras los pins del hero (520vh). Ahora que el FAQ va a mitad de
        // página esto importa: un observer global se pre-dispararía. Fallback a
        // IntersectionObserver registrado en `load` si no hubiera GSAP.
        var hasST = typeof gsap !== 'undefined' &&
                    typeof window.ScrollTrigger !== 'undefined';

        if (hasST) {
            try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}
            // Mismo patrón exacto que reveal-headers.js: disparamos sobre un
            // elemento CHICO (el encabezado), no sobre la <section> completa. Con
            // el hero de 520vh, usar la sección alta como trigger la hacía
            // pre-disparar; el header se comporta bien. reveal() agrega .faq-in a
            // la sección igual, así el stagger corre en head + items.
            var trigger = section.querySelector('.faq-head') || section;
            window.ScrollTrigger.create({
                trigger: trigger,
                start: 'top 82%',
                once: true,
                onEnter: reveal
            });
            // El layout definitivo llega tras cargar imágenes y aplicar los pins.
            window.addEventListener('load', function () {
                requestAnimationFrame(function () {
                    try { window.ScrollTrigger.refresh(); } catch (_) {}
                });
            });
        } else if ('IntersectionObserver' in window) {
            var start = function () {
                var io = new IntersectionObserver(function (entries) {
                    entries.forEach(function (e) {
                        if (e.isIntersecting) { reveal(); io.disconnect(); }
                    });
                }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
                io.observe(section);
            };
            if (document.readyState === 'complete') start();
            else window.addEventListener('load', start);
        } else {
            reveal();
        }
        // Sin failsafe por tiempo: sería contraproducente para una sección al
        // fondo de la página (revelaría el FAQ antes de que el usuario scrollee
        // hasta él, perdiendo la animación). El failsafe real es CSS: si este
        // módulo no corre, no se agrega .js-faq y el contenido queda visible.
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
