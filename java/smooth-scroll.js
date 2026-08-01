/**
 * CRUZ ESTUDIO ® — SMOOTH SCROLL (Lenis) + integración con GSAP ScrollTrigger.
 *
 * Integración oficial: Lenis mueve el scroll real de la página, ScrollTrigger se
 * actualiza en cada evento y el rAF de Lenis lo maneja el ticker de GSAP (un solo
 * loop). Así el hero (scrub sobre #spacer) sigue funcionando igual, pero con
 * inercia — es el cambio que más "premium" hace sentir la navegación.
 *
 * Seguridad: se DETIENE cuando hay bloqueo de scroll (menú abierto, intro del
 * loader) y se desactiva con prefers-reduced-motion. En touch usa el scroll
 * nativo (default de Lenis), que es lo esperable en mobile.
 */
(function () {
    'use strict';

    // CSS boilerplate que pide Lenis. Va inyectado porque es de librería, no de
    // diseño. Clave: anula el `scroll-behavior: smooth` del sitio, que pelearía.
    function injectBaseCss() {
        const css = 'html.lenis,html.lenis body{height:auto}' +
            '.lenis.lenis-smooth{scroll-behavior:auto !important}' +
            '.lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}' +
            '.lenis.lenis-stopped{overflow:hidden}';
        const s = document.createElement('style');
        s.setAttribute('data-lenis-base', '');
        s.textContent = css;
        document.head.appendChild(s);
    }

    function init() {
        if (typeof Lenis === 'undefined') return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        injectBaseCss();

        const lenis = new Lenis({
            duration: 1.2,
            easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true
        });
        window.cruzLenis = lenis;

        // ── Sincronización con GSAP / ScrollTrigger ──
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
        }
        if (typeof gsap !== 'undefined') {
            gsap.ticker.add(time => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }

        // ── Bloqueo de scroll ──
        // El menú (body.nav-open) y la intro del loader ponen overflow hidden;
        // con scroll suave hay que frenar Lenis explícitamente o seguiría andando.
        function syncLock() {
            const locked = getComputedStyle(document.body).overflowY === 'hidden' ||
                document.body.classList.contains('nav-open') ||
                document.body.classList.contains('scroll-locked');
            if (locked) lenis.stop(); else lenis.start();
        }
        new MutationObserver(syncLock).observe(document.body, {
            attributes: true, attributeFilter: ['class', 'style']
        });
        new MutationObserver(syncLock).observe(document.documentElement, {
            attributes: true, attributeFilter: ['class', 'style']
        });
        syncLock();

        // ── Anclas internas con easing de Lenis ──
        document.addEventListener('click', e => {
            const a = e.target.closest && e.target.closest('a[href^="#"]');
            if (!a) return;
            const href = a.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            lenis.scrollTo(target, { offset: -90 });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
