/**
 * SPARKO SWEETS PAC-MAN GAME
 * A complete standalone Pac-Man game with candy/sweet themed branding
 * Created for Sparko Sweets Shopify store
 */

(function() {
    'use strict';

    // ============================================================================
    // 1. CONFIGURATION & CONSTANTS
    // ============================================================================

    const CONFIG = {
        // Sparko Sweets Brand Colors
        COLORS: {
            BACKGROUND: '#1a0b2e',
            WALL: '#ff006e',
            DOT: '#ffbe0b',
            POWER_PELLET: '#3a86ff',
            PACMAN: '#ffd60a',
            GHOST_BLINKY: '#ff006e',  // Pink/Red
            GHOST_PINKY: '#fb5607',   // Orange
            GHOST_INKY: '#3a86ff',    // Blue
            GHOST_CLYDE: '#8338ec',   // Purple
            GHOST_SCARED: '#06ffa5',  // Cyan
            GHOST_EYES: '#ffffff',
            TEXT: '#ffffff'
        },

        // Game Settings
        TILE_SIZE: 20,
        GRID_WIDTH: 28,
        GRID_HEIGHT: 31,
        FPS: 60,
        PACMAN_SPEED: 2,
        GHOST_SPEED: 1.8,
        GHOST_SCARED_SPEED: 1.2,
        POWER_PELLET_DURATION: 300, // frames (5 seconds at 60fps)
        SCATTER_DURATION: 420,      // 7 seconds
        CHASE_DURATION: 1200,        // 20 seconds

        // Scoring
        SCORE_DOT: 10,
        SCORE_POWER_PELLET: 50,
        SCORE_GHOST: 200,

        // Game Stats
        STARTING_LIVES: 3,
        DOTS_PER_LEVEL: 244
    };

    // ============================================================================
    // 2. GAME STATE
    // ============================================================================

    const gameState = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,
        score: 0,
        lives: CONFIG.STARTING_LIVES,
        level: 1,
        gameOver: false,
        paused: false,
        won: false,

        // Power pellet state
        powerMode: false,
        powerModeTimer: 0,

        // Ghost AI state
        ghostMode: 'scatter', // 'scatter' or 'chase'
        ghostModeTimer: 0,

        // Animation
        animationFrame: 0,
        lastTime: 0,

        // Input
        keys: {},
        touchStartX: 0,
        touchStartY: 0
    };

    // ============================================================================
    // 3. MAP DATA
    // ============================================================================

    // Map legend:
    // 0 = empty/path, 1 = wall, 2 = dot, 3 = power pellet, 4 = ghost house
    const LEVEL_MAP = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    let gameMap = [];

    function initializeMap() {
        gameMap = LEVEL_MAP.map(row => [...row]);
    }

    // ============================================================================
    // 4. PLAYER CLASS
    // ============================================================================

    class Player {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = 14 * CONFIG.TILE_SIZE;
            this.y = 23 * CONFIG.TILE_SIZE;
            this.direction = { x: 0, y: 0 };
            this.nextDirection = { x: 0, y: 0 };
            this.speed = CONFIG.PACMAN_SPEED;
            this.mouthAngle = 0;
            this.mouthOpening = true;
        }

        update() {
            // Try to change direction if next direction is set
            if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
                const nextX = this.x + this.nextDirection.x * this.speed;
                const nextY = this.y + this.nextDirection.y * this.speed;
                if (this.canMove(nextX, nextY)) {
                    this.direction = { ...this.nextDirection };
                }
            }

            // Move in current direction
            const newX = this.x + this.direction.x * this.speed;
            const newY = this.y + this.direction.y * this.speed;

            if (this.canMove(newX, newY)) {
                this.x = newX;
                this.y = newY;
            }

            // Wrap around tunnel
            if (this.x < -CONFIG.TILE_SIZE) {
                this.x = CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE;
            } else if (this.x > CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE) {
                this.x = -CONFIG.TILE_SIZE;
            }

            // Animate mouth
            if (this.mouthOpening) {
                this.mouthAngle += 0.1;
                if (this.mouthAngle >= 0.5) this.mouthOpening = false;
            } else {
                this.mouthAngle -= 0.1;
                if (this.mouthAngle <= 0) this.mouthOpening = true;
            }

            // Collect dots and power pellets
            this.collectItems();
        }

        canMove(x, y) {
            const gridX = Math.floor(x / CONFIG.TILE_SIZE);
            const gridY = Math.floor(y / CONFIG.TILE_SIZE);
            const radius = CONFIG.TILE_SIZE / 2.5;

            // Check all corners of the collision box
            const corners = [
                { x: x - radius, y: y - radius },
                { x: x + radius, y: y - radius },
                { x: x - radius, y: y + radius },
                { x: x + radius, y: y + radius }
            ];

            for (const corner of corners) {
                const cx = Math.floor(corner.x / CONFIG.TILE_SIZE);
                const cy = Math.floor(corner.y / CONFIG.TILE_SIZE);

                if (cy < 0 || cy >= CONFIG.GRID_HEIGHT ||
                    cx < 0 || cx >= CONFIG.GRID_WIDTH) {
                    continue; // Allow tunnel wrapping
                }

                if (gameMap[cy] && gameMap[cy][cx] === 1) {
                    return false;
                }
            }

            return true;
        }

        collectItems() {
            const gridX = Math.floor(this.x / CONFIG.TILE_SIZE);
            const gridY = Math.floor(this.y / CONFIG.TILE_SIZE);

            if (gridY >= 0 && gridY < CONFIG.GRID_HEIGHT &&
                gridX >= 0 && gridX < CONFIG.GRID_WIDTH) {

                const tile = gameMap[gridY][gridX];

                if (tile === 2) { // Dot
                    gameMap[gridY][gridX] = 0;
                    gameState.score += CONFIG.SCORE_DOT;
                    checkLevelComplete();
                } else if (tile === 3) { // Power pellet
                    gameMap[gridY][gridX] = 0;
                    gameState.score += CONFIG.SCORE_POWER_PELLET;
                    activatePowerMode();
                    checkLevelComplete();
                }
            }
        }

        setDirection(dx, dy) {
            this.nextDirection = { x: dx, y: dy };
        }

        draw(ctx) {
            const radius = CONFIG.TILE_SIZE / 2;

            // Calculate rotation based on direction
            let rotation = 0;
            if (this.direction.x > 0) rotation = 0;
            else if (this.direction.x < 0) rotation = Math.PI;
            else if (this.direction.y > 0) rotation = Math.PI / 2;
            else if (this.direction.y < 0) rotation = -Math.PI / 2;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(rotation);

            // Draw Pac-Man
            ctx.fillStyle = CONFIG.COLORS.PACMAN;
            ctx.beginPath();
            ctx.arc(0, 0, radius,
                    this.mouthAngle,
                    Math.PI * 2 - this.mouthAngle);
            ctx.lineTo(0, 0);
            ctx.fill();

            ctx.restore();
        }
    }

    // ============================================================================
    // 5. GHOST CLASS
    // ============================================================================

    class Ghost {
        constructor(name, color, startX, startY) {
            this.name = name;
            this.color = color;
            this.startX = startX;
            this.startY = startY;
            this.reset();
        }

        reset() {
            this.x = this.startX * CONFIG.TILE_SIZE;
            this.y = this.startY * CONFIG.TILE_SIZE;
            this.direction = { x: 0, y: -1 };
            this.speed = CONFIG.GHOST_SPEED;
            this.scared = false;
            this.eaten = false;
            this.inHouse = true;
            this.houseTimer = 60 * (ghosts.indexOf(this) + 1); // Stagger releases
        }

        update(player) {
            // If in ghost house, wait to leave
            if (this.inHouse) {
                this.houseTimer--;
                if (this.houseTimer <= 0) {
                    this.inHouse = false;
                    this.x = 14 * CONFIG.TILE_SIZE;
                    this.y = 11 * CONFIG.TILE_SIZE;
                }
                return;
            }

            // If eaten, return to house
            if (this.eaten) {
                this.returnToHouse();
                return;
            }

            // Update speed based on scared state
            this.speed = this.scared ? CONFIG.GHOST_SCARED_SPEED : CONFIG.GHOST_SPEED;

            // Choose next direction at intersections
            if (this.isAtIntersection()) {
                this.chooseDirection(player);
            }

            // Move
            const newX = this.x + this.direction.x * this.speed;
            const newY = this.y + this.direction.y * this.speed;

            if (this.canMove(newX, newY)) {
                this.x = newX;
                this.y = newY;
            }

            // Wrap around tunnel
            if (this.x < -CONFIG.TILE_SIZE) {
                this.x = CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE;
            } else if (this.x > CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE) {
                this.x = -CONFIG.TILE_SIZE;
            }
        }

        isAtIntersection() {
            const threshold = 5;
            const centerX = Math.round(this.x / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE;
            const centerY = Math.round(this.y / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE;

            return Math.abs(this.x - centerX) < threshold &&
                   Math.abs(this.y - centerY) < threshold;
        }

        chooseDirection(player) {
            const gridX = Math.round(this.x / CONFIG.TILE_SIZE);
            const gridY = Math.round(this.y / CONFIG.TILE_SIZE);

            let targetX, targetY;

            if (this.scared) {
                // Run away from player (random-ish movement)
                targetX = gridX + (Math.random() > 0.5 ? 10 : -10);
                targetY = gridY + (Math.random() > 0.5 ? 10 : -10);
            } else {
                const playerGridX = Math.floor(player.x / CONFIG.TILE_SIZE);
                const playerGridY = Math.floor(player.y / CONFIG.TILE_SIZE);

                if (gameState.ghostMode === 'chase') {
                    // Chase mode - each ghost has different behavior
                    if (this.name === 'blinky') {
                        // Blinky: directly targets player
                        targetX = playerGridX;
                        targetY = playerGridY;
                    } else if (this.name === 'pinky') {
                        // Pinky: targets 4 tiles ahead of player
                        targetX = playerGridX + player.direction.x * 4;
                        targetY = playerGridY + player.direction.y * 4;
                    } else if (this.name === 'inky') {
                        // Inky: targets relative to Blinky and player
                        const blinky = ghosts[0];
                        const blinkyGridX = Math.floor(blinky.x / CONFIG.TILE_SIZE);
                        const blinkyGridY = Math.floor(blinky.y / CONFIG.TILE_SIZE);
                        targetX = playerGridX + (playerGridX - blinkyGridX);
                        targetY = playerGridY + (playerGridY - blinkyGridY);
                    } else {
                        // Clyde: targets player if far, scatter corner if close
                        const distance = Math.sqrt(
                            Math.pow(gridX - playerGridX, 2) +
                            Math.pow(gridY - playerGridY, 2)
                        );
                        if (distance > 8) {
                            targetX = playerGridX;
                            targetY = playerGridY;
                        } else {
                            targetX = 0;
                            targetY = CONFIG.GRID_HEIGHT - 1;
                        }
                    }
                } else {
                    // Scatter mode - go to corners
                    if (this.name === 'blinky') {
                        targetX = CONFIG.GRID_WIDTH - 1;
                        targetY = 0;
                    } else if (this.name === 'pinky') {
                        targetX = 0;
                        targetY = 0;
                    } else if (this.name === 'inky') {
                        targetX = CONFIG.GRID_WIDTH - 1;
                        targetY = CONFIG.GRID_HEIGHT - 1;
                    } else {
                        targetX = 0;
                        targetY = CONFIG.GRID_HEIGHT - 1;
                    }
                }
            }

            // Find best direction toward target
            const possibleDirections = [
                { x: 0, y: -1 }, // up
                { x: 0, y: 1 },  // down
                { x: -1, y: 0 }, // left
                { x: 1, y: 0 }   // right
            ].filter(dir => {
                // Don't reverse direction
                return !(dir.x === -this.direction.x && dir.y === -this.direction.y);
            }).filter(dir => {
                // Check if can move in this direction
                const testX = this.x + dir.x * CONFIG.TILE_SIZE;
                const testY = this.y + dir.y * CONFIG.TILE_SIZE;
                return this.canMove(testX, testY);
            });

            if (possibleDirections.length > 0) {
                // Choose direction that minimizes distance to target
                let bestDir = possibleDirections[0];
                let bestDist = Infinity;

                for (const dir of possibleDirections) {
                    const testX = gridX + dir.x;
                    const testY = gridY + dir.y;
                    const dist = Math.sqrt(
                        Math.pow(testX - targetX, 2) +
                        Math.pow(testY - targetY, 2)
                    );
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestDir = dir;
                    }
                }

                this.direction = bestDir;
            }
        }

        canMove(x, y) {
            const gridX = Math.floor(x / CONFIG.TILE_SIZE);
            const gridY = Math.floor(y / CONFIG.TILE_SIZE);

            if (gridY < 0 || gridY >= CONFIG.GRID_HEIGHT ||
                gridX < 0 || gridX >= CONFIG.GRID_WIDTH) {
                return true; // Allow tunnel wrapping
            }

            if (gameMap[gridY] && gameMap[gridY][gridX] === 1) {
                return false;
            }

            return true;
        }

        returnToHouse() {
            // Simple pathfinding back to house
            const houseX = 14 * CONFIG.TILE_SIZE;
            const houseY = 14 * CONFIG.TILE_SIZE;

            if (Math.abs(this.x - houseX) < 5 && Math.abs(this.y - houseY) < 5) {
                this.eaten = false;
                this.inHouse = true;
                this.houseTimer = 180; // 3 seconds
                return;
            }

            // Move toward house
            if (this.x < houseX) this.direction = { x: 1, y: 0 };
            else if (this.x > houseX) this.direction = { x: -1, y: 0 };
            else if (this.y < houseY) this.direction = { x: 0, y: 1 };
            else if (this.y > houseY) this.direction = { x: 0, y: -1 };

            this.x += this.direction.x * CONFIG.GHOST_SPEED * 2;
            this.y += this.direction.y * CONFIG.GHOST_SPEED * 2;
        }

        draw(ctx) {
            const radius = CONFIG.TILE_SIZE / 2;

            if (this.eaten) {
                // Draw just eyes when eaten
                this.drawEyes(ctx, this.x, this.y);
                return;
            }

            // Draw ghost body
            ctx.fillStyle = this.scared ? CONFIG.COLORS.GHOST_SCARED : this.color;

            // Body (circle + wavy bottom)
            ctx.beginPath();
            ctx.arc(this.x, this.y - radius / 3, radius, Math.PI, 0, false);

            // Wavy bottom
            const waveTime = gameState.animationFrame * 0.1;
            for (let i = 0; i < 3; i++) {
                const waveX = this.x - radius + (radius * 2 / 3) * i;
                const waveY = this.y + radius / 3 + Math.sin(waveTime + i) * 3;
                ctx.lineTo(waveX, waveY);
            }
            ctx.lineTo(this.x + radius, this.y + radius / 3);
            ctx.closePath();
            ctx.fill();

            // Draw eyes (unless scared)
            if (!this.scared) {
                this.drawEyes(ctx, this.x, this.y);
            } else {
                // Draw scared face
                ctx.fillStyle = CONFIG.COLORS.GHOST_EYES;
                ctx.fillRect(this.x - radius / 2, this.y - radius / 4, radius / 4, radius / 2);
                ctx.fillRect(this.x + radius / 4, this.y - radius / 4, radius / 4, radius / 2);
            }
        }

        drawEyes(ctx, x, y) {
            const eyeRadius = CONFIG.TILE_SIZE / 8;
            const pupilRadius = CONFIG.TILE_SIZE / 12;

            // White eyes
            ctx.fillStyle = CONFIG.COLORS.GHOST_EYES;
            ctx.beginPath();
            ctx.arc(x - eyeRadius, y - eyeRadius / 2, eyeRadius, 0, Math.PI * 2);
            ctx.arc(x + eyeRadius, y - eyeRadius / 2, eyeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Black pupils
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x - eyeRadius + this.direction.x * 2,
                    y - eyeRadius / 2 + this.direction.y * 2,
                    pupilRadius, 0, Math.PI * 2);
            ctx.arc(x + eyeRadius + this.direction.x * 2,
                    y - eyeRadius / 2 + this.direction.y * 2,
                    pupilRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ============================================================================
    // 6. GAME LOGIC
    // ============================================================================

    let player;
    let ghosts = [];

    function initializeGame() {
        // Initialize map
        initializeMap();

        // Create player
        player = new Player();

        // Create ghosts
        ghosts = [
            new Ghost('blinky', CONFIG.COLORS.GHOST_BLINKY, 14, 14),
            new Ghost('pinky', CONFIG.COLORS.GHOST_PINKY, 12, 14),
            new Ghost('inky', CONFIG.COLORS.GHOST_INKY, 14, 15),
            new Ghost('clyde', CONFIG.COLORS.GHOST_CLYDE, 16, 14)
        ];

        // Reset game state
        gameState.score = 0;
        gameState.lives = CONFIG.STARTING_LIVES;
        gameState.level = 1;
        gameState.gameOver = false;
        gameState.won = false;
        gameState.paused = false;
        gameState.powerMode = false;
        gameState.powerModeTimer = 0;
        gameState.ghostMode = 'scatter';
        gameState.ghostModeTimer = CONFIG.SCATTER_DURATION;
    }

    function activatePowerMode() {
        gameState.powerMode = true;
        gameState.powerModeTimer = CONFIG.POWER_PELLET_DURATION;

        ghosts.forEach(ghost => {
            if (!ghost.eaten && !ghost.inHouse) {
                ghost.scared = true;
            }
        });
    }

    function updatePowerMode() {
        if (gameState.powerMode) {
            gameState.powerModeTimer--;
            if (gameState.powerModeTimer <= 0) {
                gameState.powerMode = false;
                ghosts.forEach(ghost => {
                    ghost.scared = false;
                });
            }
        }
    }

    function updateGhostMode() {
        gameState.ghostModeTimer--;
        if (gameState.ghostModeTimer <= 0) {
            if (gameState.ghostMode === 'scatter') {
                gameState.ghostMode = 'chase';
                gameState.ghostModeTimer = CONFIG.CHASE_DURATION;
            } else {
                gameState.ghostMode = 'scatter';
                gameState.ghostModeTimer = CONFIG.SCATTER_DURATION;
            }
        }
    }

    function checkCollisions() {
        ghosts.forEach(ghost => {
            if (ghost.inHouse || ghost.eaten) return;

            const dx = player.x - ghost.x;
            const dy = player.y - ghost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.TILE_SIZE * 0.7) {
                if (ghost.scared) {
                    // Eat ghost
                    ghost.eaten = true;
                    ghost.scared = false;
                    gameState.score += CONFIG.SCORE_GHOST;
                } else {
                    // Lose life
                    loseLife();
                }
            }
        });
    }

    function loseLife() {
        gameState.lives--;

        if (gameState.lives <= 0) {
            gameOver();
        } else {
            // Reset positions
            player.reset();
            ghosts.forEach(ghost => ghost.reset());
            gameState.powerMode = false;
            gameState.powerModeTimer = 0;
        }
    }

    function checkLevelComplete() {
        // Count remaining dots
        let dotsLeft = 0;
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                if (gameMap[y][x] === 2 || gameMap[y][x] === 3) {
                    dotsLeft++;
                }
            }
        }

        if (dotsLeft === 0) {
            nextLevel();
        }
    }

    function nextLevel() {
        gameState.level++;
        gameState.won = true;

        // Small delay before resetting level
        setTimeout(() => {
            initializeMap();
            player.reset();
            ghosts.forEach(ghost => ghost.reset());
            gameState.won = false;
            gameState.powerMode = false;
            gameState.powerModeTimer = 0;
            gameState.ghostMode = 'scatter';
            gameState.ghostModeTimer = CONFIG.SCATTER_DURATION;
        }, 2000);
    }

    function gameOver() {
        gameState.gameOver = true;
    }

    function restartGame() {
        initializeGame();
    }

    // ============================================================================
    // 7. RENDERING
    // ============================================================================

    function render() {
        const ctx = gameState.ctx;
        const width = gameState.width;
        const height = gameState.height;

        // Clear canvas
        ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, width, height);

        // Center the game
        ctx.save();
        const offsetX = (width - CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE) / 2;
        const offsetY = 60; // Leave space for HUD
        ctx.translate(offsetX, offsetY);

        // Draw map
        drawMap(ctx);

        // Draw entities
        player.draw(ctx);
        ghosts.forEach(ghost => ghost.draw(ctx));

        ctx.restore();

        // Draw HUD
        drawHUD(ctx, width);

        // Draw game over or win screen
        if (gameState.gameOver) {
            drawGameOver(ctx, width, height);
        } else if (gameState.won) {
            drawLevelComplete(ctx, width, height);
        }
    }

    function drawMap(ctx) {
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const tile = gameMap[y][x];
                const px = x * CONFIG.TILE_SIZE;
                const py = y * CONFIG.TILE_SIZE;

                if (tile === 1) {
                    // Wall
                    ctx.fillStyle = CONFIG.COLORS.WALL;
                    ctx.fillRect(px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

                    // Add border for 3D effect
                    ctx.strokeStyle = '#ff73a8';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                } else if (tile === 2) {
                    // Dot
                    ctx.fillStyle = CONFIG.COLORS.DOT;
                    ctx.beginPath();
                    ctx.arc(px + CONFIG.TILE_SIZE / 2,
                           py + CONFIG.TILE_SIZE / 2,
                           3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (tile === 3) {
                    // Power pellet (animated)
                    const pulse = Math.sin(gameState.animationFrame * 0.1) * 0.3 + 0.7;
                    ctx.fillStyle = CONFIG.COLORS.POWER_PELLET;
                    ctx.globalAlpha = pulse;
                    ctx.beginPath();
                    ctx.arc(px + CONFIG.TILE_SIZE / 2,
                           py + CONFIG.TILE_SIZE / 2,
                           6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }
        }
    }

    function drawHUD(ctx, width) {
        ctx.fillStyle = CONFIG.COLORS.TEXT;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${gameState.score}`, 20, 30);

        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${gameState.level}`, width / 2, 30);

        ctx.textAlign = 'right';
        ctx.fillText(`LIVES: ${gameState.lives}`, width - 20, 30);

        // Power mode indicator
        if (gameState.powerMode) {
            ctx.fillStyle = CONFIG.COLORS.POWER_PELLET;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('POWER MODE!', width / 2, 50);
        }
    }

    function drawGameOver(ctx, width, height) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = CONFIG.COLORS.TEXT;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 40);

        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Final Score: ${gameState.score}`, width / 2, height / 2 + 10);

        ctx.font = '20px Arial';
        ctx.fillStyle = CONFIG.COLORS.POWER_PELLET;
        ctx.fillText('Press SPACE or TAP to restart', width / 2, height / 2 + 60);
    }

    function drawLevelComplete(ctx, width, height) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = CONFIG.COLORS.POWER_PELLET;
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${gameState.level - 1} COMPLETE!`, width / 2, height / 2);

        ctx.font = '24px Arial';
        ctx.fillStyle = CONFIG.COLORS.TEXT;
        ctx.fillText('Get ready for next level...', width / 2, height / 2 + 50);
    }

    // ============================================================================
    // 8. INPUT HANDLING
    // ============================================================================

    function setupInput() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            gameState.keys[e.key] = true;

            // Prevent default for arrow keys and space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            // Restart game
            if (e.key === ' ' && (gameState.gameOver || gameState.paused)) {
                if (gameState.gameOver) {
                    restartGame();
                } else {
                    gameState.paused = false;
                }
            }

            // Pause game
            if (e.key === 'p' || e.key === 'P') {
                gameState.paused = !gameState.paused;
            }
        });

        document.addEventListener('keyup', (e) => {
            gameState.keys[e.key] = false;
        });

        // Touch input for mobile
        gameState.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            gameState.touchStartX = touch.clientX;
            gameState.touchStartY = touch.clientY;

            // Tap to restart
            if (gameState.gameOver) {
                restartGame();
            }
        });

        gameState.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        gameState.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - gameState.touchStartX;
            const deltaY = touch.clientY - gameState.touchStartY;
            const threshold = 30;

            if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        player.setDirection(1, 0); // Right
                    } else {
                        player.setDirection(-1, 0); // Left
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0) {
                        player.setDirection(0, 1); // Down
                    } else {
                        player.setDirection(0, -1); // Up
                    }
                }
            }
        });

        // Mouse click to restart
        gameState.canvas.addEventListener('click', () => {
            if (gameState.gameOver) {
                restartGame();
            }
        });
    }

    function handleInput() {
        if (gameState.paused || gameState.gameOver || gameState.won) return;

        // Arrow keys
        if (gameState.keys['ArrowUp']) {
            player.setDirection(0, -1);
        } else if (gameState.keys['ArrowDown']) {
            player.setDirection(0, 1);
        } else if (gameState.keys['ArrowLeft']) {
            player.setDirection(-1, 0);
        } else if (gameState.keys['ArrowRight']) {
            player.setDirection(1, 0);
        }

        // WASD keys
        if (gameState.keys['w'] || gameState.keys['W']) {
            player.setDirection(0, -1);
        } else if (gameState.keys['s'] || gameState.keys['S']) {
            player.setDirection(0, 1);
        } else if (gameState.keys['a'] || gameState.keys['A']) {
            player.setDirection(-1, 0);
        } else if (gameState.keys['d'] || gameState.keys['D']) {
            player.setDirection(1, 0);
        }
    }

    // ============================================================================
    // 9. GAME LOOP
    // ============================================================================

    function gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - gameState.lastTime;
        gameState.lastTime = timestamp;

        // Update
        if (!gameState.paused && !gameState.gameOver && !gameState.won) {
            gameState.animationFrame++;
            handleInput();
            player.update();
            ghosts.forEach(ghost => ghost.update(player));
            updatePowerMode();
            updateGhostMode();
            checkCollisions();
        }

        // Render
        render();

        // Continue loop
        requestAnimationFrame(gameLoop);
    }

    // ============================================================================
    // 10. INITIALIZATION
    // ============================================================================

    function setupCanvas() {
        // Try to find existing canvas
        let canvas = document.getElementById('pacman-canvas');

        // Create canvas if it doesn't exist
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'pacman-canvas';
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto';
            canvas.style.background = CONFIG.COLORS.BACKGROUND;
            canvas.style.border = '3px solid ' + CONFIG.COLORS.WALL;
            canvas.style.borderRadius = '10px';

            // Try to find a container
            const container = document.getElementById('pacman-container') ||
                            document.getElementById('game-container') ||
                            document.body;

            container.appendChild(canvas);
        }

        // Set canvas size
        const maxWidth = Math.min(window.innerWidth - 40, CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE + 40);
        const maxHeight = Math.min(window.innerHeight - 40, CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE + 120);

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        gameState.canvas = canvas;
        gameState.ctx = canvas.getContext('2d');
        gameState.width = canvas.width;
        gameState.height = canvas.height;

        // Handle window resize
        window.addEventListener('resize', () => {
            const maxWidth = Math.min(window.innerWidth - 40, CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE + 40);
            const maxHeight = Math.min(window.innerHeight - 40, CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE + 120);

            canvas.width = maxWidth;
            canvas.height = maxHeight;
            gameState.width = canvas.width;
            gameState.height = canvas.height;
        });
    }

    function init() {
        setupCanvas();
        setupInput();
        initializeGame();
        gameState.lastTime = performance.now();
        requestAnimationFrame(gameLoop);

        console.log('Sparko Sweets Pac-Man Game Initialized!');
        console.log('Controls: Arrow Keys or WASD to move');
        console.log('P to pause, SPACE to restart');
        console.log('Mobile: Swipe to move, tap to restart');
    }

    // Auto-initialize when script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
