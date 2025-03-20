//loader//


document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loader');
    const progressBar = document.querySelector('.progress-bar');
    const percentage = document.querySelector('.loader-percentage');
    let progress = 1; // Inicia en 1%

    // Bloquear scroll mientras carga
    document.body.style.overflow = 'hidden';

    const interval = setInterval(() => {
        progress += 1; // Aumento gradual

        if (progress > 100) {
            progress = 100;
            clearInterval(interval); // Detener contador en 100%

            setTimeout(() => {
                loader.classList.add('hidden'); // Oculta loader con transición
                document.body.style.overflow = ''; // Reactiva scroll

                // Suavizar la transición hacia la página
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }, 800); // Espera antes de ocultar
        }

        progressBar.style.width = `${progress}%`;
        percentage.textContent = `${progress}%`;
    }, 30); // Se actualiza cada 30ms para una animación fluida
});