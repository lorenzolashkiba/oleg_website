/* ============================================
   IGOR RISTRUTTURAZIONI - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initPreloader();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initActiveNavLinks();
    initCounterAnimation();
    initReviewsSlider();
    initContactForm();
    initBackToTop();
    initAOS();
});

/* ============================================
   Preloader
   ============================================ */
function initPreloader() {
    const preloader = document.getElementById('preloader');

    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('hidden');
            // Remove preloader from DOM after animation
            setTimeout(function() {
                preloader.style.display = 'none';
            }, 500);
        }, 500);
    });
}

/* ============================================
   Navbar Scroll Effect
   ============================================ */
function initNavbar() {
    const navbar = document.querySelector('.navbar');

    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on load
}

/* ============================================
   Mobile Menu
   ============================================ */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });
}

/* ============================================
   Smooth Scroll
   ============================================ */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   Active Navigation Links
   ============================================ */
function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
}

/* ============================================
   Counter Animation
   ============================================ */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    let animated = false;

    function animateCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                    // Add + or % suffix if needed
                    if (target === 500) counter.textContent = target + '+';
                    if (target === 100) counter.textContent = target + '%';
                    if (target === 15) counter.textContent = target + '+';
                }
            };

            updateCounter();
        });
    }

    function checkCountersInView() {
        if (animated) return;

        const heroStats = document.querySelector('.hero-stats');
        if (!heroStats) return;

        const rect = heroStats.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight * 0.8) {
            animated = true;
            animateCounters();
        }
    }

    window.addEventListener('scroll', checkCountersInView);
    checkCountersInView();
}

/* ============================================
   Reviews Slider
   ============================================ */
function initReviewsSlider() {
    const track = document.querySelector('.reviews-track');
    const cards = document.querySelectorAll('.review-card');
    const prevBtn = document.querySelector('.review-btn.prev');
    const nextBtn = document.querySelector('.review-btn.next');

    if (!track || cards.length === 0) return;

    let currentIndex = 0;
    let cardsToShow = getCardsToShow();
    const totalCards = cards.length;

    function getCardsToShow() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function updateSlider() {
        const cardWidth = cards[0].offsetWidth + 30; // card width + gap
        const offset = -currentIndex * cardWidth;
        track.style.transform = `translateX(${offset}px)`;
    }

    function nextSlide() {
        const maxIndex = totalCards - cardsToShow;
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        updateSlider();
    }

    function prevSlide() {
        const maxIndex = totalCards - cardsToShow;
        currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
        updateSlider();
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto-play
    let autoPlay = setInterval(nextSlide, 5000);

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.addEventListener('mouseleave', () => {
        autoPlay = setInterval(nextSlide, 5000);
    });

    // Update on resize
    window.addEventListener('resize', () => {
        cardsToShow = getCardsToShow();
        currentIndex = 0;
        updateSlider();
    });

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
}

/* ============================================
   Contact Form
   ============================================ */
function initContactForm() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Basic validation
        const errors = validateForm(data);

        if (errors.length > 0) {
            showFormMessage(errors.join('<br>'), 'error');
            return;
        }

        // Simulate form submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invio in corso...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            showFormMessage('Grazie per averci contattato! Ti risponderemo entro 24 ore.', 'success');
            form.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });

    function validateForm(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 2) {
            errors.push('Inserisci un nome valido');
        }

        if (!data.email || !isValidEmail(data.email)) {
            errors.push('Inserisci un\'email valida');
        }

        if (!data.phone || data.phone.trim().length < 8) {
            errors.push('Inserisci un numero di telefono valido');
        }

        if (!data.message || data.message.trim().length < 10) {
            errors.push('Il messaggio deve contenere almeno 10 caratteri');
        }

        if (!data.privacy) {
            errors.push('Devi accettare la privacy policy');
        }

        return errors;
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showFormMessage(message, type) {
        // Remove existing message
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) existingMessage.remove();

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.innerHTML = message;
        messageEl.style.cssText = `
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 500;
            ${type === 'success'
                ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
                : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;

        // Insert at the top of the form
        form.insertBefore(messageEl, form.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'opacity 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 5000);
    }
}

/* ============================================
   Back to Top Button
   ============================================ */
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');

    if (!backToTop) return;

    function toggleButton() {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', toggleButton);

    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ============================================
   AOS (Animate on Scroll) Initialization
   ============================================ */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            delay: 0,
            mirror: false
        });
    }
}

/* ============================================
   Utility Functions
   ============================================ */

// Debounce function for performance
function debounce(func, wait = 100) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Throttle function for performance
function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ============================================
   Image Lazy Loading Enhancement
   ============================================ */
if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.src = img.dataset.src || img.src;
    });
} else {
    // Fallback for older browsers
    const lazyImages = document.querySelectorAll('img[data-src]');

    const lazyLoad = function() {
        lazyImages.forEach(img => {
            if (img.getBoundingClientRect().top < window.innerHeight + 100) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    };

    window.addEventListener('scroll', throttle(lazyLoad, 200));
    window.addEventListener('resize', throttle(lazyLoad, 200));
    lazyLoad();
}

/* ============================================
   Parallax Effect for Hero (Optional)
   ============================================ */
function initParallax() {
    const hero = document.querySelector('.hero');

    if (!hero || window.innerWidth <= 768) return;

    window.addEventListener('scroll', throttle(function() {
        const scrolled = window.scrollY;
        hero.style.backgroundPositionY = -(scrolled * 0.3) + 'px';
    }, 16));
}

// Initialize parallax after page load
window.addEventListener('load', initParallax);
