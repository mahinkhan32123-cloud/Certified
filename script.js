// ===== SCREEN MANAGEMENT =====
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function startGame() {
  showScreen('gameScreen');
  initGame();
}

function showInstructions() {
  showScreen('instructionsScreen');
}

function backToMenu() {
  showScreen('mainMenu');
  // Reset fade variables
  fadeAlpha = 0;
  fadeComplete = false;
}

function openEssay() {
  showScreen('essayScreen');
}

// ===== MARIO PLATFORMER GAME =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Camera for side-scrolling
const camera = {
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  followSpeed: 0.1
};

// Game state
const game = {
  hasKey: false,
  hasHeart: false,
  heartBoxIndex: null,
  keys: {},
  animationFrame: null,
  levelWidth: 3000,
  lastSafePlatform: null,
  checkpoints: [
    { x: 500, passed: false },
    { x: 1200, passed: false },
    { x: 1900, passed: false },
    { x: 2400, passed: false }
  ],
  currentCheckpoint: { x: 100, y: 450 }
};

// Mario player - will draw like Mario 64 style
const mario = {
  x: 100,
  y: 450,
  width: 40,
  height: 40,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpPower: 12,
  onGround: false,
  direction: 'right',
  isWalking: false,
  walkFrame: 0,
  walkTimer: 0
};

// Key object - classic key design
const key = {
  x: 300,
  y: 510,
  width: 30,
  height: 30,
  collected: false,
  floatOffset: 0
};

// Boxes - spread across level, heart in last 3 only
const boxes = [
  { x: 500, y: 300, width: 40, height: 40, broken: false },
  { x: 750, y: 250, width: 40, height: 40, broken: false },
  { x: 1100, y: 300, width: 40, height: 40, broken: false },
  { x: 1400, y: 250, width: 40, height: 40, broken: false },
  { x: 1700, y: 300, width: 40, height: 40, broken: false },
  { x: 950, y: 180, width: 40, height: 40, broken: false },
  { x: 1250, y: 180, width: 40, height: 40, broken: false },
  { x: 1900, y: 250, width: 40, height: 40, broken: false, canHaveHeart: true }, // Last 3
  { x: 2200, y: 300, width: 40, height: 40, broken: false, canHaveHeart: true },
  { x: 1550, y: 200, width: 40, height: 40, broken: false, canHaveHeart: true }
];

// Heart object
const heart = {
  x: 0,
  y: 0,
  width: 25,
  height: 25,
  collected: false,
  falling: false,
  velocityY: 0,
  floatOffset: 0
};

// Castle
const castle = {
  x: 2700,
  y: 300,
  width: 90,
  height: 200
};

// Platforms - forgiving spacing
const platforms = [
  { x: 0, y: 550, width: 3000, height: 50 }, // Ground
  { x: 200, y: 470, width: 150, height: 20 },
  { x: 450, y: 420, width: 140, height: 20 },
  { x: 700, y: 370, width: 150, height: 20 },
  { x: 920, y: 320, width: 140, height: 20 },
  { x: 650, y: 250, width: 120, height: 20 },
  { x: 900, y: 250, width: 120, height: 20 },
  { x: 1150, y: 370, width: 150, height: 20 },
  { x: 1350, y: 320, width: 140, height: 20 },
  { x: 1600, y: 370, width: 150, height: 20 },
  { x: 1200, y: 250, width: 130, height: 20 },
  { x: 1500, y: 270, width: 120, height: 20 },
  { x: 1850, y: 320, width: 150, height: 20 },
  { x: 2100, y: 370, width: 140, height: 20 },
  { x: 2350, y: 420, width: 150, height: 20 },
  { x: 2650, y: 500, width: 350, height: 20 }
];

const gravity = 0.6;

// ===== INITIALIZATION =====
function initGame() {
  game.hasKey = false;
  game.hasHeart = false;
  mario.x = 100;
  mario.y = 450;
  mario.velocityX = 0;
  mario.velocityY = 0;
  key.collected = false;
  heart.collected = false;
  heart.falling = false;
  camera.x = 0;
  
  game.checkpoints.forEach(cp => cp.passed = false);
  game.currentCheckpoint = { x: 100, y: 450 };
  game.lastSafePlatform = null;
  
  // Randomize heart in LAST 3 boxes only
  const heartBoxes = boxes.filter(box => box.canHaveHeart);
  const randomIndex = Math.floor(Math.random() * heartBoxes.length);
  game.heartBoxIndex = boxes.indexOf(heartBoxes[randomIndex]);
  
  boxes.forEach(box => box.broken = false);
  
  updateHUD();
  
  if (game.animationFrame) {
    cancelAnimationFrame(game.animationFrame);
  }
  gameLoop();
}

