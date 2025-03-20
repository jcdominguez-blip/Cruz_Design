function toggleAccordion(element) {
    const content = element.nextElementSibling;
    const isVisible = content.style.display === "block";


    // Oculta todos los contenidos de acordeón
    const allContents = document.querySelectorAll('.accordion-content');
    allContents.forEach((item) => {
        item.style.display = 'none';
    });


    // Muestra el contenido correspondiente al elemento clicado
    content.style.display = isVisible ? "none" : "block";


    // Cambiar la imagen y el texto
    const imgSrc = element.querySelector('span').getAttribute('data-img');
    const title = element.querySelector('span').getAttribute('data-title');
    const description = element.querySelector('span').getAttribute('data-description');


    const projectImage = document.getElementById('project-image');
    const projectTitle = document.getElementById('project-title');
    const projectDescription = document.getElementById('project-description');


    projectImage.src = imgSrc;
    projectTitle.textContent = title;
    projectDescription.textContent = description;
}


function changeContent(element) {
    document.getElementById('project-description').innerText = element.getAttribute('data-description');
}


//transicion automatica en imagenes//


let currentIndex = 0;
let images = [];
let intervalId;


function changeImage() {
    const imgElement = document.getElementById('project-image');
    if (images.length > 0) {
        imgElement.src = images[currentIndex];
        currentIndex = (currentIndex + 1) % images.length;
    }
}


function toggleAccordion(element) {
    const accordion = element.classList.toggle('active'); // Cambia la clase activa
    const content = element.nextElementSibling; // Obtiene el contenido del acordeón
   
    if (accordion) {
        // Si el acordeón se activa, obtén las imágenes y comienza el cambio
        const span = element.querySelector('span');
        images = JSON.parse(span.getAttribute('data-images'));
        currentIndex = 0; // Reinicia el índice al cambiar de proyecto
        changeImage(); // Muestra la primera imagen inmediatamente
       
        // Reiniciar el intervalo si ya hay uno
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(changeImage, 2000); // Cambia la imagen cada 2 segundos
    } else {
        // Si se desactiva, puedes detener el intervalo
        clearInterval(intervalId);
    }
   
    // Mostrar u ocultar el contenido
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}


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




//footer-clock//




        function updateClock() {
            const now = new Date();
            const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
            document.getElementById('clock').textContent = now.toLocaleTimeString('es-AR', options);
        }
        setInterval(updateClock, 1000);
        updateClock(); // Update clock immediately on load
 




//boton lenguaje//


document.addEventListener('DOMContentLoaded', function() {
    const languageToggle = document.getElementById('language-toggle');
    const elementsToTranslate = document.querySelectorAll('[data-en], [data-es]');


    // Función para cambiar el idioma
    function toggleLanguage() {
        const currentLanguage = languageToggle.textContent.trim().toLowerCase();
        const newLanguage = currentLanguage === 'español' ? 'english' : 'español';


        // Cambiar el texto del botón
        languageToggle.textContent = newLanguage.charAt(0).toUpperCase() + newLanguage.slice(1);


        // Cambiar el contenido de los elementos
        elementsToTranslate.forEach(element => {
            if (currentLanguage === 'español') {
                element.textContent = element.getAttribute('data-en');
            } else {
                element.textContent = element.getAttribute('data-es');
            }
        });
    }


    // Evento para cambiar el idioma al hacer clic en el botón//
    languageToggle.addEventListener('click', toggleLanguage);
});


// Traduccion formulario//


function toggleLanguage() {
    const currentLanguage = languageToggle.textContent.trim().toLowerCase();
    const newLanguage = currentLanguage === 'español' ? 'english' : 'español';


    // Cambiar el texto del botón
    languageToggle.textContent = newLanguage.charAt(0).toUpperCase() + newLanguage.slice(1);


    // Cambiar el contenido de los elementos
    document.querySelectorAll('[data-en], [data-es]').forEach(element => {
        if (currentLanguage === 'español') {
            element.textContent = element.getAttribute('data-en');
        } else {
            element.textContent = element.getAttribute('data-es');
        }
    });


    // Cambiar los placeholders y labels del formulario
    const formLabels = document.querySelectorAll('.form-group label');
    formLabels.forEach(label => {
        if (currentLanguage === 'español') {
            label.textContent = label.getAttribute('data-en');
        } else {
            label.textContent = label.getAttribute('data-es');
        }
    });
}


