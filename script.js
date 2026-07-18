/**
 * Darshana Art Gallery - Interactive Scripting
 * Implements smooth scroll, gallery filtering, lightbox modal, scroll reveals,
 * testimonial slider, and inquiry form submission.
 */

let isNavigating = false;

function temporarilyDisableNavHide() {
    isNavigating = true;
    const header = document.getElementById('main-header');
    if (header) header.classList.remove('nav-hidden');
    
    const handleScrollEnd = () => {
        isNavigating = false;
        window.removeEventListener('scrollend', handleScrollEnd);
    };
    
    window.addEventListener('scrollend', handleScrollEnd);
    
    setTimeout(() => {
        isNavigating = false;
        window.removeEventListener('scrollend', handleScrollEnd);
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initHeaderScroll();
    initMobileNav();
    initScrollSpy();
    initScrollReveal();
    initGallery();
    initCompleteGalleryModal();
    initProcessFlow();
    initInstagramScroll();
    initContactForm();
});

function initLenis() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Integrate with anchor link clicks
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                temporarilyDisableNavHide();
                
                lenis.scrollTo(targetEl, {
                    offset: 0,
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    window.lenis = lenis;
}

/* ==========================================================================
   Header Scroll State
   ========================================================================== */
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
        if (isNavigating) {
            header.classList.remove('nav-hidden');
            lastScrollY = window.scrollY;
            return;
        }
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        const scrollDifference = currentScrollY - lastScrollY;
        
        if (currentScrollY > 5) {
            if (scrollDifference > 5) {
                // Scrolling down -> disappear
                header.classList.add('nav-hidden');
            } else if (scrollDifference < -5) {
                // Scrolling up -> appear immediately
                header.classList.remove('nav-hidden');
            }
        } else {
            header.classList.remove('nav-hidden');
        }
        
        lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger on load in case page is refreshed while scrolled
}

/* ==========================================================================
   Mobile Navigation Toggle
   ========================================================================== */
function initMobileNav() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const menu = document.getElementById('nav-menu');
    const links = document.querySelectorAll('.nav-menu a');
    
    const toggleMenu = () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    };
    
    toggle.addEventListener('click', toggleMenu);
    
    // Close menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (menu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
    
    // Close menu when clicking outside of it
    document.addEventListener('click', (e) => {
        if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) {
            toggleMenu();
        }
    });
}

/* ==========================================================================
   Scroll Spy (Active Section Nav Highlighting)
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a:not(.nav-btn)');
    
    const handleScrollSpy = () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; // Offset for header height
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', handleScrollSpy);
    handleScrollSpy();
}

/* ==========================================================================
   Scroll Reveal Animations
   ========================================================================== */
function initScrollReveal() {
    // Add reveal class to components we want to animate on scroll
    const revealTargets = [
        '.section-header',
        '.journey-content-area',
        '.journey-image-area',
        '.process-text',
        '.process-image-area',
        '.commission-card',
        '.contact-info',
        '.contact-form-area',
        '.timeline-item'
    ];
    
    revealTargets.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.classList.add('reveal'));
    });
    
    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   Curated Works Gallery & Lightbox
   ========================================================================== */
