// --- Sparko Sweets Bunny Game ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Configuration
const CONFIG = {
    bunnySpeed: 4,
    bunnyRadius: 22,
    lollipopRadius: 12,
    totalLollipops: 15,
    pointsPerLollipop: 10,
    stardustParticles: 20
};

// Game State
const game = {
    bunny: { 
        x: canvas.width / 2, 
        y: canvas.height / 2, 
        radius: CONFIG.bunnyRadius, 
        speed: CONFIG.bunnySpeed,
        direction: { x: 0, y: 0 },
        mouthOpen: false,
        animationTimer: 0
    },
    lollipops: [],
    particles: [],
    score: 0,
    totalLollipops: CONFIG.totalLollipops,
    gameOver: false,
    startTime: Date.now()
};

// Keyboard Input
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false
};

// Sparko Sweets Brand Colors for Lollipops
const LOLLIPOP_COLORS = [
    { candy: '#FF1493', shine: '#FF69B4', name: 'Pink' },      // Hot Pink
    { candy: '#FFD700', shine: '#FFEC8B', name: 'Gold' },      // Gold
    { candy: '#FF4500', shine: '#FF6347', name: 'Orange' },    // Orange Red
    { candy: '#9370DB', shine: '#BA55D3', name: 'Purple' },    // Purple
    { candy: '#00CED1', shine: '#48D1CC', name: 'Teal' },      // Turquoise
    { candy: '#32CD32', shine: '#90EE90', name: 'Green' },     // Lime Green
    { candy: '#FF69B4', shine: '#FFB6C1', name: 'Rose' }       // Pink variants
];

// Particle System for Collection Effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6 - 2;
        this.life = 1;
        this.decay = 0.02;
        this.size = Math.random() * 4 + 2;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life -= this.decay;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

// Generate Lollipops with spacing
function createLollipops() {
    const minDistance = 80; // Minimum distance between lollipops
    const margin = 50;
    
    for (let i = 0; i < game.totalLollipops; i++) {
        let validPosition = false;
        let attempts = 0;
        let newLollipop;
        
        while (!validPosition && attempts < 100) {
            newLollipop = {
                x: Math.random() * (canvas.width - margin * 2) + margin,
                y: Math.random() * (canvas.height - margin * 2) + margin,
                collected: false,
                colorScheme: LOLLIPOP_COLORS[i % LOLLIPOP_COLORS.length],
                rotation: Math.random() * Math.PI * 2,
                bobOffset: Math.random() * Math.PI * 2,
                scale: 1
            };
            
            // Check distance from bunny starting position
            const distFromBunny = Math.hypot(newLollipop.x - game.bunny.x, newLollipop.y - game.bunny.y);
            
            // Check distance from other lollipops
            validPosition = distFromBunny > 100 && game.lollipops.every(pop => {
                const dist = Math.hypot(newLollipop.x - pop.x, newLollipop.y - pop.y);
                return dist > minDistance;
            });
            
            attempts++;
        }
        
        if (validPosition) {
            game.lollipops.push(newLollipop);
        }
    }
}

// Input Listeners
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    if (keys.hasOwnProperty(key)) keys[key] = true;
    
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) > -1) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    if (keys.hasOwnProperty(key)) keys[key] = false;
});

