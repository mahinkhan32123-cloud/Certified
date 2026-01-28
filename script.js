// Elements
const mainMenu = document.getElementById("mainMenu");
const hangmanGame = document.getElementById("hangmanGame");
const transitionScreen = document.getElementById("transitionScreen");
const catchGame = document.getElementById("catchGame");
const keyGame = document.getElementById("keyGame");
const question = document.getElementById("question");
const ending = document.getElementById("ending");
const yesNormalBtn = document.getElementById("yesNormalBtn");
const yesExcitedBtn = document.getElementById("yesExcitedBtn");
const sadMessage = document.getElementById("sadMessage");

// Main Menu - Button behavior
let normalBtnClicked = false;

yesNormalBtn.addEventListener("click", function() {
  if (!normalBtnClicked) {
    // First click - shrink and show sad message
    normalBtnClicked = true;
    yesNormalBtn.classList.add("shrink");
    sadMessage.style.display = "block";
  }
  // Don't do anything else - force them to click YESSSSSS
});

yesExcitedBtn.addEventListener("click", function() {
  mainMenu.style.display = "none";
  startHangman();
});

// ===== HANGMAN GAME =====
const hangmanQuestions = [
  { question: "Who is your favorite person ever?", answer: "MAHIN" },
  { question: "Who is his favorite person?", answer: "BATUL" }
];

let currentQuestion = 0;
let currentWord = "";
let guessedLetters = [];
let displayWord = [];
let wrongGuessCount = 0;
const maxWrongGuesses = 6;

const hangmanParts = [
  document.getElementById("head"),
  document.getElementById("body"),
  document.getElementById("leftArm"),
  document.getElementById("rightArm"),
  document.getElementById("leftLeg"),
  document.getElementById("rightLeg")
];

function startHangman() {
  hangmanGame.style.display = "block";
  currentQuestion = 0;
  wrongGuessCount = 0;
  resetHangman();
  loadQuestion();
}

function resetHangman() {
  // Hide all hangman parts
  hangmanParts.forEach(part => {
    part.style.display = "none";
  });
}

function loadQuestion() {
  const q = hangmanQuestions[currentQuestion];
  currentWord = q.answer.toUpperCase();
  guessedLetters = [];
  displayWord = Array(currentWord.length).fill("_");
  
  document.getElementById("hangmanQuestion").textContent = q.question;
  document.getElementById("hangmanMessage").textContent = "";
  document.getElementById("wrongLetters").textContent = "";
  updateHangmanDisplay();
  createKeyboard();
}

function updateHangmanDisplay() {
  document.getElementById("hangmanWord").textContent = displayWord.join(" ");
}

function createKeyboard() {
  const keyboard = document.getElementById("hangmanKeyboard");
  keyboard.innerHTML = "";
  
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.className = "letter-btn";
    btn.onclick = () => guessLetter(letter, btn);
    btn.dataset.letter = letter;
    keyboard.appendChild(btn);
  }
}

function guessLetter(letter, btn) {
  if (btn) btn.disabled = true;
  guessedLetters.push(letter);
  
  if (currentWord.includes(letter)) {
    // Correct guess
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] === letter) {
        displayWord[i] = letter;
      }
    }
    updateHangmanDisplay();
    
    // Check if word is complete
    if (!displayWord.includes("_")) {
      document.getElementById("hangmanMessage").textContent = "Correct! ✨";
      setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < hangmanQuestions.length) {
          loadQuestion();
        } else {
          // All questions answered!
          hangmanGame.style.display = "none";
          transitionScreen.style.display = "block";
        }
      }, 1500);
    }
  } else {
    // Wrong guess
    wrongGuessCount++;
    
    // Show hangman part
    if (wrongGuessCount <= maxWrongGuesses) {
      hangmanParts[wrongGuessCount - 1].style.display = "block";
    }
    
    // Update wrong letters display
    const wrongLettersEl = document.getElementById("wrongLetters");
    const wrongLetters = guessedLetters.filter(l => !currentWord.includes(l));
    wrongLettersEl.textContent = wrongLetters.join(" ");
    
    // Check if game over
    if (wrongGuessCount >= maxWrongGuesses) {
      document.getElementById("hangmanMessage").textContent = "Game Over! 💀 Try again!";
      setTimeout(() => {
        // Restart hangman from beginning
        currentQuestion = 0;
        wrongGuessCount = 0;
        resetHangman();
        loadQuestion();
      }, 2000);
    }
  }
}

// Keyboard support for hangman
document.addEventListener("keydown", function(e) {
  if (hangmanGame.style.display === "block") {
    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
      const btn = document.querySelector(`[data-letter="${key}"]`);
      if (btn && !btn.disabled) {
        guessLetter(key, btn);
      }
    }
  }
});

// ===== TRANSITION SCREEN =====
function startCatchGame() {
  transitionScreen.style.display = "none";
  catchGame.style.display = "block";
  initCatchGame();
}

// ===== CATCH GAME - MARIO THEME =====
let score = 0;
let bombCount = 0;
let gameActive = false;

function initCatchGame() {
  score = 0;
  bombCount = 0;
  gameActive = true;
  updateCatchStats();
  document.getElementById("catchArea").innerHTML = "";
  spawnItems();
}

function updateCatchStats() {
  document.getElementById("score").textContent = score;
  document.getElementById("bombs").textContent = bombCount;
}

