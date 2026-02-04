/* ============================================ */
/* VALENTINE'S DAY WEBSITE - JAVASCRIPT */
/* All functionality for smooth romantic experience */
/* ============================================ */

// ============================================
// PAGE NAVIGATION
// ============================================

/**
 * Smoothly transition between pages
 * @param {number} pageNumber - The page to navigate to (1-4)
 */
function goToPage(pageNumber) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById('page' + pageNumber);
    targetPage.classList.add('active');

    // If going to page 2, start the slideshow
    if (pageNumber === 2) {
        showSlide(slideIndex);
    }
}

// ============================================
// SLIDESHOW FUNCTIONALITY
// ============================================

let slideIndex = 1;

/**
 * Display the current slide and update dots
 * @param {number} n - Slide number to show
 */
function showSlide(n) {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');

    // Wrap around if out of bounds
    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active-slide');
    }

    // Remove active class from all dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active-dot');
    }

    // Show current slide and activate dot
    slides[slideIndex - 1].classList.add('active-slide');
    dots[slideIndex - 1].classList.add('active-dot');
}

/**
 * Navigate to next/previous slide
 * @param {number} n - Direction to move (1 for next, -1 for previous)
 */
function changeSlide(n) {
    slideIndex += n;
    showSlide(slideIndex);
}

/**
 * Jump to specific slide
 * @param {number} n - Slide number to jump to
 */
function currentSlide(n) {
    slideIndex = n;
    showSlide(slideIndex);
}

// Auto-play slideshow (optional - uncomment to enable)
// setInterval(() => {
//     changeSlide(1);
// }, 4000);

// ============================================
// NO BUTTON - PLAYFUL AVOIDANCE
// ============================================

// Messages to cycle through when hovering over "No"
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

/**
 * Handle mouse hovering over the "No" button
 * Makes it shrink and move randomly
 */
function handleNoHover() {
    const noBtn = document.getElementById('noBtn');
    const noMessage = document.getElementById('noMessage');

    // Shrink the button each time
    noButtonScale = Math.max(0.3, noButtonScale - 0.1);

    // Random position within safe bounds
    const maxMoveX = 250;
    const maxMoveY = 150;
    const randomX = (Math.random() - 0.5) * maxMoveX;
    const randomY = (Math.random() - 0.5) * maxMoveY;

    // Apply transformation
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(${noButtonScale})`;

    // Show random funny message
    const randomMessage = noMessages[Math.floor(Math.random() * noMessages.length)];
    noMessage.textContent = randomMessage;

    // Clear message after 1.5 seconds
    setTimeout(() => {
        noMessage.textContent = '';
    }, 1500);
}

// ============================================
// YES BUTTON - CELEBRATION
// ============================================

/**
 * Handle "Yes" button click
 * Shows celebration screen with animations
 */
function handleYes() {
    const celebration = document.getElementById('celebration');
    celebration.classList.add('active');

    // Start all celebration animations
    createConfetti();
    startFireworks();
}

// ============================================
// CONFETTI ANIMATION
// ============================================

/**
 * Create confetti pieces falling from top
 */
function createConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#ff6b9d', '#ff8fb3', '#ffc4d6', '#ffebf0', '#ff1493', '#FFD700'];

    // Initial burst of confetti
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);

            // Remove after animation
            setTimeout(() => confetti.remove(), 3000);
        }, i * 20);
    }

    // Continuous confetti
    setInterval(() => {
        for (let i = 0; i < 15; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }
    }, 2000);
}

// ============================================
// FIREWORKS ANIMATION (Canvas)
// ============================================

/**
 * Create fireworks on canvas
 */
function startFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Firework particle class
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8
            };
            this.alpha = 1;
            this.decay = 0.015;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        update() {
            this.velocity.y += 0.1; // gravity
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
        }
    }

    let particles = [];

    /**
     * Create a firework explosion at given coordinates
     */
    function createFirework(x, y) {
        const colors = ['#ff6b9d', '#ff8fb3', '#ffc4d6', '#FFD700', '#ff1493', '#FFF'];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(x, y, color));
        }
    }

    /**
     * Animation loop for fireworks
     */
    function animate() {
        ctx.fillStyle = 'rgba(255, 158, 184, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        const y = Math.random() * canvas.height * 0.5;
        createFirework(x, y);
    }, 800);

    // Initial burst of fireworks
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.5;
            createFirework(x, y);
        }, i * 300);
    }

    // Start animation
    animate();
}

// ============================================
// INITIALIZE
// ============================================

// Show first page on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Valentine\'s Day website loaded! 💖');
    
    // Make sure page 1 is active
    document.getElementById('page1').classList.add('active');
});
