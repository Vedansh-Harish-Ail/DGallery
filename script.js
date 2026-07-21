/**
 * Darshana Art Gallery - Interactive Scripting
 * Implements smooth scroll, gallery filtering, lightbox modal, scroll reveals,
 * testimonial slider, and inquiry form submission.
 */

let isNavigating = false;
window.isNavigating = false;
let navHideTimeout = null;

function temporarilyDisableNavHide(duration = 3000) {
    isNavigating = true;
    window.isNavigating = true;
    const header = document.getElementById('main-header');
    if (header) header.classList.remove('nav-hidden');
    
    if (navHideTimeout) clearTimeout(navHideTimeout);
    navHideTimeout = setTimeout(() => {
        isNavigating = false;
        window.isNavigating = false;
    }, duration);
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

    window.lenis = lenis;

    // Integrate with anchor link clicks
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();

                // Close mobile nav if open
                const menu = document.getElementById('nav-menu');
                const toggle = document.getElementById('mobile-nav-toggle');
                if (menu && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    if (toggle) {
                        toggle.classList.remove('active');
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                    document.body.classList.remove('no-scroll');
                }

                temporarilyDisableNavHide(3000);

                if (window.isGalleryPinned !== undefined) {
                    window.isGalleryPinned = false;
                }

                const targetTop = Math.max(0, targetEl.getBoundingClientRect().top + window.scrollY - 90);

                if (window.lenis) {
                    window.lenis.start();
                    window.lenis.scrollTo(targetTop, {
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                }
                
                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ==========================================================================
   Header Scroll State
   ========================================================================== */
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    const menu = document.getElementById('nav-menu');
    if (!header) return;

    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
        if (isNavigating || (menu && menu.classList.contains('active'))) {
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
        
        if (currentScrollY > 100) {
            if (scrollDifference > 8) {
                // Scrolling down -> disappear
                header.classList.add('nav-hidden');
            } else if (scrollDifference < -8) {
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
    if (!toggle || !menu) return;

    const links = menu.querySelectorAll('a');
    
    const toggleMenu = () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    };
    
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
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
    
    if (!sections.length || !navLinks.length) return;

    const handleScrollSpy = () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 220 && rect.bottom >= 120) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };
    
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
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
            temporarilyDisableNavHide(2500);
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                if (window.lenis) {
                    window.lenis.start();
                    window.lenis.scrollTo(contactSection, { offset: -90, duration: 1.2 });
                } else {
                    const targetTop = contactSection.getBoundingClientRect().top + window.scrollY - 90;
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                }
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

    gsap.set(container, { transformOrigin: "bottom center" });

    gsap.fromTo(container, 
        {
            rotateX: 72, // tilted back heavily (sleeping/lying position)
            scale: 0.75,
            z: -150,
            y: 50,
            boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15), 0px 10px 20px rgba(0, 0, 0, 0.1)"
        },
        {
            rotateX: 0, // standing fully upright
            scale: 1,
            z: 0,
            y: 0,
            boxShadow: "0px 25px 50px -12px rgba(0, 0, 0, 0.25), 0px 50px 100px -20px rgba(0, 0, 0, 0.15)",
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.instagram-section',
                start: 'top bottom', // starts as soon as top of section enters viewport bottom
                end: 'bottom center', // ends when bottom of section reaches viewport center
                scrub: 1.5 // smooth interpolation
            }
        }
    );
}
