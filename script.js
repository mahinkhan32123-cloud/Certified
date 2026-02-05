/* ============================================ */
/* ROMANTIC VALENTINE'S WEBSITE - JAVASCRIPT */
/* Enhanced with artsy transitions and celebrations */
/* ============================================ */

// ============================================
// PAGE NAVIGATION
// ============================================

/**
 * Smoothly transition between pages
 * @param {number} pageNumber - The page to navigate to (1-4)
 */
function goToPage(pageNumber) {
    console.log(`Navigating to page ${pageNumber}`);
    
    // Remove active class from all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Add active class to target page
    const targetPage = document.getElementById('page' + pageNumber);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Special actions for specific pages
    if (pageNumber === 2) {
        // Initialize and start slideshow on page 2
        setTimeout(() => {
            initSlideshow();
        }, 200);
    }
}

// ============================================
// SLIDESHOW WITH ARTSY TRANSITIONS
// ============================================

let slideIndex = 1;
let slideshowInitialized = false;

/**
 * Display the current slide with Ken Burns effect
 * @param {number} n - Slide number to show
 */
function showSlide(n) {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');

    if (slides.length === 0) {
        console.log('No slides found');
        return;
    }

    // Wrap around if needed
    if (n > slides.length) { 
        slideIndex = 1; 
    }
    if (n < 1) { 
        slideIndex = slides.length; 
    }

    console.log(`Showing slide ${slideIndex} of ${slides.length}`);

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active-slide');
        slides[i].style.display = 'none';
    }

    // Deactivate all dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active-dot');
    }

    // Show current slide with animation
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].style.display = 'block';
        slides[slideIndex - 1].classList.add('active-slide');
    }
    
    // Activate current dot
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].classList.add('active-dot');
    }
}

/**
 * Navigate to next or previous slide
 * @param {number} n - Direction (1 for next, -1 for previous)
 */
function changeSlide(n) {
    slideIndex += n;
    showSlide(slideIndex);
}

/**
 * Jump to a specific slide
 * @param {number} n - Slide number
 */
function currentSlide(n) {
    slideIndex = n;
    showSlide(slideIndex);
}

/**
 * Initialize slideshow when page 2 becomes active
 */
function initSlideshow() {
    if (!slideshowInitialized) {
        console.log('Initializing slideshow');
        slideshowInitialized = true;
        slideIndex = 1;
        showSlide(slideIndex);
    }
}

// Optional: Auto-play slideshow (uncomment to enable)
// let autoPlayInterval;
// function startAutoPlay() {
//     if (autoPlayInterval) clearInterval(autoPlayInterval);
//     autoPlayInterval = setInterval(() => {
//         changeSlide(1);
//     }, 5000);
// }
// function stopAutoPlay() {
//     if (autoPlayInterval) clearInterval(autoPlayInterval);
// }

// ============================================
// NO BUTTON - PLAYFUL DODGING
// ============================================

const noMessages = [
    "NO?!",
    "bruh",
    "so return the gift?",
    "hmmm wrong",
    "you can't be thatttt wicked",
    "say you swear",
    "oh hell nah",
    "LOL YOU THOUGHT THIS WAS A CHOICE...",
    "can't have SHIT these days",
    "yeah nahhh"
];

let noButtonScale = 1;
let noHoverCount = 0;

/**
 * Handle hovering over the No button
 * Makes it dodge and shrink playfully
 */
