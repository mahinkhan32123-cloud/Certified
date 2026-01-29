const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
const game = {
  hasKey: false,
  won: false
};

// Player (Mario)
const player = {
  x: 50,
  y: 400,
  width: 32,
  height: 32,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpPower: 12,
  onGround: false,
  color: '#e60012'
};

// Key
const key = {
  x: 600,
  y: 300,
  width: 30,
  height: 30,
  collected: false
};

// Castle
const castle = {
  x: 700,
  y: 350,
  width: 80,
  height: 150
};

// Platforms
const platforms = [
  { x: 0, y: 550, width: 800, height: 50 }, // Ground
  { x: 200, y: 450, width: 150, height: 20 }, // Platform 1
  { x: 450, y: 350, width: 150, height: 20 }, // Platform 2 (key here)
  { x: 650, y: 500, width: 150, height: 20 }  // Platform 3 (castle here)
];

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ' || e.key === 'ArrowUp') {
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Physics
const gravity = 0.5;

function updatePlayer() {
  // Horizontal movement
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
    player.velocityX = -player.speed;
  } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
    player.velocityX = player.speed;
  } else {
    player.velocityX = 0;
  }

  // Jumping
  if ((keys['ArrowUp'] || keys[' '] || keys['w'] || keys['W']) && player.onGround) {
    player.velocityY = -player.jumpPower;
    player.onGround = false;
  }

  // Apply gravity
  player.velocityY += gravity;

  // Update position
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Keep player in bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  // Platform collision
  player.onGround = false;
  
  platforms.forEach(platform => {
    if (player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height >= platform.y &&
        player.y + player.height <= platform.y + platform.height &&
        player.velocityY >= 0) {
      
      player.y = platform.y - player.height;
      player.velocityY = 0;
      player.onGround = true;
    }
  });

  // Check key collection
  if (!key.collected &&
      player.x + player.width > key.x &&
      player.x < key.x + key.width &&
      player.y + player.height > key.y &&
      player.y < key.y + key.height) {
    
    key.collected = true;
    game.hasKey = true;
    document.getElementById('message').style.display = 'none';
    document.getElementById('hasKey').style.display = 'block';
  }

  // Check castle collision (only if has key)
  if (game.hasKey && !game.won &&
      player.x + player.width > castle.x &&
      player.x < castle.x + castle.width &&
      player.y + player.height > castle.y &&
      player.y < castle.y + castle.height) {
    
    game.won = true;
    document.getElementById('winScreen').style.display = 'flex';
  }
}

function drawPlayer() {
  // Draw Mario (red with hat)
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  // Hat
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x - 4, player.y - 8, player.width + 8, 10);
  
  // Face (skin color)
  ctx.fillStyle = '#fdbcb4';
  ctx.fillRect(player.x + 6, player.y + 8, player.width - 12, 14);
  
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(player.x + 10, player.y + 12, 4, 4);
  ctx.fillRect(player.x + 18, player.y + 12, 4, 4);
  
  // Mustache
  ctx.fillStyle = '#000';
  ctx.fillRect(player.x + 8, player.y + 18, 16, 3);
}

function drawKey() {
  if (key.collected) return;
  
  // Key body
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(key.x, key.y + 10, 20, 8);
  
  // Key head
  ctx.beginPath();
  ctx.arc(key.x + 5, key.y + 14, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd700';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Key teeth
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(key.x + 20, key.y + 10, 4, 4);
  ctx.fillRect(key.x + 25, key.y + 14, 4, 4);
  
  // Shine effect
  ctx.fillStyle = '#fff';
  ctx.fillRect(key.x + 3, key.y + 12, 3, 3);
}

function drawCastle() {
  // Castle body
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
  
  // Castle door
  ctx.fillStyle = '#654321';
  ctx.fillRect(castle.x + 25, castle.y + 80, 30, 70);
  
  // Door frame
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(castle.x + 25, castle.y + 80, 30, 70);
  
  // Tower tops
  ctx.fillStyle = '#e60012';
  ctx.beginPath();
  ctx.moveTo(castle.x - 5, castle.y);
  ctx.lineTo(castle.x + 15, castle.y - 30);
  ctx.lineTo(castle.x + 35, castle.y);
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(castle.x + 45, castle.y);
  ctx.lineTo(castle.x + 65, castle.y - 30);
  ctx.lineTo(castle.x + 85, castle.y);
  ctx.fill();
  
  // Windows
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(castle.x + 15, castle.y + 30, 15, 20);
  ctx.fillRect(castle.x + 50, castle.y + 30, 15, 20);
  
  // Window frames
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(castle.x + 15, castle.y + 30, 15, 20);
  ctx.strokeRect(castle.x + 50, castle.y + 30, 15, 20);
  
  // Flag
  ctx.fillStyle = '#e60012';
  ctx.fillRect(castle.x + 65, castle.y - 30, 15, 10);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(castle.x + 65, castle.y - 30);
  ctx.lineTo(castle.x + 65, castle.y);
  ctx.stroke();
  
  // Heart on door (if player has key)
  if (game.hasKey) {
    ctx.fillStyle = '#ff69b4';
    ctx.font = '20px Arial';
    ctx.fillText('💖', castle.x + 30, castle.y + 120);
  } else {
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('🔒', castle.x + 30, castle.y + 120);
  }
}

function drawPlatforms() {
  ctx.fillStyle = '#8B4513';
  platforms.forEach(platform => {
    // Platform
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Grass on top
    ctx.fillStyle = '#00d900';
    ctx.fillRect(platform.x, platform.y, platform.width, 5);
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    
    ctx.fillStyle = '#8B4513';
  });
}

function drawBackground() {
  // Sky
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Clouds
  drawCloud(100, 80, 40);
  drawCloud(300, 120, 50);
  drawCloud(550, 90, 45);
  
  // Sun
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(700, 80, 40, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(x, y, size) {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
  ctx.arc(x + size * 0.5, y, size * 0.7, 0, Math.PI * 2);
  ctx.arc(x + size, y, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  if (!game.won) {
    // Clear canvas
    drawBackground();
    
    // Draw game elements
    drawPlatforms();
    drawKey();
    drawCastle();
    drawPlayer();
    
    // Update player
    updatePlayer();
    
    requestAnimationFrame(gameLoop);
  }
}

// Valentine's Day question handlers
function moveNoBtn() {
  const noBtn = document.getElementById('noBtn');
  const maxX = 200;
  const maxY = 100;
  const randomX = Math.random() * maxX - maxX/2;
  const randomY = Math.random() * maxY - maxY/2;
  noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
}

function celebrate() {
  document.getElementById('winScreen').style.display = 'none';
  document.getElementById('celebrationScreen').style.display = 'flex';
}

// Start game
gameLoop();
