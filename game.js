// --- Game Initialization ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
const game = {
    bunny: { 
        x: 300, 
        y: 300, 
        radius: 20, 
        speed: 5, 
        color: 'white' 
    },
    lollipops: [],
    score: 0,
    totalLollipops: 10,
    gameOver: false
};

// Keyboard Input Tracking
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Generate Random Lollipops
function createLollipops() {
    const colors = ['#FF69B4', '#FFD700', '#FF4500', '#00CED1', '#ADFF2F']; // Pink, Gold, Red, Teal, Green
    
    for (let i = 0; i < game.totalLollipops; i++) {
        game.lollipops.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20,
            collected: false,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

// --- Input Listeners ---
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    // Prevent scrolling the page when playing
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// --- Game Logic Updates ---
function update() {
    if (game.gameOver) return;

    // 1. Move Bunny
    if (keys.ArrowUp && game.bunny.y > game.bunny.radius) {
        game.bunny.y -= game.bunny.speed;
    }
    if (keys.ArrowDown && game.bunny.y < canvas.height - game.bunny.radius) {
        game.bunny.y += game.bunny.speed;
    }
    if (keys.ArrowLeft && game.bunny.x > game.bunny.radius) {
        game.bunny.x -= game.bunny.speed;
    }
    if (keys.ArrowRight && game.bunny.x < canvas.width - game.bunny.radius) {
        game.bunny.x += game.bunny.speed;
    }

    // 2. Check Collisions (Eating Lollipops)
    game.lollipops.forEach(pop => {
        if (!pop.collected) {
            // Distance formula to check collision
            const dx = game.bunny.x - pop.x;
            const dy = game.bunny.y - pop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If bunny touches lollipop (distance < combined radius)
            if (distance < game.bunny.radius + 10) {
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
    const remaining = game.lollipops.filter(p => !p.collected).length;
    if (remaining === 0) {
        game.gameOver = true;
    }
}

// --- Drawing Functions ---
function draw() {
    // Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Lollipops
    game.lollipops.forEach(pop => {
        if (!pop.collected) {
            // Stick
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(pop.x - 1, pop.y + 5, 2, 12);
            // Candy
            ctx.fillStyle = pop.color;
            ctx.beginPath();
            ctx.arc(pop.x, pop.y, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw Bunny
    ctx.fillStyle = game.bunny.color;
    ctx.beginPath();
    ctx.arc(game.bunny.x, game.bunny.y, game.bunny.radius, 0, Math.PI * 2);
    ctx.fill();
    // Bunny Face
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🐰", game.bunny.x, game.bunny.y + 2);

    // Draw "You Win" text if game over
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText("🎉 YUMMY! YOU WIN! 🎉", canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText("Refresh to play again", canvas.width / 2, canvas.height / 2 + 40);
    }
}

// --- Main Loop ---
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start the Game
createLollipops();
loop();
