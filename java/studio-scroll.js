/* ==========================================================================
   STUDIO INTRO — Scroll-zoom del video + reveal de líneas del statement
   Inspiración: x2ycreative.com (video crece con scroll) +
                gsap.com/demo/responsive-line-splits-on-scroll/ (texto)
   ========================================================================== */
(function () {
    'use strict';

    function init() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('[studio-scroll] GSAP / ScrollTrigger no disponibles.');
            return;
        }
        gsap.registerPlugin(ScrollTrigger);

        const section = document.getElementById('studio-intro');
        if (!section) return;

        const stage = section.querySelector('.studio-stage');
        const videoBox = section.querySelector('.studio-video-container');
        const textBox = section.querySelector('.studio-text-container');
        const eyebrow = section.querySelector('.studio-eyebrow');
        const lines = section.querySelectorAll('.studio-reveal-line > span');

        if (!stage || !videoBox || !textBox) return;

        console.log('[studio-scroll] init OK',
            { stage: !!stage, videoBox: !!videoBox, textBox: !!textBox,
              eyebrow: !!eyebrow, lines: lines.length });

        // Estado inicial
        gsap.set(videoBox, { width: '38vw', height: '58vh', borderRadius: 6 });
        gsap.set(textBox, { opacity: 0 });
        gsap.set(eyebrow, { y: 24, opacity: 0 });
        gsap.set(lines, { yPercent: 110, opacity: 0 });

        // Mobile: sin pin, video full + reveal sencillo al entrar
        const isMobile = window.matchMedia('(max-width: 760px)').matches;
        if (isMobile) {
            gsap.set(videoBox, { width: '100vw', height: '100vh', borderRadius: 0 });
            gsap.set(textBox, { opacity: 1 });
            gsap.to(eyebrow, {
                y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
                scrollTrigger: { trigger: section, start: 'top 70%', once: true }
            });
            gsap.to(lines, {
                yPercent: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
                stagger: 0.13,
                scrollTrigger: { trigger: section, start: 'top 60%', once: true }
            });
            return;
        }

        // Timeline pineada — pin distance generosa para que TODO se vea antes
        // de que termine el pin, con un "hold" largo de lectura al final.
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=280%',           // pin generoso: video + texto + hold
                pin: stage,
                pinSpacing: true,
                scrub: 0.3,              // scrub tight, menos lag
                anticipatePin: 1,
                invalidateOnRefresh: true,
            }
        });

        // 1. Video crece desde recuadro chico a full bleed (0 → 0.22)
        tl.to(videoBox, {
            width: '100vw',
            height: '100vh',
            borderRadius: 0,
            ease: 'power2.inOut',
            duration: 0.22,
        }, 0);

        // 2. Frame de texto fade-in (0.22 → 0.30)
        tl.to(textBox, {
            opacity: 1,
            ease: 'power2.out',
            duration: 0.08,
        }, 0.22);

        // 3. Eyebrow sube y aparece (0.26 → 0.36)
        tl.to(eyebrow, {
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            duration: 0.10,
        }, 0.26);

        // 4. Líneas del statement entran escalonadas (0.32 → 0.58)
        tl.to(lines, {
            yPercent: 0,
            opacity: 1,
            ease: 'power3.out',
            duration: 0.18,
            stagger: 0.08,
        }, 0.32);

        // 5. HOLD largo: todo queda quieto y legible entre 0.58 y 1.0,
        //    o sea durante ~117vh de scroll antes de que termine el pin.
        //    Esto garantiza tiempo de lectura y que el reveal complete aunque
        //    el usuario scrollee rápido.
        tl.to({}, { duration: 0.42 }, 0.58);

        // Panel-stack removido — el flujo natural funciona bien.

        // Fuerza un refresh INMEDIATO para que el pinSpacer se inyecte ya y
        // los scripts que corren después (type.js para el pin de why-us, etc)
        // calculen sus triggers contra las posiciones POST-pinSpacer, no las
        // viejas. Sin esto, why-us pinea prematuramente y tapa servicios.
        requestAnimationFrame(() => ScrollTrigger.refresh());

        // Refresh adicional en load (fuentes / video metadata pueden cambiar sizes)
        window.addEventListener('load', () => ScrollTrigger.refresh());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
