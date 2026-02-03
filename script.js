// =====================
// SCRIPT.JS — VERSION 2.0
// Working with test MP3
// =====================

document.addEventListener('DOMContentLoaded', () => {

    const bgMusic = document.getElementById('bgMusic');

    // All songs use test MP3 for now
    const songs = {
        'with-you': 'https://www.computerhope.com/jargon/m/example.mp3',
        'sure-thing': 'https://www.computerhope.com/jargon/m/example.mp3',
        'let-me-love-you': 'https://www.computerhope.com/jargon/m/example.mp3'
    };

    // =====================
    // STAGE CONTROL
    // =====================
    function showStage(stageId) {
        console.log('Showing stage:', stageId);
        
        // Hide all stages
        document.querySelectorAll('.stage').forEach(stage => {
            stage.style.display = 'none';
            stage.classList.remove('active');
        });

        // Show target stage
        const activeStage = document.getElementById(stageId);
        if (activeStage) {
            activeStage.style.display = 'flex';
            activeStage.classList.add('active');
        } else {
            console.error('Stage not found:', stageId);
        }
    }

    function playSong(key) {
        console.log('Playing song:', key);
        
        if (songs[key]) {
            bgMusic.src = songs[key];
            bgMusic.volume = 0.5;
            bgMusic.play()
                .then(() => console.log('Music started successfully'))
                .catch(err => console.log('Music play failed:', err));
        } else {
            console.log('No song URL for:', key);
        }
    }

    // =====================
    // STAGE 1: SONG SELECTION
    // =====================
    const songOptions = document.querySelector('.song-options');
    if (songOptions) {
        songOptions.addEventListener('click', (e) => {
            const card = e.target.closest('.song-card');
            if (!card) return;

            const songKey = card.dataset.song;
            console.log('Song card clicked:', songKey);

            // Play the song
            playSong(songKey);
            
            // Show vinyl animation
            showStage('songTransition');

            // Auto-advance to envelope intro after 3.2 seconds
            setTimeout(() => {
                showStage('envelopeIntro');
            }, 3200);
        });
    }

    // =====================
    // STAGE 2: ENVELOPE INTRO
    // =====================
    const nextToEnvelopeBtn = document.getElementById('nextToEnvelope');
    if (nextToEnvelopeBtn) {
        nextToEnvelopeBtn.addEventListener('click', () => {
            console.log('Next to envelope clicked');
            showStage('envelopeStage');
        });
    }

    // =====================
    // STAGE 3: ENVELOPE & LETTER
    // =====================
    const envelope = document.getElementById('envelope');
    const heartSeal = document.getElementById('heartSeal');

    if (heartSeal) {
        heartSeal.addEventListener('click', () => {
            console.log('Heart seal clicked - opening envelope');
            
            if (envelope) {
                envelope.classList.add('open');
            }
            
            heartSeal.style.opacity = '0';
            heartSeal.style.pointerEvents = 'none';
            
            const instruction = document.querySelector('.envelope-instruction');
            if (instruction) {
                instruction.style.opacity = '0';
            }
        });
    }

    const nextToDrumrollBtn = document.getElementById('nextToDrumroll');
    if (nextToDrumrollBtn) {
        nextToDrumrollBtn.addEventListener('click', () => {
            console.log('Next to drumroll clicked');
            showStage('drumrollStage');
            
            // Auto-advance to question after 3 seconds
            setTimeout(() => {
                console.log('Auto-advancing to question');
                showStage('questionStage');
            }, 3000);
        });
    }

    // =====================
    // STAGE 5: THE QUESTION
    // =====================
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const noMessage = document.getElementById('noMessage');

    const noMessages = [
        "Nice try 😏",
        "Nopeeee",
        "Think again 🥺",
        "Wrong answer",
        "LOL no",
        "Try clicking yes 💖",
        "Really? 😅",
        "Wrong button!"
    ];

    let noScale = 1;

    if (noBtn) {
        noBtn.addEventListener('mouseenter', () => {
            noScale = Math.max(0.3, noScale - 0.12);
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 150;
            noBtn.style.transform = `translate(${x}px, ${y}px) scale(${noScale})`;
            
            if (noMessage) {
                const randomMsg = noMessages[Math.floor(Math.random() * noMessages.length)];
                noMessage.textContent = randomMsg;
                setTimeout(() => noMessage.textContent = '', 1500);
            }
        });
    }

    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            console.log('YES clicked! Starting celebration!');
            showStage('celebrationStage');
            startCelebration();
        });
    }

    // =====================
    // STAGE 6: CELEBRATION
    // =====================
    function startCelebration() {
        console.log('Starting celebration animations');
        createConfetti();
        createHearts();
        createFireworks();
    }

    function createConfetti() {
        const container = document.getElementById('confettiContainer');
        if (!container) return;

        const colors = ['#ff69b4', '#c2185b', '#ff1493', '#ffc0cb', '#ff6b9d'];
        
        // Initial burst
        for (let i = 0; i < 120; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                container.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 25);
        }

        // Continuous confetti
        setInterval(() => {
            for (let i = 0; i < 10; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                container.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }
        }, 2000);
    }

    function createHearts() {
        const container = document.getElementById('heartsContainer');
        if (!container) return;

        const heartEmojis = ['💖', '💕', '💗', '💓', '💝'];
        
        // Continuous hearts
        setInterval(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            heart.style.left = Math.random() * 100 + '%';
            container.appendChild(heart);
            
            setTimeout(() => heart.remove(), 4000);
        }, 300);
    }

    function createFireworks() {
        const container = document.getElementById('fireworksContainer');
        if (!container) return;

        const colors = ['#ff69b4', '#c2185b', '#ff1493', '#ffc0cb', '#FFD700', '#ff6b9d'];
        
        function launchFirework() {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight * 0.5);
            
            for (let i = 0; i < 30; i++) {
                const angle = (Math.PI * 2 * i) / 30;
                const velocity = 50 + Math.random() * 50;
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity;
                
                const particle = document.createElement('div');
                particle.className = 'firework';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                particle.style.setProperty('--tx', tx + 'px');
                particle.style.setProperty('--ty', ty + 'px');
                container.appendChild(particle);
                
                setTimeout(() => particle.remove(), 1000);
            }
        }

        // Initial fireworks
        for (let i = 0; i < 5; i++) {
            setTimeout(launchFirework, i * 400);
        }

        // Continuous fireworks
        setInterval(launchFirework, 1600);
    }

    // =====================
    // INITIALIZE
    // =====================
    console.log('Valentine app initialized - v2.0');
    showStage('songSelection');

    // Enable audio on first interaction
    document.addEventListener('click', () => {
        if (bgMusic) {
            bgMusic.volume = 0.5;
        }
    }, { once: true });

});
