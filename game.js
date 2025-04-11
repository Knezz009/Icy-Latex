const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
  // Ruch poziomy
  player.vx = 0;
  if (keys["ArrowLeft"] || keys["a"]) player.vx = -player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.vx = player.speed;

  player.x += player.vx;

  // Grawitacja
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

  // Ograniczenia ekranu (nie wypadaj)
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "green";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  // Skok
  if (e.code === "Space" && player.grounded) {
    player.vy = player.jumpPower;
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

loop();