function spawnItems() {
  if (!gameActive) return;
  
  const items = [
    // Mario characters (1 point each)
    { type: "mario", points: 1, url: "https://i.imgur.com/cL3Wlnm.png" },
    { type: "luigi", points: 1, url: "https://i.imgur.com/vQx5kEC.png" },
    { type: "peach", points: 1, url: "https://i.imgur.com/sJYYKQL.png" },
    // Star (5 points)
    { type: "star", points: 5, url: "https://i.imgur.com/zNz3pNN.png" },
    // Bowser (bomb)
    { type: "bowser", points: 0, url: "https://i.imgur.com/mN4crzl.png" }
  ];
  
  // Weighted spawn - more characters, fewer bowsers
  const spawnPool = [
    ...Array(3).fill(items[0]), // Mario x3
    ...Array(3).fill(items[1]), // Luigi x3
    ...Array(3).fill(items[2]), // Peach x3
    ...Array(2).fill(items[3]), // Star x2
    items[4] // Bowser x1
  ];
  
  const item = spawnPool[Math.floor(Math.random() * spawnPool.length)];
  const fallingItem = document.createElement("div");
  fallingItem.className = "falling-item";
  
  const img = document.createElement("img");
  img.src = item.url;
  img.alt = item.type;
  img.onerror = function() {
    // Fallback to emoji if image fails to load
    const emojiMap = {
      mario: "🔴",
      luigi: "🟢",
      peach: "👑",
      star: "⭐",
      bowser: "💣"
    };
    fallingItem.textContent = emojiMap[item.type];
    fallingItem.style.fontSize = "50px";
  };
  
  fallingItem.appendChild(img);
  fallingItem.style.left = Math.random() * (window.innerWidth - 80) + "px";
  fallingItem.style.top = "-80px";
  
  const duration = 2.5 + Math.random() * 1.5;
  fallingItem.style.animationDuration = duration + "s";
  
  fallingItem.onclick = () => {
    if (item.type === "bowser") {
      // Hit a bomb!
      bombCount++;
      updateCatchStats();
      
      if (bombCount >= 3) {
        gameActive = false;
        alert("💥 GAME OVER! You hit Bowser 3 times! Try again!");
        document.getElementById("catchArea").innerHTML = "";
        initCatchGame();
        return;
      }
    } else {
      // Score points!
      score += item.points;
      updateCatchStats();
      
      if (score >= 25) {
        gameActive = false;
        setTimeout(() => {
          catchGame.style.display = "none";
          keyGame.style.display = "block";
          document.getElementById("key").style.left = "50px";
          document.getElementById("key").style.top = "200px";
        }, 500);
        return;
      }
    }
    
    fallingItem.remove();
  };
  
  document.getElementById("catchArea").appendChild(fallingItem);
  
  setTimeout(() => {
    if (fallingItem.parentNode) {
      fallingItem.remove();
    }
  }, duration * 1000);
  
  if (gameActive) {
    setTimeout(spawnItems, 600 + Math.random() * 400);
  }
}

// ===== KEY GAME =====
const key = document.getElementById("key");
const heart = document.getElementById("lockHeart");
let dragging = false;

function startDrag(e) {
  dragging = true;
  key.style.cursor = "grabbing";
  e.preventDefault();
}

function drag(e) {
  if (!dragging) return;
  const touch = e.touches ? e.touches[0] : e;
  key.style.left = (touch.clientX - 30) + "px";
  key.style.top = (touch.clientY - 30) + "px";
  checkUnlock();
}

function stopDrag() { 
  dragging = false;
  key.style.cursor = "grab";
}

function checkUnlock() {
  const k = key.getBoundingClientRect();
  const h = heart.getBoundingClientRect();
  if (k.left < h.right && k.right > h.left && k.top < h.bottom && k.bottom > h.top) {
    keyGame.style.display = "none";
    question.style.display = "block";
  }
}

key.addEventListener("mousedown", startDrag);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", stopDrag);
key.addEventListener("touchstart", startDrag);
document.addEventListener("touchmove", drag);
document.addEventListener("touchend", stopDrag);

// ===== QUESTION STAGE =====
const tauntsArr = [
  "SIKE 😭", "ABSOLUTELY NOT", "NICE TRY THO", "YOU REALLY THOUGHT?", "NAH UH",
  "WRONG ANSWER", "TRY AGAIN BUDDY", "LMAOOOO", "BE SERIOUS", "THAT BUTTON IS DECORATIVE",
  "NO IS NOT A REAL OPTION", "PLEASE BFFR", "ALMOST HAD IT", "SO CLOSE 😏", "DENIED",
  "SYSTEM SAYS NO (YOU)", "HAHAHA", "TRY HARDER", "NOT TODAY", "😎 BETTER LUCK NEXT TIME",
  "ERROR 404: YES NOT FOUND", "ACCESS DENIED", "INVALID OPTION", "TRY HARDER BESTIE"
];

function moveNo() {
  const noBtn = document.getElementById("noBtn");
  const maxX = window.innerWidth - noBtn.offsetWidth - 40;
  const maxY = window.innerHeight - noBtn.offsetHeight - 40;
  const randomX = Math.random() * maxX - maxX/2;
  const randomY = Math.random() * maxY - maxY/2;
  
  noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
  document.getElementById("taunt").textContent = tauntsArr[Math.floor(Math.random() * tauntsArr.length)];
}

function yes() {
  question.style.display = "none";
  ending.style.display = "flex";
}
