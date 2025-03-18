
//responsive hamburguer funcion//


document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("mobile-menu");
    const navLinks = document.getElementById("nav-links");
    const logo = document.querySelector(".logo");

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
        logo.classList.toggle("hidden"); // Agrega o quita la clase para ocultar el logo
    });
});




function showProjectDetails(element) {
    // Obtener los datos del proyecto
    const title = element.querySelector('.titulo-proyecto').dataset.title;
    const description = element.querySelector('.titulo-proyecto').dataset.description;
    const images = JSON.parse(element.querySelector('.titulo-proyecto').dataset.images);
    const videos = JSON.parse(element.querySelector('.titulo-proyecto').dataset.videos);

    // Asignar el título y la descripción
    document.getElementById('project-title').innerText = title;
    document.getElementById('project-description').innerText = description;

    // Limpiar la galería de imágenes y videos
    const gallery = document.getElementById('project-gallery');
    gallery.innerHTML = '';

    // Mostrar imágenes en la galería
    images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = title;
        imgElement.onclick = () => openModal(image);
        gallery.appendChild(imgElement);
    });

    // Mostrar videos en la galería
    videos.forEach(video => {
        const videoElement = document.createElement('iframe');
        videoElement.src = video;
        videoElement.width = "560";
        videoElement.height = "315";
        videoElement.frameBorder = "0";
        videoElement.allowFullscreen = true;
        gallery.appendChild(videoElement);
    });

    // Si hay videos, mostrarlos
    if (videos.length > 0) {
        document.getElementById('project-video').style.display = 'block';
        document.getElementById('video-iframe').src = videos[0]; // Muestra el primer video
    } else {
        document.getElementById('project-video').style.display = 'none';
    }
}

// Función para abrir el modal
function openModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    modal.style.display = 'flex'; // Mostrar el modal
    modalImg.src = imageSrc;
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none'; // Ocultar el modal
}

// Cerrar el modal si se hace clic fuera de la imagen
window.onclick = function(event) {
    const modal = document.getElementById('image-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Footer clock
function updateClock() {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('clock').textContent = now.toLocaleTimeString('es-AR', options);
}
setInterval(updateClock, 1000);
updateClock(); // Update clock immediately on load

// Botón de lenguaje
let currentLanguage = 'es'; // Idioma por defecto

document.getElementById('language-toggle').addEventListener('click', function() {
    currentLanguage = currentLanguage === 'es' ? 'en' : 'es'; // Cambiar el idioma

    // Cambiar el texto del botón
    this.textContent = currentLanguage === 'es' ? 'Español' : 'English';

    // Cambiar el texto de los elementos
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute(currentLanguage === 'es' ? 'data-es' : 'data-en');
    });
});

// Nuevo description
document.addEventListener('DOMContentLoaded', function() {
    const languageToggle = document.getElementById('language-toggle');
    const elementsToTranslate = document.querySelectorAll('[data-title-en], [data-title-es], [data-description-en], [data-description-es]');
    
    // Establecer el idioma inicial (por ejemplo, español)
    let isSpanish = true; // Cambia esto a false si quieres que sea inglés por defecto

    // Función para cambiar el idioma
    function toggleLanguage() {
        isSpanish = !isSpanish; // Cambiar el estado del idioma

        // Cambiar el texto del botón
        languageToggle.textContent = isSpanish ? 'Inglés' : 'Español';

        // Cambiar el contenido de los elementos
        elementsToTranslate.forEach(element => {
            if (isSpanish) {
                if (element.hasAttribute('data-title-es')) {
                    element.textContent = element.getAttribute('data-title-es');
                }
                if (element.hasAttribute('data-description-es')) {
                    element.textContent = element.getAttribute('data-description-es');
                }
            } else {
                if (element.hasAttribute('data-title-en')) {
                    element.textContent = element.getAttribute('data-title-en');
                }
                if (element.hasAttribute('data-description-en')) {
                    element.textContent = element.getAttribute('data-description-en');
                }
            }
        });
    }

    // Inicializar el texto del botón
    languageToggle.textContent = isSpanish ? 'Español' : 'Inglés';

    // Evento para cambiar el idioma al hacer clic en el botón
    languageToggle.addEventListener('click', toggleLanguage);
});


