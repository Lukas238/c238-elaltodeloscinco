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
        // initSlickSlider(); // Deshabilitado - ahora usamos masonry grid
        initFancybox();
        initGalleryVideos();
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
            const terrenoLat = -31.961639;
            const terrenoLng = -64.640222;
            
            // Coordenadas de Villa General Belgrano (centro)
            const vgbLat = -31.9770;
            const vgbLng = -64.5660;

            const map = L.map('map', {
                center: [terrenoLat, terrenoLng],
                zoom: 12,
                scrollWheelZoom: false,
                touchZoom: true,
                doubleClickZoom: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Marker del terreno
            const markerTerreno = L.marker([terrenoLat, terrenoLng]).addTo(map);
            markerTerreno.bindPopup('<strong>El Alto de los Cinco</strong><br>Desarrollo de Chacras');

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
    let currentMapView = 'lines'; // Track current map view: 'lines', 'transit', or 'satellite'

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
            doubleClickZoom: true,   // Permitir zoom con doble click
            zoomAnimation: false     // Deshabilitar animación de zoom - evita saltos del overlay
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
        
        // Crear capa de tránsito (OpenStreetMap)
        const transitLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        });
        
        // Agregar capa blanca por defecto (Vista de Líneas)
        whiteLayer.addTo(interactiveMapInstance);
        $('#interactive-map').css('background-color', '#ffffff');
        
        // Precargar las otras capas para evitar demora al cambiar vista
        // Agregar brevemente con opacidad 0 para forzar descarga inicial
        satelliteLayer.setOpacity(0);
        transitLayer.setOpacity(0);
        satelliteLayer.addTo(interactiveMapInstance);
        transitLayer.addTo(interactiveMapInstance);
        
        // Removerlas después de un momento (ya iniciaron la carga)
        setTimeout(() => {
            if (interactiveMapInstance.hasLayer(satelliteLayer)) {
                interactiveMapInstance.removeLayer(satelliteLayer);
            }
            if (interactiveMapInstance.hasLayer(transitLayer)) {
                interactiveMapInstance.removeLayer(transitLayer);
            }
            // Restaurar opacidad para uso posterior
            satelliteLayer.setOpacity(1);
            transitLayer.setOpacity(1);
        }, 2000);
        
        // Bounds para los overlays de imagen
        const imageBounds = [
            [BOUNDS.south, BOUNDS.west],
            [BOUNDS.north, BOUNDS.east]
        ];
        
        // Crear ambos overlays con coordenadas exactas y rotación
        // Iniciar con opacity 0 para evitar flash antes de aplicar rotación
        overlayChacras = L.imageOverlay(OVERLAYS.chacras, imageBounds, {
            opacity: 0,
            interactive: false,
            bubblingMouseEvents: false,
            className: 'overlay-black'
        });
        
        overlaySubdivisiones = L.imageOverlay(OVERLAYS.subdivisiones, imageBounds, {
            opacity: 0,
            interactive: false,
            bubblingMouseEvents: false,
            className: 'overlay-black'
        });
        
        // Transformación: solo rotación (Leaflet maneja la posición)
        const OVERLAY_ROTATION = 1.005; // grados
        let overlayObservers = new Map(); // Para trackear los observers
        
        // Función para aplicar rotación sin trigger de observer
        function applyRotationToOverlayDirect(element) {
            if (!element) return;
            
            const currentTransform = element.style.transform || '';
            const transformWithoutRotation = currentTransform.replace(/\s*rotate\([^)]+\)/g, '').trim();
            element.style.transform = transformWithoutRotation + ` rotate(${OVERLAY_ROTATION}deg)`;
            element.style.transformOrigin = 'center center';
        }
        
        // Configurar observer para un overlay
        function setupOverlayObserver(overlay) {
            const element = overlay.getElement();
            if (!element) {
                setTimeout(() => setupOverlayObserver(overlay), 50);
                return;
            }
            
            // Desconectar observer anterior si existe
            if (overlayObservers.has(overlay)) {
                overlayObservers.get(overlay).disconnect();
            }
            
            // Aplicar rotación inicial
            applyRotationToOverlayDirect(element);
            
            // Hacer visible con fade-in
            const currentOpacity = parseFloat(window.getComputedStyle(element).opacity);
            if (currentOpacity === 0) {
                element.style.transition = 'opacity 0.3s ease-in-out';
                setTimeout(() => overlay.setOpacity(0.8), 50);
            }
            
            // Crear observer para detectar cambios de transform de Leaflet
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const transform = element.style.transform;
                        // Solo reaplica si no tiene la rotación correcta
                        if (transform && !transform.includes(`rotate(${OVERLAY_ROTATION}deg)`)) {
                            applyRotationToOverlayDirect(element);
                        }
                    }
                });
            });
            
            observer.observe(element, {
                attributes: true,
                attributeFilter: ['style']
            });
            
            overlayObservers.set(overlay, observer);
        }
        
        // Listeners para cuando se agregan los overlays al mapa
        overlayChacras.on('add', function() {
            setTimeout(() => setupOverlayObserver(overlayChacras), 100);
        });
        
        overlaySubdivisiones.on('add', function() {
            setTimeout(() => setupOverlayObserver(overlaySubdivisiones), 100);
        });
        
        // Listeners para cuando se remueven del mapa
        overlayChacras.on('remove', function() {
            if (overlayObservers.has(overlayChacras)) {
                overlayObservers.get(overlayChacras).disconnect();
                overlayObservers.delete(overlayChacras);
            }
        });
        
        overlaySubdivisiones.on('remove', function() {
            if (overlayObservers.has(overlaySubdivisiones)) {
                overlayObservers.get(overlaySubdivisiones).disconnect();
                overlayObservers.delete(overlaySubdivisiones);
            }
        });
        
        // Función para cambiar clase sin perder el transform
        function updateOverlayColor(overlay, colorClass) {
            if (!overlay) return;
            
            const element = overlay.getElement();
            if (element) {
                // Usar classList en lugar de reemplazar className completo
                element.classList.remove('overlay-white', 'overlay-black');
                element.classList.add(colorClass);
                
                // Re-aplicar rotación inmediatamente
                applyRotationToOverlayDirect(element);
            }
        }
        
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
        
        // Listener para cambios de zoom y movimiento
        interactiveMapInstance.on('zoomend moveend', function() {
            updateMarkerVisibility();
            // MutationObserver se encarga automáticamente de mantener la rotación
        });
        
        // Listener para resize de ventana
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (interactiveMapInstance) {
                    interactiveMapInstance.invalidateSize();
                    // MutationObserver se encarga automáticamente de mantener la rotación
                }
            }, 200);
        });
        
        // Check inicial
        updateMarkerVisibility();
        
        // Event handlers para botones de overlay
        $('[data-overlay]').on('click', function() {
            const overlayType = $(this).data('overlay');
            const isCurrentlyActive = $(this).hasClass('active');
            
            // Remover todos los overlays (resetear opacity para próxima vez)
            if (interactiveMapInstance.hasLayer(overlayChacras)) {
                overlayChacras.setOpacity(0);
                interactiveMapInstance.removeLayer(overlayChacras);
            }
            if (interactiveMapInstance.hasLayer(overlaySubdivisiones)) {
                overlaySubdivisiones.setOpacity(0);
                interactiveMapInstance.removeLayer(overlaySubdivisiones);
            }
            
            // Agregar el overlay seleccionado
            let activeOverlay = null;
            if (overlayType === 'chacras') {
                overlayChacras.addTo(interactiveMapInstance);
                activeOverlay = overlayChacras;
            } else if (overlayType === 'subdivisiones') {
                overlaySubdivisiones.addTo(interactiveMapInstance);
                activeOverlay = overlaySubdivisiones;
            }
            
            // Determinar el color según la vista activa registrada
            if (activeOverlay) {
                const colorClass = (currentMapView === 'satellite') ? 'overlay-white' : 'overlay-black';
                
                // Aplicar color correcto después de que el overlay esté en el mapa
                setTimeout(() => {
                    const element = activeOverlay.getElement();
                    if (element) {
                        element.classList.remove('overlay-white', 'overlay-black');
                        element.classList.add(colorClass);
                    }
                }, 150);
            }
            
            // Actualizar botones activos
            $('[data-overlay]').removeClass('active');
            $(this).addClass('active');
            
            if (!isCurrentlyActive) {
                // Primer click: hacer zoom detallado
                interactiveMapInstance.setView(CENTER, 17);
            } else {
                // Click en botón activo: toggle entre vista detallada y vista completa
                const currentCenter = interactiveMapInstance.getCenter();
                const currentZoom = interactiveMapInstance.getZoom();
                
                // Calcular centro del overlay (bounds del plano)
                const overlayCenter = [
                    (BOUNDS.north + BOUNDS.south) / 2,
                    (BOUNDS.east + BOUNDS.west) / 2
                ];
                
                // Tolerancia para comparar coordenadas
                const tolerance = 0.0005;
                const isCenteredOnDetail = Math.abs(currentCenter.lat - CENTER[0]) < tolerance &&
                                          Math.abs(currentCenter.lng - CENTER[1]) < tolerance &&
                                          currentZoom === 17;
                
                if (isCenteredOnDetail) {
                    // Ya está en vista detallada, cambiar a vista completa
                    interactiveMapInstance.setView(overlayCenter, 15);
                } else {
                    // No está en vista detallada, ir a vista detallada
                    interactiveMapInstance.setView(CENTER, 17);
                }
            }
        });
        
        // Event handlers para botones de vista de mapa
        $('[data-mapview]').on('click', function() {
            const viewType = $(this).data('mapview');
            
            // Actualizar la variable de vista activa
            currentMapView = viewType;
            
            // Determinar qué overlay está activo
            const activeOverlay = interactiveMapInstance.hasLayer(overlayChacras) ? overlayChacras : 
                                  interactiveMapInstance.hasLayer(overlaySubdivisiones) ? overlaySubdivisiones : null;
            
            // Remover todas las capas base
            if (interactiveMapInstance.hasLayer(satelliteLayer)) {
                interactiveMapInstance.removeLayer(satelliteLayer);
            }
            if (interactiveMapInstance.hasLayer(whiteLayer)) {
                interactiveMapInstance.removeLayer(whiteLayer);
            }
            if (interactiveMapInstance.hasLayer(transitLayer)) {
                interactiveMapInstance.removeLayer(transitLayer);
            }
            
            if (viewType === 'satellite') {
                satelliteLayer.addTo(interactiveMapInstance);
                $('#interactive-map').css('background-color', '');
                if (activeOverlay) {
                    updateOverlayColor(activeOverlay, 'overlay-white');
                }
            } else if (viewType === 'transit') {
                transitLayer.addTo(interactiveMapInstance);
                $('#interactive-map').css('background-color', '');
                if (activeOverlay) {
                    updateOverlayColor(activeOverlay, 'overlay-black');
                }
            } else {
                whiteLayer.addTo(interactiveMapInstance);
                $('#interactive-map').css('background-color', '#ffffff');
                if (activeOverlay) {
                    updateOverlayColor(activeOverlay, 'overlay-black');
                }
            }
            
            // Actualizar botones activos
            $('[data-mapview]').removeClass('active');
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
            Fancybox.bind('[data-fancybox="gallery"]', {
                groupAll: true,
                Toolbar: {
                    display: {
                        left: ['infobar'],
                        middle: [],
                        right: ['slideshow', 'thumbs', 'close']
                    }
                },
                Thumbs: {
                    type: 'classic',
                    autoStart: false
                },
                Images: {
                    protected: true,
                    zoom: true
                },
                Video: {
                    autoplay: true,
                    ratio: 16/9
                },
                Carousel: {
                    infinite: true,
                    transition: 'slide'
                },
                // Enhanced animation options
                on: {
                    ready: (fancybox) => {
                        // Ensure panning animations are applied
                        console.log('Fancybox gallery ready');
                    }
                }
            });
        }
    }

    // ============================================
    // Gallery Video Thumbnails
    // ============================================
    function initGalleryVideos() {
        const videoThumbs = document.querySelectorAll('.video-thumb-player');
        
        videoThumbs.forEach(video => {
            // Asegurar que el video esté muteado en móviles
            video.muted = true;
            video.playsInline = true;
            
            // Manejar el loop con transición suave
            video.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            });
            
            // Intentar reproducir el video (algunos navegadores requieren interacción)
            video.play().catch(err => {
                console.log('Autoplay prevented:', err);
            });
        });
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
            const href = this.getAttribute('href');
            
            // Ignorar enlaces con solo "#" o vacíos
            if (!href || href === '#' || href.length <= 1) {
                return;
            }
            
            const target = $(href);
            
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
