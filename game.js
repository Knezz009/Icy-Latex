const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 800;

let cameraY = 0;
let score = 0;
let gameOver = false;
let startPlatformTimer = 0;
let startPlatformVisible = true;

let player = {
  x: 280,
  y: 700,
  width: 40,
  height: 40,
  vx: 0,
  vy: 0,
  speed: 5,
  gravity: 0.6,
  jumpPower: -20,
  grounded: false,
};

let keys = {};
let platforms = [];
let platformSpacing = 100;
let platformId = 0;
let canWallBounceLeft = true;
let canWallBounceRight = true;

function getPlatformFallSpeed() {
  if (score < 100) return 0.1;
  if (score < 300) return 0.4;
  if (score < 500) return 0.7;
  return 1.2;
}

function createInitialPlatforms() {
  platforms = [];
  platforms.push({
    id: platformId++, x: 0, y: 750, width: canvas.width, height: 10,
    isStart: true, shake: false, createdAt: Date.now()
  });
  for (let i = 1; i <= 20; i++) generateNewPlatform(750 - i * platformSpacing);
}

function generateNewPlatform(y) {
  const x = Math.floor(Math.random() * (canvas.width - 100));
  platforms.push({
    id: platformId++, x, y, width: 100, height: 10,
    isStart: false, shake: false, shakeOffset: 0, createdAt: Date.now()
  });
}

function checkForPlatformGeneration() {
  const margin = 400;
  const highestPlatform = Math.min(...platforms.map(p => p.y));
  if (player.y - margin < highestPlatform)
    generateNewPlatform(highestPlatform - platformSpacing);
}

function resetGame() {
  cameraY = 0;
  score = 0;
  gameOver = false;
  startPlatformTimer = 0;
  startPlatformVisible = true;
  player.x = 280;
  player.y = 700;
  player.vx = 0;
  player.vy = 0;
  platformId = 0;
  document.getElementById("formContainer").style.display = "none";
  document.getElementById("responseMsg").innerText = "";
  document.getElementById("nickInput").value = "";
  createInitialPlatforms();
  loop();
}

function update(delta) {
  if (gameOver) return;

  if (startPlatformVisible) {
    startPlatformTimer += delta;
    if (startPlatformTimer >= 10000) startPlatformVisible = false;
  }

  player.vx = 0;
  if (keys["ArrowLeft"] || keys["KeyA"]) player.vx = -player.speed;
  if (keys["ArrowRight"] || keys["KeyD"]) player.vx = player.speed;
  player.x += player.vx;
  player.vy += player.gravity;
  player.y += player.vy;
  player.grounded = false;

  checkForPlatformGeneration();

  const fallSpeed = getPlatformFallSpeed();
  const now = Date.now();

  platforms.forEach(p => {
    const age = now - p.createdAt;
    let speedMultiplier = 1;

    if (age > 7000) {
      speedMultiplier = 3;
      p.shake = true;
      p.shakeOffset = Math.sin(now / 30 + p.id) * 4;
    } else if (p.y > cameraY + canvas.height - 150) {
      p.shake = true;
      p.shakeOffset = Math.sin(now / 50 + p.id) * 2;
    } else {
      p.shake = false;
      p.shakeOffset = 0;
    }

    p.y += fallSpeed * speedMultiplier;
  });

  platforms.forEach(p => {
    if (!p.isStart || startPlatformVisible) {
      if (
        player.x < p.x + p.width &&
        player.x + player.width > p.x &&
        player.y + player.height < p.y + p.height &&
        player.y + player.height + player.vy >= p.y
      ) {
        player.y = p.y - player.height;
        player.vy = 0;
        player.grounded = true;
      }
    }
  });

  let floorsPassed = Math.floor((750 - player.y) / 40);
  if (floorsPassed > score) score = floorsPassed;

  if (player.y < cameraY + 200) cameraY = player.y - 200;

  if (player.x <= 0) {
    if (canWallBounceLeft) {
      player.vy = -20;
      canWallBounceLeft = false;
    }
    player.x = 0;
  } else canWallBounceLeft = true;

  if (player.x + player.width >= canvas.width) {
    if (canWallBounceRight) {
      player.vy = -20;
      canWallBounceRight = false;
    }
    player.x = canvas.width - player.width;
  } else canWallBounceRight = true;

  if (player.y > cameraY + canvas.height + 100) gameOver = true;

  platforms = platforms.filter(p => p.y < cameraY + canvas.height + 100);
}

function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlatform(p) {
  const x = p.x + (p.shakeOffset || 0);
  if (!p.isStart || startPlatformVisible) {
    ctx.fillStyle = p.shake ? "#ff5555" : "#cc0000";
    ctx.fillRect(x, p.y, p.width, p.height);
  }
}

function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.font = "30px monospace";
  ctx.textAlign = "center";
  ctx.fillText("X", player.x + player.width / 2, player.y + player.height - 5);
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.fillText(`Piętra: ${score}`, canvas.width / 2, 30);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "28px monospace";
  ctx.textAlign = "center";
  ctx.fillText("KONIEC GRY", canvas.width / 2, canvas.height / 2 - 40);
  ctx.fillText(`Wynik: ${score}`, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(canvas.width / 2 - 70, canvas.height / 2 + 30, 140, 40);
  ctx.fillStyle = "#fff";
  ctx.font = "18px monospace";
  ctx.fillText("ZAGRAJ PONOWNIE", canvas.width / 2, canvas.height / 2 + 58);
  drawSubmitForm();
  drawScoreBoard();
}

function drawSubmitForm() {
  document.getElementById("formContainer").style.display = "flex";
}

function drawScoreBoard() {
  const list = document.getElementById("scoreList");
  list.innerHTML = "<h3>Top 10:</h3>";
  fetch("https://latteice-default-rtdb.europe-west1.firebasedatabase.app/scores.json")
    .then(res => res.json())
    .then(data => {
      const entries = Object.values(data || {}).sort((a, b) => b.wynik - a.wynik).slice(0, 10);
      entries.forEach(entry => {
        const item = document.createElement("div");
        item.textContent = `${entry.nick}: ${entry.wynik}`;
        list.appendChild(item);
      });
    });
}

function draw() {
  drawBackground();
  ctx.save();
  ctx.translate(0, -cameraY);
  platforms.forEach(drawPlatform);
  drawPlayer();
  ctx.restore();
  drawScore();
  if (gameOver) drawGameOver();
}

canvas.addEventListener("click", (e) => {
  if (!gameOver) return;
  const x = e.offsetX;
  const y = e.offsetY;
  if (
    x >= canvas.width / 2 - 70 &&
    x <= canvas.width / 2 + 70 &&
    y >= canvas.height / 2 + 30 &&
    y <= canvas.height / 2 + 70
  ) {
    resetGame();
  }
});

document.addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === "Space") {
    if (gameOver) resetGame();
    if (player.grounded) player.vy = player.jumpPower;
  }
});

document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

function sendScore() {
  const nick = document.getElementById("nickInput").value.trim();
  if (!nick) {
    document.getElementById("responseMsg").innerText = "Podaj nick.";
    return;
  }
  const entry = { nick, wynik: score };
  push(scoresRef, entry);
  document.getElementById("responseMsg").innerText = "Wynik wysłany!";
}

let lastTime = 0;
function loop(timestamp = 0) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  update(delta);
  draw();
  if (!gameOver) requestAnimationFrame(loop);
}

createInitialPlatforms();
loop();
