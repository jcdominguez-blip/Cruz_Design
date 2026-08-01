/**
 * METODOLOGÍA — CRUZ ESTUDIO ®
 *
 * 1) Scroll reveal "fade in up" con stagger (IntersectionObserver, vanilla) para
 *    hero y CTA.
 * 2) TIMELINE interactivo (ref. wearemotto.com/motto-method): una línea vertical
 *    que se "prende" al scrollear y va ACTIVANDO los pasos 01→04 en secuencia.
 *    El relleno se controla con GSAP ScrollTrigger (scrub) — ya cargado en la
 *    página e integrado con Lenis. Cada paso se activa cuando la línea llega a su
 *    nodo; se apaga si volvés a subir.
 *
 * Fallbacks: sin IntersectionObserver / sin GSAP / prefers-reduced-motion →
 * todo queda visible y activo (la página nunca se rompe).
 */
(function () {
    'use strict';

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── 1 · REVEAL (hero / CTA) ─────────────────────────────────────────── */
    function initReveal() {
        var nodes = Array.prototype.slice.call(
            document.querySelectorAll('.metodo-page [data-reveal]')
        );
        if (!nodes.length) return;

        // Stagger según posición entre hermanos [data-reveal] del mismo bloque
        nodes.forEach(function (el) {
            var parent = el.parentElement;
            if (!parent) return;
            // Los pasos del timeline entran de a uno al scrollear: sin stagger
            // acumulado (cada uno revela apenas entra).
            if (parent.hasAttribute('data-timeline')) return;
            var sibs = Array.prototype.filter.call(parent.children, function (c) {
                return c.hasAttribute && c.hasAttribute('data-reveal');
            });
            var i = sibs.indexOf(el);
            if (i > 0) el.style.setProperty('--d', (i * 0.1).toFixed(2) + 's');
        });

        var show = function (el) { el.classList.add('is-visible'); };

        if (reduce || !('IntersectionObserver' in window)) {
            nodes.forEach(show);
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
        nodes.forEach(function (el) { io.observe(el); });
    }

    /* ── 2 · TIMELINE (línea que se prende + activación de pasos) ─────────── */
    function initTimeline() {
        var list = document.querySelector('.mtd-steps[data-timeline]');
        if (!list) return;
        var fill = list.querySelector('.mtd-track-fill');
        var steps = Array.prototype.slice.call(list.querySelectorAll('.mtd-step'));
        if (!fill || !steps.length) return;

        var hasST = typeof gsap !== 'undefined' &&
                    typeof window.ScrollTrigger !== 'undefined';

        // Fallback: sin scroll-driven → línea completa y todos los pasos activos.
        if (reduce || !hasST) {
            fill.style.transform = 'scaleY(1)';
            steps.forEach(function (s) { s.classList.add('is-active'); });
            return;
        }

        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}

        // Fracción [0..1] de la altura del riel donde vive el nodo de cada paso.
        // Un paso se activa cuando el relleno (scaleY = progreso) supera su nodo.
        var ratios = [];
        function computeRatios() {
            var h = list.offsetHeight || 1;
            ratios = steps.map(function (step) {
                var node = step.querySelector('.mtd-node');
                var y = step.offsetTop + (node ? node.offsetTop : 0);
                return Math.max(0, Math.min(1, y / h));
            });
        }
        computeRatios();

        window.ScrollTrigger.create({
            trigger: list,
            start: 'top 62%',      // la línea empieza a prenderse al entrar la lista
            end: 'bottom 72%',     // termina de prenderse al salir por abajo
            scrub: true,
            invalidateOnRefresh: true,
            onRefresh: computeRatios,
            onUpdate: function (self) {
                var p = self.progress;
                fill.style.transform = 'scaleY(' + p + ')';
                for (var i = 0; i < steps.length; i++) {
                    steps[i].classList.toggle('is-active', p >= ratios[i] - 0.001);
                }
            }
        });

        // Layout definitivo tras fuentes/imágenes/pins.
        window.addEventListener('load', function () {
            requestAnimationFrame(function () {
                try { window.ScrollTrigger.refresh(); } catch (_) {}
            });
        });
    }

    function init() { initReveal(); initTimeline(); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
