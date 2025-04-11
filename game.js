const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let cameraY = 0;
let score = 0;
let maxYReached = 500;
let gameOver = false;

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
  { x: 150, y: 550, width: 100, height: 10 },
  { x: 200, y: 400, width: 100, height: 10 },
  { x: 100, y: 250, width: 100, height: 10 }
];

// RESET
function resetGame() {
  cameraY = 0;
  score = 0;
  maxYReached = 500;
  gameOver = false;
  player.x = 180;
  player.y = 500;
  player.vx = 0;
  player.vy = 0;
  platforms = [
    { x: 150, y: 550, width: 100, height: 10 },
    { x: 200, y: 400, width: 100, height: 10 },
    { x: 100, y: 250, width: 100, height: 10 }
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

  // Kolizje z platformami
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
    }
  });

  // Boczne odbicia – boost
  if (player.y > cameraY && player.vy > 0) {
    if (player.x <= 0 || player.x + player.width >= canvas.width) {
      player.vy = -20; // boost od ściany
    }
  }

  // Kamera
  if (player.y < cameraY + 200) {
    cameraY = player.y - 200;
  }

  // Liczenie pięter (co 100px do góry)
  if (player.y < maxYReached) {
    score++;
    maxYReached = player.y;
  }

  // Ograniczenia poziome
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  // Game over (spadek)
  if (player.y > cameraY + canvas.height + 100) {
    gameOver = true;
  }
}

function drawBackground() {
  // Gradient z efektem "oponiarskim"
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1a0000");
  gradient.addColorStop(0.5, "#0d0d0d");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Efekty bieżnika (linie + kręgi)
  ctx.strokeStyle = "#300";
  ctx.lineWidth = 2;
  for (let i = 0; i < canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Kręgi stylizowane na opony
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

  // Przycisk
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

  ctx.fillStyle = "red";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

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
