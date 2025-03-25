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


// ... loader code remains unchanged ...

// ANIMACION Page transition functions
function redirectWithAnimation(element) {
    const url = element.dataset.url;
    const transition = document.querySelector('.page-transition');
    
    transition.classList.remove('exiting');
    transition.style.display = 'block';
    
    void transition.offsetWidth;
    
    transition.classList.add('entering');
    
    setTimeout(() => {
        window.location.href = url;
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    const transition = document.querySelector('.page-transition');
    
    transition.style.display = 'block';
    void transition.offsetWidth;
    transition.classList.add('exiting');
    
    setTimeout(() => {
        transition.style.display = 'none';
    }, 1000);
    
    document.querySelectorAll('a[href]:not([target="_blank"])').forEach(link => {
        if (!link.classList.contains('carousel-control-prev') && 
            !link.classList.contains('carousel-control-next')) {
            link.addEventListener('click', function(e) {
                if (!this.hasAttribute('data-no-transition')) {
                    e.preventDefault();
                    const href = this.getAttribute('href');
                    
                    transition.classList.remove('exiting');
                    transition.style.display = 'block';
                    
                    void transition.offsetWidth;
                    
                    transition.classList.add('entering');
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 1000);
                }
            });
        }
    });
});

// ... loader code remains unchanged ...

// Add new function for index return transition
function returnToIndexAnimation(e) {
    if (window.location.pathname.includes('/pages/')) {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        const transition = document.querySelector('.page-transition');
        
        transition.classList.remove('entering');
        transition.style.display = 'block';
        transition.classList.add('exit-to-index');
        
        setTimeout(() => {
            window.location.href = href;
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const transition = document.querySelector('.page-transition');
    
    // Add handlers for index links
    document.querySelectorAll('a[href*="index.html"], a[href="../index.html"]').forEach(link => {
        link.addEventListener('click', returnToIndexAnimation);
    });
    
    // ... rest of existing code ...
});