// ===== INPUT HANDLING =====
window.addEventListener('keydown', (e) => {
  game.keys[e.key] = true;
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  game.keys[e.key] = false;
});

// ===== UPDATE FUNCTIONS =====
function updateCamera() {
  const targetX = mario.x - camera.width / 2 + mario.width / 2;
  camera.x += (targetX - camera.x) * camera.followSpeed;
  
  if (camera.x < 0) camera.x = 0;
  if (camera.x > game.levelWidth - camera.width) {
    camera.x = game.levelWidth - camera.width;
  }
}

function updateMario() {
  mario.isWalking = false;
  if (game.keys['ArrowLeft']) {
    mario.velocityX = -mario.speed;
    mario.direction = 'left';
    mario.isWalking = true;
  } else if (game.keys['ArrowRight']) {
    mario.velocityX = mario.speed;
    mario.direction = 'right';
    mario.isWalking = true;
  } else {
    mario.velocityX = 0;
  }

  if (mario.isWalking && mario.onGround) {
    mario.walkTimer++;
    if (mario.walkTimer > 8) {
      mario.walkFrame = (mario.walkFrame + 1) % 2;
      mario.walkTimer = 0;
    }
  } else {
    mario.walkFrame = 0;
    mario.walkTimer = 0;
  }

  if (game.keys[' '] && mario.onGround) {
    mario.velocityY = -mario.jumpPower;
    mario.onGround = false;
  }

  mario.velocityY += gravity;
  mario.x += mario.velocityX;
  mario.y += mario.velocityY;

  if (mario.x < 0) mario.x = 0;
  if (mario.x + mario.width > game.levelWidth) {
    mario.x = game.levelWidth - mario.width;
  }

  mario.onGround = false;
  
  platforms.forEach(platform => {
    if (mario.velocityY >= 0 &&
        mario.x + mario.width > platform.x &&
        mario.x < platform.x + platform.width &&
        mario.y + mario.height >= platform.y &&
        mario.y + mario.height <= platform.y + 20) {
      
      mario.y = platform.y - mario.height;
      mario.velocityY = 0;
      mario.onGround = true;
      
      game.lastSafePlatform = {
        x: platform.x + platform.width / 2,
        y: platform.y - mario.height
      };
    }
  });
  
  if (mario.y > canvas.height + 100) {
    if (game.lastSafePlatform) {
      mario.x = game.lastSafePlatform.x - mario.width / 2;
      mario.y = game.lastSafePlatform.y;
    } else {
      mario.x = game.currentCheckpoint.x;
      mario.y = game.currentCheckpoint.y;
    }
    mario.velocityY = 0;
    mario.velocityX = 0;
  }
  
  game.checkpoints.forEach(checkpoint => {
    if (!checkpoint.passed && mario.x > checkpoint.x) {
      checkpoint.passed = true;
      game.currentCheckpoint = {
        x: checkpoint.x,
        y: 450
      };
    }
  });

  // Boxes always breakable
  if (mario.velocityY < 0) {
    boxes.forEach((box, index) => {
      if (!box.broken) {
        const horizontalOverlap = mario.x + mario.width > box.x - 10 && 
                                  mario.x < box.x + box.width + 10;
        const verticalCollision = mario.y <= box.y + box.height + 5 &&
                                 mario.y >= box.y - 5;
        
        if (horizontalOverlap && verticalCollision) {
          box.broken = true;
          mario.velocityY = 2;
          
          if (index === game.heartBoxIndex) {
            heart.x = box.x + 7.5;
            heart.y = box.y - 30;
            heart.falling = true;
            heart.velocityY = -5;
          }
        }
      }
    });
  }

  if (!key.collected &&
      mario.x + mario.width > key.x &&
      mario.x < key.x + key.width &&
      mario.y + mario.height > key.y &&
      mario.y < key.y + key.height) {
    
    key.collected = true;
    game.hasKey = true;
    updateHUD();
  }

  if (!heart.collected && heart.falling &&
      mario.x + mario.width > heart.x &&
      mario.x < heart.x + heart.width &&
      mario.y + mario.height > heart.y &&
      mario.y < heart.y + heart.height) {
    
    heart.collected = true;
    game.hasHeart = true;
    updateHUD();
  }

  if (game.hasHeart &&
      mario.x + mario.width > castle.x &&
      mario.x < castle.x + castle.width &&
      mario.y + mario.height > castle.y &&
      mario.y < castle.y + castle.height) {
    
    reachedCastle();
  }
}

