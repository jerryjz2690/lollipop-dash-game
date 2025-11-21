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
    collectedCount: 0,
    gameOver: false
};

// Keyboard Tracking
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Generate Random Lollipops
function createLollipops() {
    const colors = ['#FF69B4', '#FFD700', '#FF4500', '#00CED1', '#ADFF2F'];
    const spawnMargin = 30;

    for (let i = 0; i < game.totalLollipops; i++) {
        game.lollipops.push({
            x: Math.random() * (canvas.width - spawnMargin * 2) + spawnMargin,
            y: Math.random() * (canvas.height - spawnMargin * 2) + spawnMargin,
            collected: false,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

// --- Input Listeners ---
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// --- Game Logic ---
function update() {
    if (game.gameOver) return;

    const b = game.bunny;

    // Movement
    if (keys.ArrowUp && b.y - b.radius > 0) b.y -= b.speed;
    if (keys.ArrowDown && b.y + b.radius < canvas.height) b.y += b.speed;
    if (keys.ArrowLeft && b.x - b.radius > 0) b.x -= b.speed;
    if (keys.ArrowRight && b.x + b.radius < canvas.width) b.x += b.speed;

    // Collisions
    game.lollipops.forEach(pop => {
        if (!pop.collected) {
            const dx = b.x - pop.x;
            const dy = b.y - pop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < b.radius + 10) {
                pop.collected = true;
                game.score += 10;
                game.collectedCount++;

                updateScoreDisplay();

                if (game.collectedCount === game.totalLollipops) {
                    game.gameOver = true;
                }
            }
        }
    });
}

function updateScoreDisplay() {
    const scoreEl = document.getElementById('scoreDisplay');
    if (scoreEl) scoreEl.innerText = game.score;
}

// --- Drawing ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Lollipops
    game.lollipops.forEach(pop => {
        if (!pop.collected) {
            ctx.fillStyle = '#8B4513'; // Stick
            ctx.fillRect(pop.x - 1, pop.y + 5, 2, 12);

            ctx.fillStyle = pop.color; // Candy
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

    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🐰", game.bunny.x, game.bunny.y + 2);

    // Win screen
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
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

// Start Game
createLollipops();
loop();
