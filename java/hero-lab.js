/**
 * HERO LAB — Etapa 3 (Split Text) + Etapa 4 (WebGL rayo) [Etapa 4 se agrega luego]
 *
 * Etapa 3:
 *   · Split text manual: envuelve cada palabra del H1 en <span.word> (overflow
 *     hidden) + <span.word-inner> interno.
 *   · Timeline onLoad: las palabras suben desde su máscara (y 105%, rotateX -40)
 *     con stagger; después la bajada hace fade-in.
 *
 * Requiere GSAP. Respeta prefers-reduced-motion.
 */
(function () {
    'use strict';

    var SEL = { title: '.hero-title', bajada: '.hero-bajada' };

    // Split manual por palabras (sin SplitText de pago)
    function splitWords(el) {
        var text = el.textContent.trim();
        el.setAttribute('aria-label', text);
        el.textContent = '';
        var words = text.split(/\s+/);
        words.forEach(function (w, i) {
            var outer = document.createElement('span');
            outer.className = 'word';
            outer.setAttribute('aria-hidden', 'true');
            var inner = document.createElement('span');
            inner.className = 'word-inner';
            inner.textContent = w;
            outer.appendChild(inner);
            el.appendChild(outer);
            if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        });
        return el.querySelectorAll('.word-inner');
    }

    function init() {
        var title = document.querySelector(SEL.title);
        if (!title) return;
        var bajada = document.querySelector(SEL.bajada);
        var inners = splitWords(title);

        if (typeof gsap === 'undefined' ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // sin animación: el texto queda visible (failsafe)
        }

        var tl = gsap.timeline({ delay: 0.15 });
        tl.from(inners, {
            yPercent: 105,
            rotateX: -40,
            transformOrigin: 'top center',
            transformPerspective: 800,
            opacity: 0,
            duration: 1.4,
            ease: 'expo.out',
            stagger: 0.08
        });
        if (bajada) {
            tl.from(bajada, {
                opacity: 0,
                y: 20,
                duration: 1,
                ease: 'power2.out'
            }, '-=0.5');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