function updateHeart() {
  if (heart.falling && !heart.collected) {
    heart.velocityY += gravity;
    heart.y += heart.velocityY;

    platforms.forEach(platform => {
      if (heart.y + heart.height >= platform.y &&
          heart.y + heart.height <= platform.y + 20 &&
          heart.x + heart.width > platform.x &&
          heart.x < platform.x + platform.width &&
          heart.velocityY >= 0) {
        
        heart.y = platform.y - heart.height;
        heart.velocityY = 0;
        heart.falling = false;
      }
    });
  }

  if (!heart.collected) {
    heart.floatOffset = Math.sin(Date.now() / 200) * 5;
  }
}

function updateKey() {
  if (!key.collected) {
    key.floatOffset = Math.sin(Date.now() / 300) * 8;
  }
}

function updateHUD() {
  document.getElementById('hasKeyText').textContent = game.hasKey ? 'YES' : 'NO';
  document.getElementById('hasKeyText').style.color = game.hasKey ? '#00ff00' : '#ff0000';
  
  document.getElementById('hasHeartText').textContent = game.hasHeart ? 'YES' : 'NO';
  document.getElementById('hasHeartText').style.color = game.hasHeart ? '#ff69b4' : '#ff0000';
}

// ===== DRAWING FUNCTIONS =====
function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#98d8f8');
  gradient.addColorStop(0.5, '#68b8f0');
  gradient.addColorStop(1, '#98d8f8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cloudOffset = camera.x * 0.5;
  drawSNESCloud(150 - cloudOffset, 80, 60);
  drawSNESCloud(450 - cloudOffset, 120, 70);
  drawSNESCloud(750 - cloudOffset, 90, 65);
  drawSNESCloud(1100 - cloudOffset, 110, 60);
  drawSNESCloud(1450 - cloudOffset, 85, 65);
  drawSNESCloud(1800 - cloudOffset, 105, 70);

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(700 - camera.x * 0.3, 80, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawSNESCloud(x, y, size) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.6, y, size * 0.6, 0, Math.PI * 2);
  ctx.arc(x + size * 1.2, y, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlatforms() {
  platforms.forEach(platform => {
    ctx.fillStyle = '#d88028';
    ctx.fillRect(platform.x - camera.x, platform.y, platform.width, platform.height);
    
    ctx.fillStyle = '#00c800';
    ctx.fillRect(platform.x - camera.x, platform.y, platform.width, 10);
    
    ctx.fillStyle = '#00d000';
    for (let i = platform.x; i < platform.x + platform.width; i += 8) {
      ctx.fillRect(i - camera.x, platform.y + 2, 3, 6);
      ctx.fillRect(i + 4 - camera.x, platform.y + 3, 3, 5);
    }
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x - camera.x, platform.y, platform.width, platform.height);
    
    ctx.fillStyle = '#c87020';
    for (let i = platform.x + 10; i < platform.x + platform.width; i += 20) {
      for (let j = platform.y + 15; j < platform.y + platform.height - 5; j += 15) {
        ctx.fillRect(i - camera.x, j, 4, 4);
      }
    }
  });
}

function drawMario64Style() {
  const drawX = mario.x - camera.x;
  const drawY = mario.y;
  
  ctx.save();
  
  if (mario.direction === 'left') {
    ctx.translate(drawX + mario.width, drawY);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(drawX, drawY);
  }

  const w = mario.width;
  const h = mario.height;
  
  // Based on reference: Round Mario with proper proportions
  
  // Large red hat (covers top of head, not floating)
  ctx.fillStyle = '#e60012';
  ctx.beginPath();
  ctx.ellipse(w/2, h*0.25, w*0.45, h*0.22, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  
  // Hat brim (darker red, rounded)
  ctx.fillStyle = '#c00000';
  ctx.beginPath();
  ctx.ellipse(w/2, h*0.28, w*0.48, h*0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // White M circle on hat
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(w/2, h*0.18, w*0.14, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#e60012';
  ctx.font = `bold ${w*0.28}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', w/2, h*0.18);
  
  // Round head/face (peach color)
  ctx.fillStyle = '#f4c7ab';
  ctx.beginPath();
  ctx.arc(w/2, h*0.42, w*0.38, 0, Math.PI * 2);
  ctx.fill();
  
  // Big blue eyes with white
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(w*0.35, h*0.38, w*0.12, h*0.14, 0, 0, Math.PI * 2);
  ctx.ellipse(w*0.65, h*0.38, w*0.12, h*0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Blue iris
  ctx.fillStyle = '#4a9eff';
  ctx.beginPath();
  ctx.arc(w*0.36, h*0.38, w*0.08, 0, Math.PI * 2);
  ctx.arc(w*0.64, h*0.38, w*0.08, 0, Math.PI * 2);
  ctx.fill();
  
  // Black pupils with shine
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(w*0.37, h*0.38, w*0.04, 0, Math.PI * 2);
  ctx.arc(w*0.63, h*0.38, w*0.04, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(w*0.38, h*0.37, w*0.02, 0, Math.PI * 2);
  ctx.arc(w*0.64, h*0.37, w*0.02, 0, Math.PI * 2);
  ctx.fill();
  
  // Round nose
  ctx.fillStyle = '#f4c7ab';
  ctx.beginPath();
  ctx.ellipse(w/2, h*0.45, w*0.14, h*0.12, 0, 0, Math.PI);
  ctx.fill();
  
  // Big thick mustache (dark brown/black)
  ctx.fillStyle = '#3d2817';
  ctx.beginPath();
  ctx.ellipse(w*0.3, h*0.52, w*0.18, h*0.12, -0.3, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w*0.7, h*0.52, w*0.18, h*0.12, 0.3, 0, Math.PI);
  ctx.fill();
  
  // Red shirt (visible at neckline)
  ctx.fillStyle = '#e60012';
  ctx.fillRect(w*0.25, h*0.58, w*0.5, h*0.08);
  
  // Blue overalls body
  ctx.fillStyle = '#2758d6';
  ctx.fillRect(w*0.2, h*0.66, w*0.6, h*0.3);
  
  // Overall straps
  ctx.fillStyle = '#2758d6';
  ctx.fillRect(w*0.28, h*0.58, w*0.12, h*0.12);
  ctx.fillRect(w*0.6, h*0.58, w*0.12, h*0.12);
  
  // Yellow buttons (shiny)
  const gradient = ctx.createRadialGradient(w*0.34, h*0.64, 0, w*0.34, h*0.64, w*0.08);
  gradient.addColorStop(0, '#ffeb3b');
  gradient.addColorStop(1, '#ffc107');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(w*0.34, h*0.64, w*0.08, 0, Math.PI * 2);
  ctx.arc(w*0.66, h*0.64, w*0.08, 0, Math.PI * 2);
  ctx.fill();
  
  // White gloves (rounded, puffy)
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  
  // Left glove
  ctx.beginPath();
  ctx.arc(w*0.05, h*0.7, w*0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Right glove
  ctx.beginPath();
  ctx.arc(w*0.95, h*0.7, w*0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Brown shoes
  ctx.fillStyle = '#8B4513';
  if (mario.walkFrame === 1 && mario.isWalking) {
    ctx.beginPath();
    ctx.ellipse(w*0.3, h*0.98, w*0.16, h*0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w*0.7, h*0.98, w*0.16, h*0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(w*0.35, h*0.98, w*0.16, h*0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w*0.65, h*0.98, w*0.16, h*0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (game.hasHeart && heart.collected) {
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 20px Arial';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff69b4';
    ctx.fillText('💖', w + 2, 20);
    ctx.shadowBlur = 0;
  }

  ctx.restore();
  ctx.textAlign = 'left';
}

function drawClassicKey() {
  if (key.collected) return;

  const drawY = key.y + key.floatOffset;
  const drawX = key.x - camera.x;

  ctx.shadowBlur = 20;
  ctx.shadowColor = '#FFD700';

  // Key body (golden)
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(drawX + 8, drawY + 12, 14, 6);
  
  // Key head (circle)
  ctx.beginPath();
  ctx.arc(drawX + 10, drawY + 15, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Hole in key head
  ctx.fillStyle = '#8B7500';
  ctx.beginPath();
  ctx.arc(drawX + 10, drawY + 15, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Key teeth
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(drawX + 22, drawY + 12, 3, 3);
  ctx.fillRect(drawX + 22, drawY + 15, 5, 3);
  
  // Key outline
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(drawX + 10, drawY + 15, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(drawX + 8, drawY + 12, 14, 6);
  
  ctx.shadowBlur = 0;
}

function drawBoxes() {
  boxes.forEach(box => {
    const drawX = box.x - camera.x;
    
    if (box.broken) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(drawX - 5, box.y + 5, 15, 15);
      ctx.fillRect(drawX + 30, box.y + 5, 15, 15);
      return;
    }

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(drawX, box.y, box.width, box.height);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(drawX, box.y, box.width, box.height);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('?', drawX + 12, box.y + 30);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(drawX + 5, box.y + 5, 10, 10);
  });
}

function drawHeart() {
  if (heart.collected) return;
  if (!heart.falling && !heart.collected) return;

  const drawY = heart.falling ? heart.y : heart.y + heart.floatOffset;
  const drawX = heart.x - camera.x;

  ctx.shadowBlur = 15;
  ctx.shadowColor = '#ff69b4';

  ctx.fillStyle = '#ff69b4';
  ctx.font = '30px Arial';
  ctx.fillText('💖', drawX, drawY + 25);

  ctx.shadowBlur = 0;
}

function drawCastle() {
  const drawX = castle.x - camera.x;
  const baseY = castle.y;
  
  ctx.fillStyle = '#E8D5B7';
  ctx.fillRect(drawX - 5, baseY + 80, 25, 120);
  ctx.fillRect(drawX + 70, baseY + 80, 25, 120);
  
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX - 5, baseY + 80, 25, 120);
  ctx.strokeRect(drawX + 70, baseY + 80, 25, 120);
  
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(drawX + 5, baseY + 50, 80, 150);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(drawX + 5, baseY + 50, 80, 150);
  
  ctx.strokeStyle = 'rgba(139, 115, 85, 0.3)';
  ctx.lineWidth = 1;
  for (let i = baseY + 60; i < baseY + 200; i += 12) {
    ctx.beginPath();
    ctx.moveTo(drawX + 5, i);
    ctx.lineTo(drawX + 85, i);
    ctx.stroke();
  }
  for (let i = drawX + 15; i < drawX + 85; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, baseY + 50);
    ctx.lineTo(i, baseY + 200);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(drawX - 5, baseY + 80, 15, 120);
  ctx.fillRect(drawX + 80, baseY + 80, 15, 120);
  
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(drawX - 5, baseY + 80, 15, 120);
  ctx.strokeRect(drawX + 80, baseY + 80, 15, 120);
  
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(drawX + 30, baseY, 30, 60);
  ctx.strokeRect(drawX + 30, baseY, 30, 60);
  
  ctx.fillStyle = '#DC143C';
  
  ctx.beginPath();
  ctx.moveTo(drawX - 8, baseY + 80);
  ctx.lineTo(drawX + 2.5, baseY + 50);
  ctx.lineTo(drawX + 13, baseY + 80);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8B0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(drawX - 8 + i * 3.5, baseY + 80 - i * 5);
    ctx.lineTo(drawX + 13 - i * 3.5, baseY + 80 - i * 5);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#DC143C';
  ctx.beginPath();
  ctx.moveTo(drawX + 77, baseY + 80);
  ctx.lineTo(drawX + 87.5, baseY + 50);
  ctx.lineTo(drawX + 98, baseY + 80);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8B0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(drawX + 77 + i * 3.5, baseY + 80 - i * 5);
    ctx.lineTo(drawX + 98 - i * 3.5, baseY + 80 - i * 5);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#DC143C';
  ctx.beginPath();
  ctx.moveTo(drawX + 25, baseY);
  ctx.lineTo(drawX + 45, baseY - 35);
  ctx.lineTo(drawX + 65, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8B0000';
  ctx.stroke();
  
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(drawX + 25 + i * 5, baseY - i * 6);
    ctx.lineTo(drawX + 65 - i * 5, baseY - i * 6);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#DC143C';
  ctx.beginPath();
  ctx.moveTo(drawX, baseY + 50);
  ctx.lineTo(drawX + 45, baseY + 15);
  ctx.lineTo(drawX + 90, baseY + 50);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#ff69b4';
  ctx.fillRect(drawX + 45, baseY - 35, 3, 35);
  
  ctx.fillRect(drawX + 48, baseY - 33, 18, 12);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX + 48, baseY - 33, 18, 12);
  
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 10px Arial';
  ctx.fillText('👑', drawX + 50, baseY - 23);
  
  const doorX = drawX + 27;
  const doorY = baseY + 140;
  const doorWidth = 36;
  const doorHeight = 60;
  
  ctx.fillStyle = '#C19A6B';
  ctx.fillRect(doorX - 3, doorY - 3, doorWidth + 6, doorHeight + 3);
  
  ctx.fillStyle = '#654321';
  ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
  
  ctx.beginPath();
  ctx.arc(doorX + doorWidth / 2, doorY, doorWidth / 2, Math.PI, 0);
  ctx.fill();
  
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 2;
  ctx.strokeRect(doorX + 4, doorY + 5, doorWidth - 8, doorHeight - 10);
  ctx.strokeRect(doorX + 8, doorY + 10, doorWidth - 16, doorHeight - 20);
  
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);
  
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(doorX + doorWidth - 8, doorY + doorHeight / 2, 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#87CEEB';
  
  const winX1 = drawX + 12;
  const winY = baseY + 100;
  ctx.fillRect(winX1, winY, 18, 28);
  ctx.beginPath();
  ctx.arc(winX1 + 9, winY, 9, Math.PI, 0);
  ctx.fill();
  
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(winX1, winY, 18, 28);
  ctx.beginPath();
  ctx.moveTo(winX1 + 9, winY);
  ctx.lineTo(winX1 + 9, winY + 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(winX1, winY + 14);
  ctx.lineTo(winX1 + 18, winY + 14);
  ctx.stroke();
  
  const winX2 = drawX + 60;
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(winX2, winY, 18, 28);
  ctx.beginPath();
  ctx.arc(winX2 + 9, winY, 9, Math.PI, 0);
  ctx.fill();
  
  ctx.strokeStyle = '#000';
  ctx.strokeRect(winX2, winY, 18, 28);
  ctx.beginPath();
  ctx.moveTo(winX2 + 9, winY);
  ctx.lineTo(winX2 + 9, winY + 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(winX2, winY + 14);
  ctx.lineTo(winX2 + 18, winY + 14);
  ctx.stroke();
  
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(drawX + 37, baseY + 20, 16, 25);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX + 37, baseY + 20, 16, 25);
  ctx.beginPath();
  ctx.moveTo(drawX + 45, baseY + 20);
  ctx.lineTo(drawX + 45, baseY + 45);
  ctx.stroke();
  
  if (game.hasHeart) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText('⭐', doorX + doorWidth / 2, doorY + 40);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#666';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔒', doorX + doorWidth / 2, doorY + 38);
  }
  
  ctx.textAlign = 'left';
}

// ===== GAME LOOP =====
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateCamera();

  drawBackground();
  drawPlatforms();
  drawCastle();
  drawBoxes();
  drawClassicKey();
  drawHeart();
  drawMario64Style();

  updateMario();
  updateKey();
  updateHeart();

  game.animationFrame = requestAnimationFrame(gameLoop);
}

// ===== CASTLE REACHED - TRANSITION =====
let fadeAlpha = 0;
let fadeComplete = false;

function reachedCastle() {
  cancelAnimationFrame(game.animationFrame);
  fadeToBlack();
}

function fadeToBlack() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  updateCamera();
  
  drawBackground();
  drawPlatforms();
  drawCastle();
  drawBoxes();
  drawClassicKey();
  drawHeart();
  drawMario64Style();
  
  ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  fadeAlpha += 0.015;
  
  if (fadeAlpha >= 1 && !fadeComplete) {
    fadeComplete = true;
    showTransition();
  } else if (fadeAlpha < 1) {
    requestAnimationFrame(fadeToBlack);
  }
}

function showTransition() {
  showScreen('transitionScreen');
  document.getElementById('transitionText').textContent = 
    "I made that easy for you huh… now let's see how good you are to find me when you're lost...!";
  
  setTimeout(() => {
    initMazeGame();
  }, 4000);
}

// ===== MAZE GAME =====
const mazeCanvas = document.getElementById('mazeCanvas');
const mazeCtx = mazeCanvas.getContext('2d');

mazeCanvas.width = 700;
mazeCanvas.height = 700;

const maze = {
  cellSize: 35,
  cols: 20,
  rows: 20,
  grid: [],
  player: { x: 1, y: 1 },
  goal: { x: 18, y: 18 },
  keys: {}
};

function initMazeGame() {
  showScreen('mazeScreen');
  generateMaze();
  maze.player = { x: 1, y: 1 };
  
  window.addEventListener('keydown', handleMazeInput);
  window.addEventListener('keyup', (e) => {
    maze.keys[e.key] = false;
  });
  
  drawMaze();
}

function handleMazeInput(e) {
  const oldX = maze.player.x;
  const oldY = maze.player.y;
  
  if (e.key === 'ArrowUp' && maze.player.y > 0) {
    if (maze.grid[maze.player.y][maze.player.x].top) maze.player.y--;
  } else if (e.key === 'ArrowDown' && maze.player.y < maze.rows - 1) {
    if (maze.grid[maze.player.y][maze.player.x].bottom) maze.player.y++;
  } else if (e.key === 'ArrowLeft' && maze.player.x > 0) {
    if (maze.grid[maze.player.y][maze.player.x].left) maze.player.x--;
  } else if (e.key === 'ArrowRight' && maze.player.x < maze.cols - 1) {
    if (maze.grid[maze.player.y][maze.player.x].right) maze.player.x++;
  }
  
  if (oldX !== maze.player.x || oldY !== maze.player.y) {
    drawMaze();
    
    if (maze.player.x === maze.goal.x && maze.player.y === maze.goal.y) {
      reachedGoal();
    }
  }
}

function generateMaze() {
  // Initialize grid
  maze.grid = [];
  for (let y = 0; y < maze.rows; y++) {
    maze.grid[y] = [];
    for (let x = 0; x < maze.cols; x++) {
      maze.grid[y][x] = {
        visited: false,
        top: false,
        right: false,
        bottom: false,
        left: false
      };
    }
  }
  
  // Simple maze generation (recursive backtracking)
  const stack = [];
  let current = { x: 1, y: 1 };
  maze.grid[current.y][current.x].visited = true;
  
  while (true) {
    const neighbors = [];
    
    // Check all neighbors
    if (current.y > 1 && !maze.grid[current.y - 2][current.x].visited) {
      neighbors.push({ x: current.x, y: current.y - 2, dir: 'top' });
    }
    if (current.y < maze.rows - 2 && !maze.grid[current.y + 2][current.x].visited) {
      neighbors.push({ x: current.x, y: current.y + 2, dir: 'bottom' });
    }
    if (current.x > 1 && !maze.grid[current.y][current.x - 2].visited) {
      neighbors.push({ x: current.x - 2, y: current.y, dir: 'left' });
    }
    if (current.x < maze.cols - 2 && !maze.grid[current.y][current.x + 2].visited) {
      neighbors.push({ x: current.x + 2, y: current.y, dir: 'right' });
    }
    
    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      stack.push(current);
      
      // Remove walls
      if (next.dir === 'top') {
        maze.grid[current.y][current.x].top = true;
        maze.grid[current.y - 1][current.x].top = true;
        maze.grid[current.y - 1][current.x].bottom = true;
        maze.grid[current.y - 2][current.x].bottom = true;
        maze.grid[current.y - 1][current.x].visited = true;
      } else if (next.dir === 'bottom') {
        maze.grid[current.y][current.x].bottom = true;
        maze.grid[current.y + 1][current.x].bottom = true;
        maze.grid[current.y + 1][current.x].top = true;
        maze.grid[current.y + 2][current.x].top = true;
        maze.grid[current.y + 1][current.x].visited = true;
      } else if (next.dir === 'left') {
        maze.grid[current.y][current.x].left = true;
        maze.grid[current.y][current.x - 1].left = true;
        maze.grid[current.y][current.x - 1].right = true;
        maze.grid[current.y][current.x - 2].right = true;
        maze.grid[current.y][current.x - 1].visited = true;
      } else if (next.dir === 'right') {
        maze.grid[current.y][current.x].right = true;
        maze.grid[current.y][current.x + 1].right = true;
        maze.grid[current.y][current.x + 1].left = true;
        maze.grid[current.y][current.x + 2].left = true;
        maze.grid[current.y][current.x + 1].visited = true;
      }
      
      current = next;
      maze.grid[current.y][current.x].visited = true;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      break;
    }
  }
}

function drawMaze() {
  // White background
  mazeCtx.fillStyle = '#fff';
  mazeCtx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  
  // Draw heart-shaped maze with high contrast
  const centerX = mazeCanvas.width / 2;
  const centerY = mazeCanvas.height / 2;
  
  // Draw maze paths (white) and walls (pink)
  for (let y = 0; y < maze.rows; y++) {
    for (let x = 0; x < maze.cols; x++) {
      const cell = maze.grid[y][x];
      const px = x * maze.cellSize;
      const py = y * maze.cellSize;
      
      // Walkable path - white
      mazeCtx.fillStyle = '#fff';
      mazeCtx.fillRect(px + 2, py + 2, maze.cellSize - 4, maze.cellSize - 4);
      
      // Draw thick pink walls for visibility
      mazeCtx.strokeStyle = '#f48fb1';
      mazeCtx.lineWidth = 8;
      mazeCtx.lineCap = 'round';
      
      if (!cell.top) {
        mazeCtx.beginPath();
        mazeCtx.moveTo(px, py);
        mazeCtx.lineTo(px + maze.cellSize, py);
        mazeCtx.stroke();
      }
      if (!cell.right) {
        mazeCtx.beginPath();
        mazeCtx.moveTo(px + maze.cellSize, py);
        mazeCtx.lineTo(px + maze.cellSize, py + maze.cellSize);
        mazeCtx.stroke();
      }
      if (!cell.bottom) {
        mazeCtx.beginPath();
        mazeCtx.moveTo(px, py + maze.cellSize);
        mazeCtx.lineTo(px + maze.cellSize, py + maze.cellSize);
        mazeCtx.stroke();
      }
      if (!cell.left) {
        mazeCtx.beginPath();
        mazeCtx.moveTo(px, py);
        mazeCtx.lineTo(px, py + maze.cellSize);
        mazeCtx.stroke();
      }
    }
  }
  
  // Draw heart-shaped border
  mazeCtx.strokeStyle = '#f48fb1';
  mazeCtx.lineWidth = 12;
  mazeCtx.beginPath();
  
  // Create heart shape
  const scale = 300;
  const offsetY = 100;
  for (let t = 0; t <= Math.PI * 2; t += 0.01) {
    const x = scale * (16 * Math.pow(Math.sin(t), 3));
    const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    
    if (t === 0) {
      mazeCtx.moveTo(centerX + x, centerY + y/16 + offsetY);
    } else {
      mazeCtx.lineTo(centerX + x, centerY + y/16 + offsetY);
    }
  }
  mazeCtx.closePath();
  mazeCtx.stroke();
  
  // Draw goal (simple guy with flower - matching reference)
  const goalX = maze.goal.x * maze.cellSize + maze.cellSize / 2;
  const goalY = maze.goal.y * maze.cellSize + maze.cellSize / 2;
  
  // Guy - simple minimalist style like reference
  // Brown hair (half circle)
  mazeCtx.fillStyle = '#8B4513';
  mazeCtx.beginPath();
  mazeCtx.arc(goalX, goalY - 10, 8, Math.PI, 0);
  mazeCtx.fill();
  
  // Pink face circle
  mazeCtx.fillStyle = '#ffc0cb';
  mazeCtx.beginPath();
  mazeCtx.arc(goalX, goalY - 10, 7, 0, Math.PI * 2);
  mazeCtx.fill();
  
  // Simple eye dot
  mazeCtx.fillStyle = '#000';
  mazeCtx.beginPath();
  mazeCtx.arc(goalX, goalY - 10, 1, 0, Math.PI * 2);
  mazeCtx.fill();
  
  // Red body (simple rectangle)
  mazeCtx.fillStyle = '#e60012';
  mazeCtx.fillRect(goalX - 8, goalY, 16, 18);
  
  // Pink/red flower
  mazeCtx.fillStyle = '#ff1493';
  mazeCtx.font = '16px Arial';
  mazeCtx.fillText('🌸', goalX - 12, goalY + 8);
  
  // Draw player (simple girl - matching reference)
  const playerX = maze.player.x * maze.cellSize + maze.cellSize / 2;
  const playerY = maze.player.y * maze.cellSize + maze.cellSize / 2;
  
  // Brown hair
  mazeCtx.fillStyle = '#8B4513';
  mazeCtx.beginPath();
  mazeCtx.arc(playerX, playerY - 10, 8, Math.PI, 0);
  mazeCtx.fill();
  
  // Pink face
  mazeCtx.fillStyle = '#ffc0cb';
  mazeCtx.beginPath();
  mazeCtx.arc(playerX, playerY - 10, 7, 0, Math.PI * 2);
  mazeCtx.fill();
  
  // Eye dot
  mazeCtx.fillStyle = '#000';
  mazeCtx.beginPath();
  mazeCtx.arc(playerX, playerY - 10, 1, 0, Math.PI * 2);
  mazeCtx.fill();
  
  // Purple dress (triangle shape)
  mazeCtx.fillStyle = '#6a1b9a';
  mazeCtx.beginPath();
  mazeCtx.moveTo(playerX, playerY);
  mazeCtx.lineTo(playerX - 10, playerY + 18);
  mazeCtx.lineTo(playerX + 10, playerY + 18);
  mazeCtx.closePath();
  mazeCtx.fill();
  
  // Add visible border around characters for clarity
  mazeCtx.strokeStyle = '#000';
  mazeCtx.lineWidth = 2;
  
  // Border around girl
  mazeCtx.beginPath();
  mazeCtx.arc(playerX, playerY - 10, 8, 0, Math.PI * 2);
  mazeCtx.stroke();
  
  // Border around guy
  mazeCtx.beginPath();
  mazeCtx.arc(goalX, goalY - 10, 8, 0, Math.PI * 2);
  mazeCtx.stroke();
}

function reachedGoal() {
  window.removeEventListener('keydown', handleMazeInput);
  showScreen('heartScreen');
}
