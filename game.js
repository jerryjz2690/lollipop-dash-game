// --- Game Initialization ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40; // Size of grid squares
const ROWS = 15;
const COLS = 15;

// 1 = Wall, 0 = Path
// A simple symmetric maze layout (15x15)
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,0,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // Center horizontal path
    [1,1,1,0,1,0,1,0,1,0,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Game State
const game = {
    // Start bunny in top-left safe spot (Tile 1,1)
    bunny: { 
        x: TILE_SIZE * 1.5, 
        y: TILE_SIZE * 1.5, 
        radius: 12, // Slightly smaller to fit in maze
        speed: 4,   // Slightly slower for control
        color: 'white' 
    },
    lollipops: [],
    score: 0,
    totalLollipops: 10,
    gameOver: false
};

// Input Tracking
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// --- Logic Functions ---

// Check if a specific point (x,y) is inside a Wall tile
function isWall(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    // Safety check for bounds
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
    
    return map[row][col] === 1;
}

// Spawn Lollipops only on empty tiles (0)
function createLollipops() {
    const colors = ['#FF69B4', '#FFD700', '#FF4500', '#00CED1', '#ADFF2F'];
    let count = 0;
    
    while (count < game.totalLollipops) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        
        // Ensure we don't spawn on a wall AND not on the bunny's start
        if (map[r][c] === 0 && !(r===1 && c===1)) {
            // Check if a lollipop is already there
            const exists = game.lollipops.some(p => 
                Math.abs(p.x - (c * TILE_SIZE + TILE_SIZE/2)) < 5 &&
                Math.abs(p.y - (r * TILE_SIZE + TILE_SIZE/2)) < 5
            );
            
            if (!exists) {
                game.lollipops.push({
                    x: c * TILE_SIZE + TILE_SIZE / 2, // Center of tile
                    y: r * TILE_SIZE + TILE_SIZE / 2,
                    collected: false,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
                count++;
            }
        }
    }
}

// --- Input Listeners ---
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// --- Update Loop ---
function update() {
    if (game.gameOver) return;

    let nextX = game.bunny.x;
    let nextY = game.bunny.y;

    // Calculate potential movement
    if (keys.ArrowUp) nextY -= game.bunny.speed;
    if (keys.ArrowDown) nextY += game.bunny.speed;
    if (keys.ArrowLeft) nextX -= game.bunny.speed;
    if (keys.ArrowRight) nextX += game.bunny.speed;

    // Collision Detection (Wall Sliding)
    // We check the 4 "corners" of the bunny's bounding box
    // If ANY corner hits a wall, we deny movement in that axis.
    
    const r = game.bunny.radius;

    // Check Horizontal Movement
    if (!isWall(nextX - r, game.bunny.y - r) && 
        !isWall(nextX + r, game.bunny.y - r) &&
        !isWall(nextX - r, game.bunny.y + r) &&
        !isWall(nextX + r, game.bunny.y + r)) {
        game.bunny.x = nextX;
    }

    // Check Vertical Movement
    // We recalculate nextY based on current X (to allow sliding against walls)
    let finalY = game.bunny.y;
    if (keys.ArrowUp) finalY -= game.bunny.speed;
    if (keys.ArrowDown) finalY += game.bunny.speed;

    if (!isWall(game.bunny.x - r, finalY - r) && 
        !isWall(game.bunny.x + r, finalY - r) &&
        !isWall(game.bunny.x - r, finalY + r) &&
        !isWall(game.bunny.x + r, finalY + r)) {
        game.bunny.y = finalY;
    }

    // Lollipop Collection
    game.lollipops.forEach(pop => {
        if (!pop.collected) {
            const dx = game.bunny.x - pop.x;
            const dy = game.bunny.y - pop.y;
            if (Math.sqrt(dx*dx + dy*dy) < game.bunny.radius + 10) {
                pop.collected = true;
                game.score += 10;
                updateScoreDisplay();
                checkWinCondition();
            }
        }
    });
}

function updateScoreDisplay() {
    const scoreEl = document.getElementById('scoreDisplay');
    if (scoreEl) scoreEl.innerText = game.score;
}

function checkWinCondition() {
    if (game.lollipops.filter(p => !p.collected).length === 0) {
        game.gameOver = true;
    }
}

// --- Draw Loop ---
function draw() {
    // Clear
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Walls
    ctx.fillStyle = '#5C2D91'; // Shopify Purple/Blue Walls
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#5C2D91'; // Neon glow effect
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (map[r][c] === 1) {
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
    ctx.shadowBlur = 0; // Reset glow for other items

    // Draw Lollipops
    game.lollipops.forEach(pop => {
        if (!pop.collected) {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(pop.x - 1, pop.y + 5, 2, 10);
            ctx.fillStyle = pop.color;
            ctx.beginPath();
            ctx.arc(pop.x, pop.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw Bunny
    ctx.fillStyle = game.bunny.color;
    ctx.beginPath();
    ctx.arc(game.bunny.x, game.bunny.y, game.bunny.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🐰", game.bunny.x, game.bunny.y + 1);

    // Win Screen
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("🎉 YOU WIN! 🎉", canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText("Score: " + game.score, canvas.width / 2, canvas.height / 2 + 40);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Init
createLollipops();
loop();
