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
  levelWidth: 3000, // Much wider level!
  lastSafePlatform: null,
  checkpoints: [
    { x: 500, passed: false },
    { x: 1200, passed: false },
    { x: 1900, passed: false },
    { x: 2400, passed: false }
  ],
  currentCheckpoint: { x: 100, y: 450 } // Starting position
};

// Mario player - 8-bit style, no external sprites
const mario = {
  x: 100,
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
  walkTimer: 0
};

// Key object - easier to reach position
const key = {
  x: 300,
  y: 520,  // On the ground, easy to get!
  width: 30,
  height: 30,
  collected: false,
  floatOffset: 0
};

// Boxes (mystery boxes) - spread across WIDE level
const boxes = [
  { x: 500, y: 300, width: 40, height: 40, broken: false },
  { x: 750, y: 250, width: 40, height: 40, broken: false },
  { x: 1100, y: 300, width: 40, height: 40, broken: false },
  { x: 1400, y: 250, width: 40, height: 40, broken: false },
  { x: 1700, y: 300, width: 40, height: 40, broken: false },
  { x: 950, y: 180, width: 40, height: 40, broken: false },
  { x: 1250, y: 180, width: 40, height: 40, broken: false },
  { x: 1900, y: 250, width: 40, height: 40, broken: false },
  { x: 2200, y: 300, width: 40, height: 40, broken: false },
  { x: 1550, y: 200, width: 40, height: 40, broken: false }
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

// Castle - at the end of the level
const castle = {
  x: 2700,
  y: 300,
  width: 90,
  height: 200
};

// Platforms - spread across wide level
const platforms = [
  { x: 0, y: 550, width: 3000, height: 50 }, // Ground
  { x: 200, y: 450, width: 150, height: 20 },
  { x: 450, y: 400, width: 120, height: 20 },
  { x: 700, y: 350, width: 130, height: 20 },
  { x: 920, y: 300, width: 120, height: 20 },
  { x: 650, y: 230, width: 100, height: 20 },
  { x: 900, y: 230, width: 100, height: 20 },
  { x: 1150, y: 350, width: 130, height: 20 },
  { x: 1350, y: 300, width: 120, height: 20 },
  { x: 1600, y: 350, width: 130, height: 20 },
  { x: 1200, y: 230, width: 110, height: 20 },
  { x: 1500, y: 250, width: 100, height: 20 },
  { x: 1850, y: 300, width: 130, height: 20 },
  { x: 2100, y: 350, width: 120, height: 20 },
  { x: 2350, y: 400, width: 130, height: 20 },
  { x: 2650, y: 500, width: 350, height: 20 }
];

const gravity = 0.6;

// ===== INITIALIZATION =====
function initGame() {
  // Reset game state
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
  
  // Reset checkpoints
  game.checkpoints.forEach(cp => cp.passed = false);
  game.currentCheckpoint = { x: 100, y: 450 };
  game.lastSafePlatform = null;
  
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
function updateCamera() {
  // Keep Mario near center of screen
  const targetX = mario.x - camera.width / 2 + mario.width / 2;
  
  // Smooth camera follow
  camera.x += (targetX - camera.x) * camera.followSpeed;
  
  // Clamp camera to level bounds
  if (camera.x < 0) camera.x = 0;
  if (camera.x > game.levelWidth - camera.width) {
    camera.x = game.levelWidth - camera.width;
  }
}

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

  // Keep Mario in level bounds
  if (mario.x < 0) mario.x = 0;
  if (mario.x + mario.width > game.levelWidth) {
    mario.x = game.levelWidth - mario.width;
  }

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
      
      // Update last safe platform
      game.lastSafePlatform = {
        x: platform.x + platform.width / 2,
        y: platform.y - mario.height
      };
    }
  });
  
  // Check for falling off the level
  if (mario.y > canvas.height + 100) {
    // Respawn at last checkpoint or safe platform
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
  
  // Check checkpoints
  game.checkpoints.forEach(checkpoint => {
    if (!checkpoint.passed && mario.x > checkpoint.x) {
      checkpoint.passed = true;
      game.currentCheckpoint = {
        x: checkpoint.x,
        y: 450
      };
    }
  });

  // Check box collision from below - ALWAYS BREAKABLE (no key needed!)
  if (mario.velocityY < 0) {
    boxes.forEach((box, index) => {
      if (!box.broken) {
        // More forgiving collision detection
        const horizontalOverlap = mario.x + mario.width > box.x - 10 && 
                                  mario.x < box.x + box.width + 10;
        const verticalCollision = mario.y <= box.y + box.height + 5 &&
                                 mario.y >= box.y - 5;
        
        if (horizontalOverlap && verticalCollision) {
          box.broken = true;
          mario.velocityY = 2; // Small bounce
          
          // If this is the heart box, spawn the heart
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

  // SNES-style rounded clouds (parallax)
  const cloudOffset = camera.x * 0.5;
  drawSNESCloud(150 - cloudOffset, 80, 60);
  drawSNESCloud(450 - cloudOffset, 120, 70);
  drawSNESCloud(750 - cloudOffset, 90, 65);
  drawSNESCloud(1100 - cloudOffset, 110, 60);
  drawSNESCloud(1450 - cloudOffset, 85, 65);
  drawSNESCloud(1800 - cloudOffset, 105, 70);

  // Sun
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
    ctx.fillRect(platform.x - camera.x, platform.y, platform.width, platform.height);
    
    // Grass layer on top
    ctx.fillStyle = '#00c800';
    ctx.fillRect(platform.x - camera.x, platform.y, platform.width, 10);
    
    // Grass blades detail
    ctx.fillStyle = '#00d000';
    for (let i = platform.x; i < platform.x + platform.width; i += 8) {
      ctx.fillRect(i - camera.x, platform.y + 2, 3, 6);
      ctx.fillRect(i + 4 - camera.x, platform.y + 3, 3, 5);
    }
    
    // Dark outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x - camera.x, platform.y, platform.width, platform.height);
    
    // Dirt texture
    ctx.fillStyle = '#c87020';
    for (let i = platform.x + 10; i < platform.x + platform.width; i += 20) {
      for (let j = platform.y + 15; j < platform.y + platform.height - 5; j += 15) {
        ctx.fillRect(i - camera.x, j, 4, 4);
      }
    }
  });
}

function draw8BitMario() {
  const drawX = mario.x - camera.x;
  const drawY = mario.y;
  
  ctx.save();
  
  // Flip for direction
  if (mario.direction === 'left') {
    ctx.translate(drawX + mario.width, drawY);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(drawX, drawY);
  }

  const p = 2; // Smaller pixels for more detail (16x16 grid now)
  
  // Better proportioned Mario sprite
  
  // Row 0-1: Hat top
  ctx.fillStyle = '#e60012';
  ctx.fillRect(p * 5, 0, p * 6, p);
  ctx.fillRect(p * 4, p, p * 8, p);
  
  // Row 2-3: Hat brim and top of face
  ctx.fillRect(p * 3, p * 2, p * 10, p);
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 4, p * 3, p, p);
  ctx.fillRect(p * 11, p * 3, p, p);
  ctx.fillStyle = '#e60012';
  ctx.fillRect(p * 5, p * 3, p * 6, p);
  
  // Row 4: Eyes and face
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 3, p * 4, p * 2, p);
  ctx.fillStyle = '#FFF'; // White of eyes
  ctx.fillRect(p * 5, p * 4, p * 2, p);
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 7, p * 4, p, p);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(p * 8, p * 4, p * 2, p);
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 10, p * 4, p * 3, p);
  
  // Row 5: Pupils and nose
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 3, p * 5, p * 2, p);
  ctx.fillStyle = '#000'; // Left pupil
  ctx.fillRect(p * 5, p * 5, p, p);
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 6, p * 5, p, p);
  ctx.fillStyle = '#000'; // Nose
  ctx.fillRect(p * 7, p * 5, p, p);
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 8, p * 5, p, p);
  ctx.fillStyle = '#000'; // Right pupil
  ctx.fillRect(p * 9, p * 5, p, p);
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 10, p * 5, p * 3, p);
  
  // Row 6: Mustache top
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 3, p * 6, p, p);
  ctx.fillStyle = '#8B4513'; // Brown mustache
  ctx.fillRect(p * 4, p * 6, p * 8, p);
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 12, p * 6, p, p);
  
  // Row 7: Mustache bottom
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 2, p * 7, p * 2, p);
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(p * 4, p * 7, p * 8, p);
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 12, p * 7, p * 2, p);
  
  // Row 8: Mouth/chin
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(p * 4, p * 8, p * 8, p);
  
  // Row 9-10: Shirt
  ctx.fillStyle = '#e60012';
  ctx.fillRect(p * 4, p * 9, p * 8, p);
  ctx.fillRect(p * 3, p * 10, p * 10, p);
  
  // Row 11-12: Overalls with buttons
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(p * 2, p * 11, p * 3, p);
  ctx.fillStyle = '#FFD700'; // Left button
  ctx.fillRect(p * 5, p * 11, p, p);
  ctx.fillStyle = '#e60012';
  ctx.fillRect(p * 6, p * 11, p * 4, p);
  ctx.fillStyle = '#FFD700'; // Right button
  ctx.fillRect(p * 10, p * 11, p, p);
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(p * 11, p * 11, p * 3, p);
  
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(p * 2, p * 12, p * 12, p);
  
  // Row 13-14: Overalls bottom
  ctx.fillRect(p * 3, p * 13, p * 10, p);
  ctx.fillRect(p * 4, p * 14, p * 8, p);
  
  // Row 15: Legs with walking animation
  ctx.fillStyle = '#0000ff';
  if (mario.walkFrame === 1 && mario.isWalking) {
    // Walking - legs spread
    ctx.fillRect(p * 3, p * 15, p * 4, p);
    ctx.fillRect(p * 9, p * 15, p * 4, p);
  } else {
    // Standing - legs together
    ctx.fillRect(p * 5, p * 15, p * 3, p);
    ctx.fillRect(p * 8, p * 15, p * 3, p);
  }

  // If holding heart, draw it
  if (game.hasHeart && heart.collected) {
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 24px Arial';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff69b4';
    ctx.fillText('💖', mario.width + 2, 20);
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawKey() {
  if (key.collected) return;

  const drawY = key.y + key.floatOffset;
  const drawX = key.x - camera.x;

  // Outer glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#FFD700';

  // Draw Mario-style Power Key (star-like)
  const centerX = drawX + 15;
  const centerY = drawY + 15;
  const spikes = 5;
  const outerRadius = 15;
  const innerRadius = 7;

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / spikes;
    const x = centerX + Math.cos(angle - Math.PI / 2) * radius;
    const y = centerY + Math.sin(angle - Math.PI / 2) * radius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();

  // Fill with gradient
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius);
  gradient.addColorStop(0, '#FFF');
  gradient.addColorStop(0.5, '#FFD700');
  gradient.addColorStop(1, '#FFA500');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 0;
  ctx.stroke();

  // Center sparkle
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
  ctx.fill();

  // "KEY" text or symbol
  ctx.fillStyle = '#000';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('K', centerX, centerY + 4);

  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

function drawBoxes() {
  boxes.forEach(box => {
    const drawX = box.x - camera.x;
    
    if (box.broken) {
      // Broken box pieces
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(drawX - 5, box.y + 5, 15, 15);
      ctx.fillRect(drawX + 30, box.y + 5, 15, 15);
      return;
    }

    // Mystery box (yellow with question mark)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(drawX, box.y, box.width, box.height);

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(drawX, box.y, box.width, box.height);

    // Question mark
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('?', drawX + 12, box.y + 30);

    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(drawX + 5, box.y + 5, 10, 10);
  });
}

function drawHeart() {
  if (heart.collected) return;
  if (!heart.falling && !heart.collected) return;

  const drawY = heart.falling ? heart.y : heart.y + heart.floatOffset;
  const drawX = heart.x - camera.x;

  // Heart glow
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
  
  // Background towers (symmetry)
  ctx.fillStyle = '#E8D5B7';
  ctx.fillRect(drawX - 5, baseY + 80, 25, 120);
  ctx.fillRect(drawX + 70, baseY + 80, 25, 120);
  
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX - 5, baseY + 80, 25, 120);
  ctx.strokeRect(drawX + 70, baseY + 80, 25, 120);
  
  // Main castle body (larger, more impressive)
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(drawX + 5, baseY + 50, 80, 150);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(drawX + 5, baseY + 50, 80, 150);
  
  // Castle bricks pattern
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
  
  // Side towers
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(drawX - 5, baseY + 80, 15, 120);
  ctx.fillRect(drawX + 80, baseY + 80, 15, 120);
  
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(drawX - 5, baseY + 80, 15, 120);
  ctx.strokeRect(drawX + 80, baseY + 80, 15, 120);
  
  // Center tower (tallest)
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(drawX + 30, baseY, 30, 60);
  ctx.strokeRect(drawX + 30, baseY, 30, 60);
  
  // RED ROOFS - Mario 64 style
  ctx.fillStyle = '#DC143C';
  
  // Left tower roof (cone)
  ctx.beginPath();
  ctx.moveTo(drawX - 8, baseY + 80);
  ctx.lineTo(drawX + 2.5, baseY + 50);
  ctx.lineTo(drawX + 13, baseY + 80);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8B0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Add roof lines
  ctx.strokeStyle = '#8B0000';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(drawX - 8 + i * 3.5, baseY + 80 - i * 5);
    ctx.lineTo(drawX + 13 - i * 3.5, baseY + 80 - i * 5);
    ctx.stroke();
  }
  
  // Right tower roof
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
  
  // Center tower roof (tallest)
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
  
  // Main roof
  ctx.fillStyle = '#DC143C';
  ctx.beginPath();
  ctx.moveTo(drawX, baseY + 50);
  ctx.lineTo(drawX + 45, baseY + 15);
  ctx.lineTo(drawX + 90, baseY + 50);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Peach's pink flag with crown
  ctx.fillStyle = '#ff69b4';
  ctx.fillRect(drawX + 45, baseY - 35, 3, 35);
  
  // Flag cloth
  ctx.fillRect(drawX + 48, baseY - 33, 18, 12);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX + 48, baseY - 33, 18, 12);
  
  // Crown on flag
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 10px Arial';
  ctx.fillText('👑', drawX + 50, baseY - 23);
  
  // Grand entrance door (larger)
  const doorX = drawX + 27;
  const doorY = baseY + 140;
  const doorWidth = 36;
  const doorHeight = 60;
  
  // Door decoration frame
  ctx.fillStyle = '#C19A6B';
  ctx.fillRect(doorX - 3, doorY - 3, doorWidth + 6, doorHeight + 3);
  
  // Door itself
  ctx.fillStyle = '#654321';
  ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
  
  // Arched top
  ctx.beginPath();
  ctx.arc(doorX + doorWidth / 2, doorY, doorWidth / 2, Math.PI, 0);
  ctx.fill();
  
  // Door panels
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 2;
  ctx.strokeRect(doorX + 4, doorY + 5, doorWidth - 8, doorHeight - 10);
  ctx.strokeRect(doorX + 8, doorY + 10, doorWidth - 16, doorHeight - 20);
  
  // Door frame outline
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);
  
  // Door handle
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(doorX + doorWidth - 8, doorY + doorHeight / 2, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Beautiful arched windows
  ctx.fillStyle = '#87CEEB';
  
  // Left window
  const winX1 = drawX + 12;
  const winY = baseY + 100;
  ctx.fillRect(winX1, winY, 18, 28);
  ctx.beginPath();
  ctx.arc(winX1 + 9, winY, 9, Math.PI, 0);
  ctx.fill();
  
  // Window panes
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
  
  // Right window
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
  
  // Top window (center tower)
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(drawX + 37, baseY + 20, 16, 25);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX + 37, baseY + 20, 16, 25);
  ctx.beginPath();
  ctx.moveTo(drawX + 45, baseY + 20);
  ctx.lineTo(drawX + 45, baseY + 45);
  ctx.stroke();
  
  // Star or lock on door based on progress
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
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update camera
  updateCamera();

  // Draw everything
  drawBackground();
  drawPlatforms();
  drawCastle();
  drawBoxes();
  drawKey();
  drawHeart();
  draw8BitMario();

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
  
  updateCamera();
  
  drawBackground();
  drawPlatforms();
  drawCastle();
  drawBoxes();
  drawKey();
  drawHeart();
  draw8BitMario();
  
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
  ctx.font = '20px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('You have finished', canvas.width / 2, canvas.height / 2 - 60);
  ctx.fillText('the first game.', canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText('Now it\'s time for', canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText('another game.', canvas.width / 2, canvas.height / 2 + 60);
}
