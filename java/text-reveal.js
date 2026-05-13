/**
 * ============================================================
 *  CRUZ ESTUDIO ® — Scroll-to-Type Text Reveal
 *
 *  Efecto cinematográfico tipo "typing reveal" scrubbeado al scroll.
 *  Inspirado en https://codepen.io/jh3y/pen/ZYzKyXx
 *
 *  Dos modos de uso:
 *
 *  A) MODO INDIVIDUAL — cada elemento tiene su propia ScrollTrigger:
 *     <p data-scroll-text>Texto…</p>
 *
 *  B) MODO GRUPO — una única ScrollTrigger maestra cubre varios
 *     elementos dentro de una sección, sincronizados con el scroll
 *     completo de la sección (recomendado para H2 + body en bloque):
 *     <section data-scroll-text-section>
 *         <h2 data-scroll-text>…</h2>
 *         <p  data-scroll-text>…</p>
 *     </section>
 *
 *  Splitting: cada carácter va en <span class="stw-char"> dentro de
 *  <span class="stw-word"> (mantiene la integridad de cada palabra y
 *  permite line-break solo en los espacios). El CSS define el estado
 *  inicial (color atenuado). GSAP scrubea el color hacia crema lleno.
 *
 *  Carga: <script src="./java/text-reveal.js" defer></script>
 *  DESPUÉS de gsap.min.js y ScrollTrigger.min.js.
 * ============================================================
 */

(function () {
    'use strict';

    const PREFIX = '[ScrollText]';
    const log  = (...a) => console.log(PREFIX, ...a);
    const warn = (...a) => console.warn(PREFIX, ...a);

    const DIM_COLOR    = 'rgba(255, 253, 243, 0.15)';
    const BRIGHT_COLOR = 'rgba(255, 253, 243, 1)';

    /**
     * Splitea el texto del elemento en <span class="stw-char"> envueltos
     * en <span class="stw-word"> (para preservar word-integrity y permitir
     * line-breaks solo entre palabras).
     * Idempotente: marca el elemento con data-stw-ready para no re-procesar.
     */
    function splitIntoChars(el) {
        if (el.dataset.stwReady === '1') {
            return el.querySelectorAll('.stw-char');
        }

        // Tomamos el texto y normalizamos espacios
        const raw = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!raw) return [];

        const tokens = raw.split(/(\s+)/);   // ["palabra1", " ", "palabra2", …]
        const frag = document.createDocumentFragment();

        tokens.forEach(tok => {
            if (/^\s+$/.test(tok)) {
                // El espacio queda como text node — único punto donde puede romper la línea
                frag.appendChild(document.createTextNode(' '));
            } else if (tok.length) {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'stw-word';
                // Wrap each character of this word
                // Usamos Array.from para soportar surrogate pairs (emojis, acentos compuestos)
                Array.from(tok).forEach(ch => {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'stw-char';
                    charSpan.textContent = ch;
                    wordSpan.appendChild(charSpan);
                });
                frag.appendChild(wordSpan);
            }
        });

        el.innerHTML = '';
        el.appendChild(frag);
        el.dataset.stwReady = '1';
        return el.querySelectorAll('.stw-char');
    }

    /**
     * Aplica la animación scrub a un conjunto de chars usando una sección
     * como trigger (master timeline).
     * - start: cuando el top de la sección llega al 80% del viewport.
     * - end:   cuando el bottom de la sección llega al 30%.
     * - scrub: 0.5 → suavizado leve para evitar jitter, manteniendo la
     *   sensación directa de "directamente atado al scroll wheel".
     */
    function attachGroupAnimation(section, chars) {
        if (!chars.length) return;

        if (typeof gsap === 'undefined') {
            warn('GSAP no cargado — fallback estático.');
            chars.forEach(c => { c.style.color = BRIGHT_COLOR; });
            return;
        }
        if (typeof window.ScrollTrigger === 'undefined') {
            warn('ScrollTrigger no disponible — fade global.');
            gsap.to(chars, {
                color: BRIGHT_COLOR,
                duration: 1.4,
                ease: 'power2.out',
                stagger: 0.008
            });
            return;
        }

        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}

        gsap.set(chars, { color: DIM_COLOR });

        gsap.to(chars, {
            color: BRIGHT_COLOR,
            ease: 'none',
            stagger: { each: 0.05, from: 'start' },
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 30%',
                scrub: 0.5,
                invalidateOnRefresh: true
                // markers: true  // descomentar para debug
            }
        });
    }

    /**
     * Aplica la animación scrub a un elemento individual (modo standalone).
     * Trigger = el propio elemento.
     */
    function attachIndividual(el) {
        const chars = splitIntoChars(el);
        if (!chars.length) return;

        if (typeof gsap === 'undefined') {
            chars.forEach(c => { c.style.color = BRIGHT_COLOR; });
            return;
        }
        if (typeof window.ScrollTrigger === 'undefined') {
            gsap.to(chars, {
                color: BRIGHT_COLOR,
                duration: 1.4,
                ease: 'power2.out',
                stagger: 0.008
            });
            return;
        }
        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}

        gsap.set(chars, { color: DIM_COLOR });

        gsap.to(chars, {
            color: BRIGHT_COLOR,
            ease: 'none',
            stagger: { each: 0.05 },
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                end: 'bottom 25%',
                scrub: 0.5,
                invalidateOnRefresh: true
            }
        });
    }

    function init() {
        // Respeta usuarios con reduced motion: mostramos texto completo sin scrubbing
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
            document.querySelectorAll('[data-scroll-text]').forEach(el => {
                const chars = splitIntoChars(el);
                chars.forEach(c => { c.style.color = 'rgba(255, 253, 243, 0.92)'; });
            });
            log('reduced-motion → reveal estático.');
            return;
        }

        const processed = new WeakSet();

        // ── 1. MODO GRUPO ─────────────────────────────────
        // Si hay secciones con data-scroll-text-section, agrupamos todos los
        // [data-scroll-text] internos bajo UNA sola ScrollTrigger.
        const groupSections = document.querySelectorAll('[data-scroll-text-section]');
        groupSections.forEach(section => {
            const targets = section.querySelectorAll('[data-scroll-text]');
            if (!targets.length) return;

            const allChars = [];
            targets.forEach(el => {
                splitIntoChars(el).forEach(c => allChars.push(c));
                processed.add(el);
            });

            attachGroupAnimation(section, allChars);
        });

        // ── 2. MODO INDIVIDUAL ────────────────────────────
        // Elementos [data-scroll-text] que NO están dentro de un grupo
        // se animan independientemente.
        document.querySelectorAll('[data-scroll-text]').forEach(el => {
            if (processed.has(el)) return;
            attachIndividual(el);
        });

        // Refresh de ScrollTrigger una vez computado el layout final.
        if (typeof window.ScrollTrigger !== 'undefined') {
            requestAnimationFrame(() => {
                try { window.ScrollTrigger.refresh(); } catch (_) {}
            });
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    try { window.ScrollTrigger.refresh(); } catch (_) {}
                });
            }
        }

        log('Inicializado:',
            groupSections.length, 'grupo(s) +',
            document.querySelectorAll('[data-scroll-text]').length - groupSections.length, 'individual(es).');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
