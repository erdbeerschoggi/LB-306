const player = {
  x: 40,
  y: 300,
  w: 34,
  h: 34,
  vx: 0,
  vy: 0,
  speed: 4,
  jump: -13,
  grounded: false
};

function update() {

  player.vx = 0;

  if (keys["ArrowLeft"]) {
    player.vx = -player.speed;
  }

  if (keys["ArrowRight"]) {
    player.vx = player.speed;
  }

  if (keys["ArrowUp"] && player.grounded) {
    player.vy = player.jump;
    player.grounded = false;
  }

  // Gravitation
  player.vy += 0.65;

  player.x += player.vx;
  player.y += player.vy;

}