const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let cameraY = 0;

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

function update() {
  player.vx = 0;
  if (keys["ArrowLeft"] || keys["a"]) player.vx = -player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.vx = player.speed;

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

  // Kamera podąża za graczem (w górę)
  if (player.y < cameraY + 200) {
    cameraY = player.y - 200;
  }

  // Ograniczenia
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function drawBackground() {
  // Czarne tło z czerwonymi detalami
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#111");
  gradient.addColorStop(1, "#000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Czerwone linie ozdobne
  ctx.strokeStyle = "#400";
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Czerwone kropki
  ctx.fillStyle = "#500";
  for (let i = 0; i < 100; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.font = "30px monospace";
  ctx.textAlign = "center";
  ctx.fillText("X", player.x + player.width / 2, player.y + player.height - 5);
}

function draw() {
  drawBackground();

  // Przesuwamy canvas w pionie (kamera)
  ctx.save();
  ctx.translate(0, -cameraY);

  drawPlayer();

  // Platformy
  ctx.fillStyle = "red";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.code === "Space" && player.grounded) {
    player.vy = player.jumpPower;
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

loop();
