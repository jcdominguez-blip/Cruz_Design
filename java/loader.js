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
     
     // Initial state setup
     transition.style.display = 'block';
     void transition.offsetWidth;
     transition.classList.add('exiting');
     
     setTimeout(() => {
         transition.style.display = 'none';
     }, 1000);
     
     // Add transition only to page links, excluding navbar and carousel controls
     document.querySelectorAll('a[href]:not([target="_blank"])').forEach(link => {
         // Skip navbar links and carousel controls
         if (!link.closest('.nav-links-brands') && 
             !link.classList.contains('carousel-control-prev') && 
             !link.classList.contains('carousel-control-next') &&
             !link.getAttribute('href').startsWith('#')) {
             
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
 //service section//

// Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const accordionButtons = document.querySelectorAll('.accordion-button-service');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const isActive = accordionItem.classList.contains('active');
            
            // Close all accordion items
            document.querySelectorAll('.accordion-item-service').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });
});