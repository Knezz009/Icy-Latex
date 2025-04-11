// game.js - Icy-Latex z Firebase, rankingiem, restartem na spacji, spadającymi platformami i presją czasu

// FIREBASE SETUP
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzsCNpz3ZToHdZuLuFsC_zezSDyZJJfho",
  authDomain: "latteice.firebaseapp.com",
  databaseURL: "https://latteice-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "latteice",
  storageBucket: "latteice.firebasestorage.app",
  messagingSenderId: "249160867596",
  appId: "1:249160867596:web:0b200fe387a73b071e7329",
  measurementId: "G-JELC72BE88"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const scoresRef = ref(db, "scores");

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
  width: 35,
  height: 35,
  vx: 0,
  vy: 0,
  speed: 5,
  gravity: 0.7,
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
  platforms.push({ id: platformId++, x: 0, y: 750, width: canvas.width, height: 10, isStart: true, shake: false, createdAt: Date.now() });
  for (let i = 1; i <= 20; i++) generateNewPlatform(750 - i * platformSpacing);
}

function generateNewPlatform(y) {
  const x = Math.floor(Math.random() * (canvas.width - 100));
  platforms.push({ id: platformId++, x, y, width: 100, height: 10, isStart: false, shake: false, shakeOffset: 0, createdAt: Date.now() });
}

function checkForPlatformGeneration() {
  const margin = 400;
  const highestPlatform = Math.min(...platforms.map(p => p.y));
  if (player.y - margin < highestPlatform) generateNewPlatform(highestPlatform - platformSpacing);
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
