const bgMusic = document.getElementById('bgMusic');

const songs = {
    "with-you": "audio/with-you.mp3",
    "sure-thing": "audio/sure-thing.mp3",
    "let-me-love-you": "audio/let-me-love-you.mp3"
};

function showStage(id) {
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

/* SONG SELECTION */
document.querySelectorAll('.song-card').forEach(card => {
    card.addEventListener('click', () => {
        const song = card.dataset.song;

        bgMusic.src = songs[song];
        bgMusic.volume = 0.6;
        bgMusic.play();

        showStage('songTransition');

        setTimeout(() => {
            showStage('envelopeStage');
        }, 2500);
    });
});

/* ENVELOPE */
const envelope = document.getElementById('envelope');
const heart = document.getElementById('heartSeal');
const nextBtn = document.getElementById('nextBtn');

heart.addEventListener('click', () => {
    envelope.classList.add('open');
    heart.style.display = 'none';
    nextBtn.classList.remove('hidden');
});
