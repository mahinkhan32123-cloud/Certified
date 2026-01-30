// ========== State Management ==========
let currentStage = 'songSelection';
const bgMusic = document.getElementById('bgMusic');

// Song URLs (placeholder - you'll add real URLs)
const songs = {
    'with-you': '', // Add your song URL here
    'sure-thing': '', // Add your song URL here
    'let-me-love-you': '' // Add your song URL here
};

// ========== Helper Functions ==========
function showStage(stageName) {
    document.querySelectorAll('.stage').forEach(stage => {
        stage.classList.remove('active');
    });
    document.getElementById(stageName).classList.add('active');
    currentStage = stageName;
}

function playSong(songKey) {
    if (songs[songKey]) {
        bgMusic.src = songs[songKey];
        bgMusic.play().catch(err => {
            console.log('Audio play failed:', err);
        });
    }
}

// ========== STAGE 1: Song Selection ==========
document.querySelectorAll('.song-card').forEach(card => {
    card.addEventListener('click', function() {
        const songKey = this.getAttribute('data-song');
        
        // Start playing the selected song
        playSong(songKey);
        
        // Show vinyl animation
        showStage('songTransition');
        
        // After animation, show next button
        setTimeout(() => {
            showStage('envelopeIntro');
        }, 3000);
    });
});

// ========== STAGE 2: Next to Envelope ==========
document.getElementById('nextToEnvelope').addEventListener('click', function() {
    showStage('envelopeStage');
});

// ========== STAGE 3: Envelope Opening ==========
const envelope = document.getElementById('envelope');
const heartSeal = document.getElementById('heartSeal');

heartSeal.addEventListener('click', function() {
    envelope.classList.add('open');
    heartSeal.style.display = 'none';
    document.querySelector('.envelope-instruction').style.opacity = '0';
});

// Next to Drumroll
document.getElementById('nextToDrumroll').addEventListener('click', function() {
    showStage('drumrollStage');
    
    // Auto-advance after drumroll
    setTimeout(() => {
        showStage('questionStage');
    }, 3000);
});

// ========== STAGE 5: The Question ==========
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const noMessage = document.getElementById('noMessage');

const noMessages = [
    "Ouch 😭",
    "You thought...",
    "LOL",
    "Wrong choice 😜",
    "Try again",
    "Really? 🥺",
    "Think again!",
    "Nope, not happening 😏"
];

let noClickCount = 0;
let noBtnScale = 1;

noBtn.addEventListener('mouseenter', function() {
    // Make button smaller and dodge
    noClickCount++;
    noBtnScale = Math.max(0.3, noBtnScale - 0.15);
    
    // Random position within safe bounds
    const maxMove = 150;
    const randomX = (Math.random() - 0.5) * maxMove;
    const randomY = (Math.random() - 0.5) * maxMove;
    
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(${noBtnScale})`;
    
    // Show random message
    const randomMessage = noMessages[Math.floor(Math.random() * noMessages.length)];
    noMessage.textContent = randomMessage;
    
    setTimeout(() => {
        noMessage.textContent = '';
    }, 2000);
});

noBtn.addEventListener('click', function(e) {
    e.preventDefault();
    // Extra dodge on click attempt
    const randomX = (Math.random() - 0.5) * 200;
    const randomY = (Math.random() - 0.5) * 200;
    noBtnScale = Math.max(0.2, noBtnScale - 0.1);
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(${noBtnScale})`;
});

// Yes Button - Celebration!
yesBtn.addEventListener('click', function() {
    showStage('celebrationStage');
    startCelebration();
});

// ========== STAGE 6: Celebration Animations ==========
function startCelebration() {
    createConfetti();
    createHearts();
    createFireworks();
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#ff69b4', '#c2185b', '#ff1493', '#ffc0cb', '#ff6b9d'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
    
    // Loop confetti
    setInterval(() => {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                container.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 50);
        }
    }, 2000);
}

function createHearts() {
    const container = document.getElementById('heartsContainer');
    const heartEmojis = ['💖', '💕', '💗', '💓', '💝'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.bottom = '-50px';
            heart.style.animationDelay = Math.random() * 0.5 + 's';
            heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
            container.appendChild(heart);
            
            setTimeout(() => heart.remove(), 4000);
        }, i * 100);
    }
    
    // Loop hearts
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.bottom = '-50px';
        heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
        container.appendChild(heart);
        
        setTimeout(() => heart.remove(), 4000);
    }, 500);
}

function createFireworks() {
    const container = document.getElementById('fireworksContainer');
    const colors = ['#ff69b4', '#c2185b', '#ff1493', '#ffc0cb', '#FFD700', '#ff6b9d'];
    
    function launchFirework() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.5);
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework';
            
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }
    
    // Launch multiple fireworks
    for (let i = 0; i < 5; i++) {
        setTimeout(launchFirework, i * 400);
    }
    
    // Continue launching
    setInterval(() => {
        launchFirework();
    }, 1500);
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', function() {
    showStage('songSelection');
    
    // Allow audio autoplay after user interaction
    document.addEventListener('click', function initAudio() {
        bgMusic.volume = 0.5;
        document.removeEventListener('click', initAudio);
    }, { once: true });
});
