// ============================================
// Main JavaScript File - V2
// ============================================

(function($) {
    'use strict';

    // ============================================
    // Document Ready
    // ============================================
    $(document).ready(function() {
        
        // Initialize all components
        initHeader();
        initHeroVideo();
        initMap();
        initInteractiveMap();
        initSlickSlider();
        initFancybox();
        initFloatingContact();
        initSmoothScroll();
        initMobileMenu();
        initScrollAnimations();
    });

    // ============================================
    // Header Scroll Effect
    // ============================================
    function initHeader() {
        $(window).on('scroll', function() {
            if ($(window).scrollTop() > 100) {
                $('#header').addClass('scrolled');
            } else {
                $('#header').removeClass('scrolled');
            }
        });
    }

    // ============================================
    // Hero Video Controls
    // ============================================
    function initHeroVideo() {
        const video = document.getElementById('heroVideo');
        
        if (video) {
            // Ensure video plays on load
            video.play().catch(function(error) {
                console.log('Video autoplay prevented:', error);
            });

            // Pause video when not in viewport (performance)
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.play();
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(video);
        }
    }

    // ============================================
    // Leaflet Map Initialization
    // ============================================
    function initMap() {
        if (typeof L !== 'undefined' && $('#map').length) {
            // Coordenadas exactas del terreno (31°57'41.9"S 64°38'24.8"W)
            const lat = -31.961639;
            const lng = -64.640222;

            const map = L.map('map', {
                center: [lat, lng],
                zoom: 15,
                scrollWheelZoom: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add marker
            const marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup('<strong>El Alto de los Cinco</strong><br>Villa General Belgrano');

            // Enable scroll wheel zoom on click
            map.on('click', function() {
                map.scrollWheelZoom.enable();
            });

            map.on('mouseout', function() {
                map.scrollWheelZoom.disable();
            });
        }
    }

    // ============================================
    // Interactive Map with Overlay (for Planos section)
    // ============================================
    let interactiveMapInstance = null;
    let overlayChacras = null;
    let overlaySubdivisiones = null;
    let satelliteLayer = null;
    let whiteLayer = null;
    let centerMarker = null;

    function initInteractiveMap() {
        const mapContainer = document.getElementById('interactive-map');
        
        if (!mapContainer || typeof L === 'undefined') {
            console.log('Mapa interactivo no disponible');
            return;
        }

        // Coordenadas del terreno
        const BOUNDS = {
            north: -31.942797,  // 31°56'34.07"S
            south: -31.969139,  // 31°58'8.90"S
            east: -64.632783,   // 64°37'58.02"W
            west: -64.644947    // 64°38'41.81"W
        };
        
        // Centro del mapa
        const CENTER = [-31.961639, -64.640222];
        
        // Rutas de las imágenes overlay
        const OVERLAYS = {
            chacras: 'assets/images/planos/plano__chacras.png',
            subdivisiones: 'assets/images/planos/plano__subdivisiones.png'
        };
        
        // Crear el mapa
        interactiveMapInstance = L.map('interactive-map', {
            center: CENTER,
            zoom: 17,
            zoomControl: true,
            scrollWheelZoom: false,  // Deshabilitar zoom con scroll - usar botones
            dragging: true,          // Permitir arrastrar el mapa
            touchZoom: true,         // Permitir zoom con pinch en móviles
            doubleClickZoom: true    // Permitir zoom con doble click
        });
        
        // Capa satelital (ESRI World Imagery)
        satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href=\"https://www.esri.com/\">Esri</a>',
            maxZoom: 19
        });
        
        // Capa blanca (sin tiles)
        whiteLayer = L.tileLayer('', {
            attribution: '',
            maxZoom: 19
        });
        
        // Agregar capa blanca por defecto (Vista de Líneas)
        whiteLayer.addTo(interactiveMapInstance);
        $('#interactive-map').css('background-color', '#ffffff');
        
        // Bounds para los overlays de imagen
        const imageBounds = [
            [BOUNDS.south, BOUNDS.west],
            [BOUNDS.north, BOUNDS.east]
        ];
        
        // Crear ambos overlays
        overlayChacras = L.imageOverlay(OVERLAYS.chacras, imageBounds, {
            opacity: 0.8,
            interactive: false,
            bubblingMouseEvents: false,
            className: 'overlay-black'  // Negro por defecto (para Vista de Líneas)
        });
        
        overlaySubdivisiones = L.imageOverlay(OVERLAYS.subdivisiones, imageBounds, {
            opacity: 0.8,
            interactive: false,
            bubblingMouseEvents: false,
            className: 'overlay-black'  // Negro por defecto (para Vista de Líneas)
        });
        
        // Mostrar overlay de chacras por defecto
        overlayChacras.addTo(interactiveMapInstance);
        
        // Crear marker en el centro (solo visible en zoom out)
        centerMarker = L.marker(CENTER, {
            title: 'El Alto de los Cinco'
        });
        
        // Función para mostrar/ocultar marker según zoom
        function updateMarkerVisibility() {
            const currentZoom = interactiveMapInstance.getZoom();
            // Mostrar marker solo cuando zoom <= 16 (cuando overlay completo es visible)
            if (currentZoom <= 16) {
                if (!interactiveMapInstance.hasLayer(centerMarker)) {
                    centerMarker.addTo(interactiveMapInstance);
                }
            } else {
                if (interactiveMapInstance.hasLayer(centerMarker)) {
                    interactiveMapInstance.removeLayer(centerMarker);
                }
            }
        }
        
        // Listener para cambios de zoom
        interactiveMapInstance.on('zoomend', function() {
            updateMarkerVisibility();
            console.log('Zoom actual del mapa:', interactiveMapInstance.getZoom());
        });
        
        // Check inicial
        updateMarkerVisibility();
        console.log('Zoom inicial del mapa:', interactiveMapInstance.getZoom());
        
        // Event handler para botón de centrar proyecto
        $('#btn-center-project').on('click', function() {
            // Calcular centro del overlay (bounds del plano)
            const overlayCenter = [
                (BOUNDS.north + BOUNDS.south) / 2,
                (BOUNDS.east + BOUNDS.west) / 2
            ];
            
            // Verificar si ya estamos centrados en el proyecto (zoom 15)
            const currentCenter = interactiveMapInstance.getCenter();
            const currentZoom = interactiveMapInstance.getZoom();
            
            // Tolerancia para comparar coordenadas (aproximadamente 50 metros)
            const tolerance = 0.0005;
            const isCentered = Math.abs(currentCenter.lat - overlayCenter[0]) < tolerance &&
                             Math.abs(currentCenter.lng - overlayCenter[1]) < tolerance &&
                             currentZoom === 15;
            
            if (isCentered) {
                // Ya está centrado, hacer zoom más cercano a las chacras/subdivisiones (zoom inicial)
                interactiveMapInstance.setView(CENTER, 17);
            } else {
                // No está centrado, centrar el proyecto completo
                interactiveMapInstance.setView(overlayCenter, 15);
            }
        });
        
        // Event handlers para botones de overlay
        $('[data-overlay]').on('click', function() {
            const overlayType = $(this).data('overlay');
            
            // Remover todos los overlays
            if (interactiveMapInstance.hasLayer(overlayChacras)) {
                interactiveMapInstance.removeLayer(overlayChacras);
            }
            if (interactiveMapInstance.hasLayer(overlaySubdivisiones)) {
                interactiveMapInstance.removeLayer(overlaySubdivisiones);
            }
            
            // Agregar el overlay seleccionado
            if (overlayType === 'chacras') {
                overlayChacras.addTo(interactiveMapInstance);
            } else if (overlayType === 'subdivisiones') {
                overlaySubdivisiones.addTo(interactiveMapInstance);
            }
            
            // Actualizar botones activos
            $('[data-overlay]').removeClass('active');
            $(this).addClass('active');
        });
        
        // Event handlers para botones de capa base
        $('[data-baselayer]').on('click', function() {
            const layerType = $(this).data('baselayer');
            
            // Remover todas las capas base
            if (interactiveMapInstance.hasLayer(satelliteLayer)) {
                interactiveMapInstance.removeLayer(satelliteLayer);
            }
            if (interactiveMapInstance.hasLayer(whiteLayer)) {
                interactiveMapInstance.removeLayer(whiteLayer);
            }
            
            // Agregar la capa seleccionada y cambiar color de overlays
            if (layerType === 'satellite') {
                satelliteLayer.addTo(interactiveMapInstance);
                $('#interactive-map').css('background-color', '');
                // Cambiar overlays a blanco para fondo satélite
                if (overlayChacras) {
                    overlayChacras.getElement().className = 'leaflet-image-layer overlay-white';
                }
                if (overlaySubdivisiones) {
                    overlaySubdivisiones.getElement().className = 'leaflet-image-layer overlay-white';
                }
            } else if (layerType === 'white') {
                whiteLayer.addTo(interactiveMapInstance);
                $('#interactive-map').css('background-color', '#ffffff');
                // Cambiar overlays a negro para fondo blanco
                if (overlayChacras) {
                    overlayChacras.getElement().className = 'leaflet-image-layer overlay-black';
                }
                if (overlaySubdivisiones) {
                    overlaySubdivisiones.getElement().className = 'leaflet-image-layer overlay-black';
                }
            }
            
            // Actualizar botones activos
            $('[data-baselayer]').removeClass('active');
            $(this).addClass('active');
        });
        
        console.log('Mapa interactivo inicializado con overlays y controles de capa base');
    }

    // ============================================
    // Slick Slider Initialization
    // ============================================
    function initSlickSlider() {
        if (typeof $.fn.slick !== 'undefined' && $('.gallery-slider').length) {
            $('.gallery-slider').slick({
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 4000,
                arrows: true,
                fade: true,
                cssEase: 'ease-in-out',
                pauseOnHover: true,
                adaptiveHeight: false
            });
        }
    }

    // ============================================
    // Fancybox Initialization
    // ============================================
    function initFancybox() {
        if (typeof Fancybox !== 'undefined') {
            Fancybox.bind('[data-fancybox]', {
                groupAll: false,
                Toolbar: {
                    display: {
                        left: [],
                        middle: [],
                        right: ['close']
                    }
                },
                Thumbs: {
                    type: 'classic'
                },
                Images: {
                    protected: true
                },
                Video: {
                    autoplay: true
                }
            });
        }
    }

    // ============================================
    // Floating Contact Button
    // ============================================
    function initFloatingContact() {
        const $floatingBtn = $('#floatingContact');

        $(window).on('scroll', function() {
            if ($(window).scrollTop() > window.innerHeight * 0.5) {
                $floatingBtn.addClass('visible');
            } else {
                $floatingBtn.removeClass('visible');
            }
        });
    }

    // ============================================
    // Smooth Scroll
    // ============================================
    function initSmoothScroll() {
        $('a[href^="#"]').on('click', function(e) {
            const target = $(this.getAttribute('href'));
            
            if (target.length) {
                e.preventDefault();
                $('html, body').stop().animate({
                    scrollTop: target.offset().top - 80
                }, 800, 'swing');
            }
        });
    }

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    function initMobileMenu() {
        const $toggle = $('.mobile-menu-toggle');
        const $menu = $('.nav-menu');

        $toggle.on('click', function() {
            $(this).toggleClass('active');
            $menu.toggleClass('active');
        });

        // Close menu when clicking a link
        $('.nav-link').on('click', function() {
            $toggle.removeClass('active');
            $menu.removeClass('active');
        });

        // Close menu when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.header').length) {
                $toggle.removeClass('active');
                $menu.removeClass('active');
            }
        });
    }

    // ============================================
    // Scroll Animations (Intersection Observer)
    // ============================================
    function initScrollAnimations() {
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe sections
            const sections = document.querySelectorAll('section');
            sections.forEach(function(section) {
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';
                section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(section);
            });

            // Add animate-in class styles
            const style = document.createElement('style');
            style.textContent = `
                .animate-in {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ============================================
    // Window Load Event
    // ============================================
    $(window).on('load', function() {
        // Remove any loading overlays or preloaders
        $('body').addClass('loaded');
    });

    // ============================================
    // Window Resize Event (Debounced)
    // ============================================
    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Handle responsive adjustments
            handleResponsive();
        }, 250);
    });

    function handleResponsive() {
        const windowWidth = $(window).width();
        
        // Close mobile menu on desktop
        if (windowWidth > 991) {
            $('.mobile-menu-toggle').removeClass('active');
            $('.nav-menu').removeClass('active');
        }
    }

})(jQuery);
