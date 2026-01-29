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

// Set canvas size - larger for bigger level
canvas.width = 1200;
canvas.height = 600;

// Game state
const game = {
  hasKey: false,
  hasHeart: false,
  heartBoxIndex: null,
  keys: {},
  animationFrame: null
};

// Mario player with sprite
const mario = {
  x: 50,
  y: 450,
  width: 32,
  height: 32,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpPower: 12,
  onGround: false,
  direction: 'right',
  isWalking: false,
  walkFrame: 0,
  walkTimer: 0,
  sprite: new Image()
};

// Load Mario sprite (SNES style)
mario.sprite.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJRSURBVFhH7ZbPK0RRGIf3mDEzNhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhb+AAs7O1tb/wE7O1s7O/uc885d3HvmzNyZO3f8Vk/de+Y953vPOe+cc/8J/xU7gC3gHHgC3oFr4AQ4BPaB3T9A/wAYB66BN+ADeAWugGNgD9gBtv4AfQOYBi6BR+DdMwzcAEfAHrANbP4B+gbwBTwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8Aw8A8/AM/AMPAPPwDPwDDwDz8Az8P8D/gIJKXmKh5oAAAAASUVORK5CYII=';

// Key object
const key = {
  x: 400,
  y: 350,
  width: 30,
  height: 30,
  collected: false,
  floatOffset: 0
};

// Boxes (mystery boxes) - increased to 10
const boxes = [
  { x: 250, y: 300, width: 40, height: 40, broken: false },
  { x: 350, y: 250, width: 40, height: 40, broken: false },
  { x: 500, y: 300, width: 40, height: 40, broken: false },
  { x: 650, y: 250, width: 40, height: 40, broken: false },
  { x: 800, y: 300, width: 40, height: 40, broken: false },
  { x: 450, y: 180, width: 40, height: 40, broken: false },
  { x: 600, y: 180, width: 40, height: 40, broken: false },
  { x: 900, y: 250, width: 40, height: 40, broken: false },
  { x: 1000, y: 300, width: 40, height: 40, broken: false },
  { x: 750, y: 200, width: 40, height: 40, broken: false }
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

// Castle - moved further right for larger level
const castle = {
  x: 1050,
  y: 300,
  width: 90,
  height: 200
};

// Platforms - expanded for larger level
const platforms = [
  { x: 0, y: 550, width: 1200, height: 50 }, // Ground
  { x: 150, y: 450, width: 120, height: 20 },
  { x: 320, y: 400, width: 100, height: 20 },
  { x: 480, y: 350, width: 120, height: 20 },
  { x: 630, y: 300, width: 100, height: 20 },
  { x: 420, y: 230, width: 90, height: 20 },
  { x: 570, y: 230, width: 90, height: 20 },
  { x: 770, y: 350, width: 120, height: 20 },
  { x: 920, y: 300, width: 100, height: 20 },
  { x: 1030, y: 500, width: 170, height: 20 }
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
  // SNES Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#98d8f8');
  gradient.addColorStop(0.5, '#68b8f0');
  gradient.addColorStop(1, '#98d8f8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // SNES-style rounded clouds
  drawSNESCloud(150, 80, 60);
  drawSNESCloud(450, 120, 70);
  drawSNESCloud(750, 90, 65);
  drawSNESCloud(1050, 110, 60);

  // Sun
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(1100, 80, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawSNESCloud(x, y, size) {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  // Main body
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.6, y, size * 0.6, 0, Math.PI * 2);
  ctx.arc(x + size * 1.2, y, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlatforms() {
  platforms.forEach(platform => {
    // Brown dirt base
    ctx.fillStyle = '#d88028';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Grass layer on top
    ctx.fillStyle = '#00c800';
    ctx.fillRect(platform.x, platform.y, platform.width, 10);
    
    // Grass blades detail
    ctx.fillStyle = '#00d000';
    for (let i = platform.x; i < platform.x + platform.width; i += 8) {
      ctx.fillRect(i, platform.y + 2, 3, 6);
      ctx.fillRect(i + 4, platform.y + 3, 3, 5);
    }
    
    // Dark outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    
    // Dirt texture
    ctx.fillStyle = '#c87020';
    for (let i = platform.x + 10; i < platform.x + platform.width; i += 20) {
      for (let j = platform.y + 15; j < platform.y + platform.height - 5; j += 15) {
        ctx.fillRect(i, j, 4, 4);
      }
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

  // Try to draw sprite, fallback to simple Mario if not loaded
  if (mario.sprite.complete && mario.sprite.naturalWidth > 0) {
    // Draw Mario sprite
    const spriteX = mario.walkFrame * 16; // Assuming 16x16 sprite frames
    ctx.drawImage(mario.sprite, spriteX, 0, 16, 16, 0, 0, mario.width, mario.height);
  } else {
    // Fallback - Classic Mario style
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
let fadeAlpha = 0;
let fadeComplete = false;

function reachedCastle() {
  cancelAnimationFrame(game.animationFrame);
  fadeToBlack();
}

function fadeToBlack() {
  // Continue drawing game one last time
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlatforms();
  drawCastle();
  drawBoxes();
  drawKey();
  drawHeart();
  drawMario();
  
  // Draw fade overlay
  ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  fadeAlpha += 0.01;
  
  if (fadeAlpha >= 1 && !fadeComplete) {
    fadeComplete = true;
    showFinalMessage();
  } else if (fadeAlpha < 1) {
    requestAnimationFrame(fadeToBlack);
  }
}

function showFinalMessage() {
  // Black screen
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // White text
  ctx.fillStyle = '#fff';
  ctx.font = '24px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('You have finished', canvas.width / 2, canvas.height / 2 - 40);
  ctx.fillText('the first game.', canvas.width / 2, canvas.height / 2);
  ctx.fillText('Now it\'s time for', canvas.width / 2, canvas.height / 2 + 40);
  ctx.fillText('another game.', canvas.width / 2, canvas.height / 2 + 80);
}
