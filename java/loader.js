document.addEventListener("DOMContentLoaded", () => {
    // Intentamos detectar el loader por ID o por Clase por seguridad
    const loader = document.getElementById('loader') || document.querySelector('.loader');
    const body = document.body;

    if (sessionStorage.getItem('cruz-loader-visto')) {
        console.log("Loader ya visto: Saltando...");
        if (loader) loader.remove();
        body.style.overflowY = 'auto'; // Forzamos scroll
    } else {
        console.log("Primera visita: Mostrando branding...");
        
        // Lógica para ocultar el loader tras la carga
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (loader) {
                    loader.classList.add('loaded');
                    sessionStorage.setItem('cruz-loader-visto', 'true');
                    body.style.overflowY = 'auto'; // Liberamos scroll al terminar
                }
            }, 1200); // 1.2 segundos de impacto
        });

        // SAFETY: Si por alguna razón el loader falla, lo forzamos a ocultarse en 4s
        setTimeout(() => {
            if (loader && !loader.classList.contains('loaded')) {
                loader.classList.add('loaded');
                body.style.overflowY = 'auto';
            }
        }, 4000);
    }
});