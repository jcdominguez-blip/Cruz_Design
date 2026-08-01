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

        // ── Hint "SCROLL DOWN" (ref. produx.design) ──
        // Etiqueta que sigue al cursor SOLO en el hero del home. Se detecta por
        // #spacer (existe únicamente en index.html); en páginas internas no se crea.
        // Aparece con animación, sigue al puntero con lag y se desvanece al
        // scrollear hacia el contenido, indicando al usuario que haga scroll.
        const hasHero = !!document.getElementById('spacer');
        let label = null;
        if (hasHero) {
            label = document.createElement('div');
            label.className = 'cx-scroll';
            label.setAttribute('aria-hidden', 'true');
            // Capa .cx-scroll-center: centra el bloque sobre el cursor (translate
            // -50% en CSS), independiente de la animación de entrada del inner.
            label.innerHTML = '<span class="cx-scroll-center">' +
                '<span class="cx-scroll-inner">Scroll down' +
                ' <span class="cx-scroll-arrow">↓</span></span></span>';
            document.body.appendChild(label);
        }

        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;
        let lx = mx, ly = my;               // posición con lag de la etiqueta
        let scale = 1, targetScale = 1;     // 1 = aro normal · 0.42 = contraído
        let hintAppeared = false;

        // Desvanecido por scroll: opacidad plena arriba de todo → 0 al bajar
        // ~media pantalla (ya pasando al contenido). Reaparece si vuelve al top.
        function updateHint() {
            if (!label || !hintAppeared) return;
            const y = window.scrollY || window.pageYOffset || 0;
            const fade = Math.max(0, Math.min(1, 1 - y / ((window.innerHeight || 1) * 0.5)));
            label.style.opacity = String(fade);
        }
        function showHint() {
            if (!label || hintAppeared) return;
            hintAppeared = true;
            label.classList.add('is-in');
            updateHint();
        }
        if (label) {
            window.addEventListener('scroll', updateHint, { passive: true });
            // Aparece con el primer movimiento del mouse; si no hay, a los 1.4s.
            setTimeout(showHint, 1400);
        }

        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            if (label && !hintAppeared) showHint();
        }, { passive: true });

        (function loop() {
            requestAnimationFrame(loop);
            rx += (mx - rx) * 0.18;              // lag del aro
            ry += (my - ry) * 0.18;
            scale += (targetScale - scale) * 0.15;
            dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
            ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) scale(' + scale + ')';
            if (label) {
                lx += (mx - lx) * 0.14;         // la etiqueta trailea un poco más
                ly += (my - ly) * 0.14;
                // Posición en el punto del cursor; el centrado real (horizontal +
                // debajo del aro) lo resuelve .cx-scroll-center en el CSS.
                label.style.transform = 'translate(' + lx + 'px,' + ly + 'px)';
            }
        })();

        // Hover sobre interactivos → el aro se contrae hacia el punto (delegación)
        document.addEventListener('mouseover', e => {
            if (e.target.closest && e.target.closest(INTERACTIVE)) {
                targetScale = 0.42;
                document.body.classList.add('cx-hover');
                if (label) label.classList.add('cx-scroll--hidden');
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
                if (label) label.classList.remove('cx-scroll--hidden');
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
