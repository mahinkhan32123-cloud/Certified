document.addEventListener('DOMContentLoaded', () => {

    const stages = [
        'songSelection',
        'songTransition',
        'envelopeIntro',
        'envelopeStage',
        'drumrollStage',
        'questionStage',
        'celebrationStage'
    ];

    let index = 0;

    function showStage(id) {
        document.querySelectorAll('.stage').forEach(stage => {
            stage.classList.remove('active');
            stage.style.pointerEvents = 'none';
        });

        const active = document.getElementById(id);
        if (active) {
            active.classList.add('active');
            active.style.pointerEvents = 'auto';
        }
    }

    // DEBUG NEXT BUTTON
    document.getElementById('debugNextBtn').addEventListener('click', () => {
        index = Math.min(index + 1, stages.length - 1);
        showStage(stages[index]);
    });

    // Envelope open
    const envelope = document.getElementById('envelope');
    const heart = document.getElementById('heartSeal');

    heart.addEventListener('click', () => {
        envelope.classList.add('open');
    });

    // Question
    document.getElementById('yesBtn').addEventListener('click', () => {
        showStage('celebrationStage');
    });

    // Init
    showStage(stages[index]);
});
