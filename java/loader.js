//loader//


document.addEventListener('DOMContentLoaded', function() {
    // Check if we're coming from an internal page
    if (document.referrer.includes('/pages/')) {
        // Hide loader immediately if coming from internal page
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.display = 'none';
        }
        return;
    }

    // Original loader code for first visit
    const loader = document.querySelector('.loader');
    const progressBar = document.querySelector('.progress-bar');
    const percentageText = document.querySelector('.loader-percentage');
    
    let progress = 1;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 500);
        }
        progressBar.style.width = `${progress}%`;
        percentageText.textContent = `${Math.round(progress)}%`;
    }, 100);
});


// ANIMACION Page transition functions

$(document).ready(function() {
    $('#carouselExample').carousel({
        interval: 1800,
        wrap: true,
        transition: 'none'
    });
});


function redirectWithAnimation(element) {
    const url = element.dataset.url;
    const transition = document.querySelector('.page-transition');
    
    transition.classList.add('active');
    
    setTimeout(() => {
        window.location.href = url;
    }, 600);
}

// Add this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const transition = document.querySelector('.page-transition');
    transition.classList.remove('active'); // Asegura que la transición esté desactivada al cargar la página
    
    // Add transition to all navigation links
    document.querySelectorAll('a:not([target="_blank"])').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.hasAttribute('data-no-transition')) {
                e.preventDefault(); // Previene la redirección inmediata
                const href = this.getAttribute('href');
                
                // Activa la animación de salida
                transition.classList.add('active');
                
                // Redirige después de que la animación termine
                setTimeout(() => {
                    window.location.href = href;
                }, 600); // Ajusta el tiempo según la duración de tu animación CSS
            }
        });
    });
});
