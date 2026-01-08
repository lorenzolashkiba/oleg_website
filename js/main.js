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
    initPortfolioCarousel();
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
   Portfolio Carousel - Infinite Loop
   ============================================ */
function initPortfolioCarousel() {
    const track = document.querySelector('.portfolio-track');
    const originalSlides = document.querySelectorAll('.portfolio-slide');
    const prevBtn = document.querySelector('.portfolio-btn.prev');
    const nextBtn = document.querySelector('.portfolio-btn.next');
    const dotsContainer = document.querySelector('.portfolio-dots');

    if (!track || originalSlides.length === 0) return;

    const totalOriginalSlides = originalSlides.length;
    let slidesToShow = getSlidesToShow();
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = totalOriginalSlides; // Start at first real slide (after clones)
    let isTransitioning = false;

    // Clone slides for infinite loop
    function setupInfiniteLoop() {
        // Remove existing clones
        track.querySelectorAll('.portfolio-slide.clone').forEach(clone => clone.remove());

        // Clone all slides and append to both ends
        originalSlides.forEach(slide => {
            const cloneBefore = slide.cloneNode(true);
            const cloneAfter = slide.cloneNode(true);
            cloneBefore.classList.add('clone');
            cloneAfter.classList.add('clone');
            track.insertBefore(cloneBefore, track.firstChild);
            track.appendChild(cloneAfter);
        });
    }

    function getSlidesToShow() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function getSlideWidth() {
        const slide = track.querySelector('.portfolio-slide');
        if (!slide) return 0;
        const gap = window.innerWidth <= 480 ? 15 : 25;
        return slide.offsetWidth + gap;
    }

    function updateCarousel(animate = true) {
        const slideWidth = getSlideWidth();
        const offset = -currentIndex * slideWidth;

        if (!animate) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        track.style.transform = `translateX(${offset}px)`;
        updateDots();
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.portfolio-dot');
        // Calculate real index (accounting for clones at the beginning)
        let realIndex = (currentIndex - totalOriginalSlides) % totalOriginalSlides;
        if (realIndex < 0) realIndex += totalOriginalSlides;

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === realIndex);
        });
    }

    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalOriginalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('portfolio-dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Vai all'immagine ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        updateCarousel(true);
    }

    function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        updateCarousel(true);
    }

    function goToSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex = totalOriginalSlides + index;
        updateCarousel(true);
    }

    // Handle infinite loop reset
    track.addEventListener('transitionend', () => {
        isTransitioning = false;

        // If we've scrolled past the clones, jump back
        if (currentIndex >= totalOriginalSlides * 2) {
            currentIndex = totalOriginalSlides;
            updateCarousel(false);
        } else if (currentIndex < totalOriginalSlides) {
            currentIndex = totalOriginalSlides * 2 - 1;
            updateCarousel(false);
        }
    });

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto-play
    let autoPlay = setInterval(nextSlide, 4000);

    // Pause on hover/touch
    track.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.addEventListener('mouseleave', () => {
        autoPlay = setInterval(nextSlide, 4000);
    });

    track.addEventListener('touchstart', () => clearInterval(autoPlay), { passive: true });
    track.addEventListener('touchend', () => {
        autoPlay = setInterval(nextSlide, 4000);
    });

    // Touch/drag support
    track.addEventListener('touchstart', touchStart, { passive: true });
    track.addEventListener('touchmove', touchMove, { passive: true });
    track.addEventListener('touchend', touchEnd);

    track.addEventListener('mousedown', touchStart);
    track.addEventListener('mousemove', touchMove);
    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', touchEnd);

    function touchStart(e) {
        if (isTransitioning) return;
        isDragging = true;
        startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        track.style.transition = 'none';
    }

    function touchMove(e) {
        if (!isDragging) return;
        const currentPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diff = currentPos - startPos;
        currentTranslate = prevTranslate + diff;
    }

    function touchEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

        const movedBy = currentTranslate - prevTranslate;
        if (movedBy < -50) {
            nextSlide();
        } else if (movedBy > 50) {
            prevSlide();
        }

        prevTranslate = 0;
        currentTranslate = 0;
    }

    // Resize handler
    window.addEventListener('resize', () => {
        const newSlidesToShow = getSlidesToShow();
        if (newSlidesToShow !== slidesToShow) {
            slidesToShow = newSlidesToShow;
            currentIndex = totalOriginalSlides;
            updateCarousel(false);
        }
    });

    // Initialize
    setupInfiniteLoop();
    createDots();

    // Initial position (without animation)
    setTimeout(() => {
        updateCarousel(false);
    }, 100);
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
   Contact Form - Netlify Forms
   ============================================ */
function initContactForm() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form elements
        const nameInput = form.querySelector('#name');
        const emailInput = form.querySelector('#email');
        const phoneInput = form.querySelector('#phone');
        const messageInput = form.querySelector('#message');
        const privacyCheckbox = form.querySelector('#privacy');

        // Basic validation
        const errors = [];

        if (!nameInput.value || nameInput.value.trim().length < 2) {
            errors.push('Inserisci un nome valido');
        }

        if (!emailInput.value || !isValidEmail(emailInput.value)) {
            errors.push('Inserisci un\'email valida');
        }

        if (!phoneInput.value || phoneInput.value.trim().length < 8) {
            errors.push('Inserisci un numero di telefono valido');
        }

        if (!messageInput.value || messageInput.value.trim().length < 10) {
            errors.push('Il messaggio deve contenere almeno 10 caratteri');
        }

        if (!privacyCheckbox.checked) {
            errors.push('Devi accettare la privacy policy');
        }

        if (errors.length > 0) {
            showFormMessage(errors.join('<br>'), 'error');
            return;
        }

        // Get form data
        const formData = new FormData(form);

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invio in corso...';
        submitBtn.disabled = true;

        // Submit to Netlify Forms
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
        .then(response => {
            if (response.ok) {
                showFormMessage('Grazie per averci contattato! Ti risponderemo entro 24 ore.', 'success');
                form.reset();
            } else {
                throw new Error('Errore durante l\'invio');
            }
        })
        .catch(error => {
            showFormMessage('Si è verificato un errore. Riprova o contattaci telefonicamente.', 'error');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });

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

/* ============================================
   Phone Number Bot Protection
   ============================================ */
function initPhoneProtection() {
    // Deobfuscate phone number only for real users (not bots)
    const phoneLinks = document.querySelectorAll('.phone-link');
    const whatsappLinks = document.querySelectorAll('.whatsapp-link');

    phoneLinks.forEach(link => {
        const p1 = link.dataset.p1;
        const p2 = link.dataset.p2;
        const p3 = link.dataset.p3;

        if (p1 && p2 && p3) {
            const phoneNumber = '+39' + p1 + p2 + p3;
            const formattedPhone = '+39 ' + p1 + ' ' + p2 + ' ' + p3;

            link.href = 'tel:' + phoneNumber;

            // Se ha la classe phone-display, mostra anche il numero
            if (link.classList.contains('phone-display')) {
                link.textContent = formattedPhone;
            }
        }
    });

    whatsappLinks.forEach(link => {
        const p1 = link.dataset.p1;
        const p2 = link.dataset.p2;
        const p3 = link.dataset.p3;

        if (p1 && p2 && p3) {
            const phoneNumber = '39' + p1 + p2 + p3;
            link.href = 'https://wa.me/' + phoneNumber + '?text=Ciao%2C%20vorrei%20informazioni%20sui%20vostri%20servizi%20di%20ristrutturazione.';
        }
    });
}

// Initialize phone protection after DOM is loaded
document.addEventListener('DOMContentLoaded', initPhoneProtection);
