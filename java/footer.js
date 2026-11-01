/* ═══════════════════════════════════════════════════════════════════════
   FOOTER GLOBAL — reloj de Buenos Aires (GMT-3).
   Usado en las páginas de proyecto (el reveal lo maneja el IntersectionObserver
   inline de cada página vía .scroll-reveal / .scroll-reveal-stagger).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var el = document.getElementById('footer-clock');
    if (!el) return;
    function tick() {
        var now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
        var hh = String(now.getHours()).padStart(2, '0');
        var mm = String(now.getMinutes()).padStart(2, '0');
        el.textContent = hh + ':' + mm;
    }
    tick();
    setInterval(tick, 30000);
})();
