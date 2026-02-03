// =====================
// SCRIPT.JS — FIXED
// =====================

document.addEventListener('DOMContentLoaded', () => {

    // =====================
    // STATE
    // =====================
    let currentStage = 'songSelection';
    const bgMusic = document.getElementById('bgMusic');

    const songs = {
        'with-you': '',       // add mp3 URL
        'sure-thing': '',
        'let-me-love-you': ''
    };

    // =====================
    // HELPERS
    // =====================
    function showStage(stageId) {
        document.querySelectorAll('.stage').forEach(stage => {
            stage.classList.remove('active');
        });

        const stage = document.getElementById(stageId);
        stage.classList.add('active');
        currentStage = stageId;
    }

    function playSong(key) {
        if (!songs[key]) return;

        bgMusic.src = songs[key];
        bgMusic.volume = 0.5;

        bgMusic.play().catch(() => {
            // autoplay safety — transition still works even if audio is blocked
        });
    }

    // =====================
    // STAGE 1 — SONG SELECT (FIXED)
    // =====================
    document.querySelectorAll('.song-card').forEach(card => {
        card.addEventListener('click', () => {

            const songKey = card.dataset.song;

            // 1. Play music
            playSong(songKey);

            // 2. Force vinyl transition
            showStage('songTransition');

            // 3. Move to envelope after animation
            setTimeout(() => {
                showStage('envelopeIntro');
            }, 3200);
        });
    });

    // =====================
    // STAGE 2 — TO ENVELOPE
    // =====================
    document.getElementById('nextToEnvelope').addEventListener('click', () => {
        showStage('envelopeStage');
    });

    // =====================
    // STAGE 3 — ENVELOPE OPEN
    // =====================
    const envelope = document.getElementById('envelope');
    const heartSeal = document.getElementById('heartSeal');

    heartSeal.addEventListener('click', () => {
        envelope.classList.add('open');
        heartSeal.style.opacity = '0';
        heartSeal.style.transform = 'scale(0.5)';
        document.querySelector('.envelope-instruction').style.opacity = '0';
    });

    // =====================
    // LETTER → DRUMROLL
    // =====================
    document.getElementById('nextToDrumroll').addEventListener('click', () => {
        showStage('drumrollStage');

        setTimeout(() => {
            showStage('questionStage');
        }, 3000);
    });

    // =====================
    // QUESTION LOGIC
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

        noMessage.textContent =
            noMessages[Math.floor(Math.random() * noMessages.length)];

        setTimeout(() => (noMessage.textContent = ''), 1500);
    });

    // =====================
    // YES — CELEBRATION
    // =====================
    yesBtn.addEventListener('click', () => {
        showStage('celebrationStage');
        startCelebration();
    });

    // =====================
    // CELEBRATION FX
    // =====================
    function startCelebration() {
        confetti();
        hearts();
        fireworks();
    }

    function confetti() {
        const container = document.getElementById('confettiContainer');
        const colors = ['#ff69b4', '#ff1493', '#c2185b', '#ffc0cb'];

        for (let i = 0; i < 120; i++) {
            setTimeout(() => {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.style.left = Math.random() * 100 + '%';
                c.style.backgroundColor =
                    colors[Math.floor(Math.random() * colors.length)];
                container.appendChild(c);

                setTimeout(() => c.remove(), 3000);
            }, i * 25);
        }
    }

    function hearts() {
        const container = document.getElementById('heartsContainer');
        const emojis = ['💖', '💕', '💗', '💘'];

        setInterval(() => {
            const h = document.createElement('div');
            h.className = 'floating-heart';
            h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            h.style.left = Math.random() * 100 + '%';
            container.appendChild(h);

            setTimeout(() => h.remove(), 4000);
        }, 300);
    }

    function fireworks() {
        const container = document.getElementById('fireworksContainer');

        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5;

            for (let i = 0; i < 30; i++) {
                const p = document.createElement('div');
                p.className = 'firework';
                p.style.left = x + 'px';
                p.style.top = y + 'px';

                const angle = (Math.PI * 2 * i) / 30;
                const dist = 60 + Math.random() * 40;

                p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
                p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');

                container.appendChild(p);
                setTimeout(() => p.remove(), 1000);
            }
        }, 1600);
    }

    // =====================
    // INIT
    // =====================
    showStage('songSelection');

    // Allow audio after first interaction
    document.addEventListener('click', () => {
        bgMusic.volume = 0.5;
    }, { once: true });

});
