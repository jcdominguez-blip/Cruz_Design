/**
 * CRUZ ESTUDIO ® — Menú de navegación moderno (top-right), en todas las páginas.
 * 100% CSS-driven: el JS solo togglea la clase .is-open; la animación orquestada
 * (fondo que se despliega + links en stagger + cierre más rápido = "easeReverse")
 * vive en el CSS con transition-delay. Sin dependencia de GSAP, así funciona en
 * cualquier página, cargue o no la librería.
 * Además marca el link de la página actual (aria-current + .is-current).
 */
(function () {
  'use strict';

  function init() {
    const toggle  = document.getElementById('navToggle');
    const overlay = document.getElementById('navOverlay');
    if (!toggle || !overlay) return;

    const links = overlay.querySelectorAll('.nav-overlay-links a');
    let open = false;

    function setOpen(state) {
      open = state;
      toggle.classList.toggle('is-open', state);
      overlay.classList.toggle('is-open', state);
      document.body.classList.toggle('nav-open', state);
      toggle.setAttribute('aria-expanded', String(state));
      overlay.setAttribute('aria-hidden', String(!state));
    }

    toggle.addEventListener('click', () => setOpen(!open));
    links.forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) setOpen(false); });

    // Marcar la página actual (respeta dónde estamos posicionados).
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    links.forEach(a => {
      const target = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
      if (target && target === here) {
        a.classList.add('is-current');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
