document.addEventListener('DOMContentLoaded', () => {
    const viewBtns = document.querySelectorAll('.view-btn');
    const container = document.getElementById('archive-main');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const view = btn.getAttribute('data-view');
            if (view === 'list') {
                container.classList.remove('grid-mode');
                container.classList.add('list-mode');
            } else {
                container.classList.remove('list-mode');
                container.classList.add('grid-mode');
            }
        });
    });
    // Menú hamburguesa (Copia exacta de Index)
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('open');
            document.body.classList.toggle('menu-open');
        });
    }
});