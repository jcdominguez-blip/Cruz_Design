/**
 * ============================================================
 *  CRUZ ESTUDIO ® — Proceso de trabajo (acordeón)
 *  · Un panel abierto a la vez (click en la fila abre y cierra los demás).
 *  · Accesible vía aria-expanded. La animación es CSS (.open + grid-template-rows).
 *  · Failsafe: si el JS no corre, los paneles quedan colapsados (el contenido
 *    sigue en el DOM); al menos los títulos/numeración se ven.
 * ============================================================
 */
(function () {
    'use strict';

    function init() {
        var list = document.querySelector('[data-proc-list]');
        if (!list) return;

        var items = Array.prototype.slice.call(
            list.querySelectorAll('[data-proc-item]')
        );

        items.forEach(function (item) {
            var btn = item.querySelector('.proceso-row');
            if (!btn) return;
            btn.addEventListener('click', function () {
                var wasOpen = item.classList.contains('open');
                items.forEach(function (it) {
                    it.classList.remove('open');
                    var b = it.querySelector('.proceso-row');
                    if (b) b.setAttribute('aria-expanded', 'false');
                });
                if (!wasOpen) {
                    item.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
