document.addEventListener("DOMContentLoaded", () => {
    const percentage = document.getElementById("loader-percentage");
    const loader = document.getElementById("loader");
    const clockElement = document.getElementById("loader-clock");
    let count = 0;

    // Reloj en vivo para la fisonomía técnica
    function updateClock() {
        const now = new Date();
        clockElement.innerText = now.toTimeString().split(' ')[0];
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Algoritmo de carga constante (1 en 1)
    function startCounting() {
        count++;
        if (count > 100) count = 100;

        // Formateo a dos dígitos (01, 02...)
        percentage.innerText = count < 10 ? '0' + count : count;

        if (count < 100) {
            // Velocidad controlada para fluidez cinematográfica
            let delay = count < 30 ? 30 : (count < 80 ? 50 : 20);
            setTimeout(startCounting, delay);
        } else {
            setTimeout(() => {
                loader.classList.add("loaded");
                document.body.classList.remove("scroll-locked");
            }, 800);
        }
    }
    startCounting();
});