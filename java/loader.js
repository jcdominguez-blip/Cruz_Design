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


function redirectWithAnimation(element) {
    const url = element.dataset.url;
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);
    document.body.classList.add('transitioning');

    setTimeout(() => {
        overlay.classList.add('sliding-in');
        
        // Preload the next page
        fetch(url)
            .then(response => response.text())
            .then(() => {
                setTimeout(() => {
                    window.location.href = url;
                }, 400);
            });
    }, 50);
}

// Add this to handle return transitions
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-out';
    document.body.appendChild(overlay);

    // Small delay to ensure page is ready
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('sliding');
            setTimeout(() => {
                overlay.remove();
                document.body.classList.remove('transitioning');
            }, 800);
        });
    });
});