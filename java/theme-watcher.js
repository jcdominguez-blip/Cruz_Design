/* ==========================================================================
   THEME WATCHER — Detecta el fondo de la sección que está cruzando el centro
   del viewport y setea body[data-bg="dark"|"light"]. Lo usa la etiqueta WE
   lateral para invertir su color y mantener contraste.
   ========================================================================== */
(function () {
    'use strict';

    function init() {
        const body = document.body;
        if (!body) return;

        const sections = document.querySelectorAll('[data-theme]');
        if (!sections.length) return;

        // Por defecto el sitio arranca en dark (hero + studio).
        body.setAttribute('data-bg', body.getAttribute('data-bg') || 'dark');

        let currentTheme = body.getAttribute('data-bg');
        const lastTopForSection = new Map();

        function recompute() {
            const probe = window.innerHeight * 0.5;
            let candidate = null;
            let candidateDistance = Infinity;

            sections.forEach((sec) => {
                const r = sec.getBoundingClientRect();
                if (r.bottom < 0 || r.top > window.innerHeight) return;
                // Distancia del centro del viewport al centro de la sección
                const center = r.top + r.height / 2;
                const dist = Math.abs(center - probe);
                if (dist < candidateDistance) {
                    candidateDistance = dist;
                    candidate = sec;
                }
            });

            if (!candidate) return;
            const theme = candidate.getAttribute('data-theme');
            if (theme && theme !== currentTheme) {
                currentTheme = theme;
                body.setAttribute('data-bg', theme);
            }
        }

        let raf = null;
        function onScroll() {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = null;
                recompute();
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('load', recompute);
        recompute();

        // Marca etiqueta como lista para fade-in inicial
        const tag = document.getElementById('we-side-tag');
        if (tag) requestAnimationFrame(() => tag.classList.add('is-ready'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