function handleNoHover() {
    const noBtn = document.getElementById('noBtn');
    const noMessage = document.getElementById('noMessage');
    
    if (!noBtn || !noMessage) return;

    noHoverCount++;

    // Shrink progressively (but not too small)
    noButtonScale = Math.max(0.35, noButtonScale - 0.12);

    // Calculate random movement (larger movements as user tries more)
    const moveRange = 200 + (noHoverCount * 20);
    const randomX = (Math.random() - 0.5) * moveRange;
    const randomY = (Math.random() - 0.5) * (moveRange * 0.7);

    // Apply transformation with smooth easing
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(${noButtonScale}) rotate(${Math.random() * 20 - 10}deg)`;
    noBtn.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    // Show random funny message
    const randomMsg = noMessages[Math.floor(Math.random() * noMessages.length)];
    noMessage.textContent = randomMsg;

    // Clear message after delay
    setTimeout(() => {
        noMessage.textContent = '';
    }, 1800);
}

// ============================================
// YES BUTTON - CELEBRATION!
// ============================================

/**
 * Handle Yes button click
 * Triggers full celebration sequence
 */
function handleYes() {
    console.log('She said YES! 💖');
    
    const celebration = document.getElementById('celebration');
    if (celebration) {
        celebration.classList.add('active');
    }

    // Start all celebration effects
    setTimeout(() => {
        createConfetti();
        startFireworks();
        createSparkles();
    }, 300);
}

// ============================================
// CONFETTI ANIMATION
// ============================================

/**
 * Create confetti pieces falling from top
 */
function createConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;

    const colors = [
        '#ff6b9d', '#ff8fb3', '#ffc4d6', 
        '#ffebf0', '#ff1493', '#FFD700', 
        '#ff69b4', '#ffc0cb'
    ];

    // Initial burst
    for (let i = 0; i < 180; i++) {
        setTimeout(() => {
            createConfettiPiece(container, colors);
        }, i * 15);
    }

    // Continuous confetti
    setInterval(() => {
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                createConfettiPiece(container, colors);
            }, i * 50);
        }
    }, 1500);
}

/**
 * Helper to create individual confetti piece
 */
function createConfettiPiece(container, colors) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
    
    // Random shapes
    if (Math.random() > 0.5) {
        confetti.style.borderRadius = '50%';
    }
    
    container.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 5000);
}

// ============================================
// SPARKLES ANIMATION
// ============================================

/**
 * Create twinkling sparkles
 */
function createSparkles() {
    const container = document.getElementById('sparklesContainer');
    if (!container) return;

    setInterval(() => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = Math.random() * 100 + '%';
                sparkle.style.top = Math.random() * 100 + '%';
                sparkle.style.animationDelay = Math.random() * 0.5 + 's';
                
                container.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 2000);
            }, i * 200);
        }
    }, 600);
}

// ============================================
// FIREWORKS (CANVAS)
// ============================================

/**
 * Create fireworks display on canvas
 */
function startFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Particle class for fireworks
    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10
            };
            this.alpha = 1;
            this.decay = 0.015;
            this.size = Math.random() * 3 + 2;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            
            ctx.restore();
        }

        update() {
            this.velocity.y += 0.12; // gravity
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
        }
    }

    let particles = [];

    /**
     * Create a firework explosion
     */
    function createFirework(x, y) {
        const colors = [
            '#ff6b9d', '#ff8fb3', '#ffc4d6', 
            '#FFD700', '#ff1493', '#FFF', 
            '#ff69b4', '#ffc0cb'
        ];
        const particleCount = 60;

        for (let i = 0; i < particleCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new FireworkParticle(x, y, color));
        }
    }

    /**
     * Animation loop
     */
    function animate() {
        // Subtle fade instead of full clear
        ctx.fillStyle = 'rgba(255, 158, 184, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach((particle, index) => {
            if (particle.alpha <= 0) {
                particles.splice(index, 1);
            } else {
                particle.update();
                particle.draw();
            }
        });

        requestAnimationFrame(animate);
    }

    // Launch fireworks at intervals
    setInterval(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.6;
        createFirework(x, y);
    }, 900);

    // Initial burst
    for (let i = 0; i < 7; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.5;
            createFirework(x, y);
        }, i * 250);
    }

    // Start animation
    animate();
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('💖 Valentine\'s website loaded and ready!');
    
    // Ensure page 1 starts active
    const page1 = document.getElementById('page1');
    if (page1) {
        page1.classList.add('active');
    }

    // Pre-initialize slideshow structure
    const slides = document.getElementsByClassName('slide');
    if (slides.length > 0) {
        console.log(`Found ${slides.length} slides`);
        // Hide all slides initially
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }
    }
});
