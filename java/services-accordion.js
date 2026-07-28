/**
 * ============================================================
 *  CRUZ ESTUDIO ® — Programa de Servicios (Acordeón editorial)
 *
 *  · Toggle: click en una fila abre su panel y cierra las demás
 *    (uno abierto a la vez). Accesible (aria-expanded).
 *  · Reveal: las filas entran en cascada (produx) cuando la lista
 *    cruza el viewport. Se dispara con GSAP ScrollTrigger para que
 *    calcule la posición REAL tras los pins del hero (520vh) — si
 *    usáramos el observer global se pre-dispararía (ver reveal-headers.js).
 *
 *  La animación de apertura y de reveal es CSS (clases .open / .is-in),
 *  así corre sin depender de rAF. Este módulo solo decide el CUÁNDO.
 *
 *  Carga: DESPUÉS de gsap.min.js + ScrollTrigger.min.js.
 * ============================================================
 */
(function () {
    'use strict';

    function init() {
        var section = document.getElementById('services');
        if (!section || !section.classList.contains('services-accordion')) return;

        var list  = section.querySelector('[data-sva-list]');
        var items = Array.prototype.slice.call(section.querySelectorAll('[data-sva-item]'));
        if (!list || !items.length) return;

        // ── Acordeón: uno abierto a la vez ──
        section.querySelectorAll('.sva-row').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = btn.closest('[data-sva-item]');
                if (!item) return;
                var wasOpen = item.classList.contains('open');

                items.forEach(function (it) {
                    it.classList.remove('open');
                    var b = it.querySelector('.sva-row');
                    if (b) b.setAttribute('aria-expanded', 'false');
                });

                if (!wasOpen) {
                    item.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // ── Fondo claro texturado + inversión negro→blanco (OJoROgY) ──
        initBackground(section);

        // ── Reveal de filas ──
        // Reduced motion: mostramos todo, sin animación.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            list.classList.add('is-in');
            return;
        }

        // Activa el estado oculto inicial (CSS .js-sva). Si este módulo no corre,
        // las filas quedan visibles por defecto (failsafe natural).
        document.documentElement.classList.add('js-sva');

        var reveal = function () { list.classList.add('is-in'); };

        var hasST = typeof gsap !== 'undefined' &&
                    typeof window.ScrollTrigger !== 'undefined';

        if (hasST) {
            try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}
            window.ScrollTrigger.create({
                trigger: list,
                start: 'top 82%',
                once: true,
                onEnter: reveal
            });
            window.addEventListener('load', function () {
                requestAnimationFrame(function () {
                    try { window.ScrollTrigger.refresh(); } catch (_) {}
                });
            });
        } else {
            var start = function () {
                if (!('IntersectionObserver' in window)) { reveal(); return; }
                var io = new IntersectionObserver(function (entries) {
                    entries.forEach(function (e) {
                        if (e.isIntersecting) { reveal(); io.disconnect(); }
                    });
                }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
                io.observe(list);
            };
            if (document.readyState === 'complete') start();
            else window.addEventListener('load', start);
        }

        // Failsafe: si nada disparó el reveal (edge cases), mostrar igual.
        setTimeout(reveal, 4500);
    }

    /**
     * Fondo de la sección de servicios:
     *  · Silk en modo CLARO (blanco como textura, acento ~al tono base) →
     *    mismo look que la pantalla de loading de las páginas de proyecto.
     *    Solo en desktop (igual criterio de perf que #silk-content).
     *  · Inversión negro→blanco: la capa .sva-cover (dark + grano, continua con
     *    "Proyectos destacados") se desvanece con el scroll → el fondo cambia de
     *    negro a blanco manteniendo las texturas (técnica del pen GSAP OJoROgY).
     */
    function initBackground(section) {
        var silkMount = section.querySelector('.sva-silk');
        var cover = section.querySelector('.sva-cover');
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (silkMount && typeof window.cruzCreateSilk === 'function' &&
            !window.matchMedia('(max-width: 700px)').matches) {
            window.cruzCreateSilk(silkMount, {
                force: 'light',
                lightBase: '#FFFDF3',
                lightAccent: '#EDE9DC',
                maxDpr: 1
            });
        }

        if (!cover) return;

        var hasST = typeof gsap !== 'undefined' &&
                    typeof window.ScrollTrigger !== 'undefined';

        // Sin GSAP o reduced-motion: fondo claro directo (sin capa oscura).
        if (reduce || !hasST) { cover.style.opacity = '0'; return; }

        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}
        gsap.set(cover, { opacity: 1 });
        gsap.to(cover, {
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',   // top de la sección tocando el borde inferior
                end: 'top 45%',        // inversión completa cuando el top llega al 45%
                scrub: true,
                invalidateOnRefresh: true
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
