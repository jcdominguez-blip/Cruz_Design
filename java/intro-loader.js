/* ==========================================================================
   INTRO LOADER — Transición de salida del loader de ingreso.
   --------------------------------------------------------------------------
   El loader muestra el counter "01%", la cruz signo-cruz.svg girando (animada
   por CSS) y la bajada de estudio. Cuando la barra llega a 100%,
   loader.js/script.js llaman a window.cruzIntroExit(), que hace una transición
   animada (zoom + fade, estilo intrkt) y oculta el loader → revela el hero
   (donde aparece la esfera con el vuelo de cámara).
   ========================================================================== */
(function () {
    'use strict';

    const loader = document.getElementById('loader');
    if (!loader) {
        window.cruzIntroExit = function (done) { if (typeof done === 'function') done(); };
        return;
    }

    let exited = false;
    window.cruzIntroExit = function (done) {
        if (exited) { if (typeof done === 'function') done(); return; }
        exited = true;

        // Loader salteado (sesión ya vista): ocultar de una sin animación.
        if (document.documentElement.classList.contains('skip-loader')) {
            loader.classList.add('hidden');
            if (typeof done === 'function') done();
            return;
        }

        // Avisamos al hero para que el vuelo de cámara arranque YA, mientras el
        // loader se desvanece encima → la transición se siente continua.
        window.dispatchEvent(new Event('cruz:intro-exit'));

        loader.classList.add('intro-out');
        setTimeout(() => {
            loader.classList.add('hidden');
            if (typeof done === 'function') done();
        }, 1050);
    };
})();
