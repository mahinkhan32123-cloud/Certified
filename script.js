// =====================
// SCRIPT.JS — VERSION 2.1 (FINAL FIX)
// =====================

document.addEventListener('DOMContentLoaded', () => {

    const bgMusic = document.getElementById('bgMusic');

    const songs = {
        'with-you': 'https://www.computerhope.com/jargon/m/example.mp3',
        'sure-thing': 'https://www.computerhope.com/jargon/m/example.mp3',
        'let-me-love-you': 'https://www.computerhope.com/jargon/m/example.mp3'
    };

    // =====================
    // STAGE CONTROL — HARD FIX
    // =====================
    function showStage(stageId) {
        console.log('Showing stage:', stageId);

        document.querySelectorAll('.stage').forEach(stage => {
            stage.style.display = 'none';
            stage.style.pointerEvents = 'none';
            stage.classList.remove('active');
        });

        const activeStage = document.getElementById(stageId);
        if (!activeStage) {
            console.error('Stage not found:', stageId);
            return;
        }

        activeStage.style.display = 'flex';
        activeStage.style.pointerEvents = 'auto';
        activeStage.classList.add('active');
    }

    function playSong(key) {
        console.log('Playing song:', key);
        if (!songs[key]) return;

        bgMusic.src = songs[key];
        bgMusic.volume = 0.5;
        bgMusic.play().catch(err => {
            console.warn('Autoplay blocked (expected):', err);
        });
    }

    // =====================
    // SONG SELECTION — CAPTURE PHASE
    // =====================
    document.addEventListener(
        'click',
        (e) => {
            const card = e.target.closest('.song-card');
            if (!card) return;

            e.stopPropagation();
            e.preventDefault();

            const songKey = card.dataset.song;
            console.log('Song card CLICKED:', songKey);

            playSong(songKey);
            showStage('songTransition');

            setTimeout(() => {
                showStage('envelopeIntro');
            }, 3200);
        },
        true // 👈 CAPTURE PHASE (CRITICAL)
    );

    // =====================
    // ENVELOPE INTRO
    // =====================
    const nextToEnvelopeBtn = document.getElementById('nextToEnvelope');
    if (nextToEnvelopeBtn) {
        nextToEnvelopeBtn.addEventListener('click', () => {
            console.log('Next to envelope clicked');
            showStage('envelopeStage');
        });
    }

    // =====================
    // ENVELOPE
    // =====================
    const envelope = document.getElementById('envelope');
    const heartSeal = document.getElementById('heartSeal');

    if (heartSeal) {
        heartSeal.addEventListener('click', () => {
            console.log('Opening envelope');
            envelope.classList.add('open');
            heartSeal.style.opacity = '0';
            heartSeal.style.pointerEvents = 'none';

            const instruction = document.querySelector('.envelope-instruction');
            if (instruction) instruction.style.opacity = '0';
        });
    }

    const nextToDrumrollBtn = document.getElementById('nextToDrumroll');
    if (nextToDrumrollBtn) {
        nextToDrumrollBtn.addEventListener('click', () => {
            console.log('Next to drumroll clicked');
            showStage('drumrollStage');
            setTimeout(() => showStage('questionStage'), 3000);
        });
    }

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

    if (noBtn) {
        noBtn.addEventListener('mouseenter', () => {
            noScale = Math.max(0.3, noScale - 0.12);
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 150;
            noBtn.style.transform = `translate(${x}px, ${y}px) scale(${noScale})`;

            if (noMessage) {
                noMessage.textContent =
                    noMessages[Math.floor(Math.random() * noMessages.length)];
                setTimeout(() => (noMessage.textContent = ''), 1500);
            }
        });
    }

    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            console.log('YES clicked');
            showStage('celebrationStage');
        });
    }

    // =====================
    // INIT
    // =====================
    console.log('Valentine app initialized — FIXED');
    showStage('songSelection');

});
