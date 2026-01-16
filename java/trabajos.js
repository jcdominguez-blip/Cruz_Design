document.addEventListener('DOMContentLoaded', () => {
    const viewBtns = document.querySelectorAll('.view-btn');
    const container = document.getElementById('projects-container');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const view = btn.getAttribute('data-view');
            if (view === 'list') {
                container.classList.add('list-view');
            } else {
                container.classList.remove('list-view');
            }
        });
    });

    // Menú Hamburguesa Mobile (Copia exacta del Index)
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