/**
 * CRUZ ESTUDIO ® — ABOUT / ESTUDIO (animaciones)
 * GSAP + ScrollTrigger (registrado global). Smooth scroll: Lenis (smooth-scroll.js).
 *   1) Hero reveal (onLoad): líneas del H1 suben desde su máscara con rotateX.
 *   2) Parallax de la foto del estudio (scrub).
 *   3) Fade-up asimétrico del manifiesto (izq. antes que der. vía stagger).
 * Respeta prefers-reduced-motion (el CSS deja todo visible).
 */
(function () {
    'use strict';

    // Selectores centralizados (modular / limpio)
    var SEL = {
        revealText:   '.about-hero .reveal-text',
        photo:        '.studio-photo',
        imageWrap:    '.image-wrapper',
        content:      '.about-content',
        contentItems: '.about-content .about-statement, .about-content .method-item'
    };

    function init() {
        if (typeof gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // CSS deja todo visible

        // ── 1 · HERO REVEAL (al cargar) ─────────────────────────────────────
        gsap.timeline({ defaults: { ease: 'power4.out' } })
            .from(SEL.revealText, {
                yPercent: 100,
                opacity: 0,
                rotateX: -15,
                transformOrigin: '50% 100%',
                transformPerspective: 800,
                duration: 1.5,
                stagger: 0.15
            });

        // ── 2 · PARALLAX FOTO DEL ESTUDIO ───────────────────────────────────
        gsap.to(SEL.photo, {
            yPercent: 30,
            ease: 'none',
            scrollTrigger: {
                trigger: SEL.imageWrap,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true
            }
        });

        // ── 3 · MANIFIESTO — fade-up asimétrico (izq. → der.) ───────────────
        gsap.from(SEL.contentItems, {
            y: 50,
            opacity: 0,
            duration: 1.2,
            ease: 'expo.out',
            stagger: 0.2,
            scrollTrigger: { trigger: SEL.content, start: 'top 80%' }
        });

        // Layout definitivo tras fuentes/imágenes.
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
