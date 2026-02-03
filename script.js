// =====================
// SCRIPT.JS — HARD FIX
// =====================

document.addEventListener('DOMContentLoaded', () => {

    const bgMusic = document.getElementById('bgMusic');

    const songs = {
        'with-you': '',
        'sure-thing': '',
        'let-me-love-you': ''
    };

    // =====================
    // STAGE CONTROL (FIX)
    // =====================
    function showStage(stageId) {
        document.querySelectorAll('.stage').forEach(stage => {
            stage.style.display = 'none';
            stage.classList.remove('active');
        });

        const activeStage = document.getElementById(stageId);
        activeStage.style.display = 'flex';
        activeStage.classList.add('active');
    }

    function playSong(key) {
        // FIXED: Allow progression even without MP3
        if (songs[key]) {
            bgMusic.src = songs[key];
            bgMusic.volume = 0.5;
            bgMusic.play().catch(() => {
                console.log('Music playback failed');
            });
        } else {
            console.log('No song file yet - continuing without music');
        }
    }

    // =====================
    // SONG CLICK (BULLETPROOF)
    // =====================
    document.querySelector('.song-options').addEventListener('click', (e) => {
        const card = e.target.closest('.song-card');
        if (!card) return;

        const songKey = card.dataset.song;
        console.log('Song selected:', songKey);

        playSong(songKey);
        showStage('songTransition');

        setTimeout(() => {
            showStage('envelopeIntro');
        }, 3200);
    });

    // =====================
    // ENVELOPE FLOW
    // =====================
    document.getElementById('nextToEnvelope').addEventListener('click', () => {
        console.log('Next to envelope clicked');
        showStage('envelopeStage');
    });

    const envelope = document.getElementById('envelope');
    const heartSeal = document.getElementById('heartSeal');

    heartSeal.addEventListener('click', () => {
        console.log('Heart seal clicked');
        envelope.classList.add('open');
        heartSeal.style.opacity = '0';
        document.querySelector('.envelope-instruction').style.opacity = '0';
    });

    document.getElementById('nextToDrumroll').addEventListener('click', () => {
        console.log('Next to drumroll clicked');
        showStage('drumrollStage');
        setTimeout(() => showStage('questionStage'), 3000);
    });

    // =====================
    // QUESTION
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
        "Try clicking yes 💖"
    ];

    let noScale = 1;

    noBtn.addEventListener('mouseenter', () => {
        noScale = Math.max(0.3, noScale - 0.12);
        const x = (Math.random() - 0.5) * 180;
        const y = (Math.random() - 0.5) * 120;
        noBtn.style.transform = `translate(${x}px, ${y}px) scale(${noScale})`;
        noMessage.textContent = noMessages[Math.floor(Math.random() * noMessages.length)];
        setTimeout(() => noMessage.textContent = '', 1500);
    });

    yesBtn.addEventListener('click', () => {
        console.log('YES clicked!');
        showStage('celebrationStage');
        startCelebration();
    });

    // =====================
    // CELEBRATION
    // =====================
    function startCelebration() {
        confetti();
        hearts();
        fireworks();
    }

    function confetti() {
        const container = document.getElementById('confettiContainer');
        const colors = ['#ff69b4', '#c2185b', '#ff1493', '#ffc0cb', '#ff6b9d'];
        for (let i = 0; i < 120; i++) {
            setTimeout(() => {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.style.left = Math.random() * 100 + '%';
                c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                container.appendChild(c);
                setTimeout(() => c.remove(), 3000);
            }, i * 25);
        }
    }

    function hearts() {
        const container = document.getElementById('heartsContainer');
        const heartEmojis = ['💖', '💕', '💗', '💓', '💝'];
        setInterval(() => {
            const h = document.createElement('div');
            h.className = 'floating-heart';
            h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            h.style.left = Math.random() * 100 + '%';
            container.appendChild(h);
            setTimeout(() => h.remove(), 4000);
        }, 300);
    }

    function fireworks() {
        const container = document.getElementById('fireworksContainer');
        const colors = ['#ff69b4', '#c2185b', '#ff1493', '#ffc0cb', '#FFD700', '#ff6b9d'];
        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5;
            for (let i = 0; i < 30; i++) {
                const angle = (Math.PI * 2 * i) / 30;
                const velocity = 50 + Math.random() * 50;
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity;
                
                const p = document.createElement('div');
                p.className = 'firework';
                p.style.left = x + 'px';
                p.style.top = y + 'px';
                p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                p.style.setProperty('--tx', tx + 'px');
                p.style.setProperty('--ty', ty + 'px');
                container.appendChild(p);
                setTimeout(() => p.remove(), 1000);
            }
        }, 1600);
    }

    // =====================
    // INIT
    // =====================
    showStage('songSelection');

    document.addEventListener('click', () => {
        bgMusic.volume = 0.5;
    }, { once: true });

});
