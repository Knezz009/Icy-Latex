const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let cameraY = 0;
let score = 0;
let gameOver = false;
let startPlatformTimer = 0;
let startPlatformVisible = true;

let player = {
  x: 180,
  y: 500,
  width: 40,
  height: 40,
  vx: 0,
  vy: 0,
  speed: 5,
  gravity: 0.7,
  jumpPower: -22,
  grounded: false,
};

let keys = {};
let platforms = [];
let platformSpacing = 100;
let platformId = 0;

let canWallBounceLeft = true;
let canWallBounceRight = true;

function createInitialPlatforms() {
  platforms = [];
  platforms.push({
    id: platformId++,
    x: 0,
    y: 550,
    width: canvas.width,
    height: 10,
    isStart: true
  });

  for (let i = 1; i <= 20; i++) {
    generateNewPlatform(550 - i * platformSpacing);
  }
}

function generateNewPlatform(y) {
  const x = Math.floor(Math.random() * (canvas.width - 100));
  platforms.push({
    id: platformId++,
    x: x,
    y: y,
    width: 100,
    height: 10,
    isStart: false
  });
}

function checkForPlatformGeneration() {
  const margin = 400;
  const highestPlatform = Math.min(...platforms.map(p => p.y));
  if (player.y - margin < highestPlatform) {
    const newY = highestPlatform - platformSpacing;
    generateNewPlatform(newY);
  }
}

function resetGame() {
  cameraY = 0;
  score = 0;
  gameOver = false;
  startPlatformTimer = 0;
  startPlatformVisible = true;

  player.x = 180;
  player.y = 500;
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
    if (startPlatformTimer >= 3000) {
      startPlatformVisible = false;
    }
  }

  player.vx = 0;
  if (keys["ArrowLeft"] || keys["KeyA"]) player.vx = -player.speed;
  if (keys["ArrowRight"] || keys["KeyD"]) player.vx = player.speed;

  player.x += player.vx;
  player.vy += player.gravity;
  player.y += player.vy;
  player.grounded = false;

  checkForPlatformGeneration();

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

  let floorsPassed = Math.floor((550 - player.y) / 40);
  if (floorsPassed > score) {
    score = floorsPassed;
  }

  if (player.y < cameraY + 200) {
    cameraY = player.y - 200;
  }

  // Odbicia od ścian z blokadą wielokrotnego boosta
  if (player.x <= 0) {
    if (canWallBounceLeft) {
      player.vy = -20;
      canWallBounceLeft = false;
    }
    player.x = 0;
  } else {
    canWallBounceLeft = true;
  }

  if (player.x + player.width >= canvas.width) {
    if (canWallBounceRight) {
      player.vy = -20;
      canWallBounceRight = false;
    }
    player.x = canvas.width - player.width;
  } else {
    canWallBounceRight = true;
  }

  if (player.y > cameraY + canvas.height + 100) {
    gameOver = true;
  }
}

function drawBackground() {
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1a0000");
  gradient.addColorStop(0.5, "#0d0d0d");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#330000";
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  ctx.fillStyle = "#440000";
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlatform(p) {
  if (!p.isStart || startPlatformVisible) {
    const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
    grad.addColorStop(0, "#ff3333");
    grad.addColorStop(1, "#990000");
    ctx.fillStyle = grad;
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.strokeStyle = "#550000";
    ctx.strokeRect(p.x, p.y, p.width, p.height);
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
}

function drawSubmitForm() {
  document.getElementById("formContainer").style.display = "flex";
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

let lastTime = 0;
function loop(timestamp = 0) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  update(delta);
  draw();
  if (!gameOver) requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === "Space" && player.grounded) {
    player.vy = player.jumpPower;
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

  fetch("https://script.google.com/macros/s/AKfycbzhyH7KCGgy7L9W0NbDB7t2FQ9a8HelpZHsU2PyQ137-qEFRTYlDJhngRYrmBNiRLIHvA/exec", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({ nick, wynik: score })
  })
  .then(res => res.text())
  .then(() => {
    document.getElementById("responseMsg").innerText = "Wynik wysłany!";
  })
  .catch((err) => {
    console.error("Błąd przy fetch:", err);
    document.getElementById("responseMsg").innerText = "Błąd wysyłania 😢";
  });
}

createInitialPlatforms();
loop();
