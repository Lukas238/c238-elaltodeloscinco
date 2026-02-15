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
        initPlanosViewer();
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
    let overlay1 = null;  // Chacras
    let overlay2 = null;  // PH

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
            chacras: 'assets/images/googleEarth/all_views__chacras_b.png',
            ph: 'assets/images/googleEarth/all_views__ph_b.png'
        };
        
        // Crear el mapa (solo una vez)
        interactiveMapInstance = L.map('interactive-map', {
            center: CENTER,
            zoom: 17,
            zoomControl: true
        });
        
        // Capa satelital (ESRI World Imagery)
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href=\"https://www.esri.com/\">Esri</a>',
            maxZoom: 19,
            className: 'satellite-tiles'
        });
        
        // Capa de calles (OpenStreetMap)
        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>',
            maxZoom: 19
        });
        
        // Agregar capa satelital por defecto
        satelliteLayer.addTo(interactiveMapInstance);
        
        // Control de capas base
        L.control.layers({
            'Satélite': satelliteLayer,
            'Calles': streetLayer
        }, null, {
            position: 'topright'
        }).addTo(interactiveMapInstance);
        
        // Bounds para los overlays de imagen
        const imageBounds = [
            [BOUNDS.south, BOUNDS.west],
            [BOUNDS.north, BOUNDS.east]
        ];
        
        // Crear ambos overlays
        overlay1 = L.imageOverlay(OVERLAYS.chacras, imageBounds, {
            opacity: 0.8,
            interactive: false,
            bubblingMouseEvents: false,
            className: 'yellow-overlay'
        });
        
        overlay2 = L.imageOverlay(OVERLAYS.ph, imageBounds, {
            opacity: 0.8,
            interactive: false,
            bubblingMouseEvents: false,
            className: 'yellow-overlay'
        });
        
        // Función para cambiar entre overlays
        function switchLayer(layer) {
            // Remover todos los overlays primero
            if (interactiveMapInstance.hasLayer(overlay1)) {
                interactiveMapInstance.removeLayer(overlay1);
            }
            if (interactiveMapInstance.hasLayer(overlay2)) {
                interactiveMapInstance.removeLayer(overlay2);
            }
            
            // Agregar solo el overlay seleccionado
            switch(layer) {
                case 'chacras':
                    overlay1.addTo(interactiveMapInstance);
                    break;
                case 'ph':
                    overlay2.addTo(interactiveMapInstance);
                    break;
            }
        }
        
        // Crear control personalizado para selección de overlays
        const LayerControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },
            
            onAdd: function(map) {
                const container = L.DomUtil.create('div', 'map-controls-overlay');
                
                container.innerHTML = `
                    <div class="btn-group-overlay">
                        <button class="btn-overlay" data-layer="chacras">
                            Detalle de chacras
                        </button>
                        <button class="btn-overlay active" data-layer="ph">
                            Subdivisión de Chacras
                        </button>
                    </div>
                `;
                
                // Prevenir propagación de eventos del mapa
                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.disableScrollPropagation(container);
                
                // Agregar event listeners a los botones
                const buttons = container.querySelectorAll('.btn-overlay');
                buttons.forEach(button => {
                    button.addEventListener('click', function() {
                        const layer = this.getAttribute('data-layer');
                        switchLayer(layer);
                        
                        // Actualizar estado activo
                        buttons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                    });
                });
                
                return container;
            }
        });
        
        // Agregar el control personalizado al mapa
        interactiveMapInstance.addControl(new LayerControl());
        
        // Mostrar overlay de PH por defecto
        overlay2.addTo(interactiveMapInstance);
        
        console.log('Mapa interactivo inicializado con overlays intercambiables');
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
    // Planos Viewer with Filter Buttons
    // ============================================
    function initPlanosViewer() {
        const $btns = $('.plano-btn');
        const $viewerImg = $('#plano-viewer-img');
        const $viewerLink = $('#plano-viewer-link');
        const $mapContainer = $('#interactive-map-container');

        const planoData = {
            detalle: {
                src: 'assets/images/planos/plano__subdivision_detalle.jpg',
                alt: 'Plano - Detalle de chacras'
            },
            subdivision: {
                src: 'assets/images/planos/plano__prop_hoz__detalle.jpg',
                alt: 'Plano - Subdivisión (Propiedad Horizontal Especial)'
            },
            general: {
                src: 'assets/images/planos/plano__lote_10.jpg',
                alt: 'Plano general - Lote total del emprendimiento'
            },
            mapa: {
                type: 'map' // Special type for interactive map
            }
        };

        $btns.on('click', function() {
            const planoType = $(this).data('plano');
            const plano = planoData[planoType];

            if (plano) {
                // Update active button
                $btns.removeClass('active');
                $(this).addClass('active');

                if (plano.type === 'map') {
                    // Show interactive map, hide image
                    $viewerLink.fadeOut(200, function() {
                        $mapContainer.fadeIn(200, function() {
                            // Invalidate size to ensure Leaflet renders correctly
                            if (interactiveMapInstance) {
                                interactiveMapInstance.invalidateSize();
                            }
                        });
                    });
                } else {
                    // Show image, hide map
                    $mapContainer.fadeOut(200, function() {
                        $viewerImg.attr('src', plano.src);
                        $viewerImg.attr('alt', plano.alt);
                        $viewerLink.attr('href', plano.src);
                        $viewerLink.fadeIn(200);
                    });
                }
            }
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
