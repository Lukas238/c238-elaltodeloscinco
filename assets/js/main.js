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
    
    
    // ==========================================    // MAPA INTERACTIVO CON LEAFLET
    // ==========================================
    const mapElement = document.getElementById('interactive-map');
    
    if (mapElement && typeof L !== 'undefined') {
        console.log('Inicializando mapa interactivo...');
        
        // Coordenadas del terreno
        const BOUNDS = {
            north: -31.942797,  // 31°56'34.07"S
            south: -31.969139,  // 31°58'8.90"S
            east: -64.632783,   // 64°37'58.02"W
            west: -64.644947    // 64°38'41.81"W
        };
        
        // Centro del mapa (31°57'41.9"S 64°38'24.8"W)
        const CENTER = [-31.961639, -64.640222];
        
        // Rutas de las imágenes
        const OVERLAYS = {
            chacras: '/assets/images/googleEarth/all_views__chacras_b.png',
            ph: '/assets/images/googleEarth/all_views__ph_b.png'
        };
        
        // Variables globales del mapa
        let map;
        let overlay1 = null;  // Chacras
        let overlay2 = null;  // PH
        let currentLayer = 'ph';
        
        // Crear el mapa con OpenStreetMap
        map = L.map('interactive-map', {
            center: CENTER,
            zoom: 17,
            zoomControl: true
        });
        
        // Capa satelital (ESRI World Imagery)
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
            maxZoom: 19,
            className: 'satellite-tiles'
        });
        
        // Capa de calles (OpenStreetMap)
        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        });
        
        // Agregar capa satelital por defecto
        satelliteLayer.addTo(map);
        
        // Control de capas base
        L.control.layers({
            'Satélite': satelliteLayer,
            'Calles': streetLayer
        }, null, {
            position: 'topright'
        }).addTo(map);
        
        console.log('Mapa creado. Configurando overlays...');
        
        // Crear los overlays de imagen
        const imageBounds = [
            [BOUNDS.south, BOUNDS.west],
            [BOUNDS.north, BOUNDS.east]
        ];
        
        overlay1 = L.imageOverlay(OVERLAYS.chacras, imageBounds, {
            opacity: 0.8,
            interactive: false,
            className: 'yellow-overlay'
        });
        
        overlay2 = L.imageOverlay(OVERLAYS.ph, imageBounds, {
            opacity: 0.8,
            interactive: false,
            className: 'yellow-overlay'
        });
        
        console.log('Overlays creados.');
        
        // Crear control personalizado de botones
        const LayerControl = L.Control.extend({
            options: {
                position: 'topleft'
            },
            
            onAdd: function(map) {
                const container = L.DomUtil.create('div', 'map-controls leaflet-bar');
                
                container.innerHTML = `
                    <h3>Capas del Terreno</h3>
                    <div class="button-group">
                        <button class="layer-button" data-layer="chacras">
                            Subdivisión Chacras
                        </button>
                        <button class="layer-button active" data-layer="ph">
                            Propiedad Horizontal
                        </button>
                    </div>
                `;
                
                // Prevenir propagación de eventos del mapa
                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.disableScrollPropagation(container);
                
                // Agregar event listeners
                const buttons = container.querySelectorAll('.layer-button');
                console.log('Botones encontrados:', buttons.length);
                
                buttons.forEach(button => {
                    button.addEventListener('click', function() {
                        const layer = this.getAttribute('data-layer');
                        console.log('Botón clickeado:', layer);
                        switchLayer(layer);
                        
                        // Actualizar estado activo
                        buttons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                    });
                });
                
                return container;
            }
        });
        
        // Agregar el control al mapa
        map.addControl(new LayerControl());
        console.log('Panel de control agregado al mapa.');
        

        
        // Función para cambiar capa visible
        function switchLayer(layer) {
            console.log('Cambiando a capa:', layer);
            currentLayer = layer;
            
            // Remover todas las capas
            if (map.hasLayer(overlay1)) {
                map.removeLayer(overlay1);
            }
            if (map.hasLayer(overlay2)) {
                map.removeLayer(overlay2);
            }
            console.log('Todas las capas ocultadas');
            
            // Agregar solo la capa seleccionada
            switch(layer) {
                case 'chacras':
                    overlay1.addTo(map);
                    console.log('Mostrando capa Chacras');
                    break;
                case 'ph':
                    overlay2.addTo(map);
                    console.log('Mostrando capa PH');
                    break;
                case 'none':
                default:
                    console.log('Sin capas visibles');
                    break;
            }
        }
        
        // Mostrar capa PH por defecto
        overlay2.addTo(map);
        
        console.log('Mapa interactivo inicializado correctamente.');
    }
    
    
    // ==========================================
    // MAPA DE UBICACIÓN (SECCIÓN UBICACIÓN)
    // ==========================================
    const locationMapElement = document.getElementById('location-map');
    
    if (locationMapElement && typeof L !== 'undefined') {
        console.log('Inicializando mapa de ubicación...');
        
        // Centro del mapa (31°57'41.9"S 64°38'24.8"W)
        const locationCenter = [-31.961639, -64.640222];
        
        // Crear el mapa de ubicación
        const locationMap = L.map('location-map', {
            center: locationCenter,
            zoom: 15,
            zoomControl: true
        });
        
        // Capa satelital
        const locationSatelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
            maxZoom: 19,
            className: 'satellite-tiles'
        });
        
        // Capa de calles
        const locationStreetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        });
        
        // Agregar capa satelital por defecto
        locationSatelliteLayer.addTo(locationMap);
        
        // Control de capas
        L.control.layers({
            'Satélite': locationSatelliteLayer,
            'Calles': locationStreetLayer
        }, null, {
            position: 'topright'
        }).addTo(locationMap);
        
        // Agregar marcador en el centro
        const marker = L.marker(locationCenter).addTo(locationMap);
        marker.bindPopup('<b>El Alto de los Cinco</b><br>Villa General Belgrano, Córdoba').openPopup();
        
        console.log('Mapa de ubicación inicializado.');
    }
    
    
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