function initGallery() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;

    const CONFIG = {
        slideCount: 4,
        spacingX: 45,
        pWidth: 14,
        pHeight: 18,
        camZ: 30,
        wallAngleY: -0.25,
        snapDelay: 200,
        lerpSpeed: 0.06
    };

    const totalGalleryWidth = CONFIG.slideCount * CONFIG.spacingX;

    // Three.js Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfbf9f8);
    scene.fog = new THREE.Fog(0xfbf9f8, 10, 110);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, CONFIG.camZ);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.45);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const galleryGroup = new THREE.Group();
    scene.add(galleryGroup);

    const textureLoader = new THREE.TextureLoader();
    const planeGeo = new THREE.PlaneGeometry(CONFIG.pWidth, CONFIG.pHeight);

    const images = [
        'assets/artwork-ink-1.png',
        'assets/artwork-charcoal-1.png',
        'assets/artwork-ink-2.png',
        'assets/artwork-line-1.png'
    ];

    const paintingGroups = [];

    for (let i = 0; i < CONFIG.slideCount; i++) {
        const group = new THREE.Group();
        group.position.set(i * CONFIG.spacingX, 0, 0);
        
        const mat = new THREE.MeshBasicMaterial({ 
            map: textureLoader.load(images[i]),
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(planeGeo, mat);
        
        const edges = new THREE.EdgesGeometry(planeGeo);
        const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x111111 }));

        const shadowGeo = new THREE.PlaneGeometry(CONFIG.pWidth, CONFIG.pHeight);
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.position.set(0.6, -0.6, -0.2);

        const lineZ = -0.5;
        const lineLen = CONFIG.spacingX;
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-lineLen/2, 12, lineZ), new THREE.Vector3(lineLen/2, 12, lineZ),
            new THREE.Vector3(-lineLen/2, -12, lineZ), new THREE.Vector3(lineLen/2, -12, lineZ)
        ]);
        const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xeaeaea }));

        group.add(shadow);
        group.add(mesh);
        group.add(outline);
        group.add(lines);
        
        galleryGroup.add(group);
        paintingGroups.push(group);
    }

    galleryGroup.rotation.y = CONFIG.wallAngleY;
    galleryGroup.position.x = 7.5;

    let currentScroll = 0;
    let targetScroll = 0;
    let mouse = { x: 0, y: 0 };
    let startX = 0;
    let touchStartY = 0;
    const maxScroll = (CONFIG.slideCount - 1) * CONFIG.spacingX;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // ScrollTrigger setup for pinning and horizontal progression
    const scrollDuration = window.innerHeight * 2.5;
    
    const galleryTrigger = ScrollTrigger.create({
        trigger: '.gallery-section',
        start: 'top top',
        end: () => `+=${scrollDuration}`,
        pin: true,
        scrub: true,
        snap: {
            snapTo: 1 / (CONFIG.slideCount - 1),
            duration: { min: 0.2, max: 0.5 },
            delay: 0.1,
            ease: 'power1.inOut'
        },
        onUpdate: (self) => {
            targetScroll = self.progress * maxScroll;
        }
    });

    function goToSlide(index) {
        if (!galleryTrigger) return;
        const progress = index / (CONFIG.slideCount - 1);
        const start = galleryTrigger.start;
        const end = galleryTrigger.end;
        const targetY = start + progress * (end - start);
        
        if (window.lenis) {
            window.lenis.scrollTo(targetY, {
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        } else {
            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        }
    }

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const prevBtn = document.getElementById('gallery-prev-btn');
    const nextBtn = document.getElementById('gallery-next-btn');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            const index = Math.round(targetScroll / CONFIG.spacingX);
            const targetIndex = Math.max(0, index - 1);
            goToSlide(targetIndex);
        });

        nextBtn.addEventListener('click', () => {
            const index = Math.round(targetScroll / CONFIG.spacingX);
            const targetIndex = Math.min(CONFIG.slideCount - 1, index + 1);
            goToSlide(targetIndex);
        });
    }

    // Touch Swipe Support for Mobile (translating horizontal swipe to vertical page scroll)
    let touchStartScrollY = 0;
    canvasContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartScrollY = window.scrollY;
    }, { passive: true });
    
    canvasContainer.addEventListener('touchmove', (e) => {
        const deltaX = startX - e.touches[0].clientX;
        const deltaY = touchStartY - e.touches[0].clientY;
        
        // If horizontal swipe is dominant, slide the gallery by scrolling the page
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (e.cancelable) e.preventDefault();
            
            const scrollScale = 1.2; // Sensitivity multiplier for horizontal-to-vertical translation
            if (galleryTrigger) {
                const start = galleryTrigger.start;
                const end = galleryTrigger.end;
                const targetY = Math.max(start, Math.min(end, touchStartScrollY + deltaX * scrollScale));
                
                if (window.lenis) {
                    window.lenis.scrollTo(targetY, { immediate: true });
                } else {
                    window.scrollTo(0, targetY);
                }
            }
        }
    }, { passive: false });

    function updateUI(scrollX) {
        const rawIndex = Math.round(scrollX / CONFIG.spacingX);            
        const safeIndex = Math.max(0, Math.min(CONFIG.slideCount - 1, rawIndex));     
        for (let i = 0; i < CONFIG.slideCount; i++) {
            const el = document.getElementById(`slide-${i}`);
            if (el) {
                if (i === safeIndex) el.classList.add('active');
                else el.classList.remove('active');
            }
        }
    }

    function updateNavButtons(scrollX) {
        const index = Math.round(scrollX / CONFIG.spacingX);
        if (prevBtn) {
            if (index === 0) {
                prevBtn.style.opacity = '0.25';
                prevBtn.style.pointerEvents = 'none';
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
            }
        }
        if (nextBtn) {
            if (index === CONFIG.slideCount - 1) {
                nextBtn.style.opacity = '0.25';
                nextBtn.style.pointerEvents = 'none';
            } else {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        
        currentScroll += (targetScroll - currentScroll) * CONFIG.lerpSpeed;
        const xMove = currentScroll * Math.cos(CONFIG.wallAngleY);
        const zMove = currentScroll * Math.sin(CONFIG.wallAngleY);
        
        camera.position.x = xMove;
        camera.position.z = (window.innerWidth <= 768 ? 38 : CONFIG.camZ) - zMove;
        
        // Place paintings statically in their original sequence (since we clamp scroll)
        paintingGroups.forEach((group, i) => {
            group.position.x = i * CONFIG.spacingX;
        });

        camera.rotation.x = mouse.y * 0.04; 
        camera.rotation.y = -mouse.x * 0.04;

        updateUI(currentScroll);
        updateNavButtons(currentScroll);
        renderer.render(scene, camera);
    }

    function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        const isMobile = width <= 768;
        galleryGroup.position.x = isMobile ? 0 : 7.5;
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    
    animate();

    const slideInquireBtns = document.querySelectorAll('.slide-inquire-btn');
    slideInquireBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const title = e.currentTarget.getAttribute('data-title');
            const medium = e.currentTarget.getAttribute('data-medium');
            const size = e.currentTarget.getAttribute('data-size');
            const year = e.currentTarget.getAttribute('data-year');
            
            const formInterest = document.getElementById('form-interest');
            const formMessage = document.getElementById('form-message');
            
            if (formInterest) formInterest.value = 'acquire';
            if (formMessage) {
                formMessage.value = `Hello, I am interested in acquiring the artwork titled "${title}" (${medium}, ${size}, ${year}). Please let me know its availability and shipping details.`;
            }
            
            temporarilyDisableNavHide();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}



/* ==========================================================================
   Acquire & Commission Inquiry Form Handler
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('form-submit-btn');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameVal = document.getElementById('form-name').value.trim();
        const emailVal = document.getElementById('form-email').value.trim();
        const interestVal = document.getElementById('form-interest').value;
        const messageVal = document.getElementById('form-message').value.trim();
        
        if (!nameVal || !emailVal || !interestVal || !messageVal) {
            feedback.className = 'form-feedback error';
            feedback.textContent = 'Please fill out all required fields.';
            return;
        }
        
        // Show premium submitting state
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'TRANSMITTING...';
        feedback.className = 'form-feedback';
        feedback.textContent = '';
        
        // Simulate networking delay
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Premium response
            feedback.className = 'form-feedback success';
            feedback.textContent = `Thank you, ${nameVal}. Your inquiry has been securely sent. A gallery advisor will contact you at ${emailVal} within 48 hours.`;
            
            // Clear form
            form.reset();
        }, 1500);
    });
}

/* ==========================================================================
   Complete Archive Gallery Modal & Filtering
   ========================================================================== */
function initCompleteGalleryModal() {
    const modal = document.getElementById('full-gallery-modal');
    const openBtn = document.getElementById('explore-all-btn');
    const closeBtn = document.getElementById('full-gallery-close');
    const filterBtns = document.querySelectorAll('.modal-filter-btn');
    const cards = document.querySelectorAll('.modal-artwork-card');
    
    if (!modal || !openBtn || !closeBtn) return;
    
    // Open Modal
    openBtn.addEventListener('click', () => {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    });
    
    // Close Modal
    const closeModal = () => {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    };
    
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('full-gallery-content')) {
            closeModal();
        }
    });

    // Grid Category Filtering
    filterBtns.forEach(button => {
        button.addEventListener('click', () => {
            filterBtns.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            
            const activeFilter = button.getAttribute('data-filter');
            
            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (activeFilter === 'all' || category === activeFilter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
    
    // Clicking cards inside complete modal triggers inquiry flow
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h4').textContent;
            const medium = card.querySelector('p').textContent;
            const metaText = card.querySelector('span').textContent;
            const parts = metaText.split('•').map(p => p.trim());
            const size = parts[0] || '';
            const year = parts[1] || '';
            
            // Close modal
            closeModal();
            
            // Populate contact form interest and message
            const formInterest = document.getElementById('form-interest');
            const formMessage = document.getElementById('form-message');
            
            if (formInterest) formInterest.value = 'acquire';
            if (formMessage) {
                formMessage.value = `Hello, I am interested in acquiring the artwork titled "${title}" (${medium}, ${size}, ${year}). Please let me know its availability and shipping details.`;
            }
            
            // Scroll to form
            temporarilyDisableNavHide();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ==========================================================================
   GSAP Story Scroll Process (Card Deck Animation)
   ========================================================================== */
function initProcessFlow() {
    const container = document.getElementById('process-flow-container');
    if (!container) return;

    // Check if user prefers reduced motion or is on mobile
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768;
    
    if (prefersReducedMotion || isMobile) {
        // Clear styles in case of resize transitions
        const items = container.querySelectorAll('.flow-art-container');
        items.forEach(el => {
            el.style.transform = '';
            el.style.transformOrigin = '';
        });
        return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const sections = gsap.utils.toArray('[data-flow-section]');
    const triggers = [];

    sections.forEach((section, i) => {
        // Layering hierarchy (card deck style)
        gsap.set(section, { zIndex: i + 1 });

        const inner = section.querySelector('.flow-art-container');
        if (!inner) return;

        // Slides after the first one rotate in from bottom-left corner on scroll
        if (i > 0) {
            gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' });
            const tween = gsap.to(inner, {
                rotation: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'top 20%',
                    scrub: true,
                }
            });
            if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        // Pin each slide except the last one so following slides overlay it
        if (i < sections.length - 1) {
            const pinTrigger = ScrollTrigger.create({
                trigger: section,
                start: 'bottom bottom',
                end: 'bottom top',
                pin: true,
                pinSpacing: false
            });
            triggers.push(pinTrigger);
        }
    });

    ScrollTrigger.refresh();
}

/* ==========================================================================
   Instagram 3D Container Scroll Animation
   ========================================================================== */
function initInstagramScroll() {
    const container = document.querySelector('.instagram-device-container');
    if (!container) return;

    // Check if user prefers reduced motion or is on mobile
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(container, 
        {
            rotateX: 16,
            scale: 0.9,
            z: -50
        },
        {
            rotateX: 0,
            scale: 1,
            z: 0,
            ease: 'power1.out',
            scrollTrigger: {
                trigger: '.instagram-section',
                start: 'top bottom', // Start when the top of the section enters the bottom of the viewport
                end: 'bottom center', // End when the bottom of the section reaches the center of the viewport
                scrub: 1 // smooth scrubbing (1 second delay)
            }
        }
    );
}
