/* ==========================================================================
   PAGE LOADER — Transición de página SISTEMATIZADA.
   --------------------------------------------------------------------------
   Usa exactamente la misma estructura que el loader de ingreso de la home:
     · Fondo Silk (misma librería, java/silk-bg.js) + grano.
     · Contador 001 → 100 arriba a la izquierda.
     · La cruz (img/signo-cruz.svg) girando en el centro.
     · Bajada de estudio abajo a la izquierda.

   Lo único que cambia respecto al ingreso es el COLOR, que marca que ya
   estamos dentro del sitio:
     · → Proyectos (trabajos + fichas de proyecto): fondo blanco, cruz y
       textos en negro.
     · → Metodología / Estudio / Contacto: fondo amarillo institucional,
       cruz y textos en negro.
     · → Home: el esquema oscuro original.

   La animación dura un mínimo de OUT_MS; recién al llegar a 100 se navega.
   La página destino aparece tras un breve fade del overlay, que en la entrada
   se pinta con el MISMO tema → la transición se siente continua.
   ========================================================================== */
(function () {
    'use strict';

    const FLAG = 'cruz-page-transitioning';

    const OUT_MS = 1500;   // duración mínima del loader antes de navegar
    const IN_MS = 520;     // fade-out del overlay al llegar a la página destino
    const FALLBACK_MS = 700;

    const STUDIO_DESC =
        'Estudio de diseño y estrategia visual. Traducimos la estrategia de cada ' +
        'marca en identidades sólidas: branding, sistemas visuales y experiencias ' +
        'digitales pensadas para conectar, competir y perdurar.';

    /* ---- Temas por destino ---- */
    // Páginas que NO son proyectos → amarillo institucional.
    const YELLOW_PAGES = [
        'metodologia.html', 'about.html', 'contacto.html', 'politica-de-privacidad.html'
    ];

    function themeFor(url) {
        let file;
        try {
            file = new URL(url, location.href).pathname.split('/').pop().toLowerCase();
        } catch (_) { file = ''; }
        if (!file || file === 'index.html') return 'dark';
        if (YELLOW_PAGES.indexOf(file) !== -1) return 'yellow';
        return 'light';   // trabajos.html + todas las fichas de proyecto
    }

    // Opciones de Silk por tema (usa la rama clara del shader en light/yellow)
    function silkOptsFor(theme) {
        // Proyectos: blanco. El acento va casi al mismo tono que la base para que
        // el Silk se lea como textura y no tiña de amarillo.
        if (theme === 'light')  return { force: 'light', lightBase: '#FFFDF3', lightAccent: '#EDE9DC' };
        if (theme === 'yellow') return { force: 'light', lightBase: '#f2c335', lightAccent: '#e8b21f' };
        return {};   // dark: comportamiento original
    }

    /* ---- 0. Base path (root del sitio) ---- */
    const selfScript = document.currentScript ||
        document.querySelector('script[src*="page-loader.js"]');
    const BASE = selfScript
        ? selfScript.src.replace(/java\/page-loader\.js(\?.*)?$/, '')
        : (location.origin + '/');

    /* ---- 1. CSS del overlay (espejo del loader de ingreso) ---- */
    const css = `
        html.is-leaving, html.is-incoming { background: var(--ptx-html-bg, #1D1E1C); }

        .page-transition {
            --ptx-bg: #1D1E1C;
            --ptx-fg: #FFFDF3;
            --ptx-fg-soft: rgba(255, 253, 243, 0.55);
            --ptx-cross: brightness(0) invert(1);

            position: fixed;
            inset: 0;
            width: 100%;
            height: 100vh;
            background-color: var(--ptx-bg);
            z-index: 2147483600;
            pointer-events: none;
            opacity: 0;
            /* Neutraliza el scaleX(0) que .page-transition trae de style.css
               (sistema viejo de transición). Sin esto el overlay tiene ancho 0. */
            transform: none;
            transition: opacity ${IN_MS}ms cubic-bezier(0.7, 0, 0.3, 1);
            overflow: hidden;
        }
        .page-transition.entering,
        .page-transition.exiting,
        .page-transition.returning,
        .page-transition.exit-to-index { transform: none; }
        /* Ya estamos dentro del sitio → colores invertidos */
        .page-transition.ptx-light {
            --ptx-bg: #FFFDF3;
            --ptx-fg: #1D1E1C;
            --ptx-fg-soft: rgba(29, 30, 28, 0.55);
            --ptx-cross: brightness(0);
        }
        .page-transition.ptx-yellow {
            --ptx-bg: #f2c335;
            --ptx-fg: #1D1E1C;
            --ptx-fg-soft: rgba(29, 30, 28, 0.62);
            --ptx-cross: brightness(0);
        }

        .ptx-silk {
            position: absolute;
            inset: 0;
            z-index: 0;
            overflow: hidden;
            opacity: 0;
            transition: opacity 600ms ease;
        }
        .ptx-silk canvas { display: block; width: 100%; height: 100%; }

        /* Grano, igual que el loader de ingreso */
        .page-transition::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            opacity: 0.16;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            background-size: 260px 260px;
        }

        .ptx-counter {
            position: absolute;
            top: clamp(30px, 6.5vh, 84px);
            left: clamp(28px, 6vw, 96px);
            display: flex;
            align-items: flex-start;
            color: var(--ptx-fg);
            font-family: var(--font-header, 'Geist'), 'Helvetica Neue', sans-serif;
            font-weight: 800;
            font-size: clamp(60px, 10vw, 150px);
            line-height: 0.85;
            letter-spacing: -0.03em;
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum" 1;
            z-index: 3;
            opacity: 0;
            transition: opacity 500ms ease;
        }
        .ptx-counter .ptx-pct {
            font-family: var(--font-mono, 'cofo-sans-mono-variable'), monospace;
            font-size: 0.18em;
            font-weight: 400;
            letter-spacing: 0.1em;
            opacity: 0.5;
            margin-left: 0.45em;
            margin-top: 0.5em;
        }

        .ptx-stage {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            opacity: 0;
            transition: opacity 500ms ease;
        }
        .ptx-cross {
            width: clamp(40px, 5vw, 76px);
            height: auto;
            filter: var(--ptx-cross);
            animation: ptx-cross-spin 8s linear infinite;
            opacity: 0.95;
        }
        @keyframes ptx-cross-spin { to { transform: rotate(360deg); } }

        .ptx-desc {
            position: absolute;
            left: clamp(28px, 6vw, 96px);
            bottom: clamp(30px, 6.5vh, 84px);
            margin: 0;
            max-width: 320px;
            font-family: var(--font-reading, 'IBM Plex Sans'), sans-serif;
            font-weight: 300;
            font-size: 13px;
            line-height: 1.6;
            color: var(--ptx-fg-soft);
            z-index: 3;
            opacity: 0;
            transition: opacity 500ms ease;
        }

        html.is-leaving .page-transition { opacity: 1; pointer-events: auto; }
        html.is-leaving .page-transition .ptx-silk,
        html.is-leaving .page-transition .ptx-counter,
        html.is-leaving .page-transition .ptx-stage,
        html.is-leaving .page-transition .ptx-desc { opacity: 1; }
        html.is-leaving .page-transition .ptx-cross { opacity: 0.95; }

        html.is-incoming .page-transition { opacity: 1; pointer-events: auto; transition: none; }
        html.is-incoming .page-transition .ptx-counter,
        html.is-incoming .page-transition .ptx-stage { opacity: 1; }
        html.is-revealing .page-transition {
            opacity: 0;
            transition: opacity ${IN_MS}ms cubic-bezier(0.7, 0, 0.3, 1);
        }

        @media (max-width: 700px) {
            .ptx-desc { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
            .ptx-cross { animation: none !important; }
            .ptx-silk, .ptx-counter, .ptx-stage, .ptx-desc { transition: opacity 200ms ease; }
        }
    `;
    const style = document.createElement('style');
    style.id = 'cruz-page-loader-style';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);

    /* ---- 2. Markup del overlay ---- */
    function loaderMarkup() {
        return `
        <div class="ptx-silk" data-ptx-silk aria-hidden="true"></div>
        <div class="ptx-counter" aria-hidden="true"><span data-ptx-num>001</span><span class="ptx-pct">%</span></div>
        <div class="ptx-stage" aria-hidden="true">
            <img class="ptx-cross" src="${BASE}img/signo-cruz.svg" alt="" decoding="async">
        </div>
        <p class="ptx-desc" aria-hidden="true">${STUDIO_DESC}</p>`;
    }

    function ensureOverlay() {
        let ov = document.querySelector('.page-transition');
        if (!ov) {
            ov = document.createElement('div');
            ov.className = 'page-transition';
            (document.body || document.documentElement).appendChild(ov);
        }
        if (!ov.querySelector('.ptx-stage')) {
            ov.innerHTML = loaderMarkup();
        }
        return ov;
    }

    function applyTheme(ov, theme) {
        ov.classList.remove('ptx-light', 'ptx-yellow');
        if (theme === 'light') ov.classList.add('ptx-light');
        else if (theme === 'yellow') ov.classList.add('ptx-yellow');
        // Evita el flash del html detrás mientras el overlay está a full
        const bg = theme === 'light' ? '#FFFDF3' : (theme === 'yellow' ? '#f2c335' : '#1D1E1C');
        document.documentElement.style.setProperty('--ptx-html-bg', bg);
    }

    /* ---- 3. THREE (vendorizado si falta) — lo usa el Silk ---- */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if ([...document.scripts].some(s => s.src === src)) return resolve();
            const s = document.createElement('script');
            s.src = src; s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('No se pudo cargar ' + src));
            document.head.appendChild(s);
        });
    }
    function waitForTHREE(timeout = 6000) {
        return new Promise((resolve, reject) => {
            if (window.THREE) return resolve();
            const t0 = Date.now();
            const iv = setInterval(() => {
                if (window.THREE) { clearInterval(iv); resolve(); }
                else if (Date.now() - t0 > timeout) { clearInterval(iv); reject(new Error('THREE no disponible')); }
            }, 40);
        });
    }
    let threePromise = null;
    function ensureTHREE() {
        if (window.THREE) return Promise.resolve();
        if (threePromise) return threePromise;
        threePromise = loadScript(BASE + 'java/lib/three.min.js').then(() => waitForTHREE());
        return threePromise;
    }

    /* ---- 4. Contador ---- */
    let counterRAF = null;
    function runCounter(numEl, durationMs, readyFn, onDone) {
        const t0 = performance.now();
        let shown = 1;
        function frame(now) {
            const p = Math.min(1, (now - t0) / durationMs);
            let target = 1 + p * 99;
            if (!readyFn()) target = Math.min(target, 96);
            shown += (target - shown) * 0.18;
            const n = Math.max(1, Math.min(100, Math.round(shown)));
            if (numEl) numEl.textContent = String(n).padStart(3, '0');
            if (shown >= 99.4 && readyFn()) {
                if (numEl) numEl.textContent = '100';
                onDone();
                return;
            }
            counterRAF = requestAnimationFrame(frame);
        }
        counterRAF = requestAnimationFrame(frame);
    }
    function stopCounter() { if (counterRAF) { cancelAnimationFrame(counterRAF); counterRAF = null; } }

    /* ---- 5. Fase ENTRADA ---- */
    if (sessionStorage.getItem(FLAG)) {
        document.documentElement.classList.add('is-incoming');
        sessionStorage.removeItem(FLAG);
    }

    /* ---- 6. Filtros de navegación ---- */
    function shouldIntercept(a, evt) {
        if (!a || !a.href) return false;
        if (evt.button !== 0 || evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) return false;
        if (a.target && a.target !== '' && a.target !== '_self') return false;
        if (a.hasAttribute('download')) return false;
        const raw = a.getAttribute('href');
        if (!raw) return false;
        if (raw.startsWith('#')) return false;
        if (/^(mailto:|tel:|javascript:|sms:)/i.test(raw)) return false;
        let url;
        try { url = new URL(a.href, location.href); } catch (_) { return false; }
        if (url.origin !== location.origin) return false;
        if (url.pathname === location.pathname && url.search === location.search && !url.hash) return false;
        return true;
    }

    let navigating = false;
    function hardNav(url) {
        sessionStorage.setItem(FLAG, '1');
        window.location.href = url;
    }

    // Silk global de fondo para las páginas de proyecto (oscuras, sin #silk-content).
    function initProjectSilk() {
        if (!document.body || !document.body.classList.contains('project-page')) return;
        if (document.getElementById('silk-global')) return;
        const mount = document.createElement('div');
        mount.id = 'silk-global';
        mount.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(mount, document.body.firstChild);
        ensureTHREE()
            .then(() => loadScript(BASE + 'java/silk-bg.js'))
            .then(() => { if (window.cruzCreateSilk) window.cruzCreateSilk(mount); })
            .catch(() => {});
    }

    // Silk del overlay de transición, con los colores del tema destino.
    let silkPromise = null;
    function initTransitionSilk(ov, theme) {
        const mount = ov.querySelector('[data-ptx-silk]');
        if (!mount || mount.dataset.silkInit === '1') return;
        const run = () => {
            if (window.cruzCreateSilk) window.cruzCreateSilk(mount, silkOptsFor(theme));
        };
        if (window.cruzCreateSilk) { run(); return; }
        if (!silkPromise) silkPromise = ensureTHREE().then(() => loadScript(BASE + 'java/silk-bg.js'));
        silkPromise.then(run).catch(() => {});
    }

    function navigate(url) {
        if (navigating) return;
        navigating = true;

        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const theme = themeFor(url);
        const ov = ensureOverlay();
        applyTheme(ov, theme);

        const numEl = ov.querySelector('[data-ptx-num]');
        document.documentElement.classList.add('is-leaving');

        initTransitionSilk(ov, theme);

        // Prefetch del destino para que la navegación post-loader sea instantánea
        try { fetch(url, { credentials: 'same-origin' }).catch(() => {}); } catch (_) {}

        if (reduce) {
            runCounter(numEl, FALLBACK_MS, () => true, () => hardNav(url));
            return;
        }

        // El Silk es decorativo: si tarda, el contador no se bloquea.
        let ready = false;
        ensureTHREE().then(() => { ready = true; }).catch(() => { ready = true; });
        setTimeout(() => { ready = true; }, 1200);   // failsafe

        runCounter(numEl, OUT_MS, () => ready, () => hardNav(url));
    }

    /* ---- 7. Init ---- */
    function init() {
        const ov = ensureOverlay();
        initProjectSilk();
        ensureTHREE().catch(() => {}); // precarga THREE en background

        if (document.documentElement.classList.contains('is-incoming')) {
            // Mismo tema que mostró la página anterior al salir → continuidad.
            applyTheme(ov, themeFor(location.href));
            const numEl = ov.querySelector('[data-ptx-num]');
            if (numEl) numEl.textContent = '100';
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('is-incoming');
                document.documentElement.classList.add('is-revealing');
                setTimeout(() => {
                    document.documentElement.classList.remove('is-revealing');
                }, IN_MS);
            });
        }

        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[href]');
            if (!shouldIntercept(a, e)) return;
            e.preventDefault();
            navigate(a.href);
        });

        function attachCardNav(el, url) {
            if (!url) return;
            el.removeAttribute('onclick');
            el.setAttribute('data-nav-href', url);
            el.style.cursor = el.style.cursor || 'pointer';
            el.addEventListener('click', (e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (e.target.closest('a[href]')) return;
                e.preventDefault();
                try { navigate(new URL(url, location.href).href); }
                catch (_) { window.location.href = url; }
            });
        }

        document.querySelectorAll('[onclick*="location.href"]').forEach(el => {
            const match = el.getAttribute('onclick').match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
            if (match) attachCardNav(el, match[1]);
        });
        document.querySelectorAll('[onclick*="redirectWithAnimation"]').forEach(el => {
            attachCardNav(el, el.getAttribute('data-url'));
        });
        window.redirectWithAnimation = function (element) {
            if (!element) return;
            const url = element.getAttribute('data-url') || element.getAttribute('href');
            if (!url) return;
            try { navigate(new URL(url, location.href).href); }
            catch (_) { window.location.href = url; }
        };

        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                document.documentElement.classList.remove('is-leaving', 'is-incoming', 'is-revealing');
                sessionStorage.removeItem(FLAG);
                navigating = false;
                stopCounter();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
