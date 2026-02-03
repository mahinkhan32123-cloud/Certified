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
        if (!songs[key]) return;
        bgMusic.src = songs[key];
        bgMusic.volume = 0.5;
        bgMusic.play().catch(() => {});
    }

    // =====================
    // SONG CLICK (BULLETPROOF)
    // =====================
    document.querySelector('.song-options').addEventListener('click', (e) => {
        const card = e.target.closest('.song-card');
        if (!card) return;

        const songKey = card.dataset.song;

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
        showStage('envelopeStage');
    });

    const envelope = document.getElementById('envelope');
    const heartSeal = document.getElementById('heartSeal');

    heartSeal.addEventListener('click', () => {
        envelope.classList.add('open');
        heartSeal.style.opacity = '0';
        document.querySelector('.envelope-instruction').style.opacity = '0';
    });

    document.getElementById('nextToDrumroll').addEventListener('click', () => {
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
        for (let i = 0; i < 120; i++) {
            setTimeout(() => {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.style.left = Math.random() * 100 + '%';
                container.appendChild(c);
                setTimeout(() => c.remove(), 3000);
            }, i * 25);
        }
    }

    function hearts() {
        const container = document.getElementById('heartsContainer');
        setInterval(() => {
            const h = document.createElement('div');
            h.className = 'floating-heart';
            h.textContent = '💖';
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
