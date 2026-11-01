/**
 * CRUZ ESTUDIO ® — ABOUT / ESTUDIO (animaciones)
 * GSAP + ScrollTrigger (registrado global). Smooth scroll: Lenis (smooth-scroll.js).
 *   1) Hero reveal (onLoad): líneas del H1 + bajada suben desde su máscara con rotateX.
 *   2) Parallax de la foto del estudio (scrub).
 *   3) Footer reveal (línea + columnas en cascada).
 * Respeta prefers-reduced-motion (el CSS deja todo visible).
 * El Círculo Dorado (recorrido por scroll) vive en el 2º IIFE de este archivo.
 */
(function () {
    'use strict';

    var SEL = {
        revealText: '.about-hero .reveal-text',
        photo:      '.studio-photo',
        imageWrap:  '.image-wrapper'
    };

    function init() {
        if (typeof gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
        try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // CSS deja todo visible

        // ── 1 · HERO REVEAL (al cargar): H1 + bajada ────────────────────────
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

        // ── 3 · FOOTER reveal → mismo recurso que metodologia.html:
        //       [data-reveal] + IntersectionObserver (.is-visible) en el 3º IIFE.

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


/**
 * CÍRCULO DORADO — recorrido por scroll (valores y cultura del estudio).
 * Ref. "Motto Method": la sección se fija (pin, sólo desktop) y al scrollear se
 * van activando las tres capas EN FORMA ACUMULATIVA (01 → 01+02 → 01+02+03).
 * La capa activa se rellena en BLANCO "en pleno" y su trazo pasa al color de fondo
 * (recorte / división). El texto de la izquierda cambia con jerarquía:
 *   · label mono (01/02/03) → fade
 *   · H3 subtítulo          → reveal enmascarado (line-mask, como el hero)
 *   · P cuerpo              → fade-up
 * y el nombre de la capa activa en el círculo hace un pequeño reveal.
 * En mobile: sin pin (scroll normal dispara los estados) + tap/teclado por capa.
 * Sin GSAP / reduce-motion: capa 01 fija y tap/teclado para cambiar.
 */
(function () {
    'use strict';

    // Copy bilingüe. El idioma se sincroniza con el switch del nav (localStorage 'cruz-lang').
    var COPY_BY_LANG = {
        es: {
            '1': {
                label: '01',
                title: 'Nuestra creencia',
                desc:  'Creemos que detrás de cada gran empresa hay directores y equipos dejando la piel. Nuestro propósito humano es honrar ese esfuerzo. No existimos para ganar premios de estética, existimos para que la verdadera calidad de tu trabajo se refleje innegablemente en tu imagen.'
            },
            '2': {
                label: '02',
                title: 'Nuestros valores',
                desc:  'Trabajamos sin egos, sin romanticismos y con una honestidad brutal. Entendemos que del otro lado hay personas arriesgando capital y tiempo. Por eso, nuestra cultura interna se basa en el rigor, la transparencia y el compromiso absoluto con el crecimiento de tu negocio.'
            },
            '3': {
                label: '03',
                title: 'El estudio',
                desc:  'Somos un grupo de mentes analíticas y creativas operando desde Buenos Aires para el mundo. No somos una fábrica de identidades ni una agencia corporativa fría; somos tu equipo externo de diseño. Personas reales obsesionadas con resolver tus problemas más complejos.'
            }
        },
        en: {
            '1': {
                label: '01',
                title: 'Our belief',
                desc:  "We believe that behind every great company there are directors and teams giving everything. Our human purpose is to honor that effort. We don't exist to win aesthetic awards; we exist so the true quality of your work is undeniably reflected in your image."
            },
            '2': {
                label: '02',
                title: 'Our values',
                desc:  "We work without egos, without romanticism and with brutal honesty. We understand that on the other side there are people risking capital and time. That's why our internal culture is built on rigor, transparency and an absolute commitment to the growth of your business."
            },
            '3': {
                label: '03',
                title: 'The studio',
                desc:  "We're a group of analytical and creative minds operating from Buenos Aires for the world. We're not an identity factory or a cold corporate agency; we're your external design team. Real people obsessed with solving your most complex problems."
            }
        }
    };
    var LANG = (function () {
        try { return localStorage.getItem('cruz-lang') === 'en' ? 'en' : 'es'; }
        catch (e) { return 'es'; }
    })();
    var COPY = COPY_BY_LANG[LANG] || COPY_BY_LANG.es;
    var ORDER = ['1', '2', '3'];

    function init() {
        var section = document.querySelector('.about-golden-circle');
        if (!section) return;

        var rings   = Array.prototype.slice.call(section.querySelectorAll('.golden-ring'));
        var names   = Array.prototype.slice.call(section.querySelectorAll('.ring-name'));
        var labelEl = section.querySelector('[data-golden-label]');
        var titleEl = section.querySelector('[data-golden-title]');   // span.reveal-text dentro del H3
        var descEl  = section.querySelector('[data-golden-desc]');
        if (!rings.length || !labelEl || !titleEl || !descEl) return;

        var hasGSAP = (typeof gsap !== 'undefined');
        var hasST   = (typeof window.ScrollTrigger !== 'undefined');
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var current = '1';

        // Esquema de 3 estados por nivel respecto del paso actual:
        //   nivel <  actual → PASADO  (.is-passed  → relleno blanco)
        //   nivel == actual → ACTUAL  (.is-current → relleno amarillo)
        //   nivel >  actual → PENDIENTE (sin clase → sólo contorno)
        // Los nombres van en tinta oscura (.is-filled) cuando su aro tiene relleno.
        function paint(step) {
            var s = parseInt(step, 10);
            rings.forEach(function (r) {
                var lvl = parseInt(r.getAttribute('data-ring'), 10);
                r.classList.toggle('is-passed', lvl < s);
                r.classList.toggle('is-current', lvl === s);
            });
            names.forEach(function (n) {
                n.classList.toggle('is-filled', parseInt(n.getAttribute('data-name'), 10) <= s);
            });
        }

        // Swaps de texto (respetan la jerarquía de lectura).
        function fade(el, txt) {
            if (!hasGSAP) { el.textContent = txt; return; }
            gsap.killTweensOf(el);
            gsap.to(el, { opacity: 0, duration: 0.16, ease: 'power2.out', onComplete: function () {
                el.textContent = txt;
                gsap.to(el, { opacity: 1, duration: 0.26, ease: 'power2.out' });
            }});
        }
        function fadeUp(el, txt) {
            if (!hasGSAP) { el.textContent = txt; return; }
            gsap.killTweensOf(el);
            gsap.to(el, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.out', onComplete: function () {
                el.textContent = txt;
                gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.34, ease: 'power2.out' });
            }});
        }
        // Reveal enmascarado (el mismo recurso del hero): sube tras la máscara.
        function reveal(el, txt) {
            if (!hasGSAP) { el.textContent = txt; return; }
            gsap.killTweensOf(el);
            gsap.to(el, { yPercent: -115, opacity: 0, duration: 0.28, ease: 'power3.in', onComplete: function () {
                el.textContent = txt;
                gsap.fromTo(el, { yPercent: 115, opacity: 0 },
                    { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
            }});
        }

        function setActive(step, animate) {
            step = String(step);
            if (step === current || !COPY[step]) return;
            current = step;
            paint(step);

            var d = COPY[step];
            if (animate && hasGSAP) {
                fade(labelEl, d.label);
                reveal(titleEl, d.title);
                fadeUp(descEl, d.desc);
                var nm = section.querySelector('.ring-name[data-name="' + step + '"]');
                if (nm) gsap.fromTo(nm, { opacity: 0, y: 6 },
                    { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
                // Flash dinámico del aro seleccionado: el amarillo "prende" con un
                // fade de fill-opacity. NO se anima la geometría (scale/transform) para
                // que los círculos queden SIEMPRE concéntricos y centrados.
                var curShape = section.querySelector('.golden-ring[data-ring="' + step + '"] .ring-shape');
                if (curShape) {
                    gsap.killTweensOf(curShape);
                    gsap.fromTo(curShape, { fillOpacity: 0.2 },
                        { fillOpacity: 1, duration: 0.55, ease: 'power2.out', overwrite: 'auto' });
                }
            } else {
                labelEl.textContent = d.label;
                titleEl.textContent = d.title;
                descEl.textContent  = d.desc;
            }
        }

        paint(current);   // sincroniza estado inicial (capa 01)

        // ── RECORRIDO POR SCROLL ────────────────────────────────────────────
        if (hasGSAP && hasST && !reduced) {
            gsap.registerPlugin(window.ScrollTrigger);

            var isDesktop = window.matchMedia('(min-width: 769px)').matches;
            var conf = {
                trigger: section,
                invalidateOnRefresh: true,
                onUpdate: function (self) {
                    var idx = Math.min(ORDER.length - 1, Math.floor(self.progress * ORDER.length));
                    setActive(ORDER[idx], true);
                }
            };
            if (isDesktop) {
                // Se fija y el progreso del pin elige la capa (~0.8 pantalla por capa).
                conf.start = 'top top';
                conf.end = '+=240%';
                conf.pin = true;
                conf.pinSpacing = true;
                conf.anticipatePin = 1;
            } else {
                // Mobile: sin pin; el propio scroll de la sección dispara los estados.
                conf.start = 'top 78%';
                conf.end = 'bottom 40%';
            }
            window.ScrollTrigger.create(conf);

            // Reveal de entrada del bloque de texto y del gráfico.
            gsap.from(section.querySelectorAll('.golden-text-wrapper > *, .golden-svg'), {
                y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1,
                scrollTrigger: { trigger: section, start: 'top 72%' }
            });
        }

        // ── Acceso secundario: tap/click/teclado sobre cada capa ────────────
        rings.forEach(function (r) {
            var key = r.getAttribute('data-ring');
            r.addEventListener('click', function () { setActive(key, true); });
            r.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(key, true); }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


/**
 * REVEAL DEL FOOTER (mismo recurso que metodologia.html):
 * fade-in-up con stagger vía IntersectionObserver → agrega .is-visible.
 * La línea del footer hace scaleX (draw). El estado inicial y la transición
 * viven en CSS ([data-reveal] / .is-visible). Fallback: sin IO / reduce-motion
 * → se muestra todo.
 */
(function () {
    'use strict';

    function init() {
        var nodes = Array.prototype.slice.call(
            document.querySelectorAll('.about-page [data-reveal]')
        );
        if (!nodes.length) return;

        // Stagger según posición entre hermanos [data-reveal] del mismo bloque.
        nodes.forEach(function (el) {
            var parent = el.parentElement;
            if (!parent) return;
            var sibs = Array.prototype.filter.call(parent.children, function (c) {
                return c.hasAttribute && c.hasAttribute('data-reveal');
            });
            var i = sibs.indexOf(el);
            if (i > 0) el.style.setProperty('--d', (i * 0.1).toFixed(2) + 's');
        });

        var show = function (el) { el.classList.add('is-visible'); };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            !('IntersectionObserver' in window)) {
            nodes.forEach(show);
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
        nodes.forEach(function (el) { io.observe(el); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
