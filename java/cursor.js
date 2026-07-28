/**
 * CRUZ ESTUDIO ® — CURSOR CUSTOM (punto + aro), ref. kau.studio.
 * El punto sigue al mouse en tiempo real; el aro lo sigue con lag (lerp) y se
 * CONTRAE al pasar sobre cualquier elemento interactivo.
 * Se auto-inyecta (no necesita markup) y usa delegación de eventos, así funciona
 * también con contenido cargado dinámicamente.
 */
(function () {
    'use strict';

    const INTERACTIVE = 'a, button, input, textarea, select, label, summary,' +
        '[role="button"], .nav-toggle, .project-item, .featured-work-item,' +
        '.fwv2-item, .sw-item, [data-cursor]';

    function init() {
        // Solo desktop con puntero fino, y respetando reduced-motion
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const dot = document.createElement('div');
        const ring = document.createElement('div');
        dot.className = 'cx-dot';
        ring.className = 'cx-ring';
        dot.setAttribute('aria-hidden', 'true');
        ring.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dot);
        document.body.appendChild(ring);
        document.body.classList.add('cx-ready');

        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;
        let scale = 1, targetScale = 1;     // 1 = aro normal · 0.42 = contraído

        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
        }, { passive: true });

        (function loop() {
            requestAnimationFrame(loop);
            rx += (mx - rx) * 0.18;              // lag del aro
            ry += (my - ry) * 0.18;
            scale += (targetScale - scale) * 0.15;
            dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
            ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) scale(' + scale + ')';
        })();

        // Hover sobre interactivos → el aro se contrae hacia el punto (delegación)
        document.addEventListener('mouseover', e => {
            if (e.target.closest && e.target.closest(INTERACTIVE)) {
                targetScale = 0.42;
                document.body.classList.add('cx-hover');
            }
        }, { passive: true });

        document.addEventListener('mouseout', e => {
            if (!e.target.closest) return;
            const from = e.target.closest(INTERACTIVE);
            const to = e.relatedTarget && e.relatedTarget.closest
                ? e.relatedTarget.closest(INTERACTIVE) : null;
            if (from && !to) {
                targetScale = 1;
                document.body.classList.remove('cx-hover');
            }
        }, { passive: true });

        // Oculta el cursor al salir de la ventana
        document.addEventListener('mouseleave', () => document.body.classList.remove('cx-ready'));
        document.addEventListener('mouseenter', () => document.body.classList.add('cx-ready'));

        initMagnetic();
    }

    /**
     * Efecto magnético: el elemento se desplaza levemente hacia el cursor.
     * Se maneja con eventos (sin rAF) y la vuelta la hace una transition CSS.
     */
    function initMagnetic() {
        const STRENGTH = 0.25;
        document.querySelectorAll('.nav-toggle').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                el.style.transform = 'translate(' + (dx * STRENGTH) + 'px,' + (dy * STRENGTH) + 'px)';
            }, { passive: true });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; }, { passive: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
