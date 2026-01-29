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
}

// ===== GAME INITIALIZATION =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
const game = {
  hasKey: false,
  hasHeart: false,
  heartBoxIndex: null,
  keys: {},
  animationFrame: null
};

// Mario player
const mario = {
  x: 50,
  y: 450,
  width: 32,
  height: 32,
  velocityX: 0,
  velocityY: 0,
  speed: 4,
  jumpPower: 11,
  onGround: false,
  direction: 'right',
  isWalking: false,
  walkFrame: 0,
  walkTimer: 0
};

// Key object
const key = {
  x: 300,
  y: 400,
  width: 30,
  height: 30,
  collected: false,
  floatOffset: 0
};

// Boxes (mystery boxes)
const boxes = [
  { x: 200, y: 300, width: 40, height: 40, broken: false },
  { x: 300, y: 250, width: 40, height: 40, broken: false },
  { x: 450, y: 300, width: 40, height: 40, broken: false },
  { x: 550, y: 250, width: 40, height: 40, broken: false },
  { x: 650, y: 300, width: 40, height: 40, broken: false }
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
  x: 700,
  y: 300,
  width: 90,
  height: 200
};

// Platforms
const platforms = [
  { x: 0, y: 550, width: 800, height: 50 }, // Ground
  { x: 150, y: 450, width: 120, height: 20 },
  { x: 280, y: 350, width: 100, height: 20 },
  { x: 420, y: 400, width: 120, height: 20 },
  { x: 550, y: 350, width: 100, height: 20 },
  { x: 680, y: 500, width: 120, height: 20 }
];

const gravity = 0.6;

