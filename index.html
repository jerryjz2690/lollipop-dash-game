<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sparko Sweets Pac Vibes</title>
  <style>
    :root {
      --sparko-navy: #04152d;
      --sparko-pink: #ff5fa8;
      --sparko-bg: #050811;
      --sparko-ghost1: #ffb8de;
      --sparko-ghost2: #66e6ff;
      --sparko-ghost3: #ffe066;
      --sparko-ghost4: #b37dff;
    }

    html, body {
      margin: 0;
      height: 100%;
      background: radial-gradient(circle at top, #141b3f, var(--sparko-bg));
      color: white;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #wrapper {
      text-align: center;
    }

    #gameCanvas {
      background: #000;
      border-radius: 18px;
      box-shadow:
        0 0 0 4px rgba(255, 255, 255, 0.05),
        0 18px 45px rgba(0, 0, 0, 0.6);
      image-rendering: pixelated;
    }

    #hud {
      margin-top: 12px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
    }

    #score {
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    #status {
      font-size: 13px;
      opacity: 0.85;
    }

    .pill {
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.05);
    }

    #brand {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.7);
    }

    a {
      color: var(--sparko-pink);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
<div id="wrapper">
  <canvas id="gameCanvas" width="456" height="504"></canvas>
  <div id="hud">
    <div id="brand" class="pill">Sparko Sweets Arcade</div>
    <div id="score" class="pill">Score: 0</div>
    <div id="status">Use arrow keys to move the lollipop hero</div>
  </div>
</div>

<script>
  // Basic Pac vibe grid using Sparko Sweets colors.
  // This is intentionally minimal so you can tweak it easily.

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const TILE_SIZE = 24;
  const COLS = 19;
  const ROWS = 21;

  // Simple maze, # = wall, . = lollipop pellet, o = big lollipop, ' ' = empty
  const MAP_TEMPLATE = [
    "###################",
    "#........#........#",
    "#.###.###.#.###.###",
    "#o###.###.#.###.##o",
    "#.................#",
    "#.###.#.#####.#.###",
    "#.....#...#...#...#",
    "#####.### # ###.###",
    "    #.#       #.#  ",
    "#####.# ## ## #.###",
    "     .  #   #  .   ",
    "#####.# ##### #.###",
    "    #.#       #.#  ",
    "#####.# ##### #.###",
    "#........#........#",
    "#.###.###.#.###.###",
    "#o..#.....L.....#o#",
    "###.#.#.#####.#.###",
    "#.....#...#...#...#",
    "#.#######.#.#######",
    "###################"
  ];

  // Convert template to mutable 2D array
  let map = MAP_TEMPLATE.map(row => row.split(""));

  const player = {
    col: 9,
    row: 16,
    dirCol: 0,
    dirRow: 0,
    pendingDirCol: 0,
    pendingDirRow: 0,
    color: getComputedStyle(document.documentElement).getPropertyValue("--sparko-pink").trim()
  };

  const ghosts = [
    {
      col: 8, row: 10,
      dirCol: 1, dirRow: 0,
      color: getComputedStyle(document.documentElement).getPropertyValue("--sparko-ghost1").trim()
    },
    {
      col: 9, row: 10,
      dirCol: -1, dirRow: 0,
      color: getComputedStyle(document.documentElement).getPropertyValue("--sparko-ghost2").trim()
    },
    {
      col: 10, row: 10,
      dirCol: 0, dirRow: 1,
      color: getComputedStyle(document.documentElement).getPropertyValue("--sparko-ghost3").trim()
    },
    {
      col: 9, row: 9,
      dirCol: 0, dirRow: -1,
      color: getComputedStyle(document.documentElement).getPropertyValue("--sparko-ghost4").trim()
    }
  ];

  let score = 0;
  let gameOver = false;
  let win = false;

  const scoreEl = document.getElementById("score");
  const statusEl = document.getElementById("status");

  function isWall(c, r) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
    return map[r][c] === "#";
  }

  function pelletCountLeft() {
    let count = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === "." || map[r][c] === "o") count++;
      }
    }
    return count;
  }

  function resetGame() {
    map = MAP_TEMPLATE.map(row => row.split(""));
    player.col = 9;
    player.row = 16;
    player.dirCol = 0;
    player.dirRow = 0;
    player.pendingDirCol = 0;
    player.pendingDirRow = 0;
    ghosts[0].col = 8; ghosts[0].row = 10; ghosts[0].dirCol = 1; ghosts[0].dirRow = 0;
    ghosts[1].col = 9; ghosts[1].row = 10; ghosts[1].dirCol = -1; ghosts[1].dirRow = 0;
    ghosts[2].col = 10; ghosts[2].row = 10; ghosts[2].dirCol = 0; ghosts[2].dirRow = 1;
    ghosts[3].col = 9; ghosts[3].row = 9; ghosts[3].dirCol = 0; ghosts[3].dirRow = -1;
    score = 0;
    gameOver = false;
    win = false;
    statusEl.textContent = "Use arrow keys to move the lollipop hero";
    updateScore();
  }

  function updateScore() {
    scoreEl.textContent = "Score: " + score;
  }

  window.addEventListener("keydown", e => {
    if (gameOver || win) {
      if (e.key === " " || e.key === "Enter") {
        resetGame();
      }
      return;
    }
    let dCol = 0, dRow = 0;
    if (e.key === "ArrowLeft" || e.key === "a") dCol = -1;
    if (e.key === "ArrowRight" || e.key === "d") dCol = 1;
    if (e.key === "ArrowUp" || e.key === "w") dRow = -1;
    if (e.key === "ArrowDown" || e.key === "s") dRow = 1;

    if (dCol !== 0 || dRow !== 0) {
      player.pendingDirCol = dCol;
      player.pendingDirRow = dRow;
    }
  });

  function movePlayer() {
    // Try to turn into pending direction if tile is open
    const nextCol = player.col + player.pendingDirCol;
    const nextRow = player.row + player.pendingDirRow;
    if (!isWall(nextCol, nextRow)) {
      player.dirCol = player.pendingDirCol;
      player.dirRow = player.pendingDirRow;
    }

    const targetCol = player.col + player.dirCol;
    const targetRow = player.row + player.dirRow;
    if (!isWall(targetCol, targetRow)) {
      player.col = wrapCol(targetCol);
      player.row = targetRow;
      eatPelletAt(player.col, player.row);
    }
  }

  function eatPelletAt(c, r) {
    const tile = map[r][c];
    if (tile === ".") {
      map[r][c] = " ";
      score += 10;
      updateScore();
    } else if (tile === "o") {
      map[r][c] = " ";
      score += 50;
      updateScore();
      // Very light "powered" effect: slow ghosts for a few steps
      ghosts.forEach(g => g.slowTimer = 15);
    }

    if (pelletCountLeft() === 0) {
      win = true;
      statusEl.textContent = "You cleared all the Sparko pops. Press Space to play again";
    }
  }

  function wrapCol(c) {
    if (c < 0) return COLS - 1;
    if (c >= COLS) return 0;
    return c;
  }

  function moveGhosts() {
    for (const g of ghosts) {
      const speedSkip = g.slowTimer && g.slowTimer > 0 ? 2 : 1;
      if (!g._stepMod) g._stepMod = 0;
      g._stepMod = (g._stepMod + 1) % speedSkip;
      if (g._stepMod !== 0) {
        if (g.slowTimer && g.slowTimer > 0) g.slowTimer--;
        continue;
      }

      const options = [];
      const dirs = [
        { c: 1, r: 0 },
        { c: -1, r: 0 },
        { c: 0, r: 1 },
        { c: 0, r: -1 }
      ];
      for (const d of dirs) {
        const nc = wrapCol(g.col + d.c);
        const nr = g.row + d.r;
        // avoid walls and reverse moves to keep them wandering nicely
        const isOpposite = d.c === -g.dirCol && d.r === -g.dirRow;
        if (!isWall(nc, nr) && !isOpposite) {
          options.push(d);
        }
      }
      if (options.length === 0) {
        // only option is to reverse
        g.dirCol = -g.dirCol;
        g.dirRow = -g.dirRow;
      } else {
        const d = options[Math.floor(Math.random() * options.length)];
        g.dirCol = d.c;
        g.dirRow = d.r;
      }

      g.col = wrapCol(g.col + g.dirCol);
      g.row = g.row + g.dirRow;
    }
  }

  function checkCollisions() {
    for (const g of ghosts) {
      if (g.col === player.col && g.row === player.row) {
        if (g.slowTimer && g.slowTimer > 0) {
          // Player "eats" slowed ghosts
          g.col = 9;
          g.row = 10;
          g.dirCol = 0;
          g.dirRow = 0;
          g.slowTimer = 0;
          score += 100;
          updateScore();
        } else {
          gameOver = true;
          statusEl.textContent = "The candy ghosts got you. Press Space to play again";
        }
      }
    }
  }

  function draw() {
    // Clear
    ctx.fillStyle = "#01010a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw walls and pellets
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const tile = map[r][c];

        if (tile === "#") {
          // Rounded navy candy wall
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--sparko-navy").trim();
          ctx.beginPath();
          ctx.roundRect(
            x + 3, y + 3,
            TILE_SIZE - 6, TILE_SIZE - 6,
            8
          );
          ctx.fill();
        } else {
          // Floor
          ctx.fillStyle = "#020214";
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          if (tile === "." || tile === "o") {
            // Lollipop pellet
            ctx.save();
            const radius = tile === "o" ? 6 : 3;
            ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
            ctx.beginPath();
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--sparko-pink").trim();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            // tiny stick
            if (tile === "o") {
              ctx.strokeStyle = "#ffffffaa";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(0, radius);
              ctx.lineTo(0, radius + 5);
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      }
    }

    // Draw ghosts
    for (const g of ghosts) {
      const x = g.col * TILE_SIZE + TILE_SIZE / 2;
      const y = g.row * TILE_SIZE + TILE_SIZE / 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(0, -4, 9, Math.PI, 0);
      ctx.lineTo(9, 8);
      ctx.lineTo(4, 10);
      ctx.lineTo(0, 8);
      ctx.lineTo(-4, 10);
      ctx.lineTo(-9, 8);
      ctx.closePath();
      ctx.fill();

      // eyes
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-3, -5, 2, 0, Math.PI * 2);
      ctx.arc(3, -5, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(-3 + g.dirCol, -5 + g.dirRow, 1, 0, Math.PI * 2);
      ctx.arc(3 + g.dirCol, -5 + g.dirRow, 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw player lollipop
    const px = player.col * TILE_SIZE + TILE_SIZE / 2;
    const py = player.row * TILE_SIZE + TILE_SIZE / 2;

    ctx.save();
    ctx.translate(px, py);

    // stick
    ctx.strokeStyle = "#ffffffaa";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, 14);
    ctx.stroke();

    // candy head
    const gradient = ctx.createRadialGradient(-4, -4, 1, 0, 0, 12);
    gradient.addColorStop(0, "#ffe4f3");
    gradient.addColorStop(1, player.color);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // tiny sparkle
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-4, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (gameOver || win) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "20px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const msg = win ? "Sweet victory." : "Game over.";
      ctx.fillText(msg, canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = "14px system-ui";
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--sparko-pink").trim();
      ctx.fillText("Press Space to restart", canvas.width / 2, canvas.height / 2 + 18);
    }
  }

  let lastTime = 0;
  const STEP_INTERVAL = 120; // ms per step

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;

    if (delta >= STEP_INTERVAL && !gameOver && !win) {
      movePlayer();
      moveGhosts();
      checkCollisions();
      lastTime = timestamp;
    }

    draw();
    requestAnimationFrame(loop);
  }

  resetGame();
  requestAnimationFrame(loop);
</script>
</body>
</html>
