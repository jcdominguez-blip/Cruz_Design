/**
 * ============================================================
 *  CRUZ ESTUDIO ® — SPLIT-TEXT REVEAL (estilo motion.dev)
 *
 *  Efecto de https://examples.motion.dev/js/split-text: al entrar en
 *  viewport, el texto se revela PALABRA por palabra, subiendo + apareciendo
 *  con un stagger suave. Se aplica a los titulares de sección y a la lista.
 *
 *  Uso:  <h2 data-split>Texto…</h2>
 *
 *  El disparo va con GSAP ScrollTrigger (posición real, post-pins del hero;
 *  el observer global se pre-dispararía — mismo criterio que reveal-headers.js).
 *
 *  Carga: DESPUÉS de gsap.min.js + ScrollTrigger.min.js.
 * ============================================================
 */
(function () {
    'use strict';

    // Divide el texto del elemento en <span class="sr-word"> (palabras),
    // preservando los espacios como nodos de texto (único punto de wrap).
    function splitWords(el) {
        if (el.dataset.srReady === '1') return el.querySelectorAll('.sr-word');
        var raw = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!raw) return [];

        var tokens = raw.split(/(\s+)/);
        var frag = document.createDocumentFragment();

        tokens.forEach(function (tok) {
            if (/^\s+$/.test(tok)) {
                frag.appendChild(document.createTextNode(' '));
            } else if (tok.length) {
                var w = document.createElement('span');
                w.className = 'sr-word';
                w.textContent = tok;
                frag.appendChild(w);
            }
        });

        el.innerHTML = '';
        el.appendChild(frag);
        el.dataset.srReady = '1';
        return el.querySelectorAll('.sr-word');
    }

    function init() {
        var els = Array.prototype.slice.call(document.querySelectorAll('[data-split]'));
        if (!els.length) return;

        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var hasST = typeof gsap !== 'undefined' &&
                    typeof window.ScrollTrigger !== 'undefined';

        // Sin animación: split (para el sistema tipográfico) pero visible.
        if (reduce || !hasST) {
            els.forEach(function (el) { splitWords(el); });
            return;
        }

        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}

        els.forEach(function (el) {
            var words = splitWords(el);
            if (!words.length) return;

            gsap.set(words, { yPercent: 55, opacity: 0 });

            window.ScrollTrigger.create({
                trigger: el,
                start: 'top 88%',
                once: true,
                onEnter: function () {
                    gsap.to(words, {
                        yPercent: 0,
                        opacity: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        stagger: 0.07
                    });
                }
            });
        });

        // ── Reveal rise+stagger a nivel BLOQUE (mismo feel que el split de palabras,
        //    pero para contenido que no se puede partir en palabras: el formulario).
        //    Grupo: [data-rise-stagger]. Sus [data-rise-item] suben + aparecen en
        //    cascada cuando el grupo cruza el viewport. Si GSAP/ScrollTrigger no
        //    corre, los items quedan visibles (nunca se ocultan por CSS). ──
        var groups = Array.prototype.slice.call(
            document.querySelectorAll('[data-rise-stagger]')
        );
        groups.forEach(function (group) {
            var items = Array.prototype.slice.call(
                group.querySelectorAll('[data-rise-item]')
            );
            if (!items.length) return;

            gsap.set(items, { y: 40, opacity: 0 });

            window.ScrollTrigger.create({
                trigger: group,
                start: 'top 85%',
                once: true,
                onEnter: function () {
                    gsap.to(items, {
                        y: 0,
                        opacity: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        stagger: 0.08
                    });
                }
            });
        });

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