// ===== INITIALIZATION =====
function initGame() {
  // Reset game state
  game.hasKey = false;
  game.hasHeart = false;
  mario.x = 50;
  mario.y = 450;
  mario.velocityX = 0;
  mario.velocityY = 0;
  key.collected = false;
  heart.collected = false;
  heart.falling = false;
  
  // Randomize which box has the heart
  game.heartBoxIndex = Math.floor(Math.random() * boxes.length);
  
  // Reset all boxes
  boxes.forEach(box => box.broken = false);
  
  // Update HUD
  updateHUD();
  
  // Start game loop
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
function updateMario() {
  // Horizontal movement
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

  // Walking animation
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

  // Jumping
  if (game.keys[' '] && mario.onGround) {
    mario.velocityY = -mario.jumpPower;
    mario.onGround = false;
  }

  // Apply gravity
  mario.velocityY += gravity;

  // Update position
  mario.x += mario.velocityX;
  mario.y += mario.velocityY;

  // Keep Mario in bounds
  if (mario.x < 0) mario.x = 0;
  if (mario.x + mario.width > canvas.width) mario.x = canvas.width - mario.width;

  // Platform collision
  mario.onGround = false;
  
  platforms.forEach(platform => {
    // Landing on top
    if (mario.velocityY >= 0 &&
        mario.x + mario.width > platform.x &&
        mario.x < platform.x + platform.width &&
        mario.y + mario.height >= platform.y &&
        mario.y + mario.height <= platform.y + 20) {
      
      mario.y = platform.y - mario.height;
      mario.velocityY = 0;
      mario.onGround = true;
    }
  });

  // Check box collision from below (jumping into boxes)
  if (game.hasKey && mario.velocityY < 0) {
    boxes.forEach((box, index) => {
      if (!box.broken &&
          mario.x + mario.width > box.x &&
          mario.x < box.x + box.width &&
          mario.y <= box.y + box.height &&
          mario.y >= box.y) {
        
        box.broken = true;
        
        // If this is the heart box, spawn the heart
        if (index === game.heartBoxIndex) {
          heart.x = box.x + 7.5;
          heart.y = box.y - 30;
          heart.falling = true;
          heart.velocityY = -5;
        }
      }
    });
  }

  // Key collection
  if (!key.collected &&
      mario.x + mario.width > key.x &&
      mario.x < key.x + key.width &&
      mario.y + mario.height > key.y &&
      mario.y < key.y + key.height) {
    
    key.collected = true;
    game.hasKey = true;
    updateHUD();
  }

  // Heart collection
  if (!heart.collected && heart.falling &&
      mario.x + mario.width > heart.x &&
      mario.x < heart.x + heart.width &&
      mario.y + mario.height > heart.y &&
      mario.y < heart.y + heart.height) {
    
    heart.collected = true;
    game.hasHeart = true;
    updateHUD();
  }

  // Castle collision (if has heart)
  if (game.hasHeart &&
      mario.x + mario.width > castle.x &&
      mario.x < castle.x + castle.width &&
      mario.y + mario.height > castle.y &&
      mario.y < castle.y + castle.height) {
    
    // Reached castle with heart!
    reachedCastle();
  }
}

function updateHeart() {
  if (heart.falling && !heart.collected) {
    heart.velocityY += gravity;
    heart.y += heart.velocityY;

    // Check platform collision for heart
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

  // Floating animation for heart
  if (!heart.collected) {
    heart.floatOffset = Math.sin(Date.now() / 200) * 5;
  }
}

function updateKey() {
  // Floating animation for key
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
  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#5c94fc');
  gradient.addColorStop(1, '#87CEEB');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clouds
  drawCloud(100, 80, 40);
  drawCloud(350, 120, 50);
  drawCloud(600, 90, 45);

  // Sun
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(700, 80, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawCloud(x, y, size) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
  ctx.arc(x + size * 0.5, y, size * 0.7, 0, Math.PI * 2);
  ctx.arc(x + size, y, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlatforms() {
  platforms.forEach(platform => {
    // Brown brick
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Grass on top
    ctx.fillStyle = '#00d900';
    ctx.fillRect(platform.x, platform.y, platform.width, 8);
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    
    // Brick lines
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = platform.x; i < platform.x + platform.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, platform.y);
      ctx.lineTo(i, platform.y + platform.height);
      ctx.stroke();
    }
  });
}

function drawMario() {
  ctx.save();
  
  // Flip for direction
  if (mario.direction === 'left') {
    ctx.translate(mario.x + mario.width, mario.y);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(mario.x, mario.y);
  }

  // Hat (red)
  ctx.fillStyle = '#e60012';
  ctx.fillRect(0, 0, mario.width, 12);
  
  // Hat brim
  ctx.fillRect(-2, 10, mario.width + 4, 4);

  // Face (skin)
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(4, 14, mario.width - 8, 14);

  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(8, 16, 4, 4);
  ctx.fillRect(20, 16, 4, 4);

  // Mustache
  ctx.fillRect(6, 22, 20, 4);

  // Shirt (red)
  ctx.fillStyle = '#e60012';
  ctx.fillRect(4, 28, mario.width - 8, 4);

  // Overalls (blue)
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(0, 32, mario.width, mario.height - 32);

  // Buttons
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(8, 30, 3, 3);
  ctx.fillRect(21, 30, 3, 3);

  // Legs (walking animation)
  ctx.fillStyle = '#0000ff';
  if (mario.walkFrame === 1 && mario.isWalking) {
    ctx.fillRect(2, mario.height - 8, 12, 8);
    ctx.fillRect(18, mario.height - 8, 12, 8);
  } else {
    ctx.fillRect(6, mario.height - 8, 9, 8);
    ctx.fillRect(17, mario.height - 8, 9, 8);
  }

  // If holding heart, draw it with Mario
  if (game.hasHeart && heart.collected) {
    ctx.fillStyle = '#ff69b4';
    ctx.font = '20px Arial';
    ctx.fillText('💖', mario.width + 5, 20);
  }

  ctx.restore();
}

function drawKey() {
  if (key.collected) return;

  const drawY = key.y + key.floatOffset;

  // Key glow
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#FFD700';

  // Key body
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(key.x, drawY + 10, 20, 8);

  // Key head (circle)
  ctx.beginPath();
  ctx.arc(key.x + 5, drawY + 14, 8, 0, Math.PI * 2);
  ctx.fill();

  // Key teeth
  ctx.fillRect(key.x + 20, drawY + 10, 4, 4);
  ctx.fillRect(key.x + 25, drawY + 14, 4, 4);

  // Border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.stroke();

  ctx.shadowBlur = 0;
}

function drawBoxes() {
  boxes.forEach(box => {
    if (box.broken) {
      // Broken box pieces
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(box.x - 5, box.y + 5, 15, 15);
      ctx.fillRect(box.x + 30, box.y + 5, 15, 15);
      return;
    }

    // Mystery box (yellow with question mark)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(box.x, box.y, box.width, box.height);

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Question mark
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('?', box.x + 12, box.y + 30);

    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(box.x + 5, box.y + 5, 10, 10);
  });
}

function drawHeart() {
  if (heart.collected) return;
  if (!heart.falling && !heart.collected) return;

  const drawY = heart.falling ? heart.y : heart.y + heart.floatOffset;

  // Heart glow
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#ff69b4';

  ctx.fillStyle = '#ff69b4';
  ctx.font = '30px Arial';
  ctx.fillText('💖', heart.x, drawY + 25);

  ctx.shadowBlur = 0;
}

function drawCastle() {
  // Castle body
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(castle.x, castle.y, castle.width, castle.height);

  // Castle walls detail
  ctx.fillStyle = '#A0522D';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(castle.x + 10 + i * 30, castle.y + 20, 20, 40);
  }

  // Door
  ctx.fillStyle = '#654321';
  const doorX = castle.x + 25;
  const doorY = castle.y + castle.height - 80;
  ctx.fillRect(doorX, doorY, 40, 80);

  // Door arch
  ctx.beginPath();
  ctx.arc(doorX + 20, doorY, 20, Math.PI, 0);
  ctx.fill();

  // Door frame
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(doorX, doorY, 40, 80);

  // Windows
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(castle.x + 15, castle.y + 80, 20, 25);
  ctx.fillRect(castle.x + 55, castle.y + 80, 20, 25);

  // Window frames
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(castle.x + 15, castle.y + 80, 20, 25);
  ctx.strokeRect(castle.x + 55, castle.y + 80, 20, 25);

  // Tower tops
  ctx.fillStyle = '#e60012';
  
  // Left tower
  ctx.beginPath();
  ctx.moveTo(castle.x - 5, castle.y);
  ctx.lineTo(castle.x + 15, castle.y - 30);
  ctx.lineTo(castle.x + 35, castle.y);
  ctx.fill();

  // Right tower
  ctx.beginPath();
  ctx.moveTo(castle.x + 55, castle.y);
  ctx.lineTo(castle.x + 75, castle.y - 30);
  ctx.lineTo(castle.x + 95, castle.y);
  ctx.fill();

  // Flag
  ctx.fillStyle = '#e60012';
  ctx.fillRect(castle.x + 75, castle.y - 30, 15, 10);
  
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(castle.x + 75, castle.y - 30);
  ctx.lineTo(castle.x + 75, castle.y);
  ctx.stroke();

  // Door indicator
  if (game.hasHeart) {
    ctx.fillStyle = '#00ff00';
    ctx.font = '20px Arial';
    ctx.fillText('✨', doorX + 12, doorY + 40);
  } else {
    ctx.fillStyle = '#ff0000';
    ctx.font = '20px Arial';
    ctx.fillText('🔒', doorX + 12, doorY + 40);
  }
}

// ===== GAME LOOP =====
function gameLoop() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw everything
  drawBackground();
  drawPlatforms();
  drawCastle();
  drawBoxes();
  drawKey();
  drawHeart();
  drawMario();

  // Update everything
  updateMario();
  updateKey();
  updateHeart();

  // Continue loop
  game.animationFrame = requestAnimationFrame(gameLoop);
}

// ===== CASTLE REACHED =====
function reachedCastle() {
  cancelAnimationFrame(game.animationFrame);
  
  // Clear canvas and show final message
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#fff';
  ctx.font = '24px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('YOU REACHED', canvas.width / 2, canvas.height / 2 - 40);
  ctx.fillText('THE CASTLE!', canvas.width / 2, canvas.height / 2);
  ctx.fillText('💖', canvas.width / 2, canvas.height / 2 + 60);
  
  // Stop here as per requirements
}
