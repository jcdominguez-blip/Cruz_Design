/**
 * ============================================================
 *  CRUZ ESTUDIO ® — Cursor Image Preview (GSAP)
 *
 *  Card de imagen que sigue al cursor al pasar por una lista de
 *  proyectos. Basado en el demo de GSAP "Cursor-Tracking Image
 *  Preview" (https://demos.gsap.com).
 *
 *  - gsap.quickTo() para el seguimiento suave en x / y.
 *  - Rotación proporcional a la velocidad horizontal del cursor
 *    (se endereza sola al frenar).
 *  - scale + autoAlpha para mostrar / ocultar.
 *
 *  Se usa en dos lugares:
 *    · index.html    -> .sw-item       ("Proyectos destacados")
 *    · trabajos.html -> .project-item  (solo en LIST VIEW)
 * ============================================================ */

function initCursorImagePreview(opts) {
    if (typeof gsap === 'undefined') return null;

    const card         = document.getElementById(opts.cardId);
    const cardImg      = document.getElementById(opts.imgId);
    const cardCategory = opts.categoryId ? document.getElementById(opts.categoryId) : null;
    const cardTitle    = opts.titleId    ? document.getElementById(opts.titleId)    : null;
    const listEl       = opts.listEl;
    const items        = opts.items;
    const isEnabled    = opts.isEnabled || (() => true);

    if (!card || !cardImg || !listEl || !items || !items.length) return null;

    // Solo en dispositivos con hover real (sin touch).
    if (window.matchMedia('(hover: none)').matches) return null;

    // La card vive en <body>: position:fixed debe ser relativo al viewport
    // (la sección puede tener ancestros con transform por animaciones de reveal).
    if (card.parentElement !== document.body) document.body.appendChild(card);

    // Primera URL del data-images de un item.
    const firstImage = (item) => {
        try {
            const arr = JSON.parse(item.getAttribute('data-images') || '[]');
            return Array.isArray(arr) ? (arr[0] || '') : '';
        } catch (_) { return ''; }
    };

    // Preload de la primera imagen de cada item.
    items.forEach((item) => {
        const src = firstImage(item);
        if (src) { const pre = new Image(); pre.src = src; }
    });

    // Estado inicial: centrada en su propio punto, reducida y oculta.
    gsap.set(card, { xPercent: -50, yPercent: -50, scale: 0.8, autoAlpha: 0 });

    // quickTo: seguimiento suave + rotación por velocidad.
    const xTo   = gsap.quickTo(card, 'x',        { duration: 0.5, ease: 'power3' });
    const yTo   = gsap.quickTo(card, 'y',        { duration: 0.5, ease: 'power3' });
    const rotTo = gsap.quickTo(card, 'rotation', { duration: 0.6, ease: 'power3' });

    let lastX     = 0;
    let lastT     = 0;
    let stopTimer = null;

    window.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);

        // Rotación proporcional a la velocidad horizontal (px/ms), tope ±14°.
        const now = performance.now();
        const dt  = (now - lastT) || 16;
        const vx  = (e.clientX - lastX) / dt;
        lastX = e.clientX;
        lastT = now;
        rotTo(gsap.utils.clamp(-14, 14, vx * 6));

        // Al frenar el cursor, la card se endereza sola.
        if (stopTimer) clearTimeout(stopTimer);
        stopTimer = setTimeout(() => rotTo(0), 110);
    }, { passive: true });

    let visible = false;

    const show = () => {
        visible = true;
        gsap.to(card, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'power3' });
    };
    const hide = () => {
        if (!visible) return;
        visible = false;
        gsap.to(card, { scale: 0.8, autoAlpha: 0, duration: 0.4, ease: 'power3' });
    };

    // mouseenter por item: carga imagen + textos y muestra la card.
    items.forEach((item) => {
        item.addEventListener('mouseenter', () => {
            if (!isEnabled()) return;

            const src = firstImage(item);
            if (!src) return;

            if (cardImg.getAttribute('src') !== src) {
                cardImg.src = src;
                gsap.fromTo(cardImg, { opacity: 0 },
                    { opacity: 1, duration: 0.3, ease: 'power2.out' });
            }

            if (cardCategory) {
                const el = opts.categorySelector ? item.querySelector(opts.categorySelector) : null;
                cardCategory.textContent = el ? el.textContent.trim() : '';
            }
            if (cardTitle) {
                const el = opts.titleSelector ? item.querySelector(opts.titleSelector) : null;
                cardTitle.textContent = el ? el.textContent.trim() : '';
            }

            show();
        });
    });

    // El fade out se dispara al salir de toda la lista (no item por item).
    listEl.addEventListener('mouseleave', hide);

    // API mínima para que el caller fuerce el ocultado (ej. cambio de vista).
    return { hide };
}

/* ---------- Auto-init por página ---------- */
function bootCursorImagePreview() {
    if (!document.getElementById('sw-cursor-card')) return;

    // index.html — "Proyectos destacados"
    const swList = document.querySelector('.sw-list');
    if (swList) {
        initCursorImagePreview({
            cardId: 'sw-cursor-card',
            imgId: 'sw-card-img',
            categoryId: 'sw-card-category',
            titleId: 'sw-card-title',
            listEl: swList,
            items: swList.querySelectorAll('.sw-item'),
            categorySelector: '.sw-category',
            titleSelector: '.sw-project-title'
        });
        return;
    }

    // trabajos.html — archivo de proyectos, solo en LIST VIEW
    const archive = document.getElementById('archive-main');
    if (archive) {
        const api = initCursorImagePreview({
            cardId: 'sw-cursor-card',
            imgId: 'sw-card-img',
            categoryId: 'sw-card-category',
            titleId: 'sw-card-title',
            listEl: archive,
            items: archive.querySelectorAll('.project-item'),
            categorySelector: '.l-cat',
            titleSelector: '.l-name',
            isEnabled: () => archive.classList.contains('list-mode')
        });
        // Al cambiar de vista (Grid / List) ocultamos la card si quedó visible.
        if (api) {
            document.querySelectorAll('.view-btn').forEach((btn) => {
                btn.addEventListener('click', api.hide);
            });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootCursorImagePreview);
} else {
    bootCursorImagePreview();
}
