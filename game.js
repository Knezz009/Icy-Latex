const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let cameraY = 0;
let score = 0;
let gameOver = false;
let lastPlatformTouched = null;

let player = {
  x: 180,
  y: 500,
  width: 40,
  height: 40,
  vx: 0,
  vy: 0,
  speed: 5,
  gravity: 0.8,
  jumpPower: -15,
  grounded: false,
};

let keys = {};

let platforms = [
  { id: 1, x: 150, y: 550, width: 100, height: 10, touched: false },
  { id: 2, x: 200, y: 400, width: 100, height: 10, touched: false },
  { id: 3, x: 100, y: 250, width: 100, height: 10, touched: false }
];

function resetGame() {
  cameraY = 0;
  score = 0;
  gameOver = false;
  lastPlatformTouched = null;

  player.x = 180;
  player.y = 500;
  player.vx = 0;
  player.vy = 0;

  platforms = [
    { id: 1, x: 150, y: 550, width: 100, height: 10, touched: false },
    { id: 2, x: 200, y: 400, width: 100, height: 10, touched: false },
    { id: 3, x: 100, y: 250, width: 100, height: 10, touched: false }
  ];
  loop();
}

function update() {
  if (gameOver) return;

  player.vx = 0;
  if (keys["ArrowLeft"] || keys["KeyA"]) player.vx = -player.speed;
  if (keys["ArrowRight"] || keys["KeyD"]) player.vx = player.speed;

  player.x += player.vx;
  player.vy += player.gravity;
  player.y += player.vy;
  player.grounded = false;

  platforms.forEach(p => {
    if (
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y + player.height < p.y + p.height &&
      player.y + player.height + player.vy >= p.y
    ) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.grounded = true;

      if (!p.touched) {
        p.touched = true;
        score += 1;
      }
    }
  });

  if (player.y < cameraY + 200) {
    cameraY = player.y - 200;
  }

  if (player.x <= 0 || player.x + player.width >= canvas.width) {
    player.vy = -20;
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

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

  ctx.strokeStyle = "#300";
  ctx.lineWidth = 2;
  for (let i = 0; i < canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      20 + Math.random() * 30,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

function drawPlatform(p) {
  const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
  grad.addColorStop(0, "#ff3333");
  grad.addColorStop(1, "#990000");
  ctx.fillStyle = grad;
  ctx.fillRect(p.x, p.y, p.width, p.height);

  // cień
  ctx.strokeStyle = "#550000";
  ctx.strokeRect(p.x, p.y, p.width, p.height);
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
  ctx.font = "30px monospace";
  ctx.textAlign = "center";
  ctx.fillText("KONIEC GRY", canvas.width / 2, canvas.height / 2 - 30);
  ctx.fillText(`Wynik: ${score} pięter`, canvas.width / 2, canvas.height / 2 + 10);

  ctx.fillStyle = "#ff0000";
  ctx.fillRect(canvas.width / 2 - 70, canvas.height / 2 + 40, 140, 40);
  ctx.fillStyle = "#fff";
  ctx.font = "18px monospace";
  ctx.fillText("ZAGRAJ PONOWNIE", canvas.width / 2, canvas.height / 2 + 68);
}

canvas.addEventListener("click", (e) => {
  if (!gameOver) return;

  const x = e.offsetX;
  const y = e.offsetY;
  if (
    x >= canvas.width / 2 - 70 &&
    x <= canvas.width / 2 + 70 &&
    y >= canvas.height / 2 + 40 &&
    y <= canvas.height / 2 + 80
  ) {
    resetGame();
  }
});

function draw() {
  drawBackground();

  ctx.save();
  ctx.translate(0, -cameraY);

  drawPlayer();
  platforms.forEach(drawPlatform);

  ctx.restore();
  drawScore();

  if (gameOver) {
    drawGameOver();
  }
}

function loop() {
  update();
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

loop();
