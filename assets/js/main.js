// El Alto de los Cinco - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // SLICK SLIDER GALLERY
    // ==========================================
    if (typeof jQuery !== 'undefined' && jQuery.fn.slick) {
        $('.gallery-slider-main').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: true,
            fade: true,
            asNavFor: '.gallery-slider-nav',
            autoplay: true,
            autoplaySpeed: 4000,
            speed: 800
        });
        
        // Pause videos when changing slides
        $('.gallery-slider-main').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
            // Pause all videos
            $('.gallery-slider-main video').each(function() {
                this.pause();
            });
        });
        
        // Play video when slide becomes active (optional)
        $('.gallery-slider-main').on('afterChange', function(event, slick, currentSlide) {
            const $currentSlide = $(slick.$slides[currentSlide]);
            const $video = $currentSlide.find('video');
            // Videos will be controlled by user with controls attribute
        });
        
        $('.gallery-slider-nav').slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: '.gallery-slider-main',
            dots: true,
            centerMode: false,
            focusOnSelect: true,
            arrows: true,
            infinite: true,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        dots: true,
                        arrows: true
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        dots: true,
                        arrows: true
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        dots: true,
                        arrows: true
                    }
                }
            ]
        });
    }
    
    // ==========================================
    // FANCYBOX INITIALIZATION
    // ==========================================
    if (typeof Fancybox !== 'undefined') {
        Fancybox.bind("[data-fancybox]", {
            // Options
            Toolbar: {
                display: {
                    left: [],
                    middle: [],
                    right: ["close"],
                },
            },
            Images: {
                zoom: true,
            },
            Thumbs: {
                type: "classic",
            },
        });
    }
    
    // ==========================================
    // MOBILE MENU
    // ==========================================
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-menu a');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close mobile menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    
    // ==========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ==========================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignore empty anchors
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80; // Height of fixed header
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    
    // ==========================================
    // HEADER BACKGROUND ON SCROLL
    // ==========================================
    const header = document.querySelector('.site-header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // ==========================================
    // PLANOS TABS
    // ==========================================
    const planoTabs = document.querySelectorAll('.plano-tab');
    const planoContents = document.querySelectorAll('.plano-content');
    
    planoTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const planoId = this.getAttribute('data-plano');
            
            // Remove active class from all tabs and contents
            planoTabs.forEach(t => t.classList.remove('active'));
            planoContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(`plano-${planoId}`).classList.add('active');
        });
    });
    
    
    // ==========================================
    // FORM VALIDATION (Basic)
    // ==========================================
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const nombre = document.getElementById('nombre');
            const email = document.getElementById('email');
            const telefono = document.getElementById('telefono');
            
            let valid = true;
            
            if (!nombre.value.trim()) {
                showError(nombre, 'Por favor ingresá tu nombre');
                valid = false;
            }
            
            if (!email.value.trim() || !isValidEmail(email.value)) {
                showError(email, 'Por favor ingresá un email válido');
                valid = false;
            }
            
            if (!telefono.value.trim()) {
                showError(telefono, 'Por favor ingresá tu teléfono');
                valid = false;
            }
            
            if (valid) {
                // Submit form (implement actual submission logic)
                alert('Formulario enviado! (Implementar lógica real de envío)');
                contactForm.reset();
            }
        });
    }
    
    function showError(input, message) {
        const formGroup = input.parentElement;
        const error = formGroup.querySelector('.error-message') || document.createElement('span');
        error.className = 'error-message';
        error.textContent = message;
        error.style.color = '#D32F2F';
        error.style.fontSize = '0.875rem';
        error.style.marginTop = '4px';
        error.style.display = 'block';
        
        if (!formGroup.querySelector('.error-message')) {
            formGroup.appendChild(error);
        }
        
        input.style.borderColor = '#D32F2F';
        
        // Remove error on input
        input.addEventListener('input', function() {
            input.style.borderColor = '';
            if (error) error.remove();
        }, { once: true });
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    
    // ==========================================
    // LAZY LOADING IMAGES (Simple implementation)
    // ==========================================
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
    
    
    // ==========================================
    // FADE IN ON SCROLL ANIMATION
    // ==========================================
    const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
    
    if ('IntersectionObserver' in window && fadeElements.length > 0) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });
        
        fadeElements.forEach(el => fadeObserver.observe(el));
    }
    
    
    // ==========================================
    // VIDEO AUTOPLAY FIX FOR MOBILE
    // ==========================================
    const heroVideo = document.querySelector('.hero-video');
    
    if (heroVideo) {
        // Ensure video plays on mobile (some browsers require user interaction)
        heroVideo.play().catch(err => {
            console.log('Video autoplay prevented:', err);
            // Show fallback image if video can't autoplay
        });
    }
    
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get scroll position
function getScrollPosition() {
    return window.pageYOffset || document.documentElement.scrollTop;
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
