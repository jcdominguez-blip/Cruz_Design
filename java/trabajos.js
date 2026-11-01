/**
 * ============================================================
 *  CRUZ ESTUDIO ® — Trabajos archive
 *
 *  - View switcher Grid / List (legacy).
 *  - Menú hamburguesa mobile (match index).
 *  - HOVER CAROUSEL en cada card: al pasar el cursor sobre un
 *    .project-item, sus imágenes adicionales (data-images JSON
 *    array) se ciclan con crossfade suave + barra de progreso.
 * ============================================================
 */
document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 1. VIEW SWITCHER (Explorar / Grid / List) ----------
       La vista EXPLORAR (canvas arrastrable) es la default en TODOS los dispositivos
       — también en mobile (arrastre táctil). El canvas lo controla
       window.CruzCanvas (java/trabajos-canvas.js). */
    const viewBtns  = document.querySelectorAll('.cg-viewswitch .view-btn');
    const container = document.getElementById('archive-main');

    function setView(view) {
        viewBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-view') === view));
        if (view === 'canvas') {
            if (window.CruzCanvas) window.CruzCanvas.activate();
        } else {
            if (window.CruzCanvas) window.CruzCanvas.deactivate();
            container.classList.toggle('list-mode', view === 'list');
            container.classList.toggle('grid-mode', view !== 'list');
        }
    }

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => setView(btn.getAttribute('data-view')));
    });

    // Vista por defecto: EXPLORAR (inmersiva) en TODOS los dispositivos.
    if (window.CruzCanvas) setView('canvas');
    else setView('grid');

    /* ---------- 2. MENÚ HAMBURGUESA (match index) ---------- */
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks   = document.getElementById('nav-links');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('open');
            document.body.classList.toggle('menu-open');
        });
    }

    /* ---------- 3. HOVER CAROUSEL EN LAS CARDS ---------- */
    initHoverCarousel();
});

/**
 * Activa el carousel de imágenes adicionales al hover en cada .project-item.
 * Espera que cada item tenga:
 *   data-images='["url1", "url2", "url3", ...]'
 * (JSON array de URLs). Si el atributo no existe o tiene <2 imágenes,
 * el item se ignora (queda con su comportamiento normal).
 */
function initHoverCarousel() {
    const items = document.querySelectorAll('.project-item[data-images]');
    if (!items.length) return;

    const CYCLE_MS = 800;       // tiempo entre cambios de imagen
    // Touch / sin hover real: skip carousel (no aporta nada)
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    items.forEach((item) => {
        const visualBox = item.querySelector('.visual-box');
        if (!visualBox) return;

        // Parse de las imágenes del carousel
        let extras = [];
        try {
            extras = JSON.parse(item.getAttribute('data-images') || '[]');
        } catch (_) {
            extras = [];
        }
        if (!Array.isArray(extras) || extras.length < 2) return;

        // Inyectamos cada URL como un <img class="pi-cycle-img"> stackeado.
        // La primera arranca con .is-active. El <img> estático original queda
        // como fallback debajo del stack.
        const cycleImgs = extras.map((src, i) => {
            const img = document.createElement('img');
            img.className = 'pi-cycle-img' + (i === 0 ? ' is-active' : '');
            img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            img.loading = 'eager';
            img.decoding = 'async';
            img.src = src;
            return img;
        });

        // Indicador de progreso (línea inferior amarilla)
        const indicator = document.createElement('div');
        indicator.className = 'pi-cycle-indicator';
        const indicatorFill = document.createElement('div');
        indicatorFill.className = 'pi-cycle-indicator-fill';
        indicator.appendChild(indicatorFill);

        cycleImgs.forEach(img => visualBox.appendChild(img));
        visualBox.appendChild(indicator);

        let currentIdx = 0;
        let cycleTimer = null;

        function showIndex(idx) {
            cycleImgs.forEach((img, i) => {
                img.classList.toggle('is-active', i === idx);
            });
            // Reset + animar progress bar
            indicatorFill.style.transition = 'none';
            indicatorFill.style.width = '0%';
            void indicatorFill.offsetWidth; // force reflow
            indicatorFill.style.transition = 'width ' + CYCLE_MS + 'ms linear';
            indicatorFill.style.width = '100%';
        }

        function startCycle() {
            currentIdx = 0;
            showIndex(currentIdx);
            cycleTimer = setInterval(() => {
                currentIdx = (currentIdx + 1) % cycleImgs.length;
                showIndex(currentIdx);
            }, CYCLE_MS);
        }

        function stopCycle() {
            if (cycleTimer) {
                clearInterval(cycleTimer);
                cycleTimer = null;
            }
            cycleImgs.forEach((img, i) => {
                img.classList.toggle('is-active', i === 0);
            });
            indicatorFill.style.transition = 'width 0.3s ease';
            indicatorFill.style.width = '0%';
        }

        item.addEventListener('mouseenter', startCycle);
        item.addEventListener('mouseleave', stopCycle);
    });
}