// Smooth Scroll para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Evita el comportamiento predeterminado del enlace
        const targetId = this.getAttribute('href'); // Obtiene el ID del objetivo
        const targetElement = document.querySelector(targetId); // Selecciona el elemento objetivo


        if (targetElement) {
            // Desplazamiento suave
            targetElement.scrollIntoView({
                behavior: 'smooth', // Desplazamiento suave
                block: 'start' // Alinea el elemento en la parte superior de la ventana
            });
        }
    });
});


// Función para el efecto de máquina de escribir
function typeWriterEffect() {
    const typewriterElement = document.getElementById('typewriter');
    const texts = ["HELLO WORLD", "Cruz Diseño"]; // Textos a mostrar
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;


    function type() {
        const currentText = texts[textIndex];


        if (!isDeleting) {
            // Escribir el texto
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;


            // Si se ha escrito todo el texto, comenzar a borrar
            if (charIndex === currentText.length) {
                isDeleting = true;
                setTimeout(type, 1000); // Esperar 1 segundo antes de borrar
            } else {
                setTimeout(type, 100); // Velocidad de escritura
            }
        } else {
            // Borrar el texto
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;


            // Si se ha borrado todo el texto, pasar al siguiente texto
            if (charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length; // Cambiar al siguiente texto
                setTimeout(type, 500); // Esperar 0.5 segundos antes de escribir el siguiente texto
            } else {
                setTimeout(type, 50); // Velocidad de borrado
            }
        }
    }


    // Iniciar la animación
    type();
}


// Ejecutar la función cuando la página esté cargada //////////////
document.addEventListener('DOMContentLoaded', typeWriterEffect);


// Cursor //////////////////////////////////////////////


const links = document.querySelectorAll('.nav-links a');


links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        document.body.classList.add('link-location');
    });


    link.addEventListener('mouseleave', () => {
        document.body.classList.remove('link-location');
    });
});


document.addEventListener("DOMContentLoaded", function() {
    const texts = ["Impulsamos", "Diseñamos", "Creamos marcas"];
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    const heroTitle = document.getElementById("hero-title");


    function type() {
        const currentText = texts[currentTextIndex];
        if (isDeleting) {
            heroTitle.textContent = currentText.substring(0, currentCharIndex--);
            if (currentCharIndex < 0) {
                isDeleting = false;
                currentTextIndex = (currentTextIndex + 1) % texts.length;
                currentCharIndex = 0;
            }
        } else {
            heroTitle.textContent = currentText.substring(0, currentCharIndex++);
            if (currentCharIndex > currentText.length) {
                isDeleting = true;
                setTimeout(type, 900); // Pausa antes de empezar a borrar
                return;
            }
        }
        setTimeout(type, isDeleting ? 100 : 100);
    }


    type();
});

//Carrousel//

$(document).ready(function(){
    $('#carouselExample').carousel({
        interval: 1800 // Intervalo de 2 segundos
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Código existente...

    // Prevenir el comportamiento predeterminado de los controles del carrusel
    document.querySelectorAll('.carousel-control-prev, .carousel-control-next').forEach(function(control) {
        control.addEventListener('click', function(event) {
            event.preventDefault();
        });
    });
});


//Imagen trabajos destacados//

document.addEventListener("DOMContentLoaded", function () {
    const featuredItems = document.querySelectorAll(".featured-work-item");

    featuredItems.forEach(item => {
        item.addEventListener("click", function () {
            const projectUrl = item.getAttribute("data-url");
            if (projectUrl) {
                window.location.href = projectUrl; // Redirige a la página especificada
            }
        });
    });
});

//transiciona animada//

function redirectWithAnimation(element) {
    // Añadir clase de animación de movimiento hacia arriba
    element.style.transform = 'translateY(-30px)';
    element.style.opacity = 0;
    element.style.transition = 'transform 1s ease-out, opacity 1s ease-out';

    // Esperar a que la animación termine (1 segundo en este caso) antes de redirigir
    setTimeout(function() {
        window.location.href = element.getAttribute('data-url');
    }, 1000);  // El tiempo debe coincidir con la duración de la animación
}


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
