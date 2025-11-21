// ==========================================================================
// BUNNY LOLLIPOP DASH (Based on Pac-Man Engine)
// ==========================================================================

(function(){

// --- Compatibility Helpers ---
var newChildObject = function(parentObj, newObj) {
    var x = function(){};
    x.prototype = parentObj;
    var resultObj = new x();
    if (newObj) {
        for (var name in newObj) {
            if ({}.hasOwnProperty.call(newObj, name)) {
                resultObj[name] = newObj[name];
            }
        }
    }
    return resultObj;
};

// --- Minimal Audio Stub (Prevents errors since we don't have mp3s hosted) ---
var audio = {
    play: function() {},
    startLoop: function() {},
    stopLoop: function() {},
    silence: function() {},
    ghostReset: function() {},
    credit: { play: function(){} },
    coffeeBreakMusic: { startLoop: function(){} },
    die: { play: function(){} },
    ghostReturnToHome: { startLoop: function(){}, stopLoop: function(){} },
    eatingGhost: { play: function(){} },
    ghostTurnToBlue: { startLoop: function(){}, stopLoop: function(){} },
    eatingFruit: { play: function(){} },
    ghostNormalMove: { startLoop: function(){}, stopLoop: function(){} },
    extend: { play: function(){} },
    eating: { startLoop: function(){}, stopLoop: function(){} },
    startMusic: { play: function(){} }
};

// --- Game Constants & Globals ---
var tileSize = 16; // Scaled up for visibility
var midTile = {x: tileSize/2, y: tileSize/2};
var level = 1;
var extraLives = 0;
var score = 0;
var highScore = 10000;
var state;
var canvas, ctx;
var map;
var actors = [];
var ghosts = [];
var pacman;

// Directions
var DIR_UP = 0, DIR_LEFT = 1, DIR_DOWN = 2, DIR_RIGHT = 3;

function setDirFromEnum(dir, dirEnum) {
    if (dirEnum === DIR_UP)    { dir.x = 0; dir.y = -1; }
    else if (dirEnum === DIR_RIGHT) { dir.x = 1; dir.y = 0; }
    else if (dirEnum === DIR_DOWN)  { dir.x = 0; dir.y = 1; }
    else if (dirEnum === DIR_LEFT)  { dir.x = -1; dir.y = 0; }
}

function rotateAboutFace(dirEnum) {
    return (dirEnum + 2) % 4;
}

function getOpenTiles(tile, dirEnum) {
    var openTiles = {};
    openTiles[DIR_UP]    = map.isFloorTile(tile.x, tile.y - 1);
    openTiles[DIR_RIGHT] = map.isFloorTile(tile.x + 1, tile.y);
    openTiles[DIR_DOWN]  = map.isFloorTile(tile.x, tile.y + 1);
    openTiles[DIR_LEFT]  = map.isFloorTile(tile.x - 1, tile.y);

    var numOpen = 0;
    for (var i=0; i<4; i++) if (openTiles[i]) numOpen++;
    
    if (dirEnum !== undefined && numOpen > 1) {
        openTiles[rotateAboutFace(dirEnum)] = false; // Can't reverse immediately
    }
    return openTiles;
}

function getTurnClosestToTarget(tile, targetTile, openTiles) {
    var minDist = Infinity;
    var dirEnum = 0;
    var dir = {};
    for (var i = 0; i < 4; i++) {
        if (openTiles[i]) {
            setDirFromEnum(dir, i);
            var dx = (tile.x + dir.x) - targetTile.x;
            var dy = (tile.y + dir.y) - targetTile.y;
            var dist = dx*dx + dy*dy;
            if (dist < minDist) {
                minDist = dist;
                dirEnum = i;
            }
        }
    }
    return dirEnum;
}

// --- Map System ---
var Map = function(numCols, numRows, tiles) {
    this.numCols = numCols;
    this.numRows = numRows;
    this.tiles = tiles;
    this.currentTiles = tiles.split("");
    this.dotsEaten = 0;
    
    // Hardcoded ghost house door/home
    this.doorTile = {x: 13, y: 14}; 
    this.doorPixel = {x: (13.5 * tileSize), y: (14 * tileSize) + midTile.y - tileSize/2};
    this.homeTopPixel = 17 * tileSize;
    this.homeBottomPixel = 18 * tileSize;

    this.parseDots();
};

Map.prototype.parseDots = function() {
    this.numDots = 0;
    this.energizers = [];
    for (var i = 0; i < this.currentTiles.length; i++) {
        if (this.currentTiles[i] === '.') this.numDots++;
        if (this.currentTiles[i] === 'o') {
            this.numDots++;
            this.energizers.push({x: i % this.numCols, y: Math.floor(i / this.numCols)});
        }
    }
};

Map.prototype.getTile = function(x, y) {
    if (x >= 0 && x < this.numCols && y >= 0 && y < this.numRows) {
        return this.currentTiles[x + y * this.numCols];
    }
    return '|'; // Wall for out of bounds
};

Map.prototype.isFloorTile = function(x, y) {
    var t = this.getTile(x, y);
    return t === ' ' || t === '.' || t === 'o';
};

Map.prototype.isTunnelTile = function(x, y) {
    return (x < 1 || x >= this.numCols - 1);
};

Map.prototype.teleport = function(actor) {
    if (actor.tile.x < 0) actor.pixel.x = (this.numCols - 1) * tileSize;
    if (actor.tile.x >= this.numCols) actor.pixel.x = 0;
};

Map.prototype.onDotEat = function(x, y) {
    this.dotsEaten++;
    var i = x + y * this.numCols;
    this.currentTiles[i] = ' ';
};

Map.prototype.allDotsEaten = function() {
    return this.dotsEaten >= this.numDots;
};

// --- Actor Class (Base for Bunny and Ghosts) ---
var Actor = function() {
    this.dir = {x:0, y:0};
    this.pixel = {x:0, y:0};
    this.tile = {x:0, y:0};
    this.tilePixel = {x:0, y:0};
    this.distToMid = {x:0, y:0};
    this.targetTile = {x:0, y:0};
    this.speed = 1.5; // Base speed
};

Actor.prototype.reset = function() {
    this.setPos(this.startPixel.x, this.startPixel.y);
    this.setDir(this.startDirEnum);
    this.speed = this.baseSpeed || 1.5;
};

Actor.prototype.setPos = function(px, py) {
    this.pixel.x = px;
    this.pixel.y = py;
    if (map) map.teleport(this);
    this.tile.x = Math.floor(this.pixel.x / tileSize);
    this.tile.y = Math.floor(this.pixel.y / tileSize);
    this.tilePixel.x = this.pixel.x % tileSize;
    this.tilePixel.y = this.pixel.y % tileSize;
    this.distToMid.x = midTile.x - this.tilePixel.x;
    this.distToMid.y = midTile.y - this.tilePixel.y;
};

Actor.prototype.setDir = function(dirEnum) {
    this.dirEnum = dirEnum;
    setDirFromEnum(this.dir, dirEnum);
};

Actor.prototype.step = function() {
    if (!map) return;
    
    // Speed logic (Simplified from original)
    var moveAmt = this.speed;
    
    // Tunnel slow down
    if (map.isTunnelTile(this.tile.x, this.tile.y)) moveAmt *= 0.6;

    // Align to grid logic
    var axis = (this.dir.x !== 0) ? 'x' : 'y';
    var perp = (this.dir.x !== 0) ? 'y' : 'x';

    // Stop at walls
    var nextTileFloor = map.isFloorTile(this.tile.x + this.dir.x, this.tile.y + this.dir.y);
    // If hitting center of tile and next is wall, stop
    var pastMid = (this.dir.x === 1 && this.distToMid.x <= 0) || 
                  (this.dir.x === -1 && this.distToMid.x >= 0) ||
                  (this.dir.y === 1 && this.distToMid.y <= 0) || 
                  (this.dir.y === -1 && this.distToMid.y >= 0);

    if (pastMid && !nextTileFloor) {
        this.pixel[axis] = this.tile[axis] * tileSize + midTile[axis]; // Snap to center
    } else {
        this.pixel[axis] += this.dir[axis] * moveAmt;
        
        // Correction to center line
        if (this.distToMid[perp] !== 0) {
            var correction = (this.distToMid[perp] > 0) ? 1 : -1;
            if (Math.abs(this.distToMid[perp]) < moveAmt) correction = this.distToMid[perp];
            this.pixel[perp] += correction;
        }
    }
    this.setPos(this.pixel.x, this.pixel.y);
};

// --- Ghost Class ---
var Ghost = function() {
    Actor.call(this);
    this.color = '#F00';
    this.mode = 0; // 0: Chase, 1: Scared, 2: Eaten
    this.scared = false;
};
Ghost.prototype = newChildObject(Actor.prototype);

Ghost.prototype.update = function() {
    // Simple AI: Switch direction at intersections
    var isCenter = Math.abs(this.distToMid.x) < 2 && Math.abs(this.distToMid.y) < 2;
    
    if (isCenter) {
        var openTiles = getOpenTiles(this.tile, this.dirEnum);
        var target = (this.scared) ? {x:0, y:0} : (this.mode === 2 ? map.doorTile : pacman.tile); // Flee to 0,0 or Chase Pacman
        
        if (this.mode === 2 && this.tile.x === map.doorTile.x && this.tile.y === map.doorTile.y) {
            this.mode = 0; // Revive
            this.scared = false;
            this.speed = 1.4;
        }

        var nextDir = (this.scared) ? this.getRandomTurn(openTiles) : getTurnClosestToTarget(this.tile, target, openTiles);
        this.setDir(nextDir);
    }
    this.step();
};

Ghost.prototype.getRandomTurn = function(openTiles) {
    var choices = [];
    for(var i=0; i<4; i++) if(openTiles[i]) choices.push(i);
    return choices[Math.floor(Math.random() * choices.length)];
};

// --- Player (Bunny) Class ---
var Player = function() {
    Actor.call(this);
    this.nextDirEnum = DIR_LEFT;
    this.baseSpeed = 1.6;
};
Player.prototype = newChildObject(Actor.prototype);

Player.prototype.update = function() {
    // Attempt turn
    var isCenter = Math.abs(this.distToMid.x) < 2 && Math.abs(this.distToMid.y) < 2;
    if (isCenter || (this.dirEnum !== undefined && (this.dirEnum + 2)%4 === this.nextDirEnum)) {
        var nextDirObj = {}; 
        setDirFromEnum(nextDirObj, this.nextDirEnum);
        if (map.isFloorTile(this.tile.x + nextDirObj.x, this.tile.y + nextDirObj.y)) {
            this.setDir(this.nextDirEnum);
        }
    }
    this.step();
    
    // Eat dots
    var t = map.getTile(this.tile.x, this.tile.y);
    if (t === '.' || t === 'o') {
        map.onDotEat(this.tile.x, this.tile.y);
        score += (t === '.') ? 10 : 50;
        if (t === 'o') makeGhostsScared();
    }
};

function makeGhostsScared() {
    for(var i=0; i<ghosts.length; i++) {
        if(ghosts[i].mode !== 2) {
            ghosts[i].scared = true;
            ghosts[i].speed = 1.0; // Slow down
            // Reverse direction immediately
            ghosts[i].setDir(rotateAboutFace(ghosts[i].dirEnum));
        }
    }
    setTimeout(function(){
        for(var i=0; i<ghosts.length; i++) {
            ghosts[i].scared = false;
            ghosts[i].speed = 1.4;
        }
    }, 8000); // 8 Seconds scared
}

// --- Drawing Functions (Canvas) ---
function drawMap() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Walls
    ctx.fillStyle = "#5C2D91"; // Shopify Purple
    var wallSize = tileSize + 1; // Grout
    for (var i = 0; i < map.currentTiles.length; i++) {
        var x = (i % map.numCols) * tileSize;
        var y = Math.floor(i / map.numCols) * tileSize;
        if (map.currentTiles[i] === '|') {
            ctx.fillRect(x, y, wallSize, wallSize);
        } else if (map.currentTiles[i] === '.') {
            // Lollipop Stick
            ctx.fillStyle = "brown";
            ctx.fillRect(x + tileSize/2 - 1, y + tileSize/2 + 2, 2, 6);
            // Lollipop Candy
            ctx.fillStyle = (i % 2 === 0) ? "#FF69B4" : "#00CED1"; // Pink or Teal
            ctx.beginPath();
            ctx.arc(x + tileSize/2, y + tileSize/2, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "#5C2D91"; // Reset for walls
        } else if (map.currentTiles[i] === 'o') {
            // Big Lollipop
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x + tileSize/2, y + tileSize/2, 7, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "#5C2D91";
        }
    }
}

function drawActors() {
    // Draw Pacman (Bunny)
    ctx.fillStyle = "white";
    var px = pacman.pixel.x + tileSize/2;
    var py = pacman.pixel.y + tileSize/2;
    
    // Body
    ctx.beginPath();
    ctx.arc(px, py, tileSize/2 - 2, 0, Math.PI*2);
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.ellipse(px - 4, py - 8, 3, 8, 0, 0, Math.PI*2);
    ctx.ellipse(px + 4, py - 8, 3, 8, 0, 0, Math.PI*2);
    ctx.fill();
    // Face
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(px - 2, py - 1, 1, 0, Math.PI*2); // Left Eye
    ctx.arc(px + 2, py - 1, 1, 0, Math.PI*2); // Right Eye
    ctx.fill();

    // Draw Ghosts
    ghosts.forEach(function(g){
        var gx = g.pixel.x + tileSize/2;
        var gy = g.pixel.y + tileSize/2;
        
        if (g.mode === 2) { // Eyes only (Eaten)
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.arc(gx-3, gy, 3, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(gx+3, gy, 3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "blue";
            ctx.beginPath(); ctx.arc(gx-3, gy, 1.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(gx+3, gy, 1.5, 0, Math.PI*2); ctx.fill();
            return;
        }

        ctx.fillStyle = g.scared ? "#00F" : g.color;
        // Dome
        ctx.beginPath();
        ctx.arc(gx, gy - 2, tileSize/2 - 2, Math.PI, 0);
        ctx.lineTo(gx + tileSize/2 - 2, gy + tileSize/2);
        ctx.lineTo(gx - tileSize/2 + 2, gy + tileSize/2);
        ctx.fill();
    });
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 10, canvas.height - 10);
    
    if(state === 'GAMEOVER') {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, canvas.height/2 - 40, canvas.width, 80);
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
        ctx.fillStyle = "white";
        ctx.fillText("Click to Restart", canvas.width/2, canvas.height/2 + 30);
        ctx.textAlign = "left";
    } else if (state === 'WIN') {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, canvas.height/2 - 40, canvas.width, 80);
        ctx.fillStyle = "#0F0";
        ctx.textAlign = "center";
        ctx.fillText("YOU WIN!", canvas.width/2, canvas.height/2);
        ctx.textAlign = "left";
    }
}

// --- Initialization ---
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Map Data (Simplified Arcade Map)
    var mapStr = 
    "||||||||||||||||||||||||||||" +
    "|............||............|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|o||||.|||||.||.|||||.||||o|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|..........................|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|......||....||....||......|" +
    "||||||.||||| || |||||.||||||" +
    "     |.||||| || |||||.||    " +
    "     |.||          ||.|     " +
    "     |.|| |||--||| ||.|     " +
    "||||||.|| |      | ||.||||||" +
    "      .   |      |   .      " +
    "||||||.|| |      | ||.||||||" +
    "     |.|| |||||||| ||.|     " +
    "     |.||          ||.|     " +
    "     |.|| |||||||| ||.|     " +
    "||||||.|| |||||||| ||.||||||" +
    "|............||............|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|o..||.......  .......||..o|" +
    "|||.||.||.||||||||.||.||.|||" +
    "|||.||.||.||||||||.||.||.|||" +
    "|......||....||....||......|" +
    "|.||||||||||.||.||||||||||.|" +
    "|.||||||||||.||.||||||||||.|" +
    "|..........................|" +
    "||||||||||||||||||||||||||||";
    
    map = new Map(28, 31, mapStr);
    
    // Adjust Canvas size to fit map
    canvas.width = 28 * tileSize;
    canvas.height = 31 * tileSize;

    // Init Actors
    pacman = new Player();
    pacman.startPixel = {x: 13.5 * tileSize, y: 23 * tileSize};
    pacman.startDirEnum = DIR_LEFT;
    pacman.reset();

    // Create Ghosts
    var ghostSpecs = [
        {color: "red", x: 13.5, y: 11},
        {color: "pink", x: 13.5, y: 14},
        {color: "cyan", x: 11.5, y: 14},
        {color: "orange", x: 15.5, y: 14}
    ];
    
    ghosts = [];
    ghostSpecs.forEach(function(s){
        var g = new Ghost();
        g.color = s.color;
        g.startPixel = {x: s.x * tileSize, y: s.y * tileSize};
        g.startDirEnum = DIR_UP;
        g.reset();
        ghosts.push(g);
    });
    
    actors = [pacman].concat(ghosts);
    state = 'PLAY';
    
    requestAnimationFrame(gameLoop);
}

// --- Main Loop ---
function gameLoop() {
    if (state === 'PLAY') {
        pacman.update();
        ghosts.forEach(function(g){ g.update(); });
        
        // Collisions
        ghosts.forEach(function(g){
            var dist = Math.abs(pacman.pixel.x - g.pixel.x) + Math.abs(pacman.pixel.y - g.pixel.y);
            if (dist < tileSize/2) {
                if (g.scared) {
                    g.mode = 2; // Eaten
                    g.scared = false;
                    g.speed = 3; // Go home fast
                    score += 200;
                } else if (g.mode === 0) {
                    state = 'GAMEOVER';
                }
            }
        });
        
        if (map.allDotsEaten()) {
            state = 'WIN';
        }
    }

    drawMap();
    drawActors();
    drawScore();
    requestAnimationFrame(gameLoop);
}

// --- Input ---
window.addEventListener('keydown', function(e) {
    if([37,38,39,40].indexOf(e.keyCode) > -1) e.preventDefault();
    if (e.keyCode === 37) pacman.nextDirEnum = DIR_LEFT;
    if (e.keyCode === 38) pacman.nextDirEnum = DIR_UP;
    if (e.keyCode === 39) pacman.nextDirEnum = DIR_RIGHT;
    if (e.keyCode === 40) pacman.nextDirEnum = DIR_DOWN;
});

// Mouse Click for Restart
window.addEventListener('click', function(){
    if(state === 'GAMEOVER' || state === 'WIN') {
        map.currentTiles = map.tiles.split("");
        map.dotsEaten = 0;
        score = 0;
        pacman.reset();
        ghosts.forEach(function(g){g.reset();});
        state = 'PLAY';
    }
});

// Mobile Touch
var touchStartX = 0;
var touchStartY = 0;
window.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

window.addEventListener('touchend', function(e) {
    var touchEndX = e.changedTouches[0].screenX;
    var touchEndY = e.changedTouches[0].screenY;
    var dx = touchEndX - touchStartX;
    var dy = touchEndY - touchStartY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) pacman.nextDirEnum = DIR_RIGHT;
        else pacman.nextDirEnum = DIR_LEFT;
    } else {
        if (dy > 0) pacman.nextDirEnum = DIR_DOWN;
        else pacman.nextDirEnum = DIR_UP;
    }
    if(state === 'GAMEOVER' || state === 'WIN') {
       // Restart logic handles click/touch
    }
}, false);

// Start
init();

})();
