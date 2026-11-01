/* ═══════════════════════════════════════════════════════════════════════
   MEDIA LOADER — páginas de proyecto
   ------------------------------------------------------------------------
   1) Loader por imagen: en cada encuadre con tamaño fijo (.reveal-frame.
      aspect-framed, .projv2-gallery figure, .visual-box) muestra la CRUZ
      girando (img/signo-cruz.svg) + un contador porcentual real mientras
      descarga la imagen. Descarga vía fetch con stream para saber el %,
      pidiendo directamente el .webp gemelo (liviano) y cayendo al original
      si algo falla.
   2) Lazy-load de <video>: difiere la descarga de los mp4 (que pesan MUCHO)
      hasta que el video está por entrar al viewport. Sin tocar el HTML.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var CROSS = '/img/signo-cruz.svg';
    var hasFetchStream = ('fetch' in window) && ('ReadableStream' in window);

    /* ═══════════ 1 · LOADER POR IMAGEN ═══════════ */

    // Encuadres con tamaño propio (no colapsan a 0 antes de cargar la imagen)
    var FRAME_SEL = '.reveal-frame.aspect-framed, .projv2-gallery figure, .visual-box';

    function buildOverlay() {
        var d = document.createElement('div');
        d.className = 'ml-loader';
        d.innerHTML =
            '<img class="ml-cross" src="' + CROSS + '" alt="" aria-hidden="true" decoding="async">' +
            '<span class="ml-pct">0</span>';
        return d;
    }

    function finish(img) {
        var ov = img._mlOverlay;
        if (ov) { ov.classList.add('is-done'); setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 550); }
        img._mlOverlay = null;
        img.removeAttribute('data-ml');
    }

    function nativeLoad(img) {
        // Sin progreso: carga directa del src original
        img.onload = function () { finish(img); };
        img.onerror = function () { finish(img); };
        img.src = img.getAttribute('data-ml-src');
    }

    function loadWithProgress(img) {
        var src = img.getAttribute('data-ml-src');
        var ov = img._mlOverlay;
        var pctEl = ov ? ov.querySelector('.ml-pct') : null;
        // Pedimos el .webp gemelo directo (chico); si no existe → original
        var webp = src.replace(/\.(jpe?g|png)$/i, '.webp');

        function stream(url, onFail) {
            fetch(url, { credentials: 'same-origin' }).then(function (res) {
                if (!res.ok || !res.body) throw new Error('bad');
                var total = +res.headers.get('Content-Length') || 0;
                var reader = res.body.getReader();
                var received = 0, chunks = [];
                (function pump() {
                    reader.read().then(function (r) {
                        if (r.done) {
                            var blob = new Blob(chunks);
                            img.onload = function () { finish(img); };
                            img.onerror = function () { nativeLoad(img); };
                            img.src = URL.createObjectURL(blob);
                            if (pctEl) pctEl.textContent = '100';
                            return;
                        }
                        chunks.push(r.value);
                        received += r.value.length;
                        if (pctEl && total) pctEl.textContent = Math.min(99, Math.round(received / total * 100));
                        pump();
                    }).catch(onFail);
                })();
            }).catch(onFail);
        }

        // 1º intento webp, fallback al original, fallback final carga nativa
        stream(webp, function () {
            stream(src, function () { nativeLoad(img); });
        });
    }

    var imgIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            imgIO.unobserve(e.target);
            var img = e.target._mlImg;
            if (img) (hasFetchStream ? loadWithProgress : nativeLoad)(img);
        });
    }, { rootMargin: '300px 0px' }) : null;

    function setupImages() {
        var frames = [].slice.call(document.querySelectorAll(FRAME_SEL));
        frames.forEach(function (frame) {
            var img = frame.querySelector('img');
            if (!img || img.dataset.ml) return;
            var src = img.getAttribute('src');
            if (!src || /\.svg(\?|$)/i.test(src)) return;         // svg → sin loader
            if (img.complete && img.naturalWidth > 0) return;      // ya cargada
            // Si el encuadre ya está en viewport, dejamos la carga nativa (LCP rápido)
            var r = frame.getBoundingClientRect();
            var inView = r.top < (window.innerHeight || 0) && r.bottom > 0 && r.height > 0;
            if (inView && !imgIO) { return; }
            if (inView) {
                // visible al inicio: carga con progreso YA (sin esperar scroll)
                img.dataset.ml = '1';
                img.setAttribute('data-ml-src', src);
                img.removeAttribute('src');
                frame.classList.add('ml-frame');
                var ov0 = buildOverlay(); frame.appendChild(ov0); img._mlOverlay = ov0;
                (hasFetchStream ? loadWithProgress : nativeLoad)(img);
                return;
            }
            // fuera de viewport: preparamos y observamos
            img.dataset.ml = '1';
            img.setAttribute('data-ml-src', src);
            img.removeAttribute('src');                            // frena la carga nativa
            frame.classList.add('ml-frame');
            var ov = buildOverlay(); frame.appendChild(ov); img._mlOverlay = ov;
            frame._mlImg = img;
            if (imgIO) imgIO.observe(frame); else (hasFetchStream ? loadWithProgress : nativeLoad)(img);
        });
    }

    /* ═══════════ 2 · LAZY-LOAD DE VIDEOS ═══════════ */

    var vidIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var v = e.target; vidIO.unobserve(v);
            var srcs = [].slice.call(v.querySelectorAll('source[data-ml-src]'));
            srcs.forEach(function (s) { s.setAttribute('src', s.getAttribute('data-ml-src')); s.removeAttribute('data-ml-src'); });
            if (v.getAttribute('data-ml-src')) { v.setAttribute('src', v.getAttribute('data-ml-src')); v.removeAttribute('data-ml-src'); }
            v.preload = 'metadata';
            try { v.load(); } catch (err) {}
            if (v.hasAttribute('autoplay')) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        });
    }, { rootMargin: '400px 0px' }) : null;

    function setupVideos() {
        if (!vidIO) return;
        [].slice.call(document.querySelectorAll('video')).forEach(function (v) {
            if (v.dataset.mlLazy) return;
            var srcs = [].slice.call(v.querySelectorAll('source[src]'));
            var direct = v.getAttribute('src');
            if (!srcs.length && !direct) return;
            srcs.forEach(function (s) { s.setAttribute('data-ml-src', s.getAttribute('src')); s.removeAttribute('src'); });
            if (direct) { v.setAttribute('data-ml-src', direct); v.removeAttribute('src'); }
            v.preload = 'none';
            v.dataset.mlLazy = '1';
            try { v.load(); } catch (err) {}
            vidIO.observe(v);
        });
    }

    function init() { setupImages(); setupVideos(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