// Game Logic
function update() {
    if (game.gameOver) return;

    // Calculate movement direction
    let dx = 0, dy = 0;
    
    if (keys.ArrowUp || keys.w) dy -= 1;
    if (keys.ArrowDown || keys.s) dy += 1;
    if (keys.ArrowLeft || keys.a) dx -= 1;
    if (keys.ArrowRight || keys.d) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }

    // Update bunny direction for animation
    if (dx !== 0 || dy !== 0) {
        game.bunny.direction.x = dx;
        game.bunny.direction.y = dy;
        game.bunny.animationTimer += 0.15;
        game.bunny.mouthOpen = Math.sin(game.bunny.animationTimer) > 0;
    }

    // Move bunny with boundary checking
    const newX = game.bunny.x + dx * game.bunny.speed;
    const newY = game.bunny.y + dy * game.bunny.speed;
    
    if (newX > game.bunny.radius && newX < canvas.width - game.bunny.radius) {
        game.bunny.x = newX;
    }
    if (newY > game.bunny.radius && newY < canvas.height - game.bunny.radius) {
        game.bunny.y = newY;
    }

    // Check lollipop collection
    game.lollipops.forEach(pop => {
        if (!pop.collected) {
            const distance = Math.hypot(game.bunny.x - pop.x, game.bunny.y - pop.y);
            
            if (distance < game.bunny.radius + CONFIG.lollipopRadius) {
                pop.collected = true;
                pop.scale = 0;
                game.score += CONFIG.pointsPerLollipop;
                
                // Create particle burst
                for (let i = 0; i < CONFIG.stardustParticles; i++) {
                    game.particles.push(new Particle(pop.x, pop.y, pop.colorScheme.shine));
                }
                
                updateScoreDisplay();
                checkWinCondition();
            }
        }
    });

    // Update particles
    game.particles = game.particles.filter(p => {
        p.update();
        return !p.isDead();
    });

    // Animate uncollected lollipops
    game.lollipops.forEach(pop => {
        if (!pop.collected) {
            pop.bobOffset += 0.05;
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
        const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
        console.log(`Game completed in ${elapsed} seconds!`);
    }
}

// Drawing Functions
function drawLollipop(pop) {
    if (pop.collected && pop.scale <= 0) return;
    
    const bobAmount = Math.sin(pop.bobOffset) * 3;
    const displayY = pop.y + bobAmount;
    
    ctx.save();
    ctx.translate(pop.x, displayY);
    ctx.scale(pop.scale, pop.scale);
    
    // Stick
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.lollipopRadius);
    ctx.lineTo(0, CONFIG.lollipopRadius + 18);
    ctx.stroke();
    
    // Spiral candy design
    ctx.rotate(pop.rotation);
    
    // Main candy circle
    ctx.fillStyle = pop.colorScheme.candy;
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.lollipopRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Spiral swirl
    ctx.strokeStyle = pop.colorScheme.shine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.1) {
        const r = (CONFIG.lollipopRadius - 2) * (a / (Math.PI * 4));
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-CONFIG.lollipopRadius * 0.3, -CONFIG.lollipopRadius * 0.3, CONFIG.lollipopRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawBunny() {
    const bunny = game.bunny;
    
    ctx.save();
    ctx.translate(bunny.x, bunny.y);
    
    // Determine facing direction
    if (bunny.direction.x < 0) ctx.scale(-1, 1);
    
    // Body (white circle)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(0, 0, bunny.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ears
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    
    // Left ear
    ctx.beginPath();
    ctx.ellipse(-8, -bunny.radius, 6, 14, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Right ear
    ctx.beginPath();
    ctx.ellipse(8, -bunny.radius, 6, 14, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Inner ears (pink)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(-8, -bunny.radius, 3, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -bunny.radius, 3, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-8, -4, 3, 0, Math.PI * 2);
    ctx.arc(8, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-7, -5, 1.5, 0, Math.PI * 2);
    ctx.arc(9, -5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Nose
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(0, 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth (animated)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    if (bunny.mouthOpen) {
        // Open mouth
        ctx.beginPath();
        ctx.arc(0, 6, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();
    } else {
        // Closed mouth
        ctx.beginPath();
        ctx.moveTo(-3, 6);
        ctx.lineTo(0, 8);
        ctx.lineTo(3, 6);
        ctx.stroke();
    }
    
    // Whiskers
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-20, -2);
    ctx.moveTo(-10, 2);
    ctx.lineTo(-20, 4);
    ctx.stroke();
    
    // Right whiskers
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(20, -2);
    ctx.moveTo(10, 2);
    ctx.lineTo(20, 4);
    ctx.stroke();
    
    ctx.restore();
}

function draw() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FFF8DC');
    gradient.addColorStop(1, '#FFE4E1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles
    game.particles.forEach(p => p.draw());
    
    // Draw lollipops
    game.lollipops.forEach(pop => drawLollipop(pop));
    
    // Draw bunny
    drawBunny();
    
    // Win screen
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Title
        ctx.fillStyle = '#FF1493';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎉 SWEET VICTORY! 🎉', canvas.width / 2, canvas.height / 2 - 40);
        
        // Score
        ctx.fillStyle = '#333';
        ctx.font = '28px Arial';
        ctx.fillText(`Score: ${game.score}`, canvas.width / 2, canvas.height / 2 + 10);
        
        // Instructions
        ctx.font = '20px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Refresh to play again', canvas.width / 2, canvas.height / 2 + 50);
        
        // Sparko Sweets branding
        ctx.font = 'italic 16px Arial';
        ctx.fillStyle = '#999';
        ctx.fillText('Sparko Sweets - Handcrafted Happiness', canvas.width / 2, canvas.height / 2 + 90);
    }
}

// Main Loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Initialize and Start
createLollipops();
loop();
