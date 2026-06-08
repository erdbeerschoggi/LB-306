const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const jumpSound = new Audio("assets/sounds/Jump.mp3");
const deathSound = new Audio("assets/sounds/Oh-No.mp3");
const winSound = new Audio("assets/sounds/Win.mp3");

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

let playerSkin = null;

const skinInput = document.getElementById("skinInput");

if (skinInput) {
  skinInput.addEventListener("change", function () {
    const file = skinInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      playerSkin = new Image();
      playerSkin.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}


let keys = {};
let gameRunning = false;
let startTime = 0;
let timerInterval = null;

const player = {
  x: 40, y: 300, w: 34, h: 34,
  vx: 0, vy: 0,
  speed: 4, jump: -13,
  grounded: false
};

const platforms = [
  {x: 0, y: 390, w: 160, h: 60},
  {x: 220, y: 350, w: 130, h: 30},
  {x: 410, y: 310, w: 150, h: 30},
  {x: 630, y: 350, w: 130, h: 30},
  {x: 800, y: 390, w: 130, h: 60}
];

const spikes = [
  {x: 500, y: 280, w: 40, h: 30},
  {x: 700, y: 320, w: 40, h: 30}
];

const goal = {x: 850, y: 330, w: 30, h: 60};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function startGame() {
  showPage("gamePage");
  resetGame();
  gameRunning = true;
  startTime = Date.now();
  document.getElementById("gameMsg").textContent = "";
  timerInterval = setInterval(() => {
    document.getElementById("timer").textContent = ((Date.now() - startTime) / 1000).toFixed(2);
  }, 50);
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  player.x = 40;
  player.y = 300;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function update() {
  player.vx = 0;
  if (keys["ArrowLeft"]) player.vx = -player.speed;
  if (keys["ArrowRight"]) player.vx = player.speed;
  if (keys["ArrowUp"] && player.grounded) {
    player.vy = player.jump;
    player.grounded = false;
    playSound(jumpSound)
  }

  player.vy += 0.65;
  player.x += player.vx;
  player.y += player.vy;
  player.grounded = false;

  platforms.forEach(p => {
    if (rectsOverlap(player, p) && player.vy >= 0) {
      const oldBottom = player.y + player.h - player.vy;
      if (oldBottom <= p.y + 10) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    }
  });

  spikes.forEach(s => {
    if (rectsOverlap(player, s)) gameOver("Game Over: Stacheln berührt!");
  });

  if (player.y > canvas.height) gameOver("Game Over: Du bist in ein Loch gefallen!");

  if (rectsOverlap(player, goal)) finishGame();

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#6ecb3c";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  ctx.fillStyle = "#8b4a20";
  platforms.forEach(p => ctx.fillRect(p.x, p.y + 12, p.w, p.h));

  ctx.fillStyle = "#d33";
  spikes.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(s.x, s.y + s.h);
    ctx.lineTo(s.x + s.w / 2, s.y);
    ctx.lineTo(s.x + s.w, s.y + s.h);
    ctx.closePath();
    ctx.fill();
  });

  ctx.fillStyle = "#ffd42a";
  ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
  ctx.fillStyle = "#222";
  ctx.font = "18px Arial";
  ctx.fillText("Ziel", goal.x - 5, goal.y - 8);

  ctx.save();

ctx.beginPath();
ctx.arc(
  player.x + player.w / 2,
  player.y + player.h / 2,
  player.w / 2,
  0,
  Math.PI * 2
);
ctx.clip();

if (playerSkin) {
  ctx.drawImage(playerSkin, player.x, player.y, player.w, player.h);
} else {
  ctx.fillStyle = "#2436d9";
  ctx.beginPath();
  ctx.arc(
    player.x + player.w / 2,
    player.y + player.h / 2,
    player.w / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

ctx.restore();
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function gameOver(text) {
  playSound(deathSound);
  gameRunning = false;
  clearInterval(timerInterval);
  document.getElementById("gameMsg").textContent = text;
  setTimeout(() => showPage("menuPage"), 5500);
}

async function finishGame() {
  playSound(winSound);
  gameRunning = false;
  clearInterval(timerInterval);
  const timeMs = Date.now() - startTime;
  document.getElementById("gameMsg").textContent = "Geschafft! Zeit wird gespeichert...";
  await saveScore(timeMs);
  document.getElementById("gameMsg").textContent = "Geschafft: " + (timeMs / 1000).toFixed(2) + " Sekunden";
  setTimeout(() => loadScores(), 1200);
}
