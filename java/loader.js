document.addEventListener("DOMContentLoaded", () => {
    const percentage = document.getElementById("loader-percentage");
    const loader = document.getElementById("loader");
    const clockElement = document.getElementById("loader-clock");
    let count = 0;

    // Reloj en vivo (como en la referencia)
    function updateClock() {
        const now = new Date();
        clockElement.innerText = now.toTimeString().split(' ')[0];
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Contador de Carga
    const loaderInterval = setInterval(() => {
        count++;
        // Formatear a dos dígitos (01, 02...)
        percentage.innerText = count < 10 ? '0' + count : count;

        if (count === 100) {
            clearInterval(loaderInterval);
            setTimeout(() => {
                loader.classList.add("loaded");
                document.body.classList.remove("scroll-locked");
            }, 500);
        }
    }, 30); // Velocidad de carga
});