/**
 * CRUZ ESTUDIO ® — NAV CONTRAST
 * La navbar no tiene contenedor, así que el logo y el toggle deben garantizar
 * contraste sobre cualquier fondo. Este módulo muestrea el color REAL del fondo
 * justo debajo de la nav (bajo el logo y bajo el toggle), calcula su luminancia
 * y aplica `body.nav-light` cuando el fondo es claro → logo y toggle pasan a negro.
 *
 * Override: si existe body[data-nav-force="light|dark"], manda ese valor. Lo usa
 * el hero, que conoce su propia inversión cromática (su fondo es una capa con
 * pointer-events:none y no se puede muestrear).
 */
(function () {
    'use strict';

    function init() {
        const nav = document.querySelector('.navbar-modern');
        if (!nav) return;

        const body = document.body;
        const logo = nav.querySelector('.logo');
        const toggle = nav.querySelector('.nav-toggle');

        // Primer ancestro con un background-color suficientemente opaco
        function bgOf(el) {
            while (el && el !== document.documentElement) {
                const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
                if (m) {
                    const p = m[1].split(',').map(Number);
                    const a = p.length > 3 ? p[3] : 1;
                    if (a > 0.5) return { r: p[0], g: p[1], b: p[2] };
                }
                el = el.parentElement;
            }
            const m = getComputedStyle(body).backgroundColor.match(/rgba?\(([^)]+)\)/);
            if (m) {
                const p = m[1].split(',').map(Number);
                return { r: p[0], g: p[1], b: p[2] };
            }
            return null;
        }

        // Luminancia relativa (WCAG)
        function lum(c) {
            const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
            return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
        }

        function recompute() {
            const forced = body.getAttribute('data-nav-force');
            if (forced) {
                body.classList.toggle('nav-light', forced === 'light');
                return;
            }

            const r = nav.getBoundingClientRect();
            const y = Math.max(1, Math.min(window.innerHeight - 1, r.bottom + 4));

            const xs = [];
            if (logo) { const b = logo.getBoundingClientRect(); xs.push(b.left + b.width / 2); }
            if (toggle) { const b = toggle.getBoundingClientRect(); xs.push(b.left + b.width / 2); }
            if (!xs.length) xs.push(window.innerWidth / 2);

            let light = 0, total = 0;
            xs.forEach(x => {
                const el = document.elementFromPoint(
                    Math.max(1, Math.min(window.innerWidth - 1, x)), y
                );
                if (!el) return;
                const c = bgOf(el);
                if (!c) return;
                total++;
                if (lum(c) > 0.5) light++;
            });

            if (!total) return;
            body.classList.toggle('nav-light', light > total / 2);
        }

        let raf = null;
        function onScroll() {
            if (raf) return;
            raf = requestAnimationFrame(() => { raf = null; recompute(); });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('load', recompute);
        setTimeout(recompute, 250);
        recompute();

        // Permite forzar un recálculo desde otros módulos (p.ej. el hero)
        window.cruzNavContrast = recompute;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
