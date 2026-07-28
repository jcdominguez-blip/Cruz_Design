/**
 * ============================================================
 *  CRUZ ESTUDIO ® — TYPE REVEAL (pin + scrub, estilo jh3y)
 *
 *  Efecto exacto del CodePen https://codepen.io/jh3y/pen/ZYzKyXx:
 *  el contenedor se ANCLA al viewport mientras el usuario sigue
 *  scrolleando — los caracteres del texto se iluminan uno a uno
 *  directamente atados al scroll wheel (scrub: true). Cuando todos
 *  los caracteres están iluminados, el contenedor se libera y el
 *  flujo de scroll continúa normalmente.
 *
 *  Uso:
 *    <section data-type-pin>            ← contenedor que se pinea
 *        <h2 data-type-reveal>…</h2>   ← elemento(s) cuyo texto se ilumina
 *        <p  data-type-reveal>…</p>    ← (opcional, se anima en secuencia)
 *    </section>
 *
 *  Carga: <script src="./java/type.js" defer></script>
 *  Requiere: gsap.min.js + ScrollTrigger.min.js (ya cargados).
 * ============================================================
 */

(function () {
    'use strict';

    const TAG = '[Type]';
    const log  = (...a) => console.log(TAG, ...a);
    const warn = (...a) => console.warn(TAG, ...a);

    const DIM    = 0.14;   // opacidad inicial: TENUE (el texto se ve, con poco contraste)
    const BRIGHT = 1.00;   // opacidad final: full crema
    const RISE   = 0;      // yPercent inicial: 0 → SIN rise, sólo revela por opacidad (pedido cliente)

    /**
     * Splitea el texto en <span class="tp-char"> dentro de <span class="tp-word">.
     * Las palabras quedan inline-block (no rompen mid-word). Idempotente.
     */
    function splitChars(el) {
        if (el.dataset.tpReady === '1') return el.querySelectorAll('.tp-char');
        const raw = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!raw) return [];

        const tokens = raw.split(/(\s+)/);
        const frag = document.createDocumentFragment();

        tokens.forEach(tok => {
            if (/^\s+$/.test(tok)) {
                frag.appendChild(document.createTextNode(' '));
            } else if (tok.length) {
                const w = document.createElement('span');
                w.className = 'tp-word';
                Array.from(tok).forEach(ch => {
                    const c = document.createElement('span');
                    c.className = 'tp-char';
                    c.textContent = ch;
                    w.appendChild(c);
                });
                frag.appendChild(w);
            }
        });

        el.innerHTML = '';
        el.appendChild(frag);
        el.dataset.tpReady = '1';
        return el.querySelectorAll('.tp-char');
    }

    function initOnce(pinSection) {
        // Targets dentro de este pin: H2 + P (en orden DOM)
        const targets = pinSection.querySelectorAll('[data-type-reveal]');
        if (!targets.length) return;

        // Splitting + colección global ordenada (H2 primero, P después)
        const allChars = [];
        targets.forEach(el => {
            splitChars(el).forEach(c => allChars.push(c));
        });
        if (!allChars.length) return;

        // Reduced motion → todo brillante, sin scrub
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
            allChars.forEach(c => { c.style.opacity = String(BRIGHT); });
            return;
        }

        if (typeof gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
            warn('GSAP/ScrollTrigger no disponibles — fallback estático.');
            allChars.forEach(c => { c.style.opacity = String(BRIGHT); });
            return;
        }

        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}

        // Estado inicial explícito: tenue (RISE=0 → sin desplazamiento).
        gsap.set(allChars, { opacity: DIM, yPercent: RISE });

        // SIN PIN: el pin fijaba la sección ~2600px y (a) trababa el scroll y
        // (b) al insertar el pin-spacer corría la posición del contact, haciendo
        // que sus reveals (una sola vez) dispararan mientras el contact estaba
        // fuera de pantalla. Ahora la opacidad de cada char se revela atada al
        // scroll NATURAL mientras la sección cruza el viewport → fluido, sin trabar,
        // y sin romper los triggers de las secciones de abajo.
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: pinSection,
                start: 'top 80%',   // arranca cuando el top entra al viewport
                end: 'bottom 45%',  // termina cuando el bottom pasa el 45%
                scrub: 0.5,         // atado al scroll, con un suavizado leve
                invalidateOnRefresh: true
            }
        });

        // Insertamos un tween por carácter en posiciones uniformes de la
        // timeline [0, 1]. Cada char "se enciende" durante el 8% del total
        // del timeline (overlap controlado entre chars consecutivos para
        // que la transición no se vea entrecortada).
        const slice = 1 / allChars.length;
        const lightSpan = slice * 4;   // duración del tween de cada char
        allChars.forEach((char, i) => {
            tl.to(char, {
                opacity: BRIGHT,
                yPercent: 0,          // sube a su lugar mientras gana contraste
                ease: 'none',
                duration: lightSpan
            }, i * slice);
        });

        log('Inicializado (sin pin).', allChars.length, 'chars.');
    }

    function init() {
        const pinSections = document.querySelectorAll('[data-type-pin]');
        if (!pinSections.length) return;

        pinSections.forEach(initOnce);

        // Refresh post-fonts (las custom fonts cambian medidas)
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
