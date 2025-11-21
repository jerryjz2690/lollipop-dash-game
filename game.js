// --- Game Initialization ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
const game = {
    bunny: { x: 50, y: 50, radius: 15, color: 'white', speed: 5 },
    // Simplified lollipops array for now
    lollipops: [
        { x: 200, y: 150, collected: false, color: 'pink' },
        { x: 400, y: 300, collected: false, color: 'yellow' },
        { x: 100, y: 500, collected: false, color: 'red' }
    ],
    score: 0
};

// --- Drawing Functions ---

function drawBunny() {
    ctx.fillStyle = game.bunny.color;
    // Draw the bunny circle body
    ctx.beginPath();
    ctx.arc(game.bunny.x, game.bunny.y, game.bunny.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw the bunny face (emoji placeholder)
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // The 🐰 emoji
    ctx.fillText("🐰", game.bunny.x, game.bunny.y); 
}

function drawLollipops() {
    game.lollipops.forEach(lollipop => {
        if (!lollipop.collected) {
            // Draw the lollipop stick (small rectangle)
            ctx.fillStyle = 'brown'; 
            ctx.fillRect(lollipop.x - 1, lollipop.y + 5, 2, 10);
            
            // Draw the lollipop head (circle)
            ctx.fillStyle = lollipop.color;
            ctx.beginPath();
            ctx.arc(lollipop.x, lollipop.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function updateScore() {
    // This updates the HTML element outside the canvas
    const scoreElement = document.getElementById('scoreDisplay');
    if (scoreElement) {
        scoreElement.innerText = game.score;
    }
}

// --- Main Game Loop (for static display) ---

function drawStaticScene() {
    // 1. Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Draw elements
    drawBunny();
    drawLollipops();
    updateScore();
}

// Run the drawing function to show the initial state
drawStaticScene();